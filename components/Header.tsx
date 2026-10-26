'use client';

import React from 'react';
import { useHeliumStore } from '@/lib/store';
import {
  Shield,
  ShieldAlert,
  Search,
  Bell,
  Sun,
  Moon,
  RotateCcw,
  PlayCircle,
  Zap,
  CheckCircle2,
  XCircle,
} from 'lucide-react';

export function Header() {
  const {
    theme,
    setTheme,
    protectionEnabled,
    setProtectionEnabled,
    simulationSpeed,
    setSimulationSpeed,
    resetSimulation,
    startGuidedDemo,
    setIsSearchOpen,
    alerts,
    setSelectedAlertId,
    setActiveTab,
  } = useHeliumStore();

  const [isAlertsOpen, setIsAlertsOpen] = React.useState(false);

  const activeAlerts = alerts.filter((a) => a.status === 'open' || a.status === 'blocked');
  const recentAlerts = alerts.slice(0, 5);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md px-4 sm:px-6 py-2.5">
      <div className="flex items-center justify-between gap-4 max-w-[1600px] mx-auto">
        {/* Left: Brand & Simulation Mode Banner */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 to-indigo-600 flex items-center justify-center text-white shadow-sm font-bold text-base tracking-tighter">
              H<sub className="text-[10px] font-mono leading-none">3</sub>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-base tracking-tight text-slate-900 dark:text-slate-100">
                  H3lium
                </span>
                <span className="text-[11px] font-medium text-teal-600 dark:text-teal-400 font-mono">
                  v1.0-RC
                </span>
              </div>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-2 pl-3 border-l border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-500" />
            <span>Simulation mode: no real agents connected</span>
          </div>
        </div>

        {/* Center: Protection Master Switch & Guided Demo */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => setProtectionEnabled(!protectionEnabled)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              protectionEnabled
                ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 shadow-sm'
                : 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 animate-pulse'
            }`}
            title="Toggle H3lium Protection Gateway to demonstrate attack success vs containment"
          >
            {protectionEnabled ? (
              <>
                <Shield className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                <span className="whitespace-nowrap">Protection: ACTIVE</span>
              </>
            ) : (
              <>
                <ShieldAlert className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                <span className="whitespace-nowrap">Protection: BYPASSED</span>
              </>
            )}
          </button>

          <button
            onClick={startGuidedDemo}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-purple-600 hover:bg-purple-700 text-white transition-colors shadow-sm"
          >
            <PlayCircle className="w-3.5 h-3.5" />
            <span className="whitespace-nowrap">Start Guided Demo</span>
          </button>
        </div>

        {/* Right: Search, Alerts, Speed, Theme, Reset */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Global Search Button */}
          <button
            onClick={() => setIsSearchOpen(true)}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors border border-slate-200 dark:border-slate-800"
            title="Search agents, alerts, resources (Cmd+K)"
          >
            <Search className="w-3.5 h-3.5" />
            <span className="hidden md:inline text-[11px]">Search...</span>
            <kbd className="hidden md:inline text-[10px] font-mono bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-slate-400">
              ⌘K
            </kbd>
          </button>

          {/* Speed Selector */}
          <div className="hidden md:flex items-center gap-1 bg-slate-100 dark:bg-slate-900 p-0.5 rounded-md border border-slate-200 dark:border-slate-800 text-[11px]">
            <span className="px-1.5 text-slate-400 flex items-center gap-1">
              <Zap className="w-3 h-3 text-amber-500" />
              <span>Speed:</span>
            </span>
            {([0.5, 1, 2, 4] as const).map((spd) => (
              <button
                key={spd}
                onClick={() => setSimulationSpeed(spd)}
                className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-medium transition-colors ${
                  simulationSpeed === spd
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-xs'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {spd}x
              </button>
            ))}
          </div>

          {/* Alerts Bell Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsAlertsOpen(!isAlertsOpen)}
              className="relative p-2 rounded-md text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
              title="View Security Alerts"
            >
              <Bell className="w-4 h-4" />
              {activeAlerts.length > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-950" />
              )}
            </button>

            {isAlertsOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl z-50 p-3">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                      Security Alerts
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">
                      ({activeAlerts.length} active)
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setIsAlertsOpen(false);
                      setActiveTab('alerts');
                    }}
                    className="text-[11px] text-teal-600 dark:text-teal-400 hover:underline"
                  >
                    View all
                  </button>
                </div>

                {recentAlerts.length === 0 ? (
                  <div className="py-6 text-center text-xs text-slate-400">
                    <CheckCircle2 className="w-6 h-6 mx-auto mb-1.5 text-emerald-500" />
                    All agents operating nominally within policy envelopes.
                  </div>
                ) : (
                  <div className="space-y-1.5 max-h-64 overflow-y-auto">
                    {recentAlerts.map((alert) => (
                      <div
                        key={alert.id}
                        onClick={() => {
                          setSelectedAlertId(alert.id);
                          setActiveTab('alerts');
                          setIsAlertsOpen(false);
                        }}
                        className="p-2 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
                      >
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-medium text-slate-900 dark:text-slate-100 truncate">
                            {alert.agentName}
                          </span>
                          <span
                            className={`text-[10px] font-mono uppercase px-1.5 py-0.5 rounded ${
                              alert.level === 'critical'
                                ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                                : alert.level === 'high'
                                ? 'bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-300'
                                : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                            }`}
                          >
                            {alert.level}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                          {alert.summary}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Theme Toggle */}
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2 rounded-md text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} theme`}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Reset Simulation */}
          <button
            onClick={resetSimulation}
            className="p-2 rounded-md text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
            title="Reset Simulation State & Logs"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
