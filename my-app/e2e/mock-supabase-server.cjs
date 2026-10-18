/**
 * Minimal stand-in for Supabase's Auth (GoTrue) + PostgREST APIs, used only
 * by the Playwright e2e suite.
 * 
 * Small fake Supabase backend (Auth + REST) that the e2e tests run against instead
 * of a live Supabase project, so CAPTCHA failures, rate limits, unconfirmed emails
 * etc. can all be triggered on demand.
 *
 * Response shapes follow @supabase/auth-js's `handleError`/`_sessionResponse`
 * (see node_modules/@supabase/auth-js/src/lib/fetch.ts) and
 * @supabase/postgrest-js's maybeSingle()/single() handling closely enough
 * for the app's own code paths - this is not a general GoTrue/PostgREST
 * reimplementation.
 */
const http = require('http');
const { URL } = require('url');

const PORT = process.env.MOCK_SUPABASE_PORT
  ? Number(process.env.MOCK_SUPABASE_PORT)
  : 54329;

// Fixed, deterministic "users" the e2e specs log in as by email. Session
// access tokens directly encode which user they belong to
// ("mock-access-token:<userId>") so GET /auth/v1/user can look the user up
// without any server-side session store.
const USERS = {
  'new-user@e2e.test': {
    id: 'user-new',
    profile: null, // no profiles row yet -> login should redirect to /onboarding
  },
  'onboarded-user@e2e.test': {
    id: 'user-onboarded',
    profile: { first_name: 'Ada', last_name: 'Lovelace' },
  },
};

function userByEmail(email) {
  return USERS[email] ?? { id: `user-${Buffer.from(email).toString('hex').slice(0, 8)}`, profile: null };
}

function tokenForUserId(userId) {
  return `mock-access-token:${userId}`;
}

function userIdFromToken(authHeader) {
  const m = /^Bearer mock-access-token:(.+)$/.exec(authHeader || '');
  return m ? m[1] : null;
}

function sendJson(res, status, body) {
  const text = body === undefined ? '' : JSON.stringify(body);
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(text),
  });
  res.end(text);
}

function readBody(req) {
  return new Promise((resolve) => {
    let raw = '';
    req.on('data', (chunk) => (raw += chunk));
    req.on('end', () => {
      if (!raw) return resolve({});
      try {
        resolve(JSON.parse(raw));
      } catch {
        resolve({});
      }
    });
  });
}

// --- scenario helpers, keyed off the email used in the request -----------

function captchaFailure(res) {
  sendJson(res, 400, { msg: 'captcha verification process failed' });
}

async function handleSignup(req, res) {
  const body = await readBody(req);
  const email = body.email;

  if (body.options?.captchaToken === 'trigger-captcha-fail') return captchaFailure(res);
  if (email === 'existing@e2e.test') {
    return sendJson(res, 422, {
      error_code: 'user_already_exists',
      msg: 'User already registered',
    });
  }
  if (email === 'weakpw@e2e.test') {
    return sendJson(res, 422, { error_code: 'weak_password', msg: 'Password is too weak' });
  }

  // GoTrue's real response for a signup pending email confirmation is a
  // bare user object (no access_token -> session: null client-side).
  return sendJson(res, 200, {
    id: userByEmail(email).id,
    email,
    aud: 'authenticated',
    role: 'authenticated',
    confirmation_sent_at: new Date().toISOString(),
  });
}

async function handleTokenPassword(req, res) {
  const body = await readBody(req);
  const email = body.email;
  const captchaToken = body.gotrue_meta_security?.captcha_token;

  if (captchaToken === 'trigger-captcha-fail') return captchaFailure(res);
  if (email === 'unconfirmed@e2e.test') {
    return sendJson(res, 400, { error_code: 'email_not_confirmed', msg: 'Email not confirmed' });
  }
  if (email === 'ratelimited@e2e.test') {
    return sendJson(res, 429, { error_code: 'over_request_rate_limit', msg: 'Too many requests' });
  }
  if (email === 'wrongpass@e2e.test' || body.password !== 'correct-password') {
    return sendJson(res, 400, { error_code: 'invalid_credentials', msg: 'Invalid login credentials' });
  }

  const user = userByEmail(email);
  return sendJson(res, 200, {
    access_token: tokenForUserId(user.id),
    refresh_token: `mock-refresh-token:${user.id}`,
    expires_in: 3600,
    token_type: 'bearer',
    user: {
      id: user.id,
      email,
      aud: 'authenticated',
      role: 'authenticated',
    },
  });
}

async function handleRecover(req, res) {
  const body = await readBody(req);
  // Like handleTokenPassword: auth-js's resetPasswordForEmail() nests the
  // token under gotrue_meta_security.captcha_token, not body.captchaToken
  // directly (see GoTrueClient.js's resetPasswordForEmail()).
  if (body.gotrue_meta_security?.captcha_token === 'trigger-captcha-fail') return captchaFailure(res);
  // Supabase returns an empty 200 on success, whether or not the account
  // exists (that's precisely the no-enumeration behavior the app relies on).
  return sendJson(res, 200, {});
}

async function handleResend(req, res) {
  const body = await readBody(req);
  if (body.options?.captchaToken === 'trigger-captcha-fail') return captchaFailure(res);
  if (body.email === 'ratelimited@e2e.test') {
    return sendJson(res, 429, { error_code: 'over_email_send_rate_limit', msg: 'Too many requests' });
  }
  return sendJson(res, 200, {});
}

function handleLogout(req, res) {
  res.writeHead(204);
  res.end();
}

function handleGetUser(req, res) {
  const userId = userIdFromToken(req.headers['authorization']);
  if (!userId) {
    return sendJson(res, 401, { error_code: 'session_not_found', msg: 'Session not found' });
  }
  return sendJson(res, 200, {
    id: userId,
    email: `${userId}@e2e.test`,
    aud: 'authenticated',
    role: 'authenticated',
  });
}

function profileForUserId(userId) {
  for (const u of Object.values(USERS)) {
    if (u.id === userId) return u.profile;
  }
  return null;
}

function handleProfilesGet(req, res, url) {
  const idFilter = url.searchParams.get('id'); // "eq.<uuid>"
  const userId = idFilter?.startsWith('eq.') ? idFilter.slice(3) : null;
  const profile = userId ? profileForUserId(userId) : null;
  const accept = req.headers['accept'] || '';

  if (accept.includes('vnd.pgrst.object+json') && !accept.includes('nulls=stripped')) {
    // .single() semantics: a real PostgREST server 406s on zero rows.
    if (profile) return sendJson(res, 200, profile);
    return sendJson(res, 406, {
      code: 'PGRST116',
      details: 'Results contain 0 rows',
      hint: null,
      message: 'JSON object requested, multiple (or no) rows returned',
    });
  }

  // .maybeSingle() (and any other select): array form, postgrest-js unwraps it.
  return sendJson(res, 200, profile ? [profile] : []);
}

function handleProfilesPatch(req, res) {
  // onboarding/actions.ts does `.update(...).eq('id', ...)` with no
  // `.select()`, i.e. `Prefer: return=minimal` -> an empty 204 body, which
  // the action correctly reads as "no error".
  res.writeHead(204);
  res.end();
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  try {
    if (req.method === 'POST' && url.pathname === '/auth/v1/signup') {
      return await handleSignup(req, res);
    }
    if (req.method === 'POST' && url.pathname === '/auth/v1/token') {
      return await handleTokenPassword(req, res);
    }
    if (req.method === 'POST' && url.pathname === '/auth/v1/recover') {
      return await handleRecover(req, res);
    }
    if (req.method === 'POST' && url.pathname === '/auth/v1/resend') {
      return await handleResend(req, res);
    }
    if (req.method === 'POST' && url.pathname === '/auth/v1/logout') {
      return handleLogout(req, res);
    }
    if (req.method === 'GET' && url.pathname === '/auth/v1/user') {
      return handleGetUser(req, res);
    }
    if (req.method === 'GET' && url.pathname === '/rest/v1/profiles') {
      return handleProfilesGet(req, res, url);
    }
    if ((req.method === 'PATCH' || req.method === 'POST') && url.pathname === '/rest/v1/profiles') {
      return handleProfilesPatch(req, res);
    }
    if (req.method === 'GET' && url.pathname === '/health') {
      return sendJson(res, 200, { ok: true });
    }

    return sendJson(res, 404, { message: `mock-supabase-server: no handler for ${req.method} ${url.pathname}` });
  } catch (err) {
    return sendJson(res, 500, { message: String(err && err.message ? err.message : err) });
  }
});

server.listen(PORT, '127.0.0.1', () => {
  // eslint-disable-next-line no-console
  console.log(`[mock-supabase-server] listening on http://127.0.0.1:${PORT}`);
});