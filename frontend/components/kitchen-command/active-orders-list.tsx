'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MealOrder } from '@/lib/mock-data';
import { Clock, CheckCircle2, Flame } from 'lucide-react';

interface ActiveOrdersListProps {
  orders: MealOrder[];
  selectedOrderId?: string;
  onSelectOrder?: (order: MealOrder) => void;
}

export function ActiveOrdersList({
  orders,
  selectedOrderId,
  onSelectOrder,
}: ActiveOrdersListProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-[#F59E0B]/10 text-[#F59E0B]';
      case 'preparing':
        return 'bg-[#6B8E6F]/10 text-[#6B8E6F]';
      case 'ready':
        return 'bg-[#20B2AA]/10 text-[#20B2AA]';
      case 'delivered':
        return 'bg-[#20B2AA]/10 text-[#20B2AA]';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'preparing':
        return <Flame className="h-4 w-4" />;
      case 'ready':
      case 'delivered':
        return <CheckCircle2 className="h-4 w-4" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-lg">Active Orders</h3>
      <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
        {orders.map((order) => (
          <div
            key={order.id}
            onClick={() => onSelectOrder?.(order)}
            className={`p-4 rounded-lg cursor-pointer transition-medical border-2 ${
              selectedOrderId === order.id
                ? 'border-[#6B8E6F] bg-[#6B8E6F]/5'
                : 'border-border hover:border-[#6B8E6F]/50'
            }`}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <p className="font-semibold text-sm">{order.patientName}</p>
                <p className="text-xs text-muted-foreground">
                  Order #{order.id}
                </p>
              </div>
              <Badge className={getStatusColor(order.status)}>
                {order.status === 'pending'
                  ? 'Pending'
                  : order.status === 'preparing'
                    ? 'Cooking'
                    : order.status === 'ready'
                      ? 'Ready'
                      : 'Delivered'}
              </Badge>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{order.mealType}</span>
                <span className="font-medium">× {order.quantity}</span>
              </div>

              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                {getStatusIcon(order.status)}
                <span>Due: {order.dueTime}</span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-3 h-2 bg-secondary rounded-full overflow-hidden">
              <div
                className={`h-full transition-all ${
                  order.status === 'pending'
                    ? 'w-1/4 bg-[#F59E0B]'
                    : order.status === 'preparing'
                      ? 'w-1/2 bg-[#6B8E6F]'
                      : 'w-full bg-[#20B2AA]'
                }`}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
