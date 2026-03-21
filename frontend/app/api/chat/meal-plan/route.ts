export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const SYSTEM_PROMPT = `You are Dr. NutriCare, an AI clinical nutritionist.
Generate a structured daily meal plan for a pregnant woman or chronic illness patient.
Return ONLY valid JSON in this exact format, no markdown, no extra text:
{
  "meals": [
    { "time": "8:00 AM",  "name": "meal name", "calories": 280, "nutrients": "key nutrients" },
    { "time": "11:00 AM", "name": "meal name", "calories": 200, "nutrients": "key nutrients" },
    { "time": "1:00 PM",  "name": "meal name", "calories": 350, "nutrients": "key nutrients" },
    { "time": "4:00 PM",  "name": "meal name", "calories": 180, "nutrients": "key nutrients" },
    { "time": "7:00 PM",  "name": "meal name", "calories": 320, "nutrients": "key nutrients" }
  ],
  "totalCalories": 1330,
  "nutritionScore": 8.5,
  "focus": "one-line dietary focus e.g. High Iron & Folate for second trimester"
}
Make meals culturally diverse, nutritious, and appropriate for maternal health.`;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { patientInfo = 'pregnant woman, week 28, no allergies' } = body as { patientInfo?: string };

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'OPENAI_API_KEY not configured.' }, { status: 500 });
    }

    const client = new OpenAI({
      apiKey,
      baseURL: 'https://openrouter.ai/api/v1',
    });

    // Use GPT-4o if available; fall back to free Llama model if credits are zero
    const model = process.env.OPENROUTER_MODEL ?? 'openai/gpt-4o';
    const completion = await client.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: `Generate a meal plan for: ${patientInfo}` },
      ],
      temperature: 0.7,
      max_tokens: 800,
    });

    const raw = completion.choices[0]?.message?.content ?? '{}';
    // Strip any markdown fences the model may have added
    const cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
    const plan = JSON.parse(cleaned);
    return NextResponse.json(plan);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
