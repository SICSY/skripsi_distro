"use client";
import { useRef, useEffect, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

interface LoadingScreenProps {
  is3DReady: boolean;
  onLoadingComplete: () => void;
}

export default function LoadingScreen({ is3DReady, onLoadingComplete }: LoadingScreenProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const loaderRef = useRef<HTMLDivElement>(null);
  const textLinesRef = useRef<HTMLDivElement[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [particles, setParticles] = useState<Array<{ left: string; top: string; delay: string; duration: string }>>([]);

  const textLines = ["TRIMMING WITH", "JUST TAKE AS", "WE REQUIRE."];

  // Handle client-side only rendering
  useEffect(() => {
    setIsClient(true);
    // Generate particles only on client side to avoid hydration mismatch
    const newParticles = Array.from({ length: 50 }).map(() => ({
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      delay: `${Math.random() * 3}s`,
      duration: `${2 + Math.random() * 3}s`
    }));
    setParticles(newParticles);
  }, []);

  useGSAP(() => {
    if (!isClient) return;

    const tl = gsap.timeline({ repeat: -1 });

    // Initial setup - all text blurred and invisible
    gsap.set(textLinesRef.current, {
      opacity: 0,
      filter: "blur(20px)",
      y: 50
    });

    // Animate text lines with staggered blur effect
    textLinesRef.current.forEach((line, index) => {
      if (!line) return;

      tl.to(
        line,
        {
          opacity: 1,
          filter: "blur(0px)",
          y: 0,
          duration: 1.5,
          ease: "power3.out",
          delay: index * 0.3
        },
        index * 0.5
      )
        .to(
          line,
          {
            filter: "blur(8px)",
            duration: 0.8,
            ease: "power2.inOut"
          },
          `+=${0.5}`
        )
        .to(
          line,
          {
            filter: "blur(0px)",
            duration: 0.8,
            ease: "power2.inOut"
          },
          `+=${0.2}`
        );
    });

    // Loader circle animation
    if (loaderRef.current) {
      gsap.to(loaderRef.current, {
        rotation: 360,
        duration: 2,
        ease: "none",
        repeat: -1
      });
    }

    return () => tl.kill();
  }, [isClient]);

  // Handle 3D ready state and exit animation
  useEffect(() => {
    if (is3DReady && isClient) {
      // Simulate minimum loading time for better UX
      const timer = setTimeout(() => {
        const exitTl = gsap.timeline({
          onComplete: onLoadingComplete
        });

        // Exit animation
        exitTl
          .to(textLinesRef.current, {
            opacity: 0,
            filter: "blur(20px)",
            y: -50,
            duration: 0.8,
            stagger: 0.1,
            ease: "power3.in"
          })
          .to(
            loaderRef.current,
            {
              scale: 0,
              opacity: 0,
              duration: 0.5,
              ease: "back.in(1.7)"
            },
            "-=0.5"
          )
          .to(
            containerRef.current,
            {
              opacity: 0,
              duration: 0.5,
              ease: "power2.inOut"
            },
            "-=0.2"
          );
      }, 2000); // Minimum 2 seconds loading time

      return () => clearTimeout(timer);
    }
  }, [is3DReady, onLoadingComplete, isClient]);

  // Don't render anything until client-side hydration is complete
  if (!isClient) {
    return (
      <div className='fixed inset-0 bg-black z-50 flex flex-col items-center justify-center overflow-hidden'>
        <div className='mb-16'>
          <div className='w-16 h-16 border-2 border-white/20 border-t-white rounded-full' />
        </div>
        <div className='text-center space-y-6 max-w-4xl px-8'>
          {textLines.map((line, index) => (
            <div
              key={index}
              className='text-4xl md:text-6xl lg:text-7xl font-light text-white tracking-wider opacity-0'
              style={{
                fontFamily: "system-ui, -apple-system, sans-serif",
                letterSpacing: "0.1em"
              }}
            >
              {line}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className='fixed inset-0 bg-black z-50 flex flex-col items-center justify-center overflow-hidden'>
      {/* Animated background particles - only render on client */}
      <div className='absolute inset-0'>
        {particles.map((particle, i) => (
          <div
            key={i}
            className='absolute w-1 h-1 bg-white/10 rounded-full animate-pulse'
            style={{
              left: particle.left,
              top: particle.top,
              animationDelay: particle.delay,
              animationDuration: particle.duration
            }}
          />
        ))}
      </div>

      {/* Loader Circle */}
      <div className='mb-16'>
        <div ref={loaderRef} className='w-16 h-16 border-2 border-white/20 border-t-white rounded-full' />
      </div>

      {/* Text Content */}
      <div className='text-center space-y-6 max-w-4xl px-8'>
        {textLines.map((line, index) => (
          <div
            key={index}
            ref={(el) => el && (textLinesRef.current[index] = el)}
            className='text-4xl md:text-6xl lg:text-7xl font-light text-white tracking-wider'
            style={{
              fontFamily: "system-ui, -apple-system, sans-serif",
              letterSpacing: "0.1em"
            }}
          >
            {line}
          </div>
        ))}
      </div>

      {/* Progress indicator */}
      <div className='absolute bottom-16 left-1/2 transform -translate-x-1/2'>
        <div className='flex space-x-2'>
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className='w-2 h-2 bg-white/40 rounded-full animate-pulse'
              style={{
                animationDelay: `${i * 0.3}s`,
                animationDuration: "1.5s"
              }}
            />
          ))}
        </div>
      </div>

      {/* Loading text */}
      <div className='absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white/60 text-sm tracking-widest'>LOADING EXPERIENCE</div>
    </div>
  );
}
