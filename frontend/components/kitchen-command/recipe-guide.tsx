'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Meal } from '@/lib/mock-data';
import { Clock, Flame } from 'lucide-react';
import { VideoCard } from '@/components/common/video-card';

interface RecipeGuideProps {
  meal?: Meal;
}

interface RecipeVideoMeta {
  searchQuery: string;
  imageUrl: string;
  emoji: string;
  gradientFrom: string;
  gradientTo: string;
  channel: string;
  duration: string;
}

// ── Recipe → real Unsplash thumbnail + YouTube search query ──────────────────
const RECIPE_VIDEO_META: Record<string, RecipeVideoMeta> = {
  ragi: {
    searchQuery: 'ragi porridge finger millet recipe healthy breakfast',
    imageUrl:    'https://images.unsplash.com/photo-1574484284002-952d92456975?w=640&q=80',
    emoji:       '🌾',
    gradientFrom:'#C4956A',
    gradientTo:  '#6B8E6F',
    channel:     "Hebbars Kitchen",
    duration:    '~6 min',
  },
  spinach: {
    searchQuery: 'palak dal spinach lentil recipe healthy Indian',
    imageUrl:    'https://images.unsplash.com/photo-1546549032-9571cd6b27df?w=640&q=80',
    emoji:       '🥬',
    gradientFrom:'#4CAF50',
    gradientTo:  '#20B2AA',
    channel:     'Ranveer Brar',
    duration:    '~8 min',
  },
  rice: {
    searchQuery: 'red rice vegetable bowl healthy recipe nutrition',
    imageUrl:    'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=640&q=80',
    emoji:       '🍚',
    gradientFrom:'#E8B4A0',
    gradientTo:  '#6B8E6F',
    channel:     'Nisha Madhulika',
    duration:    '~10 min',
  },
  banana: {
    searchQuery: 'banana almond smoothie healthy protein drink recipe',
    imageUrl:    'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=640&q=80',
    emoji:       '🍌',
    gradientFrom:'#F59E0B',
    gradientTo:  '#E8B4A0',
    channel:     'Fit Tuber',
    duration:    '~5 min',
  },
  millet: {
    searchQuery: 'millet upma healthy breakfast recipe Indian',
    imageUrl:    'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=640&q=80',
    emoji:       '🌿',
    gradientFrom:'#6B8E6F',
    gradientTo:  '#20B2AA',
    channel:     'Hebbars Kitchen',
    duration:    '~7 min',
  },
};

function getVideoMeta(mealName: string): RecipeVideoMeta {
  const lower = mealName.toLowerCase();
  if (lower.includes('ragi'))    return RECIPE_VIDEO_META.ragi;
  if (lower.includes('spinach') || lower.includes('lentil') || lower.includes('dal'))
    return RECIPE_VIDEO_META.spinach;
  if (lower.includes('rice'))    return RECIPE_VIDEO_META.rice;
  if (lower.includes('banana') || lower.includes('smoothie') || lower.includes('almond'))
    return RECIPE_VIDEO_META.banana;
  return RECIPE_VIDEO_META.millet;
}

export function RecipeGuide({ meal }: RecipeGuideProps) {
  if (!meal) {
    return (
      <Card className="p-6 h-full bg-white/70 backdrop-blur-lg border border-white/20 shadow-lg rounded-2xl flex items-center justify-center">
        <p className="text-muted-foreground text-lg font-medium">Select an order to view recipe</p>
      </Card>
    );
  }

  const meta = getVideoMeta(meal.name);

  return (
    <div className="space-y-4">
      {/* ── Recipe-matched video card ─────────────────────────────── */}
      <VideoCard
        title={`How to make ${meal.name}`}
        description={`Step-by-step cooking tutorial for ${meal.name} — optimised for NGO batch cooking`}
        duration={meta.duration}
        channel={meta.channel}
        tag="Recipe Tutorial"
        tagColor="#6B8E6F"
        searchQuery={meta.searchQuery}
        imageUrl={meta.imageUrl}
        emoji={meta.emoji}
        gradientFrom={meta.gradientFrom}
        gradientTo={meta.gradientTo}
        index={0}
      />

      {/* ── Recipe Details ──────────────────────────────────────────── */}
      <Card className="p-6 bg-gradient-to-br from-white via-slate-50 to-amber-50 border border-white/20 shadow-lg rounded-2xl overflow-hidden relative">
        <div className="absolute top-0 left-0 w-40 h-40 bg-[#F59E0B]/5 rounded-full -ml-20 -mt-20" />

        <div className="relative z-10">
          <div className="mb-6">
            <h3 className="font-bold text-2xl mb-3 bg-gradient-to-r from-[#F59E0B] to-[#6B8E6F] bg-clip-text text-transparent">
              {meal.name}
            </h3>
            <div className="flex gap-2 flex-wrap">
              <Badge variant="secondary" className="bg-white/70 backdrop-blur-lg border border-white/20 px-3 py-1 gap-2">
                <Clock className="h-4 w-4" />30 min
              </Badge>
              <Badge variant="secondary" className="bg-white/70 backdrop-blur-lg border border-white/20 px-3 py-1 gap-2">
                <Flame className="h-4 w-4 text-[#F59E0B]" />{meal.calories} cal
              </Badge>
              <Badge variant="secondary" className="bg-white/70 backdrop-blur-lg border border-white/20 px-3 py-1">
                {meal.servingSize}
              </Badge>
            </div>
          </div>

          <div className="space-y-3 mb-6">
            <h4 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Ingredients</h4>
            <ul className="space-y-2">
              {meal.ingredients.map((ingredient, idx) => (
                <li key={idx} className="flex items-center gap-3 text-sm text-foreground">
                  <span className="w-2 h-2 rounded-full bg-gradient-to-r from-[#6B8E6F] to-[#20B2AA] flex-shrink-0" />
                  {ingredient}
                </li>
              ))}
            </ul>
          </div>

          <div className="p-5 bg-gradient-to-r from-[#F59E0B]/10 to-[#6B8E6F]/10 rounded-lg border border-[#F59E0B]/30 hover:border-[#F59E0B]/50 transition-all">
            <h4 className="font-semibold text-sm mb-3 uppercase tracking-wider text-muted-foreground">Batch Scaling</h4>
            <div className="space-y-2 text-sm">
              {[
                { label: 'Single portion', val: `${meal.servingSize}g`, color: '#6B8E6F', border: '#F59E0B' },
                { label: 'Batch (5×)',     val: `${parseInt(meal.servingSize) * 5}g`,  color: '#20B2AA', border: '#20B2AA' },
                { label: 'Batch (10×)',    val: `${parseInt(meal.servingSize) * 10}g`, color: '#F59E0B', border: '#F59E0B' },
              ].map(({ label, val, color, border }) => (
                <div key={label} className="flex items-center justify-between p-2 bg-white/40 rounded border hover:bg-white/60 transition-colors"
                  style={{ borderColor: `${border}33` }}>
                  <span className="text-foreground">{label}</span>
                  <span className="font-bold" style={{ color }}>{val}</span>
                </div>
              ))}
              <p className="text-xs mt-2 pt-2 border-t border-[#6B8E6F]/20 text-muted-foreground">
                ⏱️ Increase cooking time by 10–15% for larger batches
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
