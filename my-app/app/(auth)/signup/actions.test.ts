import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// regression test for the sign-up confirmation redirect bug

const mockSignUp = vi.fn();

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(async () => ({
    auth: { signUp: mockSignUp },
  })),
}));

import { signup } from './actions';

function formDataFor(email: string, password: string, captchaToken: string) {
  const formData = new FormData();
  formData.set('email', email);
  formData.set('password', password);
  formData.set('confirmPassword', password);
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
});