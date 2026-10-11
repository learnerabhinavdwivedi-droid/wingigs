// A 0.1s silent WAV file in base64 to keep the audio context alive
const SILENCE_BASE64 = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA';

let silentAudio: HTMLAudioElement | null = null;
let audioContextUnlocked = false;

export function unlockAudio() {
  if (audioContextUnlocked) return;
  
  // 1. Unlock Speech Synthesis
  const utterance = new SpeechSynthesisUtterance('');
  window.speechSynthesis.speak(utterance);

  // 2. Play silent HTML5 Audio in a loop to keep JS alive on lockscreen
  if (!silentAudio) {
    silentAudio = new Audio(SILENCE_BASE64);
    silentAudio.loop = true;
    silentAudio.volume = 0.01;
    // We swallow errors because some browsers block autoplay, 
    // but this is triggered on a user tap (Start Workout), so it should work.
    silentAudio.play().catch(e => console.warn('Silent audio play blocked:', e));
  }
  
  audioContextUnlocked = true;
}

export function stopSilentAudio() {
  if (silentAudio) {
    silentAudio.pause();
    silentAudio.currentTime = 0;
  }
}

let sharedAudioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!sharedAudioCtx) {
    const webkitWindow = window as unknown as { webkitAudioContext?: typeof AudioContext };
    const AudioCtx = window.AudioContext || webkitWindow.webkitAudioContext;
    if (AudioCtx) {
      sharedAudioCtx = new AudioCtx();
    }
  }
  if (sharedAudioCtx && sharedAudioCtx.state === 'suspended') {
    sharedAudioCtx.resume().catch(() => {});
  }
  return sharedAudioCtx;
}

export function playAcousticBeep(freq = 880, duration = 0.12, type: OscillatorType = 'sine') {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch {
    // Ignore audio context errors gracefully
  }
}

export function playCountdownPip() {
  playAcousticBeep(880, 0.1, 'sine');
}

export function playStartWhistle() {
  playAcousticBeep(1200, 0.22, 'triangle');
  setTimeout(() => playAcousticBeep(1600, 0.28, 'sine'), 120);
}

export function playVictoryChime() {
  const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
  notes.forEach((freq, idx) => {
    setTimeout(() => {
      playAcousticBeep(freq, 0.35, 'triangle');
    }, idx * 140);
  });
}

export function playAudioCue(text: string) {
  if (!('speechSynthesis' in window)) return;
  
  // Cancel any ongoing speech to prioritize the new cue
  window.speechSynthesis.cancel();
  
  const utterance = new SpeechSynthesisUtterance(text);
  
  // Try to use a high-quality local voice if available
  const voices = window.speechSynthesis.getVoices();
  const preferredVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Siri') || v.name.includes('Google') || v.name.includes('Natural')));
  
  if (preferredVoice) {
    utterance.voice = preferredVoice;
  }
  
  utterance.rate = 1.0;
  utterance.pitch = 1.0;
  
  window.speechSynthesis.speak(utterance);
}
