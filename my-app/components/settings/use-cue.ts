"use client";

import { useCallback } from "react";
import { usePlaySample, type SampleName } from "@/components/settings/settings-provider";

// For sounds that depend on an outcome, such as a right or wrong answer.
export function useCue(name: SampleName) {
  const playSample = usePlaySample();
  return useCallback(() => playSample(name), [name, playSample]);
}
