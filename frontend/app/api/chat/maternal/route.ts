export const runtime = 'nodejs';
import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

function buildSystemPrompt(ctx?: any): string {
  const base = `You are Dr. NutriCare's Maternal Health AI Assistant — a compassionate, evidence-based specialist in maternal and prenatal health.
CRITICAL RULE: You MUST begin every substantive response with:
"🔐 I am analyzing your blockchain-verified records to provide this insight."`;

  // Robust check for context
  if (!ctx || typeof ctx !== 'object') return base;
  
  const name = ctx.name || '';
  const week = ctx.pregnancyWeek || '';
  const anchored = ctx.anchored;

  let patientSection = '\n\n--- PATIENT RECORD (Blockchain-Verified) ---\n';
  if (name) patientSection += `Patient Name: ${name}\n`;
  if (week) patientSection += `Pregnancy Week: ${week}\n`;
  if (anchored !== undefined) patientSection += `Blockchain Anchored: ${anchored ? 'YES ✅' : 'NO ⚠️'}\n`;
  patientSection += '\n--- END OF PATIENT RECORD ---';
  
  return base + patientSection;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages, patientContext } = body;

    // DEBUG CHECK 1: Messages
    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Missing 'messages' array in request body" }, { status: 400 });
    }

    // DEBUG CHECK 2: API Key
    const apiKey = process.env.OPENROUTER_API_KEY; 
    if (!apiKey) {
      console.error("CRITICAL: OPENROUTER_API_KEY is not defined in .env.local");
      return NextResponse.json({ error: "Server Configuration Error: API Key missing" }, { status: 500 });
    }

    const client = new OpenAI({
      apiKey: apiKey,
      baseURL: 'https://api.router.tetrate.ai/v1',
      defaultHeaders: {
        "HTTP-Referer": "http://localhost:3000",
        "X-Title": "Maternal Health App",
      }
    });

    const completion = await client.chat.completions.create({
      model: 'gemini-2.5-flash-lite', 
      messages: [
        { role: 'system', content: buildSystemPrompt(patientContext) },
        ...messages,
      ],
      temperature: 0.4,
      max_tokens: 1000,
    });

    return NextResponse.json({ reply: completion.choices[0]?.message?.content || "" });

  } catch (err: any) {
    // This will print the ACTUAL error to your terminal window
    console.error('[/api/chat/maternal] ERROR DETAILS:', err);
    
    return NextResponse.json({ 
      error: err.message || "Internal Server Error",
      details: err.stack 
    }, { status: 500 });
  }
}