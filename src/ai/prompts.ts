import drillsData from '../data/drills/badminton.json';
import { Envelope } from '../domain/rules/envelope';

export interface PromptPayload {
  systemPrompt: string;
  userPrompt: string;
}

/**
 * Builds a sports-science prompt that constrains the AI model to the athlete's exact
 * dynamic envelope and supplies the vetted drill catalog for badminton footwork and wall rallies.
 */
export function buildPlanPrompt(envelope: Envelope, obstacle?: string): PromptPayload {
  // Only present drills that do not exceed the athlete's physical intensity ceiling
  const validDrills = drillsData.drills.filter(d => d.intensity <= envelope.max_intensity);
  
  const drillCatalogText = validDrills
    .map(d => `- ID: "${d.id}" | Name: "${d.name}" | Intensity: ${d.intensity}/3 | Target: ${d.description} | Tags: [${d.tags.join(', ')}]`)
    .join('\n');

  const systemPrompt = `You are an elite sports-science athletic coach specializing in badminton court footwork, wall rally conditioning, and athletic longevity.
You construct failure-tolerant daily training sessions that respect the athlete's current capacity envelope.
You MUST output strictly valid JSON conforming to the requested schema. Do not write conversational introductions, explanations, or markdown code fences outside the JSON.`;

  const userPrompt = `Generate today's court training session based on this physical envelope:

ATHLETE ENVELOPE CONSTRAINTS:
- Recovery Mode: ${envelope.mode}
- Time Budget: EXACTLY or up to ${envelope.budget_minutes} total minutes
- Maximum Intensity Cap: ${envelope.max_intensity} out of 3 (do NOT exceed)
- Outdoor Allowed: ${envelope.allow_outdoor ? 'Yes' : 'No (Rain or high AQI; assign indoor/sheltered footwork)'}
${obstacle ? `- Athlete Note/Obstacle: "${obstacle}"` : ''}

ALLOWED DRILL CATALOG (You may ONLY choose drills from this list):
${drillCatalogText}

REQUIRED JSON OUTPUT FORMAT:
{
  "headline": "Short punchy session headline (e.g., Rhythm & Wall Precision)",
  "why_this_plan": "1-2 sentences explaining why this matches their current recovery status",
  "advice": "1 practical technique cue for the court (e.g., Stay light on the balls of your feet)",
  "blocks": [
    {
      "drill_id": "<Must be one of the IDs listed above>",
      "minutes": <integer number of minutes>,
      "cue": "<specific mechanical execution cue for this drill>"
    }
  ]
}

RULES:
1. The sum of all block minutes MUST NOT exceed ${envelope.budget_minutes} minutes.
2. Every block drill_id MUST exist in the ALLOWED DRILL CATALOG.
3. Return ONLY the JSON object.`;

  return { systemPrompt, userPrompt };
}

/**
 * Builds a prompt for the 5-minute baseline fitness benchmark.
 */
export function buildBaselinePrompt(sport: string, level: string, city: string): PromptPayload {
  const systemPrompt = `You are a sports-science coach creating a quick 5-minute physical benchmark test. Return strictly valid JSON: { "test": "description" }`;
  const userPrompt = `The athlete is a ${level} at ${sport} training in ${city}.
Give them ONE simple, safe 5-minute physical baseline drill to gauge their footwork cadence or stamina.
Return strictly JSON:
{
  "test": "Short 1-2 sentence description of the drill and how to count reps"
}`;
  return { systemPrompt, userPrompt };
}

/**
 * Builds a prompt for the weekly Sunday recovery review.
 */
export function buildSundayReviewPrompt(completedCount: number, targetSessions: number, totalMinutes: number): PromptPayload {
  const systemPrompt = `You are a supportive, failure-tolerant athletic coach. Return strictly valid JSON: { "review": "description" }`;
  const userPrompt = `The athlete completed ${completedCount} out of ${targetSessions} planned sessions this week (${totalMinutes} active court minutes).
Provide a constructive, zero-shame weekly reflection (2 sentences) highlighting momentum and recovery.
Return strictly JSON:
{
  "review": "Your supportive reflection here"
}`;
  return { systemPrompt, userPrompt };
}

/**
 * Builds a prompt for the 30-day fitness retest evaluation.
 */
export function buildRetestPrompt(baseline: string, retestResult: string): PromptPayload {
  const systemPrompt = `You are an athletic coach evaluating a 30-day fitness retest. Return strictly valid JSON: { "summary": "description" }`;
  const userPrompt = `Initial Baseline: "${baseline}"
30-Day Retest Result: "${retestResult}"
Provide an encouraging 2-sentence breakdown comparing their current aerobic and footwork capacity to their baseline.
Return strictly JSON:
{
  "summary": "Your comparative evaluation here"
}`;
  return { systemPrompt, userPrompt };
}
