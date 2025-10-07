// services/audioService.ts
export const speak = (text: string): void => {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    console.error("Text-to-speech is not supported in this browser.");
    return;
  }

  // Cancel any ongoing speech to prevent overlap
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'es-ES'; // Set language to Spanish as phrases are in Spanish
  utterance.rate = 1.0;
  utterance.pitch = 1.0;
  
  window.speechSynthesis.speak(utterance);
};


// --- Sound Effect Service ---

let audioContext: AudioContext | null = null;
const audioBuffers: Map<string, AudioBuffer> = new Map();

// Base64-encoded sound files to prevent network errors
const soundDataUrls: Record<string, string> = {
  purchase: 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAD//wA=',
  openEnvelope: 'data:audio/wav;base64,UklGRlIAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YUgAAAD8/v/3/v/x/v/s/v/o/v/k/v/h/v/f/v/c/v/b/v/a/v/Z/v/Y/v/X/v/W/v/W/v/W/v/X/v/Y/v8=',
  favoriteOn: 'data:audio/wav;base64,UklGRiYAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQIiAAAA//8A/wD/AP8A/w==',
  favoriteOff: 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAUAAAA/v/9//7//f/+/w==',
  select: 'data:audio/wav;base64,UklGRiIAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAAA//8A/w==',
  reward: 'data:audio/wav;base64,UklGRkoAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YUYAAAD/APgA+QD5APoA+wD8APsA+wD7APwA/QD+AP8A/wD/AP8A/wD/AP8A/wD/AP8A/wD/AP8A/wD/AP8A/w==',
  mouseSqueak: 'data:audio/wav;base64,UklGRkIAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YTwAAAD4/v/5/f/t/f/k/f/g/f/b/f/X/f/T/f/P/f/M/f/K/f/I/f/H/f/H/f/I/f8=',
  catMeow: 'data:audio/wav;base64,UklGRiYAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQIiAAAAAAD/AP8A/wD/AA==',
  gameOver: 'data:audio/wav;base64,UklGRlQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YUwAAAD8/v/6/v/3/v/0/v/x/v/v/v/t/v/s/v/r/v/q/v/p/v/o/v/n/v/m/v/l/v/k/v/j/v/i/v/h/v/g/v/f/v8=',
  easterEgg: 'data:audio/wav;base64,UklGRjIAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAD8/v/6/v8='
};

const initAudio = () => {
  if (audioContext) return;
  try {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    preloadSounds();
    console.log("AudioContext initialized.");
  } catch (e) {
    console.error("Web Audio API is not supported in this browser.", e);
  }
};

const preloadSounds = async () => {
  if (!audioContext) return;
  const context = audioContext;
  for (const key in soundDataUrls) {
    const url = soundDataUrls[key];
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`Failed to fetch sound: ${response.statusText}`);
      const arrayBuffer = await response.arrayBuffer();
      context.decodeAudioData(arrayBuffer, (buffer) => {
        audioBuffers.set(key, buffer);
      }, (error) => {
        console.error(`Error decoding audio data for ${key}:`, error);
      });
    } catch (error) {
      console.error(`Failed to load sound: ${key}`, error);
    }
  }
};

const playSound = (soundName: keyof typeof soundDataUrls) => {
  if (!audioContext || !audioBuffers.has(soundName)) {
    console.warn(`Sound not ready or not found: ${soundName}`);
    return;
  }
  try {
    const source = audioContext.createBufferSource();
    source.buffer = audioBuffers.get(soundName)!;
    source.connect(audioContext.destination);
    source.start(0);
  } catch(e) {
    console.error(`Error playing sound ${soundName}:`, e);
  }
};

export const soundService = {
  init: initAudio,
  play: playSound,
};