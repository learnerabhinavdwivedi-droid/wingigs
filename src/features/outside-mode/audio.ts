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
