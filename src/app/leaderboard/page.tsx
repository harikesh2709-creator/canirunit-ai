'use client';

import React, { useState, useEffect } from 'react';
import { Trophy, Medal, Crown, Sparkles, Hash } from 'lucide-react';
import { motion } from 'framer-motion';
import { getLeaderboard, LeaderboardEntry } from '@/lib/leaderboardService';

const tierStyles: Record<number, { color: string; glow: string; bg: string; gradient: string }> = {
  1: { color: '#f59e0b', glow: 'rgba(245,158,11,0.3)', bg: 'rgba(245,158,11,0.1)', gradient: 'from-amber-500/20 to-orange-500/20' },
  2: { color: '#3b82f6', glow: 'rgba(59,130,246,0.3)', bg: 'rgba(59,130,246,0.1)', gradient: 'from-blue-500/20 to-cyan-500/20' },
  3: { color: '#10b981', glow: 'rgba(16,185,129,0.3)', bg: 'rgba(16,185,129,0.1)', gradient: 'from-emerald-500/20 to-teal-500/20' },
};

export default function LeaderboardPage() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setEntries(getLeaderboard());
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Page Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg shadow-amber-500/20">
          <Trophy className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">Global Leaderboard</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">See how your hardware ranks against the community</p>
        </div>
      </div>

      {/* Leaderboard Table Container */}
      <div className="theme-panel overflow-hidden border border-slate-200 dark:border-white/10 shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-black/40 border-b border-slate-200 dark:border-white/10">
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 w-16 text-center">Rank</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Nickname</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Hardware</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Tier</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 text-right">AI Score</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry, index) => {
                const rank = index + 1;
                const isTop3 = rank <= 3;
                const isCurrent = entry.isCurrentUser;
                
                return (
                  <motion.tr 
                    key={entry.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`
                      border-b border-slate-200/50 dark:border-white/5 last:border-0 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors
                      ${isCurrent ? 'bg-indigo-50/50 dark:bg-indigo-500/10' : ''}
                    `}
                  >
                    {/* Rank */}
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      {rank === 1 ? (
                        <Crown className="w-6 h-6 text-yellow-500 mx-auto" />
                      ) : rank === 2 ? (
                        <Medal className="w-6 h-6 text-slate-400 mx-auto" />
                      ) : rank === 3 ? (
                        <Medal className="w-6 h-6 text-amber-700 dark:text-amber-600 mx-auto" />
                      ) : (
                        <span className="text-sm font-bold text-slate-400 dark:text-slate-500 flex items-center justify-center gap-0.5">
                          <Hash className="w-3 h-3" />
                          {rank}
                        </span>
                      )}
                    </td>
                    
                    {/* Nickname */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-bold ${isTop3 ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300'}`}>
                          {entry.nickname}
                        </span>
                        {isCurrent && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500 text-white shadow-lg shadow-indigo-500/30">
                            YOU
                          </span>
                        )}
                      </div>
                    </td>
                    
                    {/* Hardware */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-slate-600 dark:text-slate-400 truncate max-w-[200px] md:max-w-[300px] inline-block" title={entry.gpuName}>
                        {entry.gpuName}
                      </span>
                    </td>
                    
                    {/* Tier */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-xs px-2.5 py-1 rounded-full font-bold border"
                            style={{ 
                              color: (tierStyles[entry.tier] || tierStyles[3]).color, 
                              background: (tierStyles[entry.tier] || tierStyles[3]).bg,
                              borderColor: (tierStyles[entry.tier] || tierStyles[3]).glow
                            }}>
                        Tier {entry.tier || 3}
                      </span>
                    </td>
                    
                    {/* AI Score */}
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {isTop3 && <Sparkles className="w-3.5 h-3.5 text-amber-500" />}
                        <span className={`text-lg font-black ${isTop3 ? 'text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-500' : 'text-slate-900 dark:text-white'}`}>
                          {entry.aiScore}
                        </span>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
