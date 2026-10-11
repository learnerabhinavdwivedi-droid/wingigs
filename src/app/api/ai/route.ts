import { NextResponse } from 'next/server';

/**
 * Open-Weight AI Inference Gateway
 * 
 * Secure gateway proxying requests to any OpenAI-compatible open-weight model server
 * (Ollama, vLLM, llama.cpp, Hugging Face TGI, etc.) configured via environment variables:
 * - AI_BASE_URL: Base URL of the OpenAI-compatible endpoint (e.g., http://localhost:11434/v1)
 * - AI_MODEL: Target model identifier (e.g., gemma2:2b, llama3.2:3b, qwen2.5:3b)
 * - AI_API_KEY: Optional bearer token for authenticated endpoints
 * 
 * Security Guardrails:
 * 1. Strictly enforces server-side sports-science system prompt (ignores client overrides).
 * 2. Caps prompt length to 2500 characters.
 * 3. In-memory IP rate limiter (15 requests/minute per IP).
 * 4. Generic error messages returned to clients (zero upstream leakage).
 * 5. Returns 503 if unconfigured, triggering deterministic vetted plan fallbacks.
 */

// In-memory rate limiting table
interface RateLimitRecord {
  count: number;
  resetTime: number;
}
const rateLimitMap = new Map<string, RateLimitRecord>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 15;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();

  // Periodic pruning if map grows large
  if (rateLimitMap.size > 500) {
    for (const [key, value] of rateLimitMap.entries()) {
      if (now > value.resetTime) {
        rateLimitMap.delete(key);
      }
    }
  }

  const record = rateLimitMap.get(ip);
  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }

  if (record.count >= MAX_REQUESTS_PER_WINDOW) {
    return false;
  }

  record.count++;
  return true;
}

const SERVER_SYSTEM_PROMPT = 
  'You are an elite sports-science athletic coach specializing in badminton court footwork, wall rally conditioning, and athletic longevity. ' +
  'Return strictly valid JSON conforming to the requested schema. Never output conversational preamble, greetings, or markdown code fences.';

export async function POST(req: Request) {
  try {
    // 1. IP Rate Limiting
    const forwardedHeader = req.headers.get('x-forwarded-for');
    const clientIp = forwardedHeader ? forwardedHeader.split(',')[0].trim() : req.headers.get('x-real-ip') || '127.0.0.1';
    
    if (!checkRateLimit(clientIp)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please wait before generating another training plan.' },
        { status: 429 }
      );
    }

    const baseUrl = process.env.AI_BASE_URL || process.env.OPENAI_BASE_URL;
    const model = process.env.AI_MODEL || 'gemma2:2b';
    const apiKey = process.env.AI_API_KEY || process.env.OPENAI_API_KEY;

    // 2. Safe Fallback Trigger when backend unconfigured
    if (!baseUrl) {
      return NextResponse.json(
        {
          error: 'No open-weight AI model endpoint configured. Set AI_BASE_URL in your environment to connect Ollama, vLLM, or Hugging Face.',
          code: 'AI_NOT_CONFIGURED',
          configured: false
        },
        { status: 503 }
      );
    }

    const body = await req.json().catch(() => null);
    if (!body || (!body.prompt && !body.userPrompt)) {
      return NextResponse.json({ error: 'Missing prompt in request body' }, { status: 400 });
    }

    const userPrompt = String(body.userPrompt || body.prompt);

    // 3. Prompt Length Capping
    if (userPrompt.length > 2500) {
      return NextResponse.json(
        { error: 'Prompt exceeds maximum allowed length of 2500 characters' },
        { status: 400 }
      );
    }

    // Normalize endpoint URL
    const cleanBaseUrl = baseUrl.replace(/\/+$/, '');
    const targetUrl = cleanBaseUrl.endsWith('/chat/completions')
      ? cleanBaseUrl
      : `${cleanBaseUrl}/chat/completions`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000); // 15-second strict timeout

    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    if (apiKey) {
      headers['Authorization'] = `Bearer ${apiKey}`;
    }

    // Always enforce the server-side sports science system prompt
    const openAiPayload = {
      model,
      messages: [
        { role: 'system', content: SERVER_SYSTEM_PROMPT },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.2,
      max_tokens: 800
    };

    const response = await fetch(targetUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(openAiPayload),
      signal: controller.signal
    });

    clearTimeout(timeout);

    if (!response.ok) {
      const errText = await response.text().catch(() => '');
      console.warn(`[AI Gateway] Model provider returned status ${response.status}: ${errText.slice(0, 200)}`);
      // Return generic message, do not leak upstream details to the client
      return NextResponse.json(
        { error: 'Upstream AI model failed to generate response. Fallback plan will be used.' },
        { status: 502 }
      );
    }

    const data = await response.json();
    const rawContent = data.choices?.[0]?.message?.content || data.choices?.[0]?.text || '';

    if (!rawContent) {
      return NextResponse.json({ error: 'Empty generation received from model' }, { status: 502 });
    }

    return NextResponse.json({
      content: rawContent,
      model,
      source: 'open-weight-gateway'
    });

  } catch (err: unknown) {
    if (err instanceof Error && err.name === 'AbortError') {
      return NextResponse.json({ error: 'AI generation timed out after 15 seconds' }, { status: 504 });
    }
    const message = err instanceof Error ? err.message : String(err);
    console.warn('[AI Gateway] Request failed:', message);
    return NextResponse.json({ error: 'AI gateway processing error. Fallback plan will be used.' }, { status: 500 });
  }
}
