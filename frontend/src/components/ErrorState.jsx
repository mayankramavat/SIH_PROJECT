import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function ErrorState({
  title = 'Unable to connect to the analytics server.',
  message = 'Please ensure the FastAPI backend is running.',
  onRetry
}) {
  return (
    <div className="flex flex-col items-center justify-center p-8 bg-govRed-50/50 rounded-xl border border-govRed-200 shadow-sm my-6 text-center">
      <div className="w-12 h-12 rounded-full bg-govRed-100 flex items-center justify-center text-govRed-600 mb-3">
        <AlertTriangle className="w-6 h-6" />
      </div>
      <h3 className="text-base font-bold text-govNavy-900 tracking-tight">{title}</h3>
      <p className="text-xs text-govSlate-600 mt-1 max-w-md">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-4 inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-govNavy-900 text-white text-xs font-semibold hover:bg-govNavy-800 transition-colors shadow-sm cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Retry Connection</span>
        </button>
      )}
    </div>
  );
}
