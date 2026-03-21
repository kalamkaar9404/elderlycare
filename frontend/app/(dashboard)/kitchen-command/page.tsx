'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import type { ComponentProps } from 'react';
import type { ActiveOrdersList as AOLType  } from '@/components/kitchen-command/active-orders-list';
import type { RecipeGuide      as RGType   } from '@/components/kitchen-command/recipe-guide';
import type { ChefChatbot      as CCType   } from '@/components/kitchen-command/chef-chatbot';
import { motion } from 'framer-motion';
import { ChefHat, Flame } from 'lucide-react';
const ActiveOrdersList = dynamic<ComponentProps<typeof AOLType>> (() => import('@/components/kitchen-command/active-orders-list').then(m => ({ default: m.ActiveOrdersList })), { ssr: false });
const RecipeGuide      = dynamic<ComponentProps<typeof RGType>>  (() => import('@/components/kitchen-command/recipe-guide').then(m      => ({ default: m.RecipeGuide })),      { ssr: false });
const ChefChatbot      = dynamic<ComponentProps<typeof CCType>>  (() => import('@/components/kitchen-command/chef-chatbot').then(m      => ({ default: m.ChefChatbot })),      { ssr: false });
import { Card } from '@/components/ui/card';
import {
  MOCK_MEAL_ORDERS,
  MOCK_MEALS,
  MOCK_CHEF_MESSAGES,
  MealOrder,
} from '@/lib/mock-data';
import { staggerContainerVariants, slideUpVariants } from '@/lib/luxury-animations';

export default function KitchenCommandPage() {
  const [selectedOrder, setSelectedOrder] = useState<MealOrder>(MOCK_MEAL_ORDERS[0]);

  const selectedMeal = MOCK_MEALS.find(
    (m) => m.name.toLowerCase().includes(selectedOrder.mealType.toLowerCase())
  );

  return (
    <motion.div
      className="space-y-6"
      variants={staggerContainerVariants}
      initial="hidden"
      animate="show"
    >
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <motion.div variants={slideUpVariants} className="space-y-4 pb-4 border-b border-white/20">
        <h1 className="text-4xl font-bold"
          style={{ background: 'linear-gradient(135deg,#F59E0B,#6B8E6F,#E8B4A0)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>
          Kitchen Command
        </h1>
        <p className="text-muted-foreground">Manage meal preparation and delivery logistics</p>
        <div className="flex flex-wrap items-center gap-3">
          <span className="px-4 py-1.5 rounded-full text-sm font-semibold bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/25">
            {MOCK_MEAL_ORDERS.length} Active Orders
          </span>
          <span className="px-4 py-1.5 rounded-full text-sm font-semibold bg-[#20B2AA]/10 text-[#20B2AA] border border-[#20B2AA]/25 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#20B2AA] animate-pulse" />
            Production Active
          </span>
        </div>
      </motion.div>

      {/* ── Themed Hero: Woman-Led Professional Kitchen ───────────────── */}
      <motion.div variants={slideUpVariants}>
        <div className="relative w-full h-52 md:h-60 rounded-3xl overflow-hidden glass-silk">
          {/* Warm kitchen atmosphere — amber/sage tones */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#F59E0B]/20 via-[#E8B4A0]/25 to-[#6B8E6F]/20" />
          <div className="absolute inset-0"
            style={{
              backgroundImage: `
                radial-gradient(circle at 30% 40%, rgba(245,158,11,0.30) 0%, transparent 55%),
                radial-gradient(circle at 75% 60%, rgba(107,142,111,0.22) 0%, transparent 50%),
                radial-gradient(circle at 10% 80%, rgba(232,180,160,0.28) 0%, transparent 40%)
              `,
            }}
          />

          {/* Steam effect lines */}
          {[...Array(4)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-0.5 rounded-full"
              style={{
                height: '40px',
                background: 'linear-gradient(to top, rgba(245,158,11,0.4), transparent)',
                left: `${25 + i * 18}%`,
                bottom: '15%',
              }}
              animate={{ y: [0, -30, -60], opacity: [0.6, 0.3, 0] }}
              transition={{ duration: 2, repeat: Infinity, delay: i * 0.5, ease: 'easeOut' }}
            />
          ))}

          <div className="absolute inset-0 flex items-end p-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center">
                  <ChefHat className="h-4 w-4 text-[#F59E0B]" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#F59E0B] bg-white/60 backdrop-blur-sm px-3 py-1 rounded-full">
                  NGO Community Kitchen
                </span>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-1">
                Quality Meal Preparation
              </h2>
              <p className="text-sm text-slate-600/90 max-w-lg">
                Women-led kitchen excellence — precision nutrition cooked with care for every community member.
              </p>
            </div>
          </div>

          {/* Flame icon top-right */}
          <motion.div
            className="absolute top-5 right-5 w-10 h-10 rounded-full bg-[#F59E0B]/20 backdrop-blur-sm flex items-center justify-center"
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Flame className="h-5 w-5 text-[#F59E0B]" />
          </motion.div>
        </div>
      </motion.div>

      {/* ── 2-Column Layout ──────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 auto-rows-max">
        <motion.div variants={slideUpVariants}>
          <Card className="p-6 glass-silk rounded-2xl border-white/30">
            <ActiveOrdersList
              orders={MOCK_MEAL_ORDERS}
              selectedOrderId={selectedOrder.id}
              onSelectOrder={setSelectedOrder}
            />
          </Card>
        </motion.div>

        <motion.div variants={slideUpVariants} className="space-y-4">
          <RecipeGuide meal={selectedMeal} />
          <ChefChatbot initialMessages={MOCK_CHEF_MESSAGES} />
        </motion.div>
      </div>
    </motion.div>
  );
}
