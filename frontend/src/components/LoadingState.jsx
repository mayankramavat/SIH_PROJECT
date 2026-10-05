import React from 'react';
import { Loader2 } from 'lucide-react';

export default function LoadingState({ message = 'Loading labour market data...' }) {
  return (
    <div className="flex flex-col items-center justify-center p-12 bg-white rounded-xl border border-govSlate-200 shadow-sm my-6 text-center">
      <Loader2 className="w-8 h-8 text-govCyan-600 animate-spin mb-3" />
      <h3 className="text-sm font-bold text-govNavy-900 tracking-tight">{message}</h3>
      <p className="text-xs text-govSlate-500 mt-1 max-w-sm">
        Retrieving validated signals from National Labour Market Intelligence System API
      </p>
    </div>
  );
}
