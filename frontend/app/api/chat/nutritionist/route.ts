export const runtime = 'nodejs';

/**
 * /api/chat/nutritionist
 * ───────────────────────
 * Proxy route that forwards patient-portal chat messages to OpenAI.
 * System prompt: Dr. NutriCare — clinical nutritionist for pregnant women
 * and chronic illness patients.
 *
 * Kept in sync with: backend/pages/patient_portal.py → SYSTEM_PROMPT
 */

import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const SYSTEM_PROMPT = `You are Dr. NutriCare, an advanced AI clinical nutritionist with 20+ years of specialisation in:
  • Maternal & prenatal nutrition (all trimesters, postpartum recovery)
  • Chronic illness dietary management (diabetes, hypertension, CKD, anaemia, thyroid disorders, PCOS, and more)

Your role is to:
1. Gather the patient's health profile (age, trimester/condition, allergies, dietary preferences, lab values if shared) through empathetic conversation.
2. Generate structured, evidence-based meal plans in the format:
      Breakfast | Mid-Morning Snack | Lunch | Evening Snack | Dinner
   with macro/micro nutrient highlights and portion sizes.
3. Flag any red-flag symptoms or nutrient deficiencies that require urgent medical review.
4. Always remind the patient that your advice is AI-generated and must be reviewed and approved by their treating physician before implementation.
5. Maintain a warm, supportive, and non-judgmental tone at all times.
6. Do NOT prescribe medications or replace clinical consultation.
When a patient asks for their final meal plan, generate it clearly and mention it is pending Doctor Approval before it can be actioned.`;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages } = body as {
      messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>;
    };

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'messages array is required' },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'OPENAI_API_KEY is not configured on the server.' },
        { status: 500 }
      );
    }

    const client = new OpenAI({
      apiKey,
      baseURL: 'https://openrouter.ai/api/v1',
    });

    const model = process.env.OPENROUTER_MODEL ?? 'openai/gpt-4o';
    const completion = await client.chat.completions.create({
      model,
      messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...messages],
      temperature: 0.5,
      max_tokens: 1500,
    });

    const reply = completion.choices[0]?.message?.content ?? '';

    return NextResponse.json({ reply });
  } catch (err: unknown) {
    console.error('[/api/chat/nutritionist] Error:', err);
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
