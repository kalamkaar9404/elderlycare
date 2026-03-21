// Mock Data for Healthcare Dashboard

export interface Patient {
  id: string;
  name: string;
  age: number;
  pregnancyWeek: number;
  riskLevel: 'low' | 'medium' | 'high';
  status: 'active' | 'pending' | 'completed';
}

export interface Vitals {
  bloodGlucose: number;
  bloodPressureSys: number;
  bloodPressureDia: number;
  weight: number;
  weightChange: number;
}

export interface Meal {
  id: string;
  name: string;
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  calories: number;
  ingredients: string[];
  servingSize: string;
}

export interface MealOrder {
  id: string;
  patientId: string;
  patientName: string;
  mealType: string;
  dueTime: string;
  status: 'pending' | 'preparing' | 'ready' | 'delivered';
  quantity: number;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'bot' | 'system';
  content: string;
  timestamp: Date;
}

export interface Alert {
  id: string;
  patientId: string;
  type: 'critical' | 'warning' | 'info';
  message: string;
  timestamp: Date;
  resolved: boolean;
}

// Mock Patients
export const MOCK_PATIENTS: Patient[] = [
  {
    id: 'p1',
    name: 'Jane Doe',
    age: 28,
    pregnancyWeek: 28,
    riskLevel: 'low',
    status: 'active',
  },
  {
    id: 'p2',
    name: 'Priya Sharma',
    age: 32,
    pregnancyWeek: 24,
    riskLevel: 'medium',
    status: 'active',
  },
  {
    id: 'p3',
    name: 'Amara Okonkwo',
    age: 26,
    pregnancyWeek: 20,
    riskLevel: 'high',
    status: 'active',
  },
  {
    id: 'p4',
    name: 'Sarah Johnson',
    age: 30,
    pregnancyWeek: 32,
    riskLevel: 'low',
    status: 'pending',
  },
  {
    id: 'p5',
    name: 'Maria Garcia',
    age: 27,
    pregnancyWeek: 16,
    riskLevel: 'low',
    status: 'active',
  },
];

// Mock Vitals for Primary Patient
export const MOCK_VITALS: Vitals = {
  bloodGlucose: 7.2,
  bloodPressureSys: 130,
  bloodPressureDia: 85,
  weight: 68.5,
  weightChange: 1.2,
};

// Mock Historical Vitals Data (30 days)
export const MOCK_VITALS_HISTORY = Array.from({ length: 30 }, (_, i) => ({
  day: i + 1,
  glucose: 6.8 + Math.random() * 2,
  systolic: 120 + Math.random() * 20,
  diastolic: 75 + Math.random() * 20,
}));

// Mock Meals
export const MOCK_MEALS: Meal[] = [
  {
    id: 'm1',
    name: 'Ragi Porridge with Jaggery',
    type: 'breakfast',
    calories: 280,
    ingredients: ['Ragi flour', 'Jaggery', 'Ghee', 'Cardamom'],
    servingSize: '200g',
  },
  {
    id: 'm2',
    name: 'Spinach and Lentil Dal',
    type: 'lunch',
    calories: 350,
    ingredients: ['Red lentils', 'Spinach', 'Turmeric', 'Cumin'],
    servingSize: '250g',
  },
  {
    id: 'm3',
    name: 'Red Rice with Vegetables',
    type: 'lunch',
    calories: 380,
    ingredients: ['Red rice', 'Carrots', 'Beans', 'Peas', 'Coconut oil'],
    servingSize: '280g',
  },
  {
    id: 'm4',
    name: 'Banana and Almond Smoothie',
    type: 'snack',
    calories: 210,
    ingredients: ['Banana', 'Almonds', 'Milk', 'Honey'],
    servingSize: '200ml',
  },
  {
    id: 'm5',
    name: 'Millet Upma with Vegetables',
    type: 'dinner',
    calories: 320,
    ingredients: ['Millet', 'Carrot', 'Peas', 'Mustard seeds', 'Onion'],
    servingSize: '250g',
  },
];

// Mock Meal Orders
export const MOCK_MEAL_ORDERS: MealOrder[] = [
  {
    id: 'o1',
    patientId: 'p1',
    patientName: 'Jane Doe',
    mealType: 'Ragi Porridge',
    dueTime: '08:00 AM',
    status: 'pending',
    quantity: 1,
  },
  {
    id: 'o2',
    patientId: 'p1',
    patientName: 'Jane Doe',
    mealType: 'Spinach Dal',
    dueTime: '12:30 PM',
    status: 'preparing',
    quantity: 1,
  },
  {
    id: 'o3',
    patientId: 'p2',
    patientName: 'Priya Sharma',
    mealType: 'Red Rice Bowl',
    dueTime: '12:30 PM',
    status: 'ready',
    quantity: 2,
  },
  {
    id: 'o4',
    patientId: 'p3',
    patientName: 'Amara Okonkwo',
    mealType: 'Millet Upma',
    dueTime: '06:00 PM',
    status: 'pending',
    quantity: 1,
  },
];

