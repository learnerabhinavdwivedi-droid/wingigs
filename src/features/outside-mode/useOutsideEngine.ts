import { useState, useEffect, useRef } from 'react';
import { 
  playAudioCue, unlockAudio, stopSilentAudio, 
  playCountdownPip, playStartWhistle, playVictoryChime 
} from './audio';
import { ZodDailyPlan } from '../../domain/schemas/plan';
import drillsData from '../../data/drills/badminton.json';

export type TimerState = 'idle' | 'running' | 'paused' | 'done';

export function useOutsideEngine(plan: ZodDailyPlan | null) {
  const [state, setState] = useState<TimerState>('idle');
  const [blockIndex, setBlockIndex] = useState(0);
  const [accumulatedSeconds, setAccumulatedSeconds] = useState(0);
  const [tick, setTick] = useState(0);

  const startedAtRef = useRef<number | null>(null);
  const accumulatedRef = useRef<number>(0);
  
  const currentBlock = plan?.blocks[blockIndex];
  
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (state === 'running') {
      interval = setInterval(() => {
        if (startedAtRef.current) {
          const now = Date.now();
          const diff = Math.floor((now - startedAtRef.current) / 1000);
          setAccumulatedSeconds(accumulatedRef.current + diff);
          setTick(t => t + 1);
        }
      }, 500);
    }
    return () => clearInterval(interval);
  }, [state, blockIndex]);

  const totalMinutes = plan?.blocks.reduce((acc, b) => acc + b.minutes, 0) || 1;
  const drillMap = new Map(drillsData.drills.map(d => [d.id, d.name]));

  // Auto-advance
  useEffect(() => {
    if (state === 'running' && currentBlock) {
      if (accumulatedSeconds >= currentBlock.minutes * 60) {
        handleNext();
      }
    }
  }, [accumulatedSeconds, currentBlock, state]);

  const lastPipRef = useRef<number | null>(null);

  const start = () => {
    setState('running');
    startedAtRef.current = Date.now();
    unlockAudio();
    playStartWhistle();
    
    // Play initial cue
    if (currentBlock) {
       const drillName = drillMap.get(currentBlock.drill_id) || currentBlock.drill_id;
       setTimeout(() => playAudioCue(`Starting ${drillName}. ${currentBlock.cue}`), 350);
    }
  };

  const pause = () => {
    setState('paused');
    if (startedAtRef.current) {
      accumulatedRef.current += Math.floor((Date.now() - startedAtRef.current) / 1000);
    }
    startedAtRef.current = null;
  };

  const resume = () => {
    setState('running');
    startedAtRef.current = Date.now();
    unlockAudio();
    playStartWhistle();
  };

  const handleNext = () => {
    if (plan && blockIndex < plan.blocks.length - 1) {
      setBlockIndex(prev => prev + 1);
      setAccumulatedSeconds(0);
      accumulatedRef.current = 0;
      startedAtRef.current = Date.now();
      unlockAudio();
      playStartWhistle();
      
      const nextBlock = plan.blocks[blockIndex + 1];
      const nextName = drillMap.get(nextBlock.drill_id) || nextBlock.drill_id;
      setTimeout(() => playAudioCue(`Next: ${nextName}. ${nextBlock.cue}`), 350);
    } else {
      setState('done');
      stopSilentAudio();
      playVictoryChime();
      setTimeout(() => playAudioCue("Workout complete. Incredible effort!"), 500);
    }
  };

  const remainingSecondsForBlock = currentBlock 
    ? Math.max(0, currentBlock.minutes * 60 - accumulatedSeconds) 
    : 0;

  // Sound countdown pips at 3, 2, 1 seconds before drill completion
  useEffect(() => {
    if (state === 'running' && remainingSecondsForBlock > 0 && remainingSecondsForBlock <= 3) {
      if (lastPipRef.current !== remainingSecondsForBlock) {
        lastPipRef.current = remainingSecondsForBlock;
        playCountdownPip();
      }
    }
  }, [state, remainingSecondsForBlock]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const progressPercent = currentBlock 
    ? Math.min(100, (accumulatedSeconds / (currentBlock.minutes * 60)) * 100) 
    : 0;

  return {
    state,
    blockIndex,
    currentBlock,
    elapsedFormatted: formatTime(accumulatedSeconds),
    remainingFormatted: formatTime(remainingSecondsForBlock),
    progressPercent,
    start,
    pause,
    resume,
    handleNext
  };
}

