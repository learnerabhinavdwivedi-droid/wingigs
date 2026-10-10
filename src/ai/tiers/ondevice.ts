import { TierFunction } from '../callModel';

// This is a placeholder for a real on-device implementation
// like using WebGPU and @mlc-ai/web-llm
export const onDeviceTier: TierFunction = async (prompt: string, signal?: AbortSignal) => {
  // In a full implementation, we'd dynamically import the heavy ML library here
  // to avoid blocking the main bundle for devices that can't run it.
  
  // const { CreateMLCEngine } = await import('@mlc-ai/web-llm');
  // const engine = await CreateMLCEngine("gemma-2b-it-q4f32_1");
  // const reply = await engine.chat.completions.create({ messages: [{ role: 'user', content: prompt }] });
  // return { content: reply.choices[0].message.content };
  
  throw new Error('On-device tier not fully implemented yet.');
};
