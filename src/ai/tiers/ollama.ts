import { TierFunction } from '../callModel';

// Optional Ollama tier for local testing
export const ollamaTier: TierFunction = async (prompt: string, signal?: AbortSignal) => {
  const OLLAMA_URL = process.env.NEXT_PUBLIC_OLLAMA_URL || 'http://localhost:11434';
  
  const res = await fetch(`${OLLAMA_URL}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'gemma:2b',
      prompt: prompt,
      stream: false
    }),
    signal
  });

  if (!res.ok) {
    throw new Error(`ollama_error: ${res.status}`);
  }

  const data = await res.json();
  return { content: data.response };
};
