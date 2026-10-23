//Unit tests for hasValidRecoverySession() — the time-window check that decides whether a password-reset link is still valid.

import { describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));

import {
  hasValidRecoverySession,
  RECOVERY_WINDOW_SECONDS,
} from './recovery-session';
import type { SupabaseClient } from '@supabase/supabase-js';

function supabaseWithClaims(claims: unknown, error: unknown = null) {
  return {
    auth: {
      getClaims: vi.fn().mockResolvedValue({ data: claims ? { claims } : null, error }),
    },
  } as unknown as SupabaseClient;
}

describe('hasValidRecoverySession()', () => {
  it('returns false when getClaims errors out', async () => {
    const supabase = supabaseWithClaims(null, { message: 'invalid jwt' });

    await expect(hasValidRecoverySession(supabase)).resolves.toBe(false);
  });

  it('returns false when there are no claims at all', async () => {
    const supabase = supabaseWithClaims(null);

    await expect(hasValidRecoverySession(supabase)).resolves.toBe(false);
  });

  it('returns false when the amr list has no recovery or otp method', async () => {
    const supabase = supabaseWithClaims({
      amr: [{ method: 'password', timestamp: Date.now() / 1000 }],
    });

    await expect(hasValidRecoverySession(supabase)).resolves.toBe(false);
  });

  it('returns true for a fresh recovery login within the window', async () => {
    const supabase = supabaseWithClaims({
      amr: [{ method: 'recovery', timestamp: Date.now() / 1000 }],
    });

    await expect(hasValidRecoverySession(supabase)).resolves.toBe(true);
  });

  it('returns true for a fresh otp login within the window', async () => {
    const supabase = supabaseWithClaims({
      amr: [{ method: 'otp', timestamp: Date.now() / 1000 }],
    });

    await expect(hasValidRecoverySession(supabase)).resolves.toBe(true);
  });

  it('returns true right at the edge of the recovery window', async () => {
    const supabase = supabaseWithClaims({
      amr: [
        {
          method: 'recovery',
          timestamp: Date.now() / 1000 - (RECOVERY_WINDOW_SECONDS - 5),
        },
      ],
    });

    await expect(hasValidRecoverySession(supabase)).resolves.toBe(true);
  });

  it('returns false once the recovery window has expired', async () => {
    const supabase = supabaseWithClaims({
      amr: [
        {
          method: 'recovery',
          timestamp: Date.now() / 1000 - (RECOVERY_WINDOW_SECONDS + 5),
        },
      ],
    });

    await expect(hasValidRecoverySession(supabase)).resolves.toBe(false);
  });

  it('returns false for a recovery timestamp in the future (clock skew/tampering)', async () => {
    const supabase = supabaseWithClaims({
      amr: [{ method: 'recovery', timestamp: Date.now() / 1000 + 120 }],
    });

    await expect(hasValidRecoverySession(supabase)).resolves.toBe(false);
  });
});