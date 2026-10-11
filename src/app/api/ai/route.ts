import { NextResponse } from 'next/server';

/**
 * Open-Weight AI Inference Gateway
 * 
 * Proxies generation requests to any OpenAI-compatible open-weight model server
 * (Ollama, vLLM, llama.cpp, Hugging Face TGI, etc.) configured via environment variables:
 * - AI_BASE_URL: Base URL of the OpenAI-compatible endpoint (e.g., http://localhost:11434/v1)
 * - AI_MODEL: Target model identifier (e.g., gemma2:2b, llama3.2:3b, qwen2.5:3b)
 * - AI_API_KEY: Optional bearer token for authenticated endpoints
 * 
 * When unconfigured or unreachable, returns 503 so the client runtime safely falls back
 * to the deterministic local sports-science plan bank.
 */
export async function POST(req: Request) {
  try {
    const baseUrl = process.env.AI_BASE_URL || process.env.OPENAI_BASE_URL;
    const model = process.env.AI_MODEL || 'gemma2:2b';
    const apiKey = process.env.AI_API_KEY || process.env.OPENAI_API_KEY;

    // If no real open-weight backend is configured, notify the client to use vetted fallbacks
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

    const body = await req.json();
    if (!body || (!body.prompt && !body.userPrompt)) {
      return NextResponse.json({ error: 'Missing prompt in request body' }, { status: 400 });
    }

    const userPrompt = (body.userPrompt || body.prompt) as string;
    const systemPrompt = (body.systemPrompt as string) || 
      'You are an athletic training engine. Return strictly valid JSON conforming to the requested schema. Do not include markdown code fences or conversational greetings.';

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

    const openAiPayload = {
      model,
      messages: [
        { role: 'system', content: systemPrompt },
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
      return NextResponse.json(
        { error: `Model server returned error: ${response.status}`, details: errText.slice(0, 300) },
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

  } catch (err: any) {
    if (err.name === 'AbortError') {
      return NextResponse.json({ error: 'AI generation timed out after 15 seconds' }, { status: 504 });
    }
    console.warn('[AI Gateway] Request failed:', err.message);
    return NextResponse.json({ error: err.message || 'Internal AI Gateway Error' }, { status: 500 });
  }
}
