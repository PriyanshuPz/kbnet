type SoundType = "level_up";

// Sound pools to reuse audio elements
const soundPools: Record<SoundType, HTMLAudioElement[]> = {
  level_up: [],
};

// Number of sounds in each pool
const POOL_SIZE = 4;

// Track the last used index for each sound type
const lastIndexUsed: Record<SoundType, number> = {
  level_up: -1,
};

// Initialize sound pools (call this once during app initialization)
export function initializeSoundPools(): void {
  if (typeof window === "undefined") return;

  Object.entries(soundPools).forEach(([type, pool]) => {
    for (let i = 0; i < POOL_SIZE; i++) {
      const audio = new Audio(`/sounds/${type}.mp3`);
      audio.volume = type === "click" ? 0.5 : 0.7;
      audio.load();
      pool.push(audio);
    }
  });
}

// Play a sound of the specified type
export function playSound(type: SoundType = "level_up"): void {
  if (typeof window === "undefined") return;

  const pool = soundPools[type];

  if (pool && pool.length > 0) {
    // Cycle through the audio elements in the pool
    lastIndexUsed[type] = (lastIndexUsed[type] + 1) % pool.length;
    const soundToPlay = pool[lastIndexUsed[type]];

    if (soundToPlay) {
      // For click sounds, add slight pitch variation for game-like feel
      // if (type === "click") {
      //   // Random pitch between 0.95 and 1.05
      //   const pitch = 0.95 + Math.random() * 0.1;
      //   soundToPlay.playbackRate = pitch;
      // }

      soundToPlay.currentTime = 0;
      soundToPlay.play().catch((error) => {
        console.log("Sound playback was prevented:", error);
      });
    }
  }
}

// Add haptic feedback for mobile devices (if supported)
export function playHapticFeedback(): void {
  if (typeof window === "undefined") return;

  if ("vibrate" in navigator) {
    // Short vibration for button press
    navigator.vibrate(15);
  }
}

// Combined function for sound and haptic feedback
export function playFeedback(type: SoundType = "level_up"): void {
  playSound(type);
  playHapticFeedback();
}
