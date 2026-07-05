import React from 'react';

export default function ReadinessMeter({ score = 0, size = 120 }) {
  const radius = size * 0.4;
  const strokeWidth = size * 0.08;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const getColor = () => {
    if (score < 40) return 'stroke-rose-500';
    if (score < 75) return 'stroke-amber-500';
    return 'stroke-emerald-500';
  };

  const getBgColor = () => {
    if (score < 40) return 'text-rose-500 bg-rose-950/20';
    if (score < 75) return 'text-amber-500 bg-amber-950/20';
    return 'text-emerald-500 bg-emerald-950/20';
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 bg-slate-950 border border-slate-800 rounded-xl shadow-md">
      <div className="relative" style={{ width: size, height: size }}>
        {/* SVG Circle Gauge */}
        <svg className="w-full h-full transform -rotate-90" viewBox={`0 0 ${size} ${size}`}>
          {/* Background circle */}
          <circle
            className="stroke-slate-800"
            fill="transparent"
            strokeWidth={strokeWidth}
            r={radius}
            cx={size / 2}
            cy={size / 2}
          />
          {/* Foreground progress circle */}
          <circle
            className={`transition-all duration-500 ease-out ${getColor()}`}
            fill="transparent"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            r={radius}
            cx={size / 2}
            cy={size / 2}
          />
        </svg>
        {/* Center Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-bold text-slate-100">{score}%</span>
          <span className="text-[9px] text-slate-500 uppercase tracking-widest font-medium">Ready</span>
        </div>
      </div>
      <div className="mt-4 text-center">
        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[9px] font-mono border border-current font-semibold uppercase tracking-wider ${getBgColor()}`}>
          {score < 40 ? 'Weak Case' : score < 75 ? 'Incomplete' : 'Ready to File'}
        </span>
      </div>
    </div>
  );
}
