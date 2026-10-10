import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    // 1. Auth Check
    // const supabase = createRouteHandlerClient({ cookies });
    // const { data: { session } } = await supabase.auth.getSession();
    // if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // 2. Rate limit (Upstash or Supabase)
    // await rateLimit(session.user.id);

    // 3. Zod in
    const body = await req.json();
    if (!body.prompt || typeof body.prompt !== 'string') {
      return NextResponse.json({ error: 'Invalid prompt' }, { status: 400 });
    }

    let mockResponse: any;
    const promptLower = body.prompt.toLowerCase();

    if (promptLower.includes('baseline') || promptLower.includes('test')) {
      mockResponse = {
        test: 'Do shadow badminton footwork cycles for 1 minute at high pace. Record how many clean reps you complete.'
      };
    } else if (promptLower.includes('retest')) {
      mockResponse = {
        summary: 'Solid progress. Your footwork recovery and endurance have noticeably improved compared to your initial baseline.'
      };
    } else if (promptLower.includes('review')) {
      mockResponse = {
        review: 'Consistent effort throughout the week. Keep workouts intentional and protect your rest windows.'
      };
    } else {
      mockResponse = {
        headline: 'Agility & Court Defense',
        why_this_plan: 'Controlled intensity focusing on footwork rhythm within your envelope.',
        advice: 'Stay on the balls of your feet and keep your racket ready.',
        blocks: [
          { drill_id: 'b1', minutes: 10, cue: 'Light feet and smooth recovery to base.' },
          { drill_id: 'b2', minutes: 15, cue: 'Controlled wall rallies with steady racket prep.' }
        ]
      };
    }
    
    // Simulate low latency
    await new Promise(resolve => setTimeout(resolve, 50));

    return NextResponse.json({ content: JSON.stringify(mockResponse) });

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
