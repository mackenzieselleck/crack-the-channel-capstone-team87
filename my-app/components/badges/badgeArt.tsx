'use client';

import { useRive } from '@rive-app/react-canvas';

export const BADGES_RIV = '/rive/badges.riv';

// plays badge's BadgeState state machine once on mount
// renders with key={artboard}
export function BadgeArt({ artboard, className }: { artboard: string; className?: string }) {
  const { RiveComponent } = useRive({
    src: BADGES_RIV,
    artboard,
    stateMachines: 'BadgeState',
    autoplay: true,
  });

  return <RiveComponent className={className} aria-hidden="true" />;
}