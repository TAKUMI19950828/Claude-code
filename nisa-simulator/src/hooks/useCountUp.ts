import { useEffect, useRef, useState } from 'react';

/** prefers-reduced-motion を購読する。 */
export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handler = () => setReduced(mq.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);
  return reduced;
}

/**
 * カウントアップ表示。
 * - `trigger` が変わったとき 0 → target を1回アニメーション（初回マウント・タブ切替・共有オープン）。
 * - `target` だけが変わる（ライブ編集）ときは即値に追従（カウントアップしない）。
 * - reduced-motion 時は常に即値。
 */
export function useCountUp(target: number, trigger: unknown, duration = 700): number {
  const prefersReduced = usePrefersReducedMotion();
  const [display, setDisplay] = useState(target);
  const animatingRef = useRef(false);
  const rafRef = useRef(0);

  // trigger 変化時のみ 0 → target をアニメーション
  useEffect(() => {
    if (prefersReduced) {
      setDisplay(target);
      return;
    }
    cancelAnimationFrame(rafRef.current);
    animatingRef.current = true;
    const from = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
      setDisplay(from + (target - from) * eased);
      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        animatingRef.current = false;
      }
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
    // target はあえて依存に含めない（trigger 起点でのみアニメ）
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trigger, prefersReduced]);

  // ライブ編集（アニメ中でない）時は即値に追従
  useEffect(() => {
    if (!animatingRef.current) setDisplay(target);
  }, [target]);

  return display;
}
