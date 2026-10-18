//Unit tests for resendConfirmation().

import { beforeEach, describe, expect, it, vi } from 'vitest';

const { mockResend } = vi.hoisted(() => ({
  mockResend: vi.fn(),
}));

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(async () => ({
    auth: { resend: mockResend },
  })),
}));

import { resendConfirmation, type ResendState } from './resend-actions';

const GENERIC_MESSAGE =
  'If that email has an unconfirmed account, a new confirmation link is on its way.';

const initialState: ResendState = {};

function formDataFor(fields: Partial<{ email: string; captchaToken: string }>) {
  const formData = new FormData();
  if (fields.email !== undefined) formData.set('email', fields.email);
  if (fields.captchaToken !== undefined)
    formData.set('captchaToken', fields.captchaToken);
  return formData;
}

describe('resendConfirmation()', () => {
  beforeEach(() => {
    mockResend.mockReset();
  });

  it('rejects an invalid email before calling Supabase', async () => {
    const result = await resendConfirmation(
      initialState,
      formDataFor({ email: 'not-an-email', captchaToken: 'token' }),
    );

    expect(result.error).toBeTruthy();
    expect(mockResend).not.toHaveBeenCalled();
  });

  it('rejects a missing CAPTCHA token before calling Supabase', async () => {
    const result = await resendConfirmation(
      initialState,
      formDataFor({ email: 'learner@example.com', captchaToken: '' }),
    );

    expect(result).toEqual({ error: 'Please complete the CAPTCHA' });
    expect(mockResend).not.toHaveBeenCalled();
  });

  it('surfaces a CAPTCHA-specific error when Supabase rejects the token', async () => {
    mockResend.mockResolvedValue({
      error: { message: 'captcha check failed' },
    });

    const result = await resendConfirmation(
      initialState,
      formDataFor({ email: 'learner@example.com', captchaToken: 'token' }),
    );

    expect(result).toEqual({
      error: 'CAPTCHA verification failed. Please try again.',
    });
  });

  it('returns a rate-limit message on the over_email_send_rate_limit code', async () => {
    mockResend.mockResolvedValue({
      error: { code: 'over_email_send_rate_limit' },
    });

    const result = await resendConfirmation(
      initialState,
      formDataFor({ email: 'learner@example.com', captchaToken: 'token' }),
    );

    expect(result).toEqual({
      error: 'Please wait a minute before requesting another email.',
    });
  });

  it('returns a rate-limit message on HTTP 429 even without the specific code', async () => {
    mockResend.mockResolvedValue({ error: { status: 429 } });

    const result = await resendConfirmation(
      initialState,
      formDataFor({ email: 'learner@example.com', captchaToken: 'token' }),
    );

    expect(result).toEqual({
      error: 'Please wait a minute before requesting another email.',
    });
  });

  it('never reveals whether the account exists on success', async () => {
    mockResend.mockResolvedValue({ error: null });

    const result = await resendConfirmation(
      initialState,
      formDataFor({ email: 'exists@example.com', captchaToken: 'token' }),
    );

    expect(result.message).toBe(GENERIC_MESSAGE);
    expect(result.sentAt).toBeTypeOf('number');
  });

  it('returns the same generic message for an unknown account (no enumeration)', async () => {
    mockResend.mockResolvedValue({ error: { code: 'user_not_found' } });

    const result = await resendConfirmation(
      initialState,
      formDataFor({ email: 'unknown@example.com', captchaToken: 'token' }),
    );

    expect(result.message).toBe(GENERIC_MESSAGE);
    expect(result.error).toBeUndefined();
  });

  it('sends the expected emailRedirectTo', async () => {
    const ORIGINAL_SITE_URL = process.env.NEXT_PUBLIC_SITE_URL;
    process.env.NEXT_PUBLIC_SITE_URL = 'https://crackthechannel.example';
    mockResend.mockResolvedValue({ error: null });

    await resendConfirmation(
      initialState,
      formDataFor({ email: 'learner@example.com', captchaToken: 'token' }),
    );

    expect(mockResend).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'signup',
        email: 'learner@example.com',
        options: expect.objectContaining({
          emailRedirectTo: 'https://crackthechannel.example/auth/confirm',
          captchaToken: 'token',
        }),
      }),
    );

    process.env.NEXT_PUBLIC_SITE_URL = ORIGINAL_SITE_URL;
  });
});