import { beforeEach, describe, expect, it, vi } from 'vitest';

// Allow the server-only authentication guard to be tested in Vitest.
vi.mock('server-only', () => ({}));

// Regression test: /learn/[slug] must remain protected.
// Authentication is now enforced by the (protected) layout,
// rather than directly inside the individual learning page.

const { mockGetUser, mockSingle, mockRedirect } = vi.hoisted(() => ({
  mockGetUser: vi.fn(),
  mockSingle: vi.fn(),
  mockRedirect: vi.fn((url: string) => {
    throw new Error(`NEXT_REDIRECT:${url}`);
  }),
}));

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(async () => ({
    auth: { getUser: mockGetUser },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          maybeSingle: mockSingle,
        })),
      })),
    })),
  })),
}));

vi.mock('next/navigation', () => ({
  redirect: mockRedirect,
}));

vi.mock('@/components/learning/moduleShell', () => ({
  ModuleShell: () => null,
}));

// The layout's navigation and popup are not relevant to these tests.
vi.mock('@/components/navbar', () => ({
  default: () => null,
}));

vi.mock('@/components/daily-challenge/dailyChallengePopup', () => ({
  DailyChallengePopup: () => null,
}));

import LearnPage from './page';
import ProtectedLayout from '../../layout';

describe('/learn/[slug] page', () => {
  beforeEach(() => {
    mockGetUser.mockReset();
    mockSingle.mockReset();
    mockRedirect.mockClear();
  });

  it('redirects signed-out visitors to /login through the protected layout', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: null },
      error: null,
    });

    await expect(
      ProtectedLayout({ children: null })
    ).rejects.toThrow('NEXT_REDIRECT:/login');

    expect(mockRedirect).toHaveBeenCalledWith('/login');
  });

  it('redirects users who have not completed onboarding', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'user-1' } },
      error: null,
    });

    mockSingle.mockResolvedValue({
      data: null,
      error: null,
    });

    await expect(
      ProtectedLayout({ children: null })
    ).rejects.toThrow('NEXT_REDIRECT:/onboarding');

    expect(mockRedirect).toHaveBeenCalledWith('/onboarding');
  });

  it('renders the correct module for a signed-in, onboarded user', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'user-1' } },
      error: null,
    });

    mockSingle.mockResolvedValue({
      data: {
        first_name: 'Sarah',
        last_name: 'Salman',
      },
      error: null,
    });

    const element = await LearnPage({
      params: Promise.resolve({ slug: 'bb84-basics' }),
    });

    const layout = await ProtectedLayout({
      children: element,
    });

    expect(mockRedirect).not.toHaveBeenCalled();

    // The learning page passes the requested slug to ModuleShell.
    expect(element.props).toEqual({
      slug: 'bb84-basics',
    });

    // The protected layout includes the learning page.
    expect(layout.props.children[1]).toBe(element);
  });
});
