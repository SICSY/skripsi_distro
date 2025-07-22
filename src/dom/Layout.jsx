"use client";
import { useRef } from "react";
import Scene from "./Scene";

const Layout = ({ children }) => {
  const ref = useRef();
  return (
    <div
      ref={ref}
      style={{
        position: "relative",
        width: " 100%",
        height: "100%",
        overflow: "auto",
        touchAction: "auto"
      }}
    >
      {/* <TransitionProvider>{children}</TransitionProvider> */}
      {children}
      <Scene
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          pointerEvents: "none"
        }}
        shadows
        eventSource={ref}
        eventPrefix='client'
      />
    </div>
  );
};

export default Layout;
