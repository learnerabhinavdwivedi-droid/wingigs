'use client';

import { useState, useEffect } from 'react';
import { getAllCheckins } from '../../data/local/queries';
import { callModel } from '../../ai/callModel';
import { hostedTier } from '../../ai/tiers/hosted';
import { z } from 'zod';
import Link from 'next/link';

export default function WeekReviewPage() {
  const [review, setReview] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const all = await getAllCheckins();
        const thisWeek = all.slice(0, 7); // Simplified for MVP: just take last 7 logs
        
        const logsStr = thisWeek.map(c => `${c.dayKey}: ${c.completed ? c.minutes + ' mins' : 'Missed'} (Screen: ${Math.floor((c.screenSeconds || 0)/60)} mins)`).join('\n');

        const prompt = `
          You are a strict, concise coach. Read these 7-day training logs for the user.
          Logs:
          ${logsStr}
          
          Write a short, punchy Sunday Review. Format as JSON matching { "review": "string" }. 
          1. Acknowledge the reality (did they train or stare at screens?).
          2. Give them one specific focus for next week.
        `;

        const result = await callModel({
          prompt,
          tier: 'hosted',
          tierFn: hostedTier,
          promptVersion: 'v1.0-review',
          schema: z.object({ review: z.string() })
        });

        // For review, we might not need Zod parsing if it's just raw text, 
        // but callModel assumes JSON if it uses Zod. Let's just catch it.
        // Wait, callModel expects JSON. So let's tell the model to return JSON.
        
        setReview(result.review);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError(true);
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <main className="min-h-screen bg-purple-50 text-black p-8 max-w-lg mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-black text-purple-900">Sunday Review</h1>
        <Link href="/progress" className="text-purple-600 font-bold hover:underline">
          &larr; Back
        </Link>
      </div>

      {loading && <div className="text-purple-600 font-bold animate-pulse">Analyzing your week...</div>}
      
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded">
          Could not generate review. Try again later.
        </div>
      )}

      {!loading && !error && (
        <div className="bg-white p-6 rounded shadow border-t-4 border-purple-600 text-lg leading-relaxed">
          {review}
        </div>
      )}
    </main>
  );
}