// Mock Chat Messages
export const MOCK_NUTRITIONIST_MESSAGES: ChatMessage[] = [
  {
    id: 'c1',
    sender: 'system',
    content: 'Welcome to your nutritionist chat. I am here to help you with any dietary concerns.',
    timestamp: new Date(Date.now() - 3600000),
  },
  {
    id: 'c2',
    sender: 'user',
    content: 'I have been feeling nauseous after the afternoon meals.',
    timestamp: new Date(Date.now() - 3000000),
  },
  {
    id: 'c3',
    sender: 'bot',
    content: 'I recommend reducing portion sizes for lunch and including ginger tea 30 minutes before meals.',
    timestamp: new Date(Date.now() - 2700000),
  },
];

export const MOCK_CHEF_MESSAGES: ChatMessage[] = [
  {
    id: 'ch1',
    sender: 'system',
    content: 'Chef Assistant: Ready to help with recipe guidance and cooking tips.',
    timestamp: new Date(Date.now() - 7200000),
  },
  {
    id: 'ch2',
    sender: 'user',
    content: 'How should I adjust the spinach dal for bulk cooking?',
    timestamp: new Date(Date.now() - 6000000),
  },
  {
    id: 'ch3',
    sender: 'bot',
    content: 'For bulk orders, scale the recipe 1:3 ratio. Increase cooking time by 5-10 minutes and stir occasionally.',
    timestamp: new Date(Date.now() - 5400000),
  },
];

// Mock Alerts
export const MOCK_ALERTS: Alert[] = [
  {
    id: 'a1',
    patientId: 'p1',
    type: 'critical',
    message: 'Blood glucose spike detected: 9.1 mmol/L',
    timestamp: new Date(),
    resolved: false,
  },
  {
    id: 'a2',
    patientId: 'p3',
    type: 'warning',
    message: 'Missing weight entry for today',
    timestamp: new Date(Date.now() - 3600000),
    resolved: false,
  },
  {
    id: 'a3',
    patientId: 'p2',
    type: 'warning',
    message: 'Blood pressure elevated: 145/92 mmHg',
    timestamp: new Date(Date.now() - 7200000),
    resolved: true,
  },
];

// Mock AI Meal Plans
export const MOCK_AI_MEAL_PLAN = {
  id: 'plan1',
  patientId: 'p1',
  status: 'pending' as const,
  generatedAt: new Date(),
  approvedAt: null,
  meals: [
    { time: '8:00 AM', meal: MOCK_MEALS[0], calories: 280 },
    { time: '11:00 AM', meal: MOCK_MEALS[3], calories: 210 },
    { time: '1:00 PM', meal: MOCK_MEALS[1], calories: 350 },
    { time: '4:00 PM', meal: MOCK_MEALS[3], calories: 210 },
    { time: '7:00 PM', meal: MOCK_MEALS[4], calories: 320 },
  ],
  totalCalories: 1370,
  nutritionScore: 8.5,
};

export const MOCK_PENDING_PLANS = [
  {
    id: 'ap1',
    patientName: 'Jane Doe',
    mealCount: 5,
    totalCalories: 1370,
    generatedAt: new Date(),
    status: 'pending',
  },
  {
    id: 'ap2',
    patientName: 'Priya Sharma',
    mealCount: 4,
    totalCalories: 1150,
    generatedAt: new Date(Date.now() - 7200000),
    status: 'pending',
  },
  {
    id: 'ap3',
    patientName: 'Amara Okonkwo',
    mealCount: 6,
    totalCalories: 1520,
    generatedAt: new Date(Date.now() - 14400000),
    status: 'pending',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// API Endpoints
// Centralise all backend route paths here so components never hardcode strings.
// Sync contract: keep in alignment with
//   frontend/app/api/chat/nutritionist/route.ts
//   frontend/app/api/chat/chef/route.ts
// ─────────────────────────────────────────────────────────────────────────────
export const API_ENDPOINTS = {
  /** Patient Portal — Dr. NutriCare AI (gpt-4o, temp 0.5) */
  chatNutritionist: '/api/chat/nutritionist',
  /** Kitchen Command — ChefAid AI (gpt-4o, temp 0.4) */
  chatChef: '/api/chat/chef',
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// Brand / Design Tokens  (mirrors backend/utils/styles.py)
// Use these in components instead of raw hex strings so colour changes
// only need to happen in ONE place.
// ─────────────────────────────────────────────────────────────────────────────
export const BRAND_COLORS = {
  sage:    '#6B8E6F',   // primary brand green
  teal:    '#20B2AA',   // safe / approved state
  amber:   '#F59E0B',   // warning / pending state
  crimson: '#DC2626',   // critical / urgent state
} as const;
