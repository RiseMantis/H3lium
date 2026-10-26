'use client';

import React from 'react';
import { useHeliumStore, TabType } from '@/lib/store';
import {
  LayoutDashboard,
  Users,
  FlaskConical,
  AlertTriangle,
  Clock,
  GitBranch,
  Sliders,
  FileText,
  Boxes,
  Award,
} from 'lucide-react';

export function Sidebar() {
  const { activeTab, setActiveTab, alerts, approvals } = useHeliumStore();

  const activeAlertsCount = alerts.filter(
    (a) => a.status === 'open' || a.status === 'blocked'
  ).length;
  const pendingApprovalsCount = approvals.filter((a) => a.status === 'pending').length;

  const navItems: {
    id: TabType;
    label: string;
    icon: React.ElementType;
    badge?: number;
    badgeColor?: string;
  }[] = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'agents', label: 'Agents', icon: Users },
    { id: 'attack_lab', label: 'Attack Lab', icon: FlaskConical },
    {
      id: 'alerts',
      label: 'Alerts',
      icon: AlertTriangle,
      badge: activeAlertsCount > 0 ? activeAlertsCount : undefined,
      badgeColor: 'bg-rose-500 text-white',
    },
    {
      id: 'approvals',
      label: 'Approval Queue',
      icon: Clock,
      badge: pendingApprovalsCount > 0 ? pendingApprovalsCount : undefined,
      badgeColor: 'bg-amber-500 text-white',
    },
    { id: 'graph', label: 'Provenance Graph', icon: GitBranch },
    { id: 'policy', label: 'Policy & Roles', icon: Sliders },
    { id: 'audit', label: 'Evidence & Audit', icon: FileText },
    { id: 'architecture', label: 'Architecture', icon: Boxes },
    { id: 'test_results', label: 'Test Results', icon: Award },
  ];

  return (
    <aside className="hidden md:flex flex-col w-56 lg:w-64 border-r border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 p-3 shrink-0 select-none">
      <div className="space-y-1">
        <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
          Security Console
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                isActive
                  ? 'bg-teal-500/10 dark:bg-teal-500/15 text-teal-700 dark:text-teal-300 font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon
                  className={`w-4 h-4 ${
                    isActive ? 'text-teal-600 dark:text-teal-400' : 'text-slate-400 dark:text-slate-500'
                  }`}
                />
                <span className="whitespace-nowrap">{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
                    item.badgeColor || 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-auto pt-4 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-400 space-y-1 px-3">
        <div className="font-medium text-slate-500 dark:text-slate-400">Core Principle</div>
        <p className="text-[10px] leading-relaxed italic text-slate-500">
          &ldquo;Allowed is not the same as appropriate.&rdquo;
        </p>
      </div>
    </aside>
  );
}
