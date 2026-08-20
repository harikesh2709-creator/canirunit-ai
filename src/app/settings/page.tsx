'use client';

import React from 'react';
import { useTheme } from 'next-themes';
import { Moon, Sun, Monitor, RefreshCw } from 'lucide-react';

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Settings</h1>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Appearance Settings */}
        <div className="theme-panel p-6">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Monitor className="w-5 h-5 text-teal-500" />
            Appearance
          </h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-slate-900 dark:text-white">Theme Preference</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">Choose your preferred viewing experience.</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <button
                onClick={() => setTheme('light')}
                className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
                  theme === 'light'
                    ? 'border-teal-500 bg-teal-50 dark:bg-teal-500/10 text-teal-600 dark:text-teal-400'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-500 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <Sun className="w-6 h-6 mb-2" />
                <span className="font-semibold">Light</span>
              </button>
              
              <button
                onClick={() => setTheme('dark')}
                className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
                  theme === 'dark'
                    ? 'border-teal-500 bg-teal-50 dark:bg-teal-500/10 text-teal-600 dark:text-teal-400'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-500 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <Moon className="w-6 h-6 mb-2" />
                <span className="font-semibold">Dark</span>
              </button>
              
              <button
                onClick={() => setTheme('system')}
                className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
                  theme === 'system'
                    ? 'border-teal-500 bg-teal-50 dark:bg-teal-500/10 text-teal-600 dark:text-teal-400'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-500 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <Monitor className="w-6 h-6 mb-2" />
                <span className="font-semibold">System</span>
              </button>
            </div>
          </div>
        </div>

        {/* System Settings Placeholder */}
        <div className="theme-panel p-6">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <RefreshCw className="w-5 h-5 text-indigo-500" />
            Data Settings
          </h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-slate-900 dark:text-white">Clear Local Storage</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">Reset all custom hardware and configurations to default.</p>
            </div>
            <button
              onClick={() => {
                localStorage.clear();
                window.location.reload();
              }}
              className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-lg transition-colors text-sm"
            >
              Reset App Data
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
