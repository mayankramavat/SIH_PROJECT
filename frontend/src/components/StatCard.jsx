import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function StatCard({
  title,
  value,
  subtitle,
  trend,
  trendPositive,
  badgeText,
  badgeVariant = 'default', // 'danger' | 'warning' | 'success' | 'cyan' | 'default'
  icon: Icon,
  accentColor // optional accent border
}) {
  const getBadgeStyle = () => {
    switch (badgeVariant) {
      case 'danger':
        return 'bg-govRed-50 text-govRed-700 border-govRed-200';
      case 'warning':
        return 'bg-govAmber-50 text-govAmber-700 border-govAmber-200';
      case 'success':
        return 'bg-govEmerald-50 text-govEmerald-700 border-govEmerald-200';
      case 'cyan':
        return 'bg-govCyan-50 text-govCyan-700 border-govCyan-200';
      default:
        return 'bg-govSlate-100 text-govSlate-700 border-govSlate-200';
    }
  };

  const getAccentBorder = () => {
    switch (badgeVariant) {
      case 'danger':
        return 'border-t-govRed-500';
      case 'warning':
        return 'border-t-govAmber-500';
      case 'success':
        return 'border-t-govEmerald-500';
      case 'cyan':
        return 'border-t-govCyan-500';
      default:
        return 'border-t-govNavy-800';
    }
  };

  return (
    <div className={`bg-white rounded-xl border border-govSlate-200 border-t-3 ${getAccentBorder()} p-4.5 shadow-xs hover:shadow-md transition-all card-hover flex flex-col justify-between`}>
      {/* Header Row */}
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] font-bold uppercase tracking-wider text-govSlate-500 truncate">
          {title}
        </span>
        {Icon && (
          <div className="w-8 h-8 rounded-lg bg-govSlate-50 border border-govSlate-100 flex items-center justify-center text-govNavy-700 shrink-0 shadow-2xs">
            <Icon className="w-4 h-4 text-govNavy-800" />
          </div>
        )}
      </div>

      {/* Main Metric Value */}
      <div className="my-2">
        <div className="text-2xl font-black tracking-tight text-govNavy-900 tabular-nums">
          {value !== null && value !== undefined && value !== ''
            ? (typeof value === 'number' ? value.toLocaleString() : value)
            : <span className="text-sm font-semibold text-govSlate-400">Loading...</span>
          }
        </div>
        {subtitle && (
          <div className="text-[11px] text-govSlate-500 mt-0.5 font-medium leading-tight">
            {subtitle}
          </div>
        )}
      </div>

      {/* Footer Status & Trend */}
      <div className="flex items-center justify-between pt-2 border-t border-govSlate-100 text-xs">
        {trend ? (
          <div className={`flex items-center space-x-1 font-bold text-[11px] ${
            trendPositive ? 'text-govEmerald-600' : 'text-govRed-600'
          }`}>
            {trendPositive ? (
              <ArrowUpRight className="w-3.5 h-3.5" />
            ) : (
              <ArrowDownRight className="w-3.5 h-3.5" />
            )}
            <span>{trend}</span>
          </div>
        ) : <div />}

        {badgeText && (
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${getBadgeStyle()}`}>
            {badgeText}
          </span>
        )}
      </div>
    </div>
  );
}
