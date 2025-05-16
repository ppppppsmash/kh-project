"use client";

import { useEffect } from "react";
import confetti from "canvas-confetti";

export const Confetti = () => {
  useEffect(() => {
    const timer = setTimeout(() => {
      triggerConfetti();
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const triggerConfetti = () => {
    const duration = 3 * 1000;
    const end = Date.now() + duration;

    const colors = ["#FFC700", "#FF0080", "#00FFFF", "#7928CA"];
    (function frame() {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: colors,
      });

      confetti({
        particleCount: 4,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: colors,
      })

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    })();
  };

  return (
    <></>
	);
}
