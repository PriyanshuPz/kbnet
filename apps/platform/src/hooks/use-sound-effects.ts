"use client";

import {
  initializeSoundPools,
  playFeedback,
  playSound,
} from "@/lib/sound-effects";
import { useEffect } from "react";

export const useSoundEffect = () => {
  useEffect(() => {
    // Initialize the sound pools when the component mounts
    initializeSoundPools();
  }, []);

  return { playSound, playFeedback };
};
