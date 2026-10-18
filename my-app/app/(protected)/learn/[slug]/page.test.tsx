import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockGetUser = vi.fn();
const mockSingle = vi.fn();

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(async () => ({
    auth: { getUser: mockGetUser },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: mockSingle,
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
    expect(element.props).toEqual({ slug: 'bb84-basics' });
  });
});