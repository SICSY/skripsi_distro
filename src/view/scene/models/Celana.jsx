"use client";
import React, { useEffect, useRef } from "react";
import { useGLTF, useAnimations } from "@react-three/drei";
import { editable } from "@theatre/r3f";
export function CelanaModel(props) {
  const group = useRef();
  const { nodes, materials, animations } = useGLTF("/models/celana.glb");
  const { actions, names } = useAnimations(animations, group);
  useEffect(() => {
    if (actions) {
  
      actions[names[0]]?.play();
    }
  }, [actions]);
  return (
    <editable.group theatreKey='celana' ref={group} {...props} dispose={null}>
      <group name='Scene'>
        <mesh
          castShadow
          name='celana'
          geometry={nodes.celana.geometry}
          material={materials.celana_mat}
          morphTargetDictionary={nodes.celana.morphTargetDictionary}
          morphTargetInfluences={nodes.celana.morphTargetInfluences}
          position={[-0.009, 0.467, 0.217]}
          scale={0.651}
        />
      </group>
    </editable.group>
  );
}

useGLTF.preload("/models/celana.glb");
