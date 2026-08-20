'use client';

import React, { useEffect, useState } from 'react';
import { useCalculator } from '@/lib/CalculatorContext';
import Dashboard from '@/components/Dashboard';

interface SeoDashboardWrapperProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initialState: any;
  headerNode: React.ReactNode;
}

export default function SeoDashboardWrapper({ initialState, headerNode }: SeoDashboardWrapperProps) {
  const { updateState } = useCalculator();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    updateState(initialState);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setReady(true);
  }, [initialState, updateState]);

  if (!ready) return null;

  return (
    <div className="space-y-6 pt-4">
      {headerNode}
      <div className="h-px bg-white/10 w-full my-8" />
      <Dashboard />
    </div>
  );
}
