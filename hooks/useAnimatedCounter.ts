"use client";

import { useEffect, useState } from "react";

export function useAnimatedCounter(
  end: number,
  duration = 2000,
  startOnView = true,
  isInView = false
) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!startOnView || !isInView) return;

    let startTime: number;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(easeOut * end));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration, startOnView, isInView]);

  return count;
}
