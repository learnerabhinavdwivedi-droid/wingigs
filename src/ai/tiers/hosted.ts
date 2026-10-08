import { TierFunction } from '../callModel';

// In a real implementation this would fetch from /api/ai
// and send the JWT token of the logged-in user.
export const hostedTier: TierFunction = async (prompt: string, signal?: AbortSignal) => {
  const res = await fetch('/api/ai', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt }),
    signal
  });

  if (!res.ok) {
    throw new Error(`fetch_error: ${res.status}`);
  }

  const data = await res.json();
  return { content: data.content };
};
