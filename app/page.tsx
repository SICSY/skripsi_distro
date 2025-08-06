"use client";

import { useRef, useState, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { TextPlugin } from "gsap/TextPlugin";
import { useGSAP } from "@gsap/react";
import { LenisWrapper } from "@/src/view/Lenis";
import ThreeCanvas from "@/src/view/Editor";

import { LenisRef } from "lenis/react";
import { Zap } from "lucide-react";
import { Canvas } from "@react-three/fiber";
import Marquee from "@/src/view/marquee";
import { AdaptiveDpr, Loader, Preload, useProgress } from "@react-three/drei";
import { Bloom, DepthOfField, EffectComposer, Noise, Vignette } from "@react-three/postprocessing";
import { AdditiveBlending, MultiplyBlending } from "three";
import Header from "@/src/view/header";
import Image from "next/image";

gsap.registerPlugin(ScrollTrigger, TextPlugin, useGSAP);

export default function Page() {
  const [lenisInstance, setLenisInstance] = useState<LenisRef | null>(null);
  const sectionsRef = useRef<HTMLDivElement[]>([]);
  const cursorRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  const linesRef = useRef<HTMLDivElement[]>([]);
  // Custom cursor animation
  useEffect(() => {
    const cursor = cursorRef.current;
    if (!cursor) return;

    const moveCursor = (e: MouseEvent) => {
      gsap.to(cursor, {
        x: e.clientX,
        y: e.clientY,
        duration: 0.3,
        ease: "power2.out"
      });
    };

    window.addEventListener("mousemove", moveCursor);
    return () => window.removeEventListener("mousemove", moveCursor);
  }, []);

  useGSAP(() => {
    if (!lenisInstance) return;

    gsap.to(linesRef.current, {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      duration: 1.2,
      ease: "power3.out",
      stagger: 0.3,
      delay: 0.3
    });

    gsap.to(textRef.current, {
      opacity: 1,
      x: 0,
      filter: "blur(0px)",
      duration: 1.2,
      ease: "power3.out",
      delay: 0.2
    });

    const heroTl = gsap.timeline();
    heroTl
      .from(".hero-title", {
        y: 100,
        opacity: 0,
        duration: 1.2,
        ease: "power4.out",
        stagger: 0.2
      })
      .from(
        ".hero-subtitle",
        {
          y: 50,
          opacity: 0,
          duration: 1,
          ease: "power3.out"
        },
        "-=0.8"
      )
      .from(
        ".hero-cta",
        {
          scale: 0,
          opacity: 0,
          duration: 0.8,
          ease: "back.out(1.7)"
        },
        "-=0.5"
      );

    sectionsRef.current.forEach((section, index) => {
      if (!section) return;

      const content = section.querySelector(".section-content") as HTMLElement;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "bottom top",
          scrub: true,
          pin: true,
          pinSpacing: true
        }
      });
      if (index !== 0) {
        tl.fromTo(content, { autoAlpha: 0, y: 0 }, { autoAlpha: 1, duration: 0.5, ease: "power2.out" });
      } else {
        gsap.set(content, { autoAlpha: 1 });
      }
      tl.to(content, { autoAlpha: 0, duration: 0.5, ease: "power2.in" }, "+=0.5");
    });

    return () => ScrollTrigger.getAll().forEach((t) => t.kill());
  }, [lenisInstance]);

  const sections = [
    {
      id: "main",
      title: "main",
      content: (
        <div className=' w-full h-full flex items-center justify-center relative overflow-hidden'>
          <Image alt='main' fill className='absolute top-0 left-0 w-full contrast-106 h-full object-cover z-[-1]' src='/image/main.png' />
          <span className='absolute text-center  justify-center items-center h-96    text-[20rem]  font-extralight uppercase  scale-y-[2]  mask-radial-from-neutral-100  mask-b-from-0.5 shadow-2xl text-[#64645b]   top-1/4 left-0 w-full -z-10'>
            harmoni
          </span>
          <div ref={textRef} className='text-white  text-end font-major flex w-full h-full flex-wrap opacity-0 -translate-x-[50px] blur-3xl will-change-transform '>
            <div
              className='xl:text-[12rem] flex place-self-end relative top-1/6  text-6xl  flex-col text-end  capitalize bg-clip-text text-transparent leading-none
    [text-stroke:1px_rgb(255,190,11)] md:[-webkit-text-stroke:5px_rgb(255,190,11)] [-webkit-text-stroke:0.6px_rgb(255,190,11)]'
            >
              build your <span className='break-all flex relative left-2/3'>style</span>
            </div>
            <div className='relative w-full h-fit  place-self-end'>
              <span className=' flex pl-2 pb-10 '>pesan sekarang</span>
            </div>
          </div>

          {/* LINE TEXTS */}
          <div className=' size-full flex flex-col md:justify-center justify-end pb-10 items-end pr-8  font-sans font-light text-[3.5vw] md:text-5xl leading-[0.8] italic mask-radial-from-3.5 mask-b-from-0.5    tracking-tight uppercase'>
            {["Dimulai dari Sini", "Bukan Sekadar Nama", "We Define Style"].map((text, i) => (
              <div key={i} ref={(el) => (linesRef.current[i] = el!)} className='opacity-0 text-white/60  translate-y-10 blur-md will-change-transform'>
                {text}
              </div>
            ))}
          </div>
        </div>
      )
    },
    {
      id: "hero",
      title: "DISTRO 3D",
      subtitle: "Customize Your Style in Real-Time",
      content: (
        <div className='h-full flex flex-col'>
          <div className=' h-full  flex justify-center items-center flex-col w-full'>
            <h1
              className='hero-title text-6xl md:text-8xl font-bold bg-clip-text text-transparent'
              style={{
                WebkitTextStroke: "1px rgb(156 163 175)" // tailwind gray-400
              }}
            >
              DISTRO 3D
            </h1>

            <p className='hero-subtitle  '>Experience the future of fashion with our revolutionary 3D clothing customization platform</p>
          </div>
          <Marquee />
        </div>
      )
    },
    {
      id: "about",
      title: "About Us",
      subtitle: "Crafting Digital Fashion",
      content: (
        <div className='h-full flex border justify-center items-center flex-col'>
          <Image alt='main1' fill className='absolute top-0 left-0 w-full contrast-106 h-full object-cover z-[-1]' src='/image/main1.png' />

          <div className='max-w-4xl mx-auto space-y-8'>
            <div className='reveal-text text-center'>
              <h2 className='text-4xl md:text-5xl font-bold text-white mb-6'>Revolutionizing Fashion</h2>
              <p className='text-xl text-white/80 leading-relaxed'>We're pioneering the intersection of technology and fashion, creating immersive 3D experiences that let you visualize and customize clothing like never before.</p>
            </div>
            <div className='grid md:grid-cols-3 gap-8'>
              {[
                { title: "Innovation", desc: "Cutting-edge 3D technology" },
                { title: "Quality", desc: "Premium materials & craftsmanship" },
                { title: "Sustainability", desc: "Eco-friendly production methods" }
              ].map((item, i) => (
                <div key={i} className='glass-card p-6 rounded-2xl backdrop-blur-md bg-white/10 border border-white/20'>
                  <h3 className='text-2xl font-bold text-white mb-3'>{item.title}</h3>
                  <p className='text-white/70'>{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )
    },

    // {
    //   id: "gallery",
    //   title: "Gallery",
    //   subtitle: "Explore Our Collection",
    //   content: <ProductGallery />
    // },

    {
      id: "features",
      title: "Features",
      subtitle: "Advanced Technology",
      content: (
        <div className='border w-full h-full flex justify-center items-center'>
          <div className='max-w-6xl mx-auto'>
            <h1 className='text-4xl md:text-8xl font-bold text-white mb-8  border-yellow-500 border-b-4 w-fit'>Features</h1>
            <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-8'>
              {[
                { title: "Real-time 3D Preview", desc: "See your designs come to life instantly", color: "from-blue-500 to-cyan-500" },
                { title: "AR Try-On", desc: "Virtual fitting room experience", color: "from-purple-500 to-pink-500" },
                { title: "Custom Patterns", desc: "Upload your own designs", color: "from-green-500 to-teal-500" },
                { title: "Material Physics", desc: "Realistic fabric simulation", color: "from-orange-500 to-red-500" },
                { title: "Size Optimization", desc: "Perfect fit guarantee", color: "from-indigo-500 to-purple-500" },
                { title: "Social Sharing", desc: "Share your creations", color: "from-pink-500 to-rose-500" }
              ].map((feature, i) => (
                <div key={i} className='glass-card p-6 rounded-2xl backdrop-blur-md bg-black/80 border border-white/20 hover:bg-white/20 transition-all duration-300'>
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${feature.color} flex items-center justify-center mb-4`}>
                    <Zap className='w-6 h-6 text-white' />
                  </div>
                  <h3 className='text-xl font-bold text-white mb-2'>{feature.title}</h3>
                  <p className='text-white/70'>{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )
    }
  ];

  return (
    <main className='relative overflow-hidden'>
      {/* Custom Cursor */}
      <Header />
      <div ref={cursorRef} className='fixed w-6 h-6 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full pointer-events-none z-50 mix-blend-difference' style={{ transform: "translate(-50%, -50%)" }} />
      <LoadingGate>
        <LenisWrapper onScroll={(lenis) => setLenisInstance(lenis)}>
          {/* 3D Background */}
          <div className='fixed inset-0 -z-10'>
            <Canvas shadows style={{ position: "fixed", inset: "0", touchAction: "none" }} eventPrefix='client' gl={{ preserveDrawingBuffer: true, localClippingEnabled: true, stencil: false, depth: true, antialias: true }}>
              <EffectComposer multisampling={0}>
                <DepthOfField focusDistance={0} focalLength={0.02} bokehScale={2} height={480} />
                <Bloom luminanceThreshold={0.1} luminanceSmoothing={0} height={10} opacity={1} />
                <Noise opacity={0.605} blendFunction={MultiplyBlending} />
                <Vignette eskil={false} offset={0.05} darkness={1.4} blendFunction={AdditiveBlending} opacity={1.6} />
              </EffectComposer>
              <ThreeCanvas lenis={lenisInstance} />
              <AdaptiveDpr pixelated />
              <Preload all />
            </Canvas>
          </div>

          {/* Sections */}
          <div className=''>
            {sections.map((section, i) => (
              <section key={section.id} id={section.id} ref={(el) => el && (sectionsRef.current[i] = el)} className='min-h-screen relative overflow-hidden flex items-center justify-center '>
                <div className='section-content relative z-10 w-full h-full'>{section.content}</div>
              </section>
            ))}
          </div>
        </LenisWrapper>
      </LoadingGate>

      <Loader
        containerStyles={{
          backgroundColor: "black",
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          overflow: "hidden",
          zIndex: 1000
        }}
        innerStyles={{
          width: "100%",
          maxWidth: "300px",
          textAlign: "center"
        }}
        barStyles={{
          height: "8px",
          borderRadius: "999px",
          backgroundColor: "#4f46e5"
        }}
        dataStyles={{
          color: "white",
          marginTop: "1rem",
          fontSize: "14px",
          letterSpacing: "2px"
        }}
        dataInterpolation={(p) => `Loading ${p.toFixed(2)}%`}
        initialState={(active) => active}
      />
    </main>
  );
}
function LoadingGate({ children }: { children: React.ReactNode }) {
  const { progress, active } = useProgress();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!active && progress === 100) {
      // Delay untuk transisi UX lebih halus

      setReady(true);
    }
  }, [progress, active]);

  if (!ready) return null;

  return <>{children}</>;
}
