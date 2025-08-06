"use client";

import { BajuModel } from "./Baju_atas";
import { CelanaModel } from "./Celana";
import { KaosKakiModel } from "./Kaos_kaki";
import { LenganModel } from "./Lengan";
import { editable } from "@theatre/r3f";
export function MainModel() {
  return (
    <editable.group castShadow receiveShadow theatreKey='model' >
      <BajuModel castShadow receiveShadow />
      <CelanaModel castShadow receiveShadow />
      <KaosKakiModel castShadow receiveShadow />
      <LenganModel castShadow receiveShadow />
    </editable.group>
  );
}
