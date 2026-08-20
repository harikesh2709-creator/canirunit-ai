import React from 'react';

interface StatCardProps {
  label: string;
  value: string;
  color: string;
  accentClass: string;
}

export default function StatCard({ label, value, color, accentClass }: StatCardProps) {
  return (
    <div className="theme-panel p-4 relative overflow-hidden group">
      <div className={`absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl opacity-20 -mr-10 -mt-10 transition-transform group-hover:scale-150 ${accentClass}`} />
      
      <div className="relative z-10">
        <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">{label}</div>
        <div className={`text-xl lg:text-2xl font-black ${color} drop-shadow-sm`}>
          {value}
        </div>
      </div>
    </div>
  );
}
