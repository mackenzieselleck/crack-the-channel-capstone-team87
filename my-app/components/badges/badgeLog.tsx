'use client';

import { useEffect } from 'react';
import { Rive } from '@rive-app/react-canvas';

// TEMPORARY: lists every artboard and state machine in badges.riv. Delete once fixed.
export function RiveArtboardList() {
  useEffect(() => {
    const canvas = document.createElement('canvas');
    const r = new Rive({
      src: '/rive/badges.riv',
      canvas,
      onLoad: () =>
        console.table(
          r.contents?.artboards?.map((a) => ({
            artboard: a.name,
            stateMachines: a.stateMachines.map((s) => s.name).join(', '),
          })),
        ),
      onLoadError: (e) => console.error('badges.riv failed to load', e),
    });
    return () => r.cleanup();
  }, []);
  return null;
}