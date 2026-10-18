//Unit tests for requestPasswordReset() and updatePassword()

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { mockRedirect } = vi.hoisted(() => ({
  mockRedirect: vi.fn((url: string) => {
    throw new Error(`REDIRECT:${url}`);
  }),
}));

vi.mock('next/navigation', () => ({
  redirect: mockRedirect,
}));

const { mockResetPasswordForEmail, mockUpdateUser, mockSignOut } = vi.hoisted(
  () => ({
    mockResetPasswordForEmail: vi.fn(),
    mockUpdateUser: vi.fn(),
    mockSignOut: vi.fn(),
  }),
);

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(async () => ({
    auth: {
      resetPasswordForEmail: mockResetPasswordForEmail,
      updateUser: mockUpdateUser,
      signOut: mockSignOut,
    },
  })),
}));

const { mockHasValidRecoverySession } = vi.hoisted(() => ({
  mockHasValidRecoverySession: vi.fn(),
}));

vi.mock('@/lib/auth/recovery-session', () => ({
  hasValidRecoverySession: mockHasValidRecoverySession,
}));

import {
  requestPasswordReset,
  updatePassword,
  type ActionState,
} from './password-reset-actions';

const GENERIC_RESET_MESSAGE =
  'If an account exists for that email, a reset link has been sent. Check your inbox and spam folder.';
const EXPIRED_MESSAGE =
  'Your reset link has expired or is invalid. Please request a new one.';

const initialState: ActionState = {};

function resetFormData(fields: Partial<{ email: string; captchaToken: string }>) {
  const formData = new FormData();
  if (fields.email !== undefined) formData.set('email', fields.email);
  if (fields.captchaToken !== undefined)
    formData.set('captchaToken', fields.captchaToken);
  return formData;
}

function updateFormData(
  fields: Partial<{ password: string; confirmPassword: string }>,
) {
  const formData = new FormData();
  if (fields.password !== undefined) formData.set('password', fields.password);
  if (fields.confirmPassword !== undefined)
    formData.set('confirmPassword', fields.confirmPassword);
  return formData;
}

const VALID_PASSWORD = 'Str0ng!Passw0rd';

describe('requestPasswordReset()', () => {
  const ORIGINAL_SITE_URL = process.env.NEXT_PUBLIC_SITE_URL;

  beforeEach(() => {
    mockResetPasswordForEmail.mockReset();
    process.env.NEXT_PUBLIC_SITE_URL = 'https://crackthechannel.example';
  });

  afterEach(() => {
    process.env.NEXT_PUBLIC_SITE_URL = ORIGINAL_SITE_URL;
  });

  it('rejects an invalid email before calling Supabase', async () => {
    const result = await requestPasswordReset(
      initialState,
      resetFormData({ email: 'not-an-email', captchaToken: 'token' }),
    );

    expect(result.error).toBeTruthy();
    expect(mockResetPasswordForEmail).not.toHaveBeenCalled();
  });

  it('rejects a missing CAPTCHA token before calling Supabase', async () => {
    const result = await requestPasswordReset(
      initialState,
      resetFormData({ email: 'learner@example.com', captchaToken: '' }),
    );

    expect(result).toEqual({ error: 'Please complete the CAPTCHA' });
    expect(mockResetPasswordForEmail).not.toHaveBeenCalled();
  });

  it('surfaces a CAPTCHA-specific error when Supabase rejects the token', async () => {
    mockResetPasswordForEmail.mockResolvedValue({
      error: { message: 'captcha verification process failed' },
    });

    const result = await requestPasswordReset(
      initialState,
      resetFormData({ email: 'learner@example.com', captchaToken: 'token' }),
    );

    expect(result).toEqual({
      error: 'CAPTCHA verification failed. Please try again.',
    });
  });

  it('returns the same generic message whether or not the account exists (success)', async () => {
    mockResetPasswordForEmail.mockResolvedValue({ error: null });

    const result = await requestPasswordReset(
      initialState,
      resetFormData({ email: 'exists@example.com', captchaToken: 'token' }),
    );

    expect(result).toEqual({ message: GENERIC_RESET_MESSAGE });
  });

  it('returns the same generic message on an unrelated Supabase error, without leaking details', async () => {
    mockResetPasswordForEmail.mockResolvedValue({
      error: { code: 'unexpected_failure', message: 'boom' },
    });

    const result = await requestPasswordReset(
      initialState,
      resetFormData({ email: 'maybe@example.com', captchaToken: 'token' }),
    );

    expect(result).toEqual({ message: GENERIC_RESET_MESSAGE });
  });

  it('sends the correct redirectTo URL', async () => {
    mockResetPasswordForEmail.mockResolvedValue({ error: null });

    await requestPasswordReset(
      initialState,
      resetFormData({ email: 'learner@example.com', captchaToken: 'token' }),
    );

    expect(mockResetPasswordForEmail).toHaveBeenCalledWith(
      'learner@example.com',
      expect.objectContaining({
        redirectTo: 'https://crackthechannel.example/reset-password',
        captchaToken: 'token',
      }),
    );
  });
});

describe('updatePassword()', () => {
  beforeEach(() => {
    mockUpdateUser.mockReset();
    mockSignOut.mockReset();
    mockHasValidRecoverySession.mockReset();
    mockRedirect.mockClear();
  });

  it('rejects a weak password before checking the recovery session', async () => {
    const result = await updatePassword(
      initialState,
      updateFormData({ password: 'weak', confirmPassword: 'weak' }),
    );

    expect(result.error).toBeTruthy();
    expect(mockHasValidRecoverySession).not.toHaveBeenCalled();
  });

  it('rejects mismatched passwords', async () => {
    const result = await updatePassword(
      initialState,
      updateFormData({
        password: VALID_PASSWORD,
        confirmPassword: 'SomethingElse1!',
      }),
    );

    expect(result).toEqual({ error: 'Passwords do not match' });
    expect(mockHasValidRecoverySession).not.toHaveBeenCalled();
  });

  it('returns an expired-link message when the recovery session is invalid/expired', async () => {
    mockHasValidRecoverySession.mockResolvedValue(false);

    const result = await updatePassword(
      initialState,
      updateFormData({ password: VALID_PASSWORD, confirmPassword: VALID_PASSWORD }),
    );

    expect(result).toEqual({ error: EXPIRED_MESSAGE });
    expect(mockUpdateUser).not.toHaveBeenCalled();
  });

  it('rejects reusing the same password', async () => {
    mockHasValidRecoverySession.mockResolvedValue(true);
    mockUpdateUser.mockResolvedValue({ error: { code: 'same_password' } });

    const result = await updatePassword(
      initialState,
      updateFormData({ password: VALID_PASSWORD, confirmPassword: VALID_PASSWORD }),
    );

    expect(result).toEqual({
      error: 'Choose a password you have not used before.',
    });
  });

  it('rejects a password Supabase considers weak', async () => {
    mockHasValidRecoverySession.mockResolvedValue(true);
    mockUpdateUser.mockResolvedValue({ error: { code: 'weak_password' } });

    const result = await updatePassword(
      initialState,
      updateFormData({ password: VALID_PASSWORD, confirmPassword: VALID_PASSWORD }),
    );

    expect(result).toEqual({
      error: 'That password is too weak. Try a longer one.',
    });
  });

  it('returns a generic error for any other Supabase failure', async () => {
    mockHasValidRecoverySession.mockResolvedValue(true);
    mockUpdateUser.mockResolvedValue({
      error: { code: 'unexpected_failure' },
    });

    const result = await updatePassword(
      initialState,
      updateFormData({ password: VALID_PASSWORD, confirmPassword: VALID_PASSWORD }),
    );

    expect(result).toEqual({
      error: 'Unable to update password. Please try again.',
    });
  });

  it('signs out globally and redirects on success', async () => {
    mockHasValidRecoverySession.mockResolvedValue(true);
    mockUpdateUser.mockResolvedValue({ error: null });
    mockSignOut.mockResolvedValue({ error: null });

    await expect(
      updatePassword(
        initialState,
        updateFormData({ password: VALID_PASSWORD, confirmPassword: VALID_PASSWORD }),
      ),
    ).rejects.toThrow('REDIRECT:/login?reset=success');

    expect(mockSignOut).toHaveBeenCalledWith({ scope: 'global' });
  });
});