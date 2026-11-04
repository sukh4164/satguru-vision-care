import React from "react";
import { LucideIcon, ArrowUpRight, ArrowDownRight } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  colorScheme?: "blue" | "navy" | "green" | "amber" | "purple" | "rose";
  onClick?: () => void;
}

export function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  colorScheme = "blue",
  onClick,
}: MetricCardProps) {
  const colorMap = {
    blue: "text-brand-600 bg-brand-50 border-brand-100",
    navy: "text-navy-800 bg-navy-50 border-navy-100",
    green: "text-emerald-700 bg-emerald-50 border-emerald-100",
    amber: "text-amber-700 bg-amber-50 border-amber-100",
    purple: "text-purple-700 bg-purple-50 border-purple-100",
    rose: "text-rose-700 bg-rose-50 border-rose-100",
  };

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs hover:shadow-md transition-all duration-200 ${
        onClick ? "cursor-pointer hover:border-brand-300" : ""
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          {title}
        </span>
        {Icon && (
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${colorMap[colorScheme]}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      <div className="flex items-baseline justify-between gap-2">
        <h3 className="text-2xl lg:text-3xl font-extrabold text-navy-950 tracking-tight font-sans">
          {value}
        </h3>
        {trend && (
          <span
            className={`inline-flex items-center text-xs font-bold px-2 py-0.5 rounded-full ${
              trend.isPositive
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                : "bg-rose-50 text-rose-700 border border-rose-200"
            }`}
          >
            {trend.isPositive ? (
              <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
            ) : (
              <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />
            )}
            {trend.value}
          </span>
        )}
      </div>

      {subtitle && (
        <p className="text-xs text-slate-500 mt-2 font-medium flex items-center gap-1.5">
          {subtitle}
        </p>
      )}
    </div>
  );
}

