"use client";
import { ContactShadows, OrbitControls, View as TunnelView } from "@react-three/drei";
import { useImperativeHandle, useRef } from "react";
import { Tunnel } from "../tunnel/Tunnel";

const View = ({ children, ref, ...props }) => {
  const localRef = useRef(null);
  useImperativeHandle(ref, () => localRef.current);
  return (
    <>
      <div ref={localRef} {...props} />
      <TunnelWrapper>
        <TunnelView track={localRef}>{children}</TunnelView>
      </TunnelWrapper>
    </>
  );
};

const Lighting = () => {
  return (
    <>
      <OrbitControls />
      <ContactShadows position={[0, -0.8, 0]} opacity={0.25} scale={10} blur={1} far={1} />
    </>
  );
};
const TunnelWrapper = ({ children }) => {
  return <Tunnel.In>{children}</Tunnel.In>;
};

View.displayName = "View";
export { View, Lighting };
