import { PropsWithChildren, useEffect } from 'react';

export type MotionPref = 'ok' | 'reduce';

export default function SeasonalUIProvider({ children }: PropsWithChildren) {
  useEffect(() => {
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    document.documentElement.dataset.motion = reduced ? 'reduce' : 'ok';
  }, []);
  return children as any;
}
