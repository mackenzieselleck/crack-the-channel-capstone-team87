// @vitest-environment jsdom

import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { BadgeUnlockProvider } from './badgeUnlockProvider';

const mocks = vi.hoisted(() => ({
  rpc: vi.fn(),
  order: vi.fn(),
  notify: () => {},
}));

vi.mock('next/navigation', () => ({ usePathname: () => '/profile' }));
vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    from: () => ({
      select: () => ({ eq: () => ({ is: () => ({ order: mocks.order }) }) }),
    }),
    rpc: mocks.rpc,
    channel: () => ({
      on: (_event: string, _filter: unknown, notify: () => void) => {
        mocks.notify = notify;
        return { subscribe: () => ({}) };
      },
    }),
    removeChannel: vi.fn(),
  }),
}));
vi.mock('./badgeArt', () => ({ BadgeArt: () => <span>Badge art</span> }));

const badges = ['First badge', 'Second badge'].map((title, index) => ({
  badge_id: `badge-${index}`,
  badges: {
    id: `badge-${index}`,
    slug: `badge-${index}`,
    title,
    description: 'An earned badge',
    artboard: `Badge${index}`,
    icon_url: null,
  },
}));

function openProvider() {
  return render(
    <BadgeUnlockProvider userId="learner">
      <button>Background action</button>
    </BadgeUnlockProvider>,
  );
}

const originalShowModal = Object.getOwnPropertyDescriptor(HTMLDialogElement.prototype, 'showModal');
const originalClose = Object.getOwnPropertyDescriptor(HTMLDialogElement.prototype, 'close');

beforeAll(() => {
  // jsdom does not implement native modal behaviour; keyboard containment and
  // page inertness are verified separately in a real browser.
  Object.defineProperty(HTMLDialogElement.prototype, 'showModal', {
    configurable: true,
    value(this: HTMLDialogElement) { this.setAttribute('open', ''); },
  });
  Object.defineProperty(HTMLDialogElement.prototype, 'close', {
    configurable: true,
    value(this: HTMLDialogElement) { this.removeAttribute('open'); },
  });
});

afterAll(() => {
  for (const [name, descriptor] of [['showModal', originalShowModal], ['close', originalClose]] as const) {
    if (descriptor) Object.defineProperty(HTMLDialogElement.prototype, name, descriptor);
    else Reflect.deleteProperty(HTMLDialogElement.prototype, name);
  }
});

beforeEach(() => {
  vi.clearAllMocks();
  mocks.order.mockResolvedValue({ data: badges, error: null });
  mocks.rpc.mockResolvedValue({ error: null });
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('badge dismissal', () => {
  it('keeps a failed save visible, explains the failure, and retries the same badge', async () => {
    const user = userEvent.setup();
    mocks.rpc.mockResolvedValueOnce({ error: { message: 'offline' } });
    openProvider();
    await user.click(await screen.findByRole('button', { name: 'Continue' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Your badge is safe');
    expect(screen.getByRole('dialog')).toHaveAccessibleName('First badge');
    await user.click(screen.getByRole('button', { name: 'Try again' }));
    await screen.findByRole('heading', { name: 'Second badge' });
    expect(mocks.rpc).toHaveBeenNthCalledWith(1, 'mark_badges_seen', { p_badge_ids: ['badge-0'] });
    expect(mocks.rpc).toHaveBeenNthCalledWith(2, 'mark_badges_seen', { p_badge_ids: ['badge-0'] });
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('also retains retryable state when the request throws', async () => {
    mocks.rpc.mockRejectedValueOnce(new Error('network disconnected'));
    openProvider();
    fireEvent.click(await screen.findByRole('button', { name: 'Continue' }));
    expect(await screen.findByRole('alert')).toBeInTheDocument();
    expect(screen.getByRole('dialog')).toHaveAccessibleName('First badge');
  });

  it('waits for persistence and ignores duplicate button, Escape and backdrop dismissals', async () => {
    let finish!: (value: { error: null }) => void;
    mocks.rpc.mockImplementationOnce(() => new Promise((resolve) => { finish = resolve; }));
    openProvider();
    const button = await screen.findByRole('button', { name: 'Continue' });
    fireEvent.click(button);
    fireEvent.click(button);
    const dialog = screen.getByRole('dialog');
    const cancel = new Event('cancel', { cancelable: true });
    fireEvent(dialog, cancel);
    fireEvent.click(dialog);

    expect(cancel.defaultPrevented).toBe(true);
    expect(mocks.rpc).toHaveBeenCalledTimes(1);
    expect(dialog).toHaveAccessibleName('First badge');
    expect(button).toHaveAttribute('aria-disabled', 'true');
    expect(button).toHaveFocus();
    await act(async () => { finish({ error: null }); });
    await screen.findByRole('heading', { name: 'Second badge' });
  });

  it('uses the same retry path when Escape dismissal fails', async () => {
    mocks.rpc.mockResolvedValueOnce({ error: { message: 'offline' } });
    openProvider();
    const dialog = await screen.findByRole('dialog');
    fireEvent(dialog, new Event('cancel', { cancelable: true }));
    expect(await screen.findByRole('alert')).toBeInTheDocument();
    expect(dialog).toHaveAttribute('open');
  });

  it('does not requeue saved badges when notifications repeat', async () => {
    openProvider();
    fireEvent.click(await screen.findByRole('button', { name: 'Continue' }));
    await screen.findByRole('heading', { name: 'Second badge' });
    await act(async () => { mocks.notify(); mocks.notify(); });
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    await act(async () => { mocks.notify(); });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(mocks.rpc).toHaveBeenCalledTimes(2);
  });

  it('restores focus to the previously focused page control after the queue closes', async () => {
    mocks.order.mockResolvedValue({ data: [], error: null });
    openProvider();
    const background = screen.getByRole('button', { name: 'Background action' });
    background.focus();
    mocks.order.mockResolvedValue({ data: [badges[0]], error: null });
    await act(async () => { mocks.notify(); });
    const button = await screen.findByRole('button', { name: 'Continue' });
    expect(button).toHaveFocus();
    fireEvent.click(button);
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      expect(background).toHaveFocus();
    });
    expect(background).toHaveFocus();
  });

  it('keeps forward and backward Tab navigation on the dialog controls', async () => {
    const user = userEvent.setup();
    openProvider();
    const button = await screen.findByRole('button', { name: 'Continue' });
    await user.tab();
    expect(button).toHaveFocus();
    await user.tab({ shift: true });
    expect(button).toHaveFocus();
  });
});
