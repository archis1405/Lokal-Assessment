

import { useState, useEffect, useRef, useMemo } from 'react';

export function useSessionTimer(startTime: number) {
  const [elapsed, setElapsed] = useState(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (!startTime) return;

    const tick = () => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000));
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [startTime]);

  const formatted = useMemo(() => {
    const mm = String(Math.floor(elapsed / 60)).padStart(2, '0');
    const ss = String(elapsed % 60).padStart(2, '0');
    return `${mm}:${ss}`;
  }, [elapsed]);

  return { elapsed, formatted };
}
