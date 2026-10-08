// A mock for the Dexie wrapper we'll build later in data/local
export interface FailureLogEntry {
  id?: number;
  timestamp: string;
  promptVersion: string;
  tier: string;
  latencyMs: number;
  repairCount: number;
  errorType: 'timeout' | 'parse_error' | 'validation_failed' | 'network_error' | 'other';
  errorMessage?: string;
}

const failureLogs: FailureLogEntry[] = [];

export async function logAIFailure(entry: Omit<FailureLogEntry, 'timestamp'>): Promise<void> {
  const log: FailureLogEntry = {
    ...entry,
    timestamp: new Date().toISOString()
  };
  
  // In a real implementation, this goes to Dexie
  failureLogs.push(log);
  
  // If we are in the browser, maybe sync it eventually
  console.error('[AI Failure Logged]', log);
}
