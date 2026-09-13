'use client';

import { useEffect } from 'react';
import { useRive, useViewModelInstanceNumber } from '@rive-app/react-webgl2';

//rive file names
const RIVE_SRC = 'spike_mascot.riv';
const ARTBOARD_NAME = 'Artboard 1';
const STATE_MACHINE_NAME = 'State Machine 1';
const MOOD_PROPERTY = 'mood';

interface RiveMascotProps {
  mood: number;
  className?: string;
}

export default function RiveMascot({ mood, className }: RiveMascotProps) {
  const { rive, RiveComponent } = useRive({
    src: RIVE_SRC,
    artboard: ARTBOARD_NAME,
    stateMachines: STATE_MACHINE_NAME,
    autoplay: true,
  
    autoBind: true,
  });

  const { setValue: setMood } = useViewModelInstanceNumber(
    MOOD_PROPERTY,
    rive?.viewModelInstance
  );
//sets mascot mood
  useEffect(() => {
    if (setMood) setMood(mood);
  }, [mood, setMood]);

  return (
    <div className={className}>
      <RiveComponent />
    </div>
  );
}