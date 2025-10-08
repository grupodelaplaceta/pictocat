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
  simon1: 'data:audio/wav;base64,UklGRqgAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YYQAAACAgPz8+Pj39vb19fX09PTz8/Py8vLz8/P09PT19fX29vj4+fn6+/v8/P39/gD+/f38/Pz7+vr5+fj49/f29fX08/Py8u/v7u7u7u7v7/Dy8vP09PX29/j5+vv8/f7/AP8A/v39/Pz7+/r6+ff39vX08/Lx8O/u7e3t7e3t7e3u7u/w8fLz9PT19vf4+fr7/P3+/wD/AP79/fz8+/v6+fn39vX08/Ly8O/v7e3t7e3t7e3u7u/w8fLz9PT19vf4+fr7/P3+/w==',
  simon2: 'data:audio/wav;base64,UklGRqgAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YYQAAADAwPz89PTt7ezq6urq6urq6erq6ujo6Ojo6Ojp6urq6+zt7e3w8PHy8/T09fX29vf4+Pj5+fn6+/v7/Pz8/f3+/v8A////AP/+/v39/Pz8+/v7+vr6+fn5+Pj49/f39vf29fX19PT08/Py8fHw8O/v7u7t7ezr6ufm5eXl5eXl5eXm5unq6+zt7e7v8PHy8/T09fX29vf4+Pn6+/z9/gD/AP79/Pz7+/r5+fj39/b19fTz8vHw7+7t6+rn5uXk4+Pj4+Pj4+Pj4+Tk5ebn6err7O3u7/Dx8vP09PX29/j5+vv8/f7/AP8A/v39/Pz7+/r5+ff29fTz8vHw7+7t6+rn5uXk4+Pj4+Pj4+Pj4+Tk5ebn6err7O3u7/Dx8vP09PX29/j5+vv8/f7/AP8=',
  simon3: 'data:audio/wav;base64,UklGRqgAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YYQAAACAAP799/b18/Lu7uns5+Xj4eHg4ODg4OHh4uPk5ufo6err7O3u7/Dx8vP09PX29vf4+Pn6+/z9/v8A////AP/+/v39/Pz7+/r5+fj39vb19fTz8vHw7+7t6+rn5uXk4+Pj4+Pj4+Pj4+Tk5ebn6err7O3u7/Dx8vP09PX29vf4+Pn6+/z9/v8A/wD+/fz8+/v6+fn49/b19fTz8vHw7+7t6+rn5uXk4+Pj4+Pj4+Pj4+Tk5ebn6err7O3u7/Dx8vP09PX29/j5+vr7/P3+/wD/AP79/Pz8+/v6+fn49/f29fX08/Lx8O/u7evq5+bl5OPj4+Pj4+Pj4+Pk5OXm5+jq6+zt7u/w8fLz9PT19vf4+fn6+/z9/v8A/w==',
  simon4: 'data:audio/wav;base64,UklGRqgAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YYQAAADAAPz86+rp5OTi4N/e3d3c3Nzc3Nzd3d7f4OHi4+Tl5ufo6err7O3u7/Dx8vP09PX29vf4+Pn6+/z9/v8A////AP/+/v39/Pz7+/r5+fj39vb19fTz8vHw7+7t6+rn5uXk4+Pj4+Pj4+Pj4+Tk5ebn6err7O3u7/Dx8vP09PX29/j5+vr7/P3+/wD/AP79/Pz7+/r5+fj39vb19fTz8vHw7+7t6+rn5uXk4+Pj4+Pj4+Pj4+Tk5ebn6err7O3u7/Dx8vP09PX29/j5+vr7/P3+/wD/AP79/Pz8+/v6+fn49/f29fX08/Lx8O/u7evq5+bl5OPj4+Pj4+Pj4+Pk5OXm5+jq6+zt7u/w8fLz9PT19vf4+fn6+/z9/v8A/w==',
  simonError: 'data:audio/wav;base64,UklGRoQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YYAAAADubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubg=='
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