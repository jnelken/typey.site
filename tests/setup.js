import '@testing-library/jest-dom';

// Mock Web Speech API
global.speechSynthesis = {
  speak: jest.fn(),
  cancel: jest.fn(),
  pause: jest.fn(),
  resume: jest.fn(),
  getVoices: jest.fn(() => [
    { name: 'Victoria', lang: 'en-US', default: true },
    { name: 'Daniel', lang: 'en-US' },
    { name: 'Google UK English Female', lang: 'en-GB' },
  ]),
  onvoiceschanged: null,
  paused: false,
};

global.SpeechSynthesisUtterance = jest.fn().mockImplementation(text => {
  const utterance = {
    text,
    rate: 1,
    pitch: 1,
    volume: 1,
    voice: null,
    onstart: null,
    onend: null,
    onerror: null,
  };

  // Allow setting event handlers
  Object.defineProperty(utterance, 'onstart', {
    get: () => utterance._onstart,
    set: fn => {
      utterance._onstart = fn;
    },
  });

  Object.defineProperty(utterance, 'onend', {
    get: () => utterance._onend,
    set: fn => {
      utterance._onend = fn;
    },
  });

  Object.defineProperty(utterance, 'onerror', {
    get: () => utterance._onerror,
    set: fn => {
      utterance._onerror = fn;
    },
  });

  return utterance;
});

// Mock Web Audio API
global.AudioContext = jest.fn().mockImplementation(() => ({
  createOscillator: jest.fn(() => ({
    connect: jest.fn(),
    start: jest.fn(),
    stop: jest.fn(),
    frequency: {
      setValueAtTime: jest.fn(),
      exponentialRampToValueAtTime: jest.fn(),
      linearRampToValueAtTime: jest.fn(),
    },
  })),
  createGain: jest.fn(() => ({
    connect: jest.fn(),
    gain: {
      setValueAtTime: jest.fn(),
      exponentialRampToValueAtTime: jest.fn(),
      linearRampToValueAtTime: jest.fn(),
    },
  })),
  createBuffer: jest.fn(() => ({
    getChannelData: jest.fn(() => new Float32Array(1000)),
  })),
  createBufferSource: jest.fn(() => ({
    connect: jest.fn(),
    start: jest.fn(),
    stop: jest.fn(),
    buffer: null,
  })),
  createBiquadFilter: jest.fn(() => ({
    connect: jest.fn(),
    type: 'bandpass',
    frequency: { setValueAtTime: jest.fn() },
    Q: { setValueAtTime: jest.fn() },
  })),
  destination: {},
  currentTime: 0,
  sampleRate: 44100,
  state: 'running',
}));

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});
