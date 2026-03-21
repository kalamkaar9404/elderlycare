import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { message, type } = await req.json();
    
    // Mock AI response - replace with actual AI service integration
    let response = "";
    
    if (type === 'maternal') {
      response = "I'm here to help with your maternal health journey. What specific questions do you have about your pregnancy or postnatal care?";
    } else if (type === 'nutrition') {
      response = "I can help you create a personalized nutrition plan. What are your dietary preferences and health goals?";
    } else if (type === 'chef') {
      response = "Let me help you prepare healthy meals. What ingredients do you have available today?";
    } else {
      response = "Hello! I'm your medical AI assistant. How can I help you today?";
    }
    
    return NextResponse.json({ 
      message: response,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to process chat message' },
      { status: 500 }
    );
  }
}