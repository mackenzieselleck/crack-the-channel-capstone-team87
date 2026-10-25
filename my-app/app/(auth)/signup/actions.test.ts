//Unit tests for signup()

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// regression test for the sign-up confirmation redirect bug

const mockSignUp = vi.fn();

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(async () => ({
    auth: { signUp: mockSignUp },
  })),
}));

import { signup } from './actions';

function formDataFor(
  email: string,
  password: string,
  captchaToken: string,
  // defaults to matching `password` so existing call sites that don't care
  // about the confirm-password check keep working; pass a different value
  // to exercise the mismatch branch.
  confirmPassword: string = password,
) {
  const formData = new FormData();
  formData.set('email', email);
  formData.set('password', password);
  formData.set('confirmPassword', confirmPassword);
  formData.set('captchaToken', captchaToken);
  return formData;
}

describe('signup()', () => {
  const ORIGINAL_SITE_URL = process.env.NEXT_PUBLIC_SITE_URL;

  beforeEach(() => {
    mockSignUp.mockReset();
    process.env.NEXT_PUBLIC_SITE_URL = 'https://crackthechannel.example';
  });

  afterEach(() => {
    process.env.NEXT_PUBLIC_SITE_URL = ORIGINAL_SITE_URL;
  });

  it('sends Supabase a real, interpolated confirmation URL', async () => {
    mockSignUp.mockResolvedValue({ error: null });

    const result = await signup(formDataFor('learner@example.com', 'Sup3rSecret!', 'captcha-token'));

    expect(result).toEqual({ success: true });
    expect(mockSignUp).toHaveBeenCalledTimes(1);

    const [signUpArgs] = mockSignUp.mock.calls[0];
    // this is the assertion that catches the regression: with the bug, this
    // value is the literal, un-interpolated string
    // "${process.env.NEXT_PUBLIC_SITE_URL}/auth/confirm".
    expect(signUpArgs.options.emailRedirectTo).toBe(
      'https://crackthechannel.example/auth/confirm'
    );
    expect(signUpArgs.options.emailRedirectTo).not.toContain('${');
  });

  it('still rejects a signup with no CAPTCHA token before calling Supabase', async () => {
    const result = await signup(formDataFor('learner@example.com', 'Sup3rSecret!', ''));

    expect(result).toEqual({ error: 'Please complete the CAPTCHA' });
    expect(mockSignUp).not.toHaveBeenCalled();
  });

  describe('input validation', () => {
    it('rejects an invalid email before checking anything else', async () => {
      const result = await signup(
        formDataFor('not-an-email', 'Sup3rSecret!', 'captcha-token'),
      );

      expect(result.error).toBeTruthy();
      expect(mockSignUp).not.toHaveBeenCalled();
    });

    it('rejects a password that fails the complexity rules', async () => {
      const result = await signup(
        formDataFor('learner@example.com', 'allLowercaseNoSymbol', 'captcha-token'),
      );

      expect(result.error).toBeTruthy();
      expect(mockSignUp).not.toHaveBeenCalled();
    });
  });

  describe('confirm-password check', () => {
    it('rejects the signup when confirmPassword does not match password', async () => {
      const result = await signup(
        formDataFor(
          'learner@example.com',
          'Sup3rSecret!',
          'captcha-token',
          'SomethingDifferent1!',
        ),
      );

      expect(result).toEqual({ error: 'Passwords do not match' });
      expect(mockSignUp).not.toHaveBeenCalled();
    });
  });

  describe('Supabase error branches', () => {
    it('surfaces a CAPTCHA-specific message when Supabase rejects the token', async () => {
      mockSignUp.mockResolvedValue({
        error: { message: 'captcha verification process failed' },
      });

      const result = await signup(
        formDataFor('learner@example.com', 'Sup3rSecret!', 'captcha-token'),
      );

      expect(result).toEqual({
        error: 'CAPTCHA verification failed. Please try again.',
      });
    });

    it('surfaces a weak-password message on the weak_password code', async () => {
      mockSignUp.mockResolvedValue({ error: { code: 'weak_password' } });

      const result = await signup(
        formDataFor('learner@example.com', 'Sup3rSecret!', 'captcha-token'),
      );

      expect(result).toEqual({
        error: 'That password is too weak. Try a longer one.',
      });
    });

    it('falls back to a generic message for any other Supabase failure (no enumeration)', async () => {
      mockSignUp.mockResolvedValue({
        error: { code: 'email_exists', message: 'User already registered' },
      });

      const result = await signup(
        formDataFor('learner@example.com', 'Sup3rSecret!', 'captcha-token'),
      );

      expect(result).toEqual({
        error: 'Unable to create account. Please try again.',
      });
    });
  });
});