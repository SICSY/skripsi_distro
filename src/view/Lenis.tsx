"use client";
import { ReactLenis } from "lenis/react";
import React, { useEffect, useRef } from "react";
import type { LenisProps, LenisRef } from "lenis/react";

export function LenisWrapper({ onScroll, children }: { onScroll?: (lenis: LenisProps) => void; children: React.ReactNode }) {
  const lenisRef = useRef<LenisRef>(null);

  useEffect(() => {
    let animationFrameId: number;

    const raf = (time: number) => {
      const lenis = lenisRef.current?.lenis;
      if (lenis) {
        lenis.raf(time);
        onScroll?.(lenis); // kirim progress ke luar (Canvas)
      }
      animationFrameId = requestAnimationFrame(raf);
    };

    animationFrameId = requestAnimationFrame(raf);
    return () => cancelAnimationFrame(animationFrameId);
  }, [onScroll]);

  return (
    <ReactLenis root options={{ autoRaf: false }} ref={lenisRef}>
      {children}
    </ReactLenis>
  );
}
