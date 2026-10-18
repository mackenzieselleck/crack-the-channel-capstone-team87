// Unit tests for the login() server action

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Our mocked redirect() throws an Error encoding the target URL, so we can
// assert on it without invoking Next.js's real redirect machinery.
const { mockRedirect } = vi.hoisted(() => ({
  mockRedirect: vi.fn((url: string) => {
    throw new Error(`REDIRECT:${url}`);
  }),
}));

vi.mock('next/navigation', () => ({
  redirect: mockRedirect,
}));

const { mockSignInWithPassword, mockMaybeSingle, mockEq, mockSelect, mockFrom } =
  vi.hoisted(() => {
    const mockMaybeSingle = vi.fn();
    const mockEq = vi.fn(() => ({ maybeSingle: mockMaybeSingle }));
    const mockSelect = vi.fn(() => ({ eq: mockEq }));
    const mockFrom = vi.fn(() => ({ select: mockSelect }));
    return {
      mockSignInWithPassword: vi.fn(),
      mockMaybeSingle,
      mockEq,
      mockSelect,
      mockFrom,
    };
  });

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(async () => ({
    auth: { signInWithPassword: mockSignInWithPassword },
    from: mockFrom,
  })),
}));

import { login, type LoginState } from './actions';

function formDataFor(
  fields: Partial<{
    email: string;
    password: string;
    captchaToken: string;
    next: string;
  }>,
) {
  const formData = new FormData();
  if (fields.email !== undefined) formData.set('email', fields.email);
  if (fields.password !== undefined) formData.set('password', fields.password);
  if (fields.captchaToken !== undefined)
    formData.set('captchaToken', fields.captchaToken);
  if (fields.next !== undefined) formData.set('next', fields.next);
  return formData;
}

const VALID_FIELDS = {
  email: 'learner@example.com',
  password: 'correct-password',
  captchaToken: 'captcha-token',
};

// a profile that has completed onboarding, used as the default "happy path"
function mockCompletedOnboarding() {
  mockMaybeSingle.mockResolvedValue({
    data: { first_name: 'Ada', last_name: 'Lovelace' },
  });
}

