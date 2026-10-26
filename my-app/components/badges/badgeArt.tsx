'use client';

import { useState } from 'react';
import { useRive } from '@rive-app/react-canvas';
import styles from './badgeArt.module.css';

export const BADGES_RIV = '/rive/badges.riv';

// Set to true once public/rive/badges.riv contains all eight badge artboards.
// While false, the popup shows each badge's static PNG instead.
const USE_RIVE = false;

type Props = {
  artboard: string;
  fallbackSrc?: string | null;
  className?: string;
};

export function BadgeArt(props: Props) {
  return USE_RIVE ? <RiveBadge {...props} /> : <StaticBadge src={props.fallbackSrc} className={props.className} />;
}

function StaticBadge({ src, className }: { src?: string | null; className?: string }) {
  if (!src) return null;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt="" aria-hidden="true" className={`${className ?? ''} ${styles.pop} object-contain`} />
  );
}

// Plays a badge's BadgeState state machine once on mount, falling back to the PNG
// if the artboard can't be loaded.
// Render with key={artboard}: useRive doesn't switch artboards on an existing instance.
function RiveBadge({ artboard, fallbackSrc, className }: Props) {
  const [failed, setFailed] = useState(false);

  const { RiveComponent } = useRive({
    src: BADGES_RIV,
    artboard,
    stateMachines: 'BadgeState',
    autoplay: true,
    onLoadError: () => {
      console.error(`BadgeArt: no artboard named "${artboard}" in ${BADGES_RIV}`);
      setFailed(true);
    },
  });

  if (failed) return <StaticBadge src={fallbackSrc} className={className} />;
  return <RiveComponent className={className} aria-hidden="true" />;
}