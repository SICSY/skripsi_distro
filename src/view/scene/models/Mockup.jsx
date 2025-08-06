"use client";
import React, { forwardRef, useRef, useImperativeHandle, useEffect } from "react";
import { useGLTF, useAnimations } from "@react-three/drei";
import { editable } from "@theatre/r3f";

export const MockupModel = forwardRef((props, ref) => {
  const group = useRef();

  const { nodes, materials, animations } = useGLTF("/models/mockups.glb");
  const { actions, names } = useAnimations(animations, group);
  const actionRef = useRef();

  useImperativeHandle(ref, () => ({
    group: group.current,
    action: actionRef?.current,
    duration: animations?.[0]?.duration || 1,
    material: materials.Material // 🟡 expose material di sini
  }));
  useEffect(() => {
    const firstActionName = names?.[0];
    const action = actions[firstActionName];

    if (action) {
      action.reset();
      action.paused = true;
      action.play();
      actionRef.current = action;

      if (ref && typeof ref === "object" && ref.current) {
        ref.current.group = group.current;
        ref.current.action = action;
        ref.current.duration = animations?.[0]?.duration || 1;
        ref.current.material = materials.Material;
      }
    }

    return () => {
      action?.stop();
    };
  }, [actions, names, ref]);
  return (
    <group ref={group} {...props} dispose={null}>
      <group castShadow receiveShadow name='Scene' dispose={null}>
        <editable.mesh
          castShadow
          receiveShadow
          theatreKey='mockup'
          name='cloth_parent001'
          geometry={nodes.cloth_parent001.geometry}
          material={materials["Material.006"]}
          morphTargetDictionary={nodes.cloth_parent001.morphTargetDictionary}
          morphTargetInfluences={nodes.cloth_parent001.morphTargetInfluences}
          position={[-0.067, 0.778, -0.03]}
          scale={0.863}
        />
      </group>
    </group>
  );
});

useGLTF.preload("/models/mockups.glb");