describe('login()', () => {
  const ORIGINAL_SITE_URL = process.env.NEXT_PUBLIC_SITE_URL;
  const initialState: LoginState = {};

  beforeEach(() => {
    mockSignInWithPassword.mockReset();
    mockMaybeSingle.mockReset();
    mockRedirect.mockClear();
    process.env.NEXT_PUBLIC_SITE_URL = 'https://crackthechannel.example';
  });

  afterEach(() => {
    process.env.NEXT_PUBLIC_SITE_URL = ORIGINAL_SITE_URL;
  });

  describe('input validation', () => {
    it('rejects an invalid email before calling Supabase', async () => {
      const result = await login(
        initialState,
        formDataFor({ ...VALID_FIELDS, email: 'not-an-email' }),
      );

      expect(result.error).toBeTruthy();
      expect(mockSignInWithPassword).not.toHaveBeenCalled();
    });

    it('rejects an empty password before calling Supabase', async () => {
      const result = await login(
        initialState,
        formDataFor({ ...VALID_FIELDS, password: '' }),
      );

      expect(result.error).toBeTruthy();
      expect(mockSignInWithPassword).not.toHaveBeenCalled();
    });
  });

  describe('CAPTCHA handling', () => {
    it('rejects a missing CAPTCHA token before calling Supabase', async () => {
      const result = await login(
        initialState,
        formDataFor({ ...VALID_FIELDS, captchaToken: '' }),
      );

      expect(result).toEqual({ error: 'Please complete the CAPTCHA' });
      expect(mockSignInWithPassword).not.toHaveBeenCalled();
    });

    it('surfaces a CAPTCHA-specific message when Supabase rejects the token', async () => {
      mockSignInWithPassword.mockResolvedValue({
        data: null,
        error: { message: 'captcha verification failed', code: undefined },
      });

      const result = await login(initialState, formDataFor(VALID_FIELDS));

      expect(result).toEqual({
        error: 'CAPTCHA verification failed. Please try again.',
      });
    });
  });

  describe('Supabase error branches', () => {
    it('flags an unconfirmed email and offers a resend link', async () => {
      mockSignInWithPassword.mockResolvedValue({
        data: null,
        error: { code: 'email_not_confirmed' },
      });

      const result = await login(initialState, formDataFor(VALID_FIELDS));

      expect(result).toEqual({
        error: 'Please confirm your email before logging in.',
        unconfirmed: true,
      });
    });

    it('returns a rate-limit message on HTTP 429', async () => {
      mockSignInWithPassword.mockResolvedValue({
        data: null,
        error: { status: 429 },
      });

      const result = await login(initialState, formDataFor(VALID_FIELDS));

      expect(result).toEqual({
        error: 'Too many attempts. Please wait a moment and try again.',
      });
    });

    it('returns a generic, non-enumerating message for wrong credentials', async () => {
      mockSignInWithPassword.mockResolvedValue({
        data: null,
        error: { code: 'invalid_credentials' },
      });

      const result = await login(initialState, formDataFor(VALID_FIELDS));

      expect(result).toEqual({ error: 'Invalid email or password.' });
    });

    it('never calls the profile lookup or redirect when sign-in fails', async () => {
      mockSignInWithPassword.mockResolvedValue({
        data: null,
        error: { code: 'invalid_credentials' },
      });

      await login(initialState, formDataFor(VALID_FIELDS));

      expect(mockFrom).not.toHaveBeenCalled();
      expect(mockRedirect).not.toHaveBeenCalled();
    });
  });

  describe('onboarding gate', () => {
    it('redirects to /onboarding when the profile has no name on file', async () => {
      mockSignInWithPassword.mockResolvedValue({
        data: { user: { id: 'user-1' } },
        error: null,
      });
      mockMaybeSingle.mockResolvedValue({ data: null });

      await expect(
        login(initialState, formDataFor(VALID_FIELDS)),
      ).rejects.toThrow('REDIRECT:/onboarding');
    });

    it('redirects to /onboarding when the name fields are blank/whitespace', async () => {
      mockSignInWithPassword.mockResolvedValue({
        data: { user: { id: 'user-1' } },
        error: null,
      });
      mockMaybeSingle.mockResolvedValue({
        data: { first_name: '   ', last_name: '' },
      });

      await expect(
        login(initialState, formDataFor(VALID_FIELDS)),
      ).rejects.toThrow('REDIRECT:/onboarding');
    });
  });

  describe('post-login redirect', () => {
    it('redirects to the default destination when no next param is given', async () => {
      mockSignInWithPassword.mockResolvedValue({
        data: { user: { id: 'user-1' } },
        error: null,
      });
      mockCompletedOnboarding();

      await expect(
        login(initialState, formDataFor(VALID_FIELDS)),
      ).rejects.toThrow('REDIRECT:/learn/test-module');
    });

    it('honors a safe same-origin next param', async () => {
      mockSignInWithPassword.mockResolvedValue({
        data: { user: { id: 'user-1' } },
        error: null,
      });
      mockCompletedOnboarding();

      await expect(
        login(
          initialState,
          formDataFor({
            ...VALID_FIELDS,
            next: 'https://crackthechannel.example/dashboard',
          }),
        ),
      ).rejects.toThrow('REDIRECT:/dashboard');
    });

    it('falls back to the default destination for a cross-origin next param', async () => {
      mockSignInWithPassword.mockResolvedValue({
        data: { user: { id: 'user-1' } },
        error: null,
      });
      mockCompletedOnboarding();

      await expect(
        login(
          initialState,
          formDataFor({ ...VALID_FIELDS, next: 'https://evil.example/phish' }),
        ),
      ).rejects.toThrow('REDIRECT:/learn/test-module');
    });

    it.each([
      '/auth/callback',
      '/login',
      '/signup',
      '/forgot-password',
      '/reset-password',
      '/email-confirmation',
      '/confirmation-success',
    ])(
      'falls back to the default destination for blocked next param %s',
      async (blocked) => {
        mockSignInWithPassword.mockResolvedValue({
          data: { user: { id: 'user-1' } },
          error: null,
        });
        mockCompletedOnboarding();

        await expect(
          login(initialState, formDataFor({ ...VALID_FIELDS, next: blocked })),
        ).rejects.toThrow('REDIRECT:/learn/test-module');
      },
    );
  });
});