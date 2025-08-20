"use client";

import { useEffect, useState } from "react";
import type React from "react";

type AnnotationAction = "highlight" | "underline" | "box";

interface HighlighterProps {
  children: React.ReactNode;
  action?: AnnotationAction;
  color?: string;
  strokeWidth?: number;
  animationDuration?: number;
  iterations?: number;
  padding?: number;
  multiline?: boolean;
}

export function Highlighter({
  children,
  action = "underline",
  color = "#ffd1dc",
  strokeWidth = 2,
  animationDuration = 600,
  iterations = 2,
  padding = 2,
  multiline = true,
}: HighlighterProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // コンポーネントがマウントされた後にアニメーションを開始
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const getStyles = () => {
    const baseStyles = {
      padding: `${padding}px`,
      borderRadius: "3px",
      fontWeight: "bold" as const,
      transition: `all ${animationDuration}ms ease-out`,
      opacity: isVisible ? 1 : 0,
      transform: isVisible ? "translateY(0)" : "translateY(2px)",
    };

    switch (action) {
      case "underline":
        return {
          ...baseStyles,
          background: `linear-gradient(transparent 60%, ${color} 60%, ${color} 85%, transparent 85%)`,
          backgroundSize: isVisible ? "100% 100%" : "0% 100%",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
        };
      case "highlight":
        return {
          ...baseStyles,
          backgroundColor: color,
          boxShadow: isVisible ? `0 0 0 ${padding}px ${color}` : "none",
        };
      case "box":
        return {
          ...baseStyles,
          border: `${strokeWidth}px solid ${color}`,
          boxShadow: isVisible ? `0 0 0 ${padding}px ${color}20` : "none",
        };
      default:
        return baseStyles;
    }
  };

  const getAnimationKeyframes = () => {
    if (iterations <= 1) return {};

    return {
      animation: `pulse ${animationDuration * 2}ms ease-in-out ${iterations - 1}`,
    };
  };

  return (
    <>
      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.05); }
        }
      `}</style>
      <span 
        style={{
          ...getStyles(),
          ...getAnimationKeyframes(),
        }}
        className="inline-block"
      >
        {children}
      </span>
    </>
  );
}
