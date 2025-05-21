"use client";

import { useEffect } from "react";
import confetti from "canvas-confetti";

export const Confetti = () => {
  useEffect(() => {
    const timer = setTimeout(() => {
      triggerRandomConfetti();
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const triggerRandomConfetti = () => {
    const patterns = [patternLeftRight, patternBurst, patternRain, patternCenterBlast];
    const randomPattern = patterns[Math.floor(Math.random() * patterns.length)];
    randomPattern();
  };

  const baseColors = ["#FFC700", "#FF0080", "#00FFFF", "#7928CA"];

  // 左右から同時に発射
  const patternLeftRight = () => {
    const duration = 3 * 1000;
    const end = Date.now() + duration;

    (function frame() {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: baseColors,
      });

      confetti({
        particleCount: 4,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: baseColors,
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    })();
  };

  // 中央から爆発
  const patternBurst = () => {
    confetti({
      particleCount: 100,
      spread: 360,
      origin: { y: 0.5 },
      colors: baseColors,
    });
  };

  // 雨のように上から落ちる
  const patternRain = () => {
    const duration = 3 * 1000;
    const end = Date.now() + duration;

    (function frame() {
      confetti({
        particleCount: 2,
        angle: 90,
        spread: 30,
        origin: { x: Math.random(), y: 0 },
        colors: baseColors,
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    })();
  };

  // 画面中央から花火のようにドン
  const patternCenterBlast = () => {
    const duration = 2 * 1000;
    const end = Date.now() + duration;

    (function frame() {
      confetti({
        particleCount: 10,
        startVelocity: 30,
        spread: 360,
        origin: { x: 0.5, y: 0.5 },
        colors: baseColors,
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    })();
  };

  return <></>;
};
