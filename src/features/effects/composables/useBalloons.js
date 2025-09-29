import { ref } from "vue";
import { useSound } from "@/features/audio/composables/useSound";
import { BALLOON_MAX } from "@/constants/balloons";

const SPAWN_DELAY = 200;
const POP_BASE_DELAY = 200;
const POP_RANDOM_VARIATION = 10000;
const BALLOON_POP_DURATION = 500;

const INFLATE_SOUND_DURATION = 0.4;
const POP_SOUND_DURATION = 0.08;

let balloonIdCounter = 0;

export function useBalloons() {
  const balloons = ref([]);
  const { isAudioEnabled, initAudio } = useSound();

  // Reuse single AudioContext to avoid browser limits
  let sharedAudioContext = null;

  const createInflateSound = () => {
    if (typeof AudioContext === "undefined" || !isAudioEnabled.value) return;

    try {
      // Initialize or reuse existing AudioContext
      if (!sharedAudioContext || sharedAudioContext.state === "closed") {
        initAudio();
        sharedAudioContext = new AudioContext();
      }

      const audioContext = sharedAudioContext;

      // Create white noise buffer for air-like inflation sound
      const bufferSize = audioContext.sampleRate * INFLATE_SOUND_DURATION;
      const buffer = audioContext.createBuffer(
        1,
        bufferSize,
        audioContext.sampleRate,
      );
      const data = buffer.getChannelData(0);

      // Generate white noise
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1; // Random values between -1 and 1
      }

      // Create buffer source and audio nodes
      const source = audioContext.createBufferSource();
      const gainNode = audioContext.createGain();
      const filter = audioContext.createBiquadFilter();

      source.buffer = buffer;
      source.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // Band-pass filter to simulate air rushing sound (mid frequencies)
      filter.type = "bandpass";
      filter.frequency.setValueAtTime(800, audioContext.currentTime);
      filter.Q.setValueAtTime(1.5, audioContext.currentTime);

      // Volume envelope - gradual fade in and out like air filling balloon
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(
        0.08,
        audioContext.currentTime + INFLATE_SOUND_DURATION / 4,
      );
      gainNode.gain.linearRampToValueAtTime(
        0.06,
        audioContext.currentTime + INFLATE_SOUND_DURATION / 2,
      );
      gainNode.gain.exponentialRampToValueAtTime(
        0.001,
        audioContext.currentTime + INFLATE_SOUND_DURATION,
      );

      source.start(audioContext.currentTime);
      source.stop(audioContext.currentTime + INFLATE_SOUND_DURATION);
    } catch (error) {
      console.warn("Audio playback error:", error);
    }
  };

  const createPopSound = () => {
    if (typeof AudioContext === "undefined" || !isAudioEnabled.value) return;

    try {
      // Initialize or reuse existing AudioContext
      if (!sharedAudioContext || sharedAudioContext.state === "closed") {
        initAudio();
        sharedAudioContext = new AudioContext();
      }

      const audioContext = sharedAudioContext;

      // Create white noise buffer for realistic pop sound
      const bufferSize = audioContext.sampleRate * POP_SOUND_DURATION;
      const buffer = audioContext.createBuffer(
        1,
        bufferSize,
        audioContext.sampleRate,
      );
      const data = buffer.getChannelData(0);

      // Generate white noise
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1; // Random values between -1 and 1
      }

      // Create buffer source and gain node
      const source = audioContext.createBufferSource();
      const gainNode = audioContext.createGain();
      const filter = audioContext.createBiquadFilter();

      source.buffer = buffer;
      source.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // High-pass filter to make it more "poppy"
      filter.type = "bandpass";
      filter.frequency.setValueAtTime(800, audioContext.currentTime);

      // Quick burst envelope - sharp attack, quick decay
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(
        0.2,
        audioContext.currentTime + 0.001,
      ); // Very quick attack
      gainNode.gain.exponentialRampToValueAtTime(
        0.001,
        audioContext.currentTime + POP_SOUND_DURATION,
      );

      source.start(audioContext.currentTime);
      source.stop(audioContext.currentTime + POP_SOUND_DURATION);
    } catch (error) {
      console.warn("Audio playback error:", error);
    }
  };

  const colors = [
    "#ff6b6b", // primary red
    "#4ecdc4", // secondary teal
    "#feca57", // tertiary yellow
    "#48e5a3", // success green
    "#ff9ff3", // pink
    "#54a0ff", // blue
    "#5f27cd", // purple
    "#00d2d3", // cyan
    "#ff9f43", // orange
    "#10ac84", // emerald
  ];

  const getRandomColor = () => {
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const getRandomPosition = () => {
    // Random horizontal position across almost full width with minimal margins
    return Math.random() * 96 + 2; // 2% to 98% of screen width
  };

  const createBalloon = () => {
    return {
      id: `balloon-${++balloonIdCounter}`,
      color: getRandomColor(),
      left: getRandomPosition(),
      isPopping: false,
    };
  };

  const removeBalloon = (balloonId) => {
    const index = balloons.value.findIndex((b) => b.id === balloonId);
    if (index !== -1) {
      balloons.value.splice(index, 1);
    }
  };

  const createLoudPopSound = () => {
    if (typeof AudioContext === "undefined" || !isAudioEnabled.value) return;

    try {
      if (!sharedAudioContext || sharedAudioContext.state === "closed") {
        initAudio();
        sharedAudioContext = new AudioContext();
      }

      const audioContext = sharedAudioContext;
      const bufferSize =
        audioContext.sampleRate * Math.max(POP_SOUND_DURATION, 0.1);
      const buffer = audioContext.createBuffer(
        1,
        bufferSize,
        audioContext.sampleRate,
      );
      const data = buffer.getChannelData(0);

      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const source = audioContext.createBufferSource();
      const gainNode = audioContext.createGain();
      const filter = audioContext.createBiquadFilter();

      source.buffer = buffer;
      source.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // Brighter, punchier pop
      filter.type = "highpass";
      filter.frequency.setValueAtTime(1200, audioContext.currentTime);

      // Louder, sharper envelope
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(
        0.5,
        audioContext.currentTime + 0.001,
      );
      gainNode.gain.exponentialRampToValueAtTime(
        0.001,
        audioContext.currentTime + Math.max(POP_SOUND_DURATION, 0.12),
      );

      source.start(audioContext.currentTime);
      source.stop(
        audioContext.currentTime + Math.max(POP_SOUND_DURATION, 0.12),
      );
    } catch (error) {
      console.warn("Audio playback error:", error);
    }
  };

  const popBalloon = (balloonId, options = {}) => {
    const balloon = balloons.value.find((b) => b.id === balloonId);
    if (balloon && !balloon.isPopping) {
      balloon.isPopping = true;

      if (options.loud) {
        createLoudPopSound();
      } else {
        createPopSound();
      }

      setTimeout(() => {
        removeBalloon(balloonId);
      }, BALLOON_POP_DURATION);
    }
  };

  const spawnBalloons = async (count) => {
    if (count <= 0 || count > BALLOON_MAX) return;

    // Limit total balloons on screen
    const balloonsToSpawn = Math.min(
      count,
      BALLOON_MAX - balloons.value.length,
    );

    // Calculate dynamic spawn delay so that total spawn time for >100
    // balloons does not exceed the time to spawn 100 at base delay.
    const BASE_COUNT = 100;
    const effectiveDelay = (() => {
      if (balloonsToSpawn <= 1) return 0;
      const ratio = (BASE_COUNT - 1) / Math.max(1, balloonsToSpawn - 1);
      // For N <= 100, keep SPAWN_DELAY; for N > 100, scale down.
      return SPAWN_DELAY * Math.min(1, ratio);
    })();

    for (let i = 0; i < balloonsToSpawn; i++) {
      if (i > 0 && effectiveDelay > 0) {
        await new Promise((resolve) => setTimeout(resolve, effectiveDelay));
      }

      const balloon = createBalloon();
      balloons.value.push(balloon);

      createInflateSound();

      const popDelay = POP_BASE_DELAY + Math.random() * POP_RANDOM_VARIATION;
      setTimeout(() => {
        popBalloon(balloon.id);
      }, popDelay);
    }
  };

  const clearAllBalloons = () => {
    balloons.value = [];
  };

  return {
    balloons,
    spawnBalloons,
    popBalloon,
    clearAllBalloons,
  };
}
