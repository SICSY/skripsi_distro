"use client";
import { useFrame } from "@react-three/fiber";
import { Resize, Backdrop, SoftShadows, SpotLight, useDepthBuffer, AdaptiveDpr } from "@react-three/drei";
import { SheetProvider, PerspectiveCamera, editable, RefreshSnapshot } from "@theatre/r3f";
import { getProject } from "@theatre/core";
import { useEffect, useRef } from "react";

import { LenisRef } from "lenis/react";
import { Color } from "three";
import demoProjectState from "./scene/state.json";

import { MockupModel } from "@/src/view/scene/models/Mockup";
import { MainModel } from "./scene/models/Model-utama";
import extension from "@theatre/r3f/dist/extension";8
import studio from "@theatre/studio";
studio.initialize()
studio.extend(extension)
// const project = getProject("My Theatre Project");
const project = getProject("My Theatre Project", { state: demoProjectState });

const sheet = project.sheet("Scene 1");
// create-react-app
// if (process.env.NODE_ENV === "development") {
//   studio.initialize();
//   if (extension && typeof extension === "object") {
//     if (!studio._extensions?.includes(extension)) {
//       studio.extend(extension);
//     }
//   }
// }

export default function ThreeCanvas({ lenis }: { lenis: LenisRef | null }) {
  const mockRef = useRef();
//  useEffect(() => {
//     if (process.env.NODE_ENV === "development") {
//       (async () => {
//         const studio = (await import("@theatre/studio")).default;
//         const extension = (await import("@theatre/r3f/dist/extension")).default;
//         studio.initialize();
//         studio.extend(extension);
//         studio.ui.hide();
//       })();
//     }
//   }, []);
  return (
    <>
      <SheetProvider sheet={sheet}>
        {/* <spotLight castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024} shadow-bias={-0.0001} shadow-normalBias={0.05} /> */}
        {/* <ambientLight intensity={0.2} /> */}
        <Resize castShadow receiveShadow height width>
          <editable.ambientLight theatreKey='Light' />
          <PerspectiveCamera theatreKey='camera' makeDefault />
          <SoftShadows size={25} samples={16} focus={0.5} />
          <Backdrop castShadow receiveShadow floor={2} position={[0, 0.1, -0.9]} scale={[20, 10, 2]}>
            <meshPhongMaterial shininess={0} reflectivity={10} color='#161615' />
          </Backdrop>

          <editable.spotLight theatreKey='spotlight1' castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024} shadow-bias={-0.0001} shadow-normalBias={0.05}></editable.spotLight>
          <editable.directionalLight theatreKey='directionalLight' />

          {/* <ContactShadows resolution={1024} frames={100} position={[0, 0.3, 0]} scale={1} blur={0.5} opacity={1} far={20} /> */}
          <MainModel />
          <editable.mesh receiveShadow theatreKey='ico' scale={1}>
            <icosahedronGeometry args={[1, 1]} />
            <meshStandardMaterial color='#00ffff' wireframe metalness={0.5} roughness={0.2} />
            {/* <pointsMaterial size={0.001} color="#FFD700" sizeAttenuation depthWrite={false} /> */}
          </editable.mesh>

          <MockupModel ref={mockRef} />
          {/* <SheetProvider sheet={sheet1}>
         
          </SheetProvider> */}
        </Resize>
        <RefreshSnapshot />
      </SheetProvider>
      <LenisScrollSync lenis={lenis} mockRef={mockRef} />
      {/* <Environment preset="city" environmentIntensity={0.1} /> */}
      <AdaptiveDpr pixelated />
    </>
  );
}

function LenisScrollSync({ lenis, mockRef }: { lenis: any | null; mockRef: React.RefObject<any> }) {
  const target = useRef(0);
  const current = useRef(0);

  useFrame(() => {
    if (lenis && lenis.limit > 0) {
      target.current = lenis.scroll / lenis.limit;
    } else {
      target.current = 0; // Default ke nol jika belum siap
    }
    current.current += (target.current - current.current) * 0.01;
    sheet.sequence.position = current.current;

    const scrollProgress = current.current;
    const action = mockRef?.current?.action;
    const duration = mockRef?.current?.duration || 0.1;

    if (action) {
      const startScroll = 0.6;
      const endScroll = 1.0;
      const scrollRange = endScroll - startScroll;

      const scrollPosInRange = (scrollProgress - startScroll) / scrollRange;
      const clamped = Math.min(Math.max(scrollPosInRange, 0), 1);

      action.time = clamped * duration;
    }

    // Clamp warna transisi
    const colorStart = 0.7;
    const colorEnd = 0.75;

    const material = mockRef?.current?.material;
    if (material) {
      if (scrollProgress <= colorStart) {
        material.color.set("#ffffff");
      } else {
        const t = (scrollProgress - colorStart) / (colorEnd - colorStart);
        const defaultColor = new Color("#ffffff");
        const goldColor = new Color("#FF0202");
        const lerped = defaultColor.clone().lerp(goldColor, t);
        material.color.set(lerped);
      }
    }
  });

  return null;
}
