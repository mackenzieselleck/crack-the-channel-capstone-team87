//Unit tests for requireUser() and requireOnboarding(), the functions every protected page calls.

import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));

const { mockRedirect } = vi.hoisted(() => ({
  mockRedirect: vi.fn((url: string) => {
    throw new Error(`REDIRECT:${url}`);
  }),
}));

vi.mock('next/navigation', () => ({
  redirect: mockRedirect,
}));

const { mockGetUser, mockMaybeSingle, mockEq, mockSelect, mockFrom } =
  vi.hoisted(() => {
    const mockMaybeSingle = vi.fn();
    const mockEq = vi.fn(() => ({ maybeSingle: mockMaybeSingle }));
    const mockSelect = vi.fn(() => ({ eq: mockEq }));
    const mockFrom = vi.fn(() => ({ select: mockSelect }));
    return {
      mockGetUser: vi.fn(),
      mockMaybeSingle,
      mockEq,
      mockSelect,
      mockFrom,
    };
  });

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(async () => ({
    auth: { getUser: mockGetUser },
    from: mockFrom,
  })),
}));

import { requireOnboarding, requireUser } from './guards';

describe('requireUser()', () => {
  beforeEach(() => {
    mockGetUser.mockReset();
    mockRedirect.mockClear();
  });

  it('redirects to /login when there is no authenticated user', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null });

    await expect(requireUser()).rejects.toThrow('REDIRECT:/login');
  });

  it('redirects to /login when Supabase returns an error', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: null },
      error: { message: 'invalid session' },
    });

    await expect(requireUser()).rejects.toThrow('REDIRECT:/login');
  });

  it('returns the supabase client and user when authenticated', async () => {
    const user = { id: 'user-1' };
    mockGetUser.mockResolvedValue({ data: { user }, error: null });

    const result = await requireUser();

    expect(result.user).toEqual(user);
    expect(result.supabase).toBeDefined();
    expect(mockRedirect).not.toHaveBeenCalled();
  });
});

describe('requireOnboarding()', () => {
  beforeEach(() => {
    mockGetUser.mockReset();
    mockMaybeSingle.mockReset();
    mockRedirect.mockClear();
  });

  it('redirects to /login first when there is no authenticated user', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null });

    await expect(requireOnboarding()).rejects.toThrow('REDIRECT:/login');
    expect(mockFrom).not.toHaveBeenCalled();
  });

  it('redirects to /onboarding when the profile row is missing entirely', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'user-1' } },
      error: null,
    });
    mockMaybeSingle.mockResolvedValue({ data: null, error: null });

    await expect(requireOnboarding()).rejects.toThrow('REDIRECT:/onboarding');
  });

  it('redirects to /onboarding when first/last name are blank', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'user-1' } },
      error: null,
    });
    mockMaybeSingle.mockResolvedValue({
      data: { first_name: '  ', last_name: '' },
      error: null,
    });

    await expect(requireOnboarding()).rejects.toThrow('REDIRECT:/onboarding');
  });

  it('throws (and does not redirect) when the profile query itself fails', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'user-1' } },
      error: null,
    });
    mockMaybeSingle.mockResolvedValue({
      data: null,
      error: { code: 'PGRST500', message: 'db down' },
    });

    await expect(requireOnboarding()).rejects.toThrow(
      'Unable to load your profile. Please try again.',
    );
    expect(mockRedirect).not.toHaveBeenCalled();
  });

  it('returns the user and profile when onboarding is complete', async () => {
    const user = { id: 'user-1' };
    mockGetUser.mockResolvedValue({ data: { user }, error: null });
    mockMaybeSingle.mockResolvedValue({
      data: { first_name: 'Ada', last_name: 'Lovelace' },
      error: null,
    });

    const result = await requireOnboarding();

    expect(result.user).toEqual(user);
    expect(result.profile).toEqual({
      first_name: 'Ada',
      last_name: 'Lovelace',
    });
    expect(mockRedirect).not.toHaveBeenCalled();
  });
});