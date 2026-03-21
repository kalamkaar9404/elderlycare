export const runtime = 'nodejs';
import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const SYSTEM_PROMPT = `You are ChefAid, an expert AI culinary guide deployed to assist NGO kitchen workers and community meal program staff. Your expertise covers:

1. RECIPE SCALING: Scale recipes to 50, 100, 500+ servings.
2. INGREDIENT SUBSTITUTIONS: Local, budget-friendly, allergy-safe substitutes.
3. FOOD HYGIENE & SAFETY: Guide on safe temperatures (cook ≥75°C, hot hold ≥60°C).
4. GENERAL CULINARY: Batch cooking scheduling and workflow optimisation.

Be practical, clear, and concise. Use bullet points and tables where helpful. Keep language simple and actionable.`;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages } = body;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'messages array is required' }, { status: 400 });
    }

    // Use the variable that holds your l7jYYh... key
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'API Key not configured' }, { status: 500 });
    }

    const client = new OpenAI({
      apiKey: apiKey,
      // Updated to your Tetrate Base URL
      baseURL: 'https://api.router.tetrate.ai/v1',
      defaultHeaders: {
        "HTTP-Referer": "http://localhost:3000",
        "X-Title": "ChefAid Assistant",
      }
    });

    const completion = await client.chat.completions.create({
      // Use the model string that worked for your other bot
      model: 'gemini-2.5-flash-lite', 
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...messages
      ],
      temperature: 0.4,
      max_tokens: 1500,
    });

    const reply = completion.choices[0]?.message?.content ?? '';
    return NextResponse.json({ reply });

  } catch (err: any) {
    console.error('[/api/chat/chef] Error:', err.message);
    return NextResponse.json({ 
      error: "ChefAid is currently connecting...",
      details: err.message 
    }, { status: 500 });
  }
}