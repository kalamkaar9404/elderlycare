import { NextRequest, NextResponse } from 'next/server';

const mockMealPlans = {
  pregnant: {
    breakfast: ["Greek yogurt with berries", "Whole grain toast with avocado", "Prenatal smoothie"],
    lunch: ["Grilled salmon salad", "Quinoa bowl with vegetables", "Lentil soup"],
    dinner: ["Lean chicken with sweet potato", "Tofu stir-fry", "Turkey meatballs with pasta"],
    snacks: ["Almonds", "Apple with peanut butter", "Cheese and crackers"]
  },
  postpartum: {
    breakfast: ["Oatmeal with nuts", "Eggs with spinach", "Protein smoothie"],
    lunch: ["Chicken and vegetable soup", "Salmon with quinoa", "Bean and rice bowl"],
    dinner: ["Beef stew", "Grilled fish with vegetables", "Vegetarian curry"],
    snacks: ["Trail mix", "Yogurt", "Hummus with vegetables"]
  }
};

export async function POST(req: NextRequest) {
  try {
    const { stage, preferences, restrictions } = await req.json();
    
    const basePlan = mockMealPlans[stage as keyof typeof mockMealPlans] || mockMealPlans.pregnant;
    
    return NextResponse.json({
      success: true,
      mealPlan: basePlan,
      stage: stage,
      preferences: preferences,
      restrictions: restrictions,
      calories: stage === 'pregnant' ? 2200 : 2000,
      protein: stage === 'pregnant' ? 80 : 70,
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to generate meal plan' },
      { status: 500 }
    );
  }
}