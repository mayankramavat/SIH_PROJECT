import React from 'react';

/**
 * SummaryCard Component
 * Reusable card for summary metrics with clear typography, rounded corners, and subtle borders.
 */
export default function SummaryCard({ 
  label, 
  value, 
  trend, 
  trendPeriod, 
  subtext, 
  icon: Icon,
  badgeText,
  badgeColor = 'blue'
}) {
  const getBadgeStyle = () => {
    switch (badgeColor) {
      case 'green':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'red':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'amber':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'blue':
      default:
        return 'bg-blue-50 text-blue-700 border-blue-200';
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
          {label}
        </p>
        {Icon && (
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="mt-3 flex items-baseline justify-between">
        <p className="text-2xl font-bold text-gray-900 tracking-tight">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </p>
        {trend && (
          <span className="inline-flex items-center text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            {trend}
          </span>
        )}
        {badgeText && !trend && (
          <span className={`inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded border ${getBadgeStyle()}`}>
            {badgeText}
          </span>
        )}
      </div>

      {(subtext || trendPeriod) && (
        <div className="mt-2 text-xs text-gray-500 flex items-center justify-between">
          <span>{subtext}</span>
          {trendPeriod && <span className="text-gray-400 italic">{trendPeriod}</span>}
        </div>
      )}
    </div>
  );
}
