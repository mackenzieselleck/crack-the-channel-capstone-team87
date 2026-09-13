import type { ReactNode } from 'react';
import RiveMascot from './mascot';
//sets mascot into corner
interface MascotCornerProps {
  mood: number;
  bubble?: ReactNode;
  children?: ReactNode;
}

export default function MascotCorner({ mood, bubble, children }: MascotCornerProps) {
  return (
    <div className="pointer-events-none fixed bottom-4 left-4 z-50 flex flex-col gap-2 sm:bottom-6 sm:left-6">
      <div className="pointer-events-auto flex items-end gap-3">
        <RiveMascot
          mood={mood}
          className="h-20 w-20 shrink-0 sm:h-24 sm:w-24 md:h-28 md:w-28"
        />
        {bubble}
      </div>
      {children && <div className="pointer-events-auto pl-1">{children}</div>}
    </div>
  );
}