"use client";

import { Preload } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Tunnel } from "../tunnel/Tunnel";

const Scene = ({ ...props }) => {
  return (
    <Canvas shadows gl={{ antialias: false }} {...props}>
      <Tunnel.Out />
      <Preload all />
    </Canvas>
  );
};

export default Scene;
