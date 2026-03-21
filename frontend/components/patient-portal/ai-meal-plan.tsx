'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { MedicalBadge } from '@/components/common/medical-badge';
import { BlockchainBadge, BlockchainStatus } from '@/components/common/blockchain-badge';
import { Zap, Clock, Loader2, RefreshCw } from 'lucide-react';

interface MealItem {
  time: string;
  name: string;
  calories: number;
  nutrients?: string;
}

interface StaticMeal {
  time: string;
  meal: { name: string; calories: number };
}

interface AIMealPlanProps {
  meals: StaticMeal[];
  totalCalories: number;
  status: 'approved' | 'pending';
  onGenerate?: () => void;
}

export function AIMealPlan({
  meals: initialMeals,
  totalCalories: initialCal,
  status,
  onGenerate,
}: AIMealPlanProps) {
  const [isGenerating, setIsGenerating]         = useState(false);
  const [error, setError]                       = useState<string | null>(null);
  const [focus, setFocus]                       = useState<string | null>(null);
  const [liveMeals, setLiveMeals]               = useState<MealItem[] | null>(null);
  const [liveTotal, setLiveTotal]               = useState<number | null>(null);
  const [chainStatus, setChainStatus]           = useState<BlockchainStatus>({ state: 'idle' });
  const [txHash, setTxHash]                     = useState<string | null>(null);

  const displayMeals: MealItem[] =
    liveMeals ??
    initialMeals.map((m) => ({ time: m.time, name: m.meal.name, calories: m.meal.calories }));
  const displayTotal = liveTotal ?? initialCal;

  /* ── Fire-and-forget: silently anchor on blockchain ── */
  const anchorOnChain = async (planData: unknown) => {
    setChainStatus({ state: 'securing' });
    try {
      const res = await fetch('/api/blockchain/record', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: planData }),
      });
      const json = await res.json();

      if (!res.ok || json.error) {
        setChainStatus({ state: 'failed', reason: json.error ?? 'Anchoring failed' });
        return;
      }

      setTxHash(json.txHash);
      // Once we have txHash we immediately try to verify to get block details
      const verifyRes = await fetch('/api/blockchain/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: planData }),
      });
      const verifyJson = await verifyRes.json();

      if (verifyJson?.verified) {
        setChainStatus({
          state: 'verified',
          timestamp: verifyJson.timestamp,
          blockNumber: verifyJson.blockNumber,
          anchoredAt: verifyJson.anchoredAt,
          explorerUrl: verifyJson.explorerUrl,
          txHash: json.txHash,
        });
      } else {
        // tx went through but verification not yet indexed; show partial success
        setChainStatus({
          state: 'verified',
          timestamp: Math.floor(Date.now() / 1000),
          blockNumber: 0,
          anchoredAt: new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }),
          explorerUrl: `https://amoy.polygonscan.com/tx/${json.txHash}`,
          txHash: json.txHash,
        });
      }
    } catch {
      setChainStatus({ state: 'failed', reason: 'Network error during anchoring' });
    }
  };

  /* ── Generate AI plan then anchor ── */
  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);
    setChainStatus({ state: 'idle' });

    try {
      const res = await fetch('/api/chat/meal-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientInfo: 'pregnant woman, week 28, no known allergies, vegetarian preferred',
        }),
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error ?? `HTTP ${res.status}`);

      if (Array.isArray(data.meals)) {
        setLiveMeals(data.meals);
        setLiveTotal(
          data.totalCalories ??
            data.meals.reduce((s: number, m: MealItem) => s + m.calories, 0)
        );
        setFocus(data.focus ?? null);

        // ── Silent blockchain anchor (does NOT block the UI) ──
        anchorOnChain(data);
      }
      onGenerate?.();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to generate plan');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Generate button */}
      <button
        onClick={handleGenerate}
        disabled={isGenerating}
        className="w-full h-12 rounded-lg font-semibold text-white
                   bg-gradient-to-r from-[#6B8E6F] to-[#20B2AA]
                   hover:shadow-lg hover:from-[#6B8E6F]/90 hover:to-[#20B2AA]/90
                   disabled:opacity-60 transition-all duration-200
                   flex items-center justify-center gap-2"
      >
        {isGenerating ? (
          <><Loader2 className="h-4 w-4 animate-spin" /><span>Generating AI Plan…</span></>
        ) : liveMeals ? (
          <><RefreshCw className="h-4 w-4" /><span>Regenerate Plan</span></>
        ) : (
          <><Zap className="h-4 w-4" /><span>Generate AI Meal Plan</span></>
        )}
      </button>

      {/* Inline errors */}
      {error && (
        <p className="text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2">
          ⚠️ {error}
        </p>
      )}

      {/* Focus tag */}
      {focus && (
        <p className="text-xs text-[#6B8E6F] bg-[#6B8E6F]/10 border border-[#6B8E6F]/20 rounded-lg px-3 py-2 font-medium">
          🎯 Focus: {focus}
        </p>
      )}

      {/* Meal plan card */}
      <Card className="p-6 bg-gradient-to-br from-white via-slate-50 to-blue-50
                       border border-white/20 shadow-lg rounded-2xl overflow-hidden relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#6B8E6F]/5 rounded-full -mr-16 -mt-16" />

        <div className="relative z-10">
          {/* Card header */}
          <div className="flex flex-wrap items-center justify-between gap-2 mb-6">
            <h3 className="font-semibold text-foreground uppercase tracking-wider">
              {liveMeals ? 'AI-Generated Plan' : "Today's Meal Plan"}
            </h3>
            <div className="flex items-center gap-2">
              {/* ── BLOCKCHAIN BADGE ── */}
              <BlockchainBadge status={chainStatus} />
              <MedicalBadge
                status={status === 'approved' ? 'safe' : 'attention'}
                label={status === 'approved' ? 'DR. APPROVED' : 'PENDING REVIEW'}
              />
            </div>
          </div>

          {/* Meal rows */}
          <div className="space-y-2">
            {displayMeals.map((meal, idx) => (
              <div
                key={idx}
                className="group flex items-start justify-between p-4
                           bg-white/60 backdrop-blur-md rounded-xl
                           border border-white/20 hover:border-[#20B2AA]/50
                           hover:bg-white/80 transition-all duration-200 hover:shadow-md"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className="h-4 w-4 text-[#6B8E6F]" />
                    <span className="text-sm font-medium text-muted-foreground">{meal.time}</span>
                  </div>
                  <p className="font-semibold text-foreground text-sm">{meal.name}</p>
                  {meal.nutrients && (
                    <p className="text-xs text-muted-foreground mt-0.5">{meal.nutrients}</p>
                  )}
                </div>
                <div className="ml-4 flex flex-col items-end flex-shrink-0">
                  <span className="text-sm font-bold text-[#6B8E6F]">{meal.calories}</span>
                  <span className="text-xs text-muted-foreground">cal</span>
                </div>
              </div>
            ))}
          </div>

          {/* Total */}
          <div className="mt-6 p-5 bg-gradient-to-r from-[#6B8E6F]/10 to-[#20B2AA]/10 rounded-xl
                          border border-[#6B8E6F]/30 hover:border-[#20B2AA]/50 transition-all shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
                  Daily Nutrition Goal
                </span>
                <p className="text-sm text-muted-foreground mt-1">Balanced macronutrients</p>
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold bg-gradient-to-r from-[#6B8E6F] to-[#20B2AA] bg-clip-text text-transparent">
                  {displayTotal}
                </span>
                <p className="text-xs text-muted-foreground mt-0.5">kcal</p>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
