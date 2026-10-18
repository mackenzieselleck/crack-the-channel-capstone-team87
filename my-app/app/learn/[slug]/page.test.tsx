import { beforeEach, describe, expect, it, vi } from 'vitest';

// Allow the server-only module to be tested in Vitest.
vi.mock('server-only', () => ({}));

// regression test: app/learn/[slug]/page.tsx lives outside the (protected)
// route group, so it never ran requireOnboarding(), a signed-out visitor
// could load /learn/<any-slug> directly and see module content that every
// other learning route keeps behind a login check.

const mockGetUser = vi.fn();
const mockSingle = vi.fn();

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

const { mockRedirect, mockModuleShell } = vi.hoisted(() => ({
  mockRedirect: vi.fn((url: string) => {
    throw new Error(`NEXT_REDIRECT:${url}`);
  }),
  mockModuleShell: vi.fn((_props: { slug: string }) => null),
}));

vi.mock('next/navigation', () => ({
  redirect: mockRedirect,
}));

vi.mock('@/components/learning/moduleShell', () => ({
  ModuleShell: (props: { slug: string }) => {
    mockModuleShell(props);
    return null;
  },
}));

import LearnPage from './page';

describe('/learn/[slug] page', () => {
  beforeEach(() => {
    mockGetUser.mockReset();
    mockSingle.mockReset();
    mockRedirect.mockClear();
    mockModuleShell.mockClear();
  });

  it('redirects signed-out visitors to /login instead of rendering the module', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });

    await expect(
      LearnPage({ params: Promise.resolve({ slug: 'bb84-basics' }) })
    ).rejects.toThrow('NEXT_REDIRECT:/login');

    expect(mockRedirect).toHaveBeenCalledWith('/login');
    expect(mockModuleShell).not.toHaveBeenCalled();
  });

  it('renders the module for a signed-in, onboarded user', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } });
    mockSingle.mockResolvedValue({
      data: { first_name: 'Sarah', last_name: 'Salman' },
    });

    const element = await LearnPage({ params: Promise.resolve({ slug: 'bb84-basics' }) });

    expect(mockRedirect).not.toHaveBeenCalled();

    const children = element.props.children;

    expect(children).toHaveLength(2);
    expect(children[1].props).toEqual({ slug: 'bb84-basics' });

  });
});