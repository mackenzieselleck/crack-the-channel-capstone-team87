// @vitest-environment jsdom

import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { BadgeUnlockProvider } from './badgeUnlockProvider';

const mocks = vi.hoisted(() => ({
  rpc: vi.fn(),
  order: vi.fn(),
  select: vi.fn(),
  eq: vi.fn(),
  is: vi.fn(),
  channel: vi.fn(),
  removeChannel: vi.fn(),
  subscription: { name: 'badge-subscription' },
  pathname: '/profile',
  notify: () => {},
}));

vi.mock('next/navigation', () => ({ usePathname: () => mocks.pathname }));
vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    from: () => ({ select: mocks.select }),
    rpc: mocks.rpc,
    channel: mocks.channel,
    removeChannel: mocks.removeChannel,
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
  // jsdom does not implement native modal behaviour. This stub supports the
  // component lifecycle and key-handler tests; native inertness needs a browser.
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
  mocks.pathname = '/profile';
  mocks.select.mockReturnValue({ eq: mocks.eq });
  mocks.eq.mockReturnValue({ is: mocks.is });
  mocks.is.mockReturnValue({ order: mocks.order });
  mocks.channel.mockReturnValue({
    on: (_event: string, _filter: unknown, notify: () => void) => {
      mocks.notify = notify;
      return { subscribe: () => mocks.subscription };
    },
  });
  mocks.order.mockResolvedValue({ data: badges, error: null });
  mocks.rpc.mockResolvedValue({ error: null });
});

describe('unseen badge loading', () => {
  it('requests only the current learner\'s unseen badges in earned order', async () => {
    openProvider();
    await screen.findByRole('heading', { name: 'First badge' });
    expect(mocks.eq).toHaveBeenCalledWith('user_id', 'learner');
    expect(mocks.is).toHaveBeenCalledWith('seen_at', null);
    expect(mocks.order).toHaveBeenCalledWith('earned_at');
    expect(mocks.channel).toHaveBeenCalledWith('user-badges:learner');

    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
    await screen.findByRole('heading', { name: 'Second badge' });
  });

  it('ignores missing badge relations and badges without display art', async () => {
    mocks.order.mockResolvedValue({
      data: [
        { badge_id: 'missing', badges: null },
        { badge_id: 'no-art', badges: { ...badges[0].badges, id: 'no-art', artboard: '' } },
        badges[1],
      ],
      error: null,
    });
    openProvider();
    expect(await screen.findByRole('dialog')).toHaveAccessibleName('Second badge');
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(mocks.rpc).toHaveBeenCalledTimes(1);
    expect(mocks.rpc).toHaveBeenCalledWith('mark_badges_seen', { p_badge_ids: ['badge-1'] });
  });

  it('keeps the page available after a read error and recovers on a later notification', async () => {
    mocks.order.mockResolvedValueOnce({ data: null, error: { message: 'offline' } });
    openProvider();
    await waitFor(() => expect(mocks.order).toHaveBeenCalledTimes(1));
    expect(screen.getByRole('button', { name: 'Background action' })).toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(mocks.rpc).not.toHaveBeenCalled();

    await act(async () => { mocks.notify(); });
    expect(await screen.findByRole('dialog')).toHaveAccessibleName('First badge');
  });

  it('checks for newly earned badges after navigation', async () => {
    mocks.order.mockResolvedValueOnce({ data: [], error: null });
    const view = openProvider();
    await waitFor(() => expect(mocks.order).toHaveBeenCalledTimes(1));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    mocks.pathname = '/learn';
    view.rerender(
      <BadgeUnlockProvider userId="learner"><button>Background action</button></BadgeUnlockProvider>,
    );
    expect(await screen.findByRole('dialog')).toHaveAccessibleName('First badge');
    expect(mocks.order).toHaveBeenCalledTimes(2);
  });

  it('removes the realtime subscription on unmount', async () => {
    mocks.order.mockResolvedValue({ data: [], error: null });
    const view = openProvider();
    await waitFor(() => expect(mocks.order).toHaveBeenCalledTimes(1));
    view.unmount();
    expect(mocks.removeChannel).toHaveBeenCalledTimes(1);
    expect(mocks.removeChannel).toHaveBeenCalledWith(mocks.subscription);
  });

  it('does not show a saved dismissal after remount when the backend reports it as seen', async () => {
    // This models the backend boundary across remount; database seen_at
    // persistence and permissions are tested in the pgTAP suite separately.
    let seen = false;
    mocks.order.mockImplementation(async () => ({ data: seen ? [] : [badges[0]], error: null }));
    mocks.rpc.mockImplementation(async () => { seen = true; return { error: null }; });
    const first = openProvider();
    fireEvent.click(await screen.findByRole('button', { name: 'Continue' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    first.unmount();

    openProvider();
    await waitFor(() => expect(mocks.order).toHaveBeenCalledTimes(2));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(mocks.rpc).toHaveBeenCalledTimes(1);
  });
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
