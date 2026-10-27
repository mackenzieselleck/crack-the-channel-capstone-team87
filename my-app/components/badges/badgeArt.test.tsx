// @vitest-environment jsdom

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { cleanup, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { BadgeArt } from './badgeArt';

const { useRive } = vi.hoisted(() => ({ useRive: vi.fn() }));
vi.mock('@rive-app/react-canvas', () => ({ useRive }));

beforeEach(() => {
  useRive.mockReset().mockImplementation(() => {
    throw new Error('Rive must remain disabled while static badge images are in use');
  });
});
afterEach(() => cleanup());

describe('static badge art', () => {
  it('renders the configured PNG as decorative artwork without initialising Rive', () => {
    const { container } = render(
      <BadgeArt artboard="QuantumStarter" fallbackSrc="/images/badges/quantum-starter.png" className="badge-size" />,
    );
    const image = container.querySelector('img');
    expect(image).toHaveAttribute('src', '/images/badges/quantum-starter.png');
    expect(image).toHaveAttribute('alt', '');
    expect(image).toHaveAttribute('aria-hidden', 'true');
    expect(image).toHaveClass('badge-size', 'object-contain');
    expect(useRive).not.toHaveBeenCalled();
  });

  it.each([undefined, null, ''])('renders no broken image when the fallback URL is %s', (fallbackSrc) => {
    const { container } = render(<BadgeArt artboard="QuantumStarter" fallbackSrc={fallbackSrc} />);
    expect(container).toBeEmptyDOMElement();
    expect(useRive).not.toHaveBeenCalled();
  });

  it('updates to the next badge PNG when the badge changes', () => {
    const { container, rerender } = render(
      <BadgeArt artboard="QuantumStarter" fallbackSrc="/images/badges/quantum-starter.png" />,
    );
    rerender(<BadgeArt artboard="BasisExplorer" fallbackSrc="/images/badges/basis-explorer.png" />);
    expect(container.querySelectorAll('img')).toHaveLength(1);
    expect(container.querySelector('img')).toHaveAttribute('src', '/images/badges/basis-explorer.png');
    expect(useRive).not.toHaveBeenCalled();
  });
});

describe('catalogue PNG assets', () => {
  it.each([
    'quantum-starter',
    'basis-explorer',
    'key-sifter',
    'eavesdropper-detective',
    'qiskit-practitioner',
    'daily-challenge',
    'consistency-master',
    'overall-champion',
  ])('%s exists and has a PNG file signature', (slug) => {
    const bytes = readFileSync(resolve(process.cwd(), 'public', 'images', 'badges', `${slug}.png`));
    expect(bytes.length).toBeGreaterThan(8);
    expect(bytes.subarray(0, 8).toString('hex')).toBe('89504e470d0a1a0a');
  });
});
