import React from 'react';

export default function RiskGauge({ score = 0, grade = 'A', size = 160 }) {
  const radius = (size - 24) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const getColor = (grade) => {
    switch (grade) {
      case 'A': return { stroke: '#10b981', text: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' };
      case 'B': return { stroke: '#3b82f6', text: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' };
      case 'C': return { stroke: '#f59e0b', text: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' };
      case 'D': return { stroke: '#f97316', text: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/20' };
      default: return { stroke: '#ef4444', text: 'text-rose-400', bg: 'bg-rose-500/10 border-rose-500/20' };
    }
  };

  const theme = getColor(grade);

  return (
    <div className="flex flex-col items-center justify-center relative">
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth="10"
          className="text-slate-800"
          fill="transparent"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={theme.stroke}
          strokeWidth="10"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="transparent"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-3xl font-extrabold tracking-tight text-white">{score}</span>
        <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">/ 100</span>
        <div className={`mt-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${theme.bg} ${theme.text}`}>
          Grade {grade}
        </div>
      </div>
    </div>
  );
}
