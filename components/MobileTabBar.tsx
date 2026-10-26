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

export function MobileTabBar() {
  const { activeTab, setActiveTab, alerts, approvals } = useHeliumStore();

  const activeAlertsCount = alerts.filter(
    (a) => a.status === 'open' || a.status === 'blocked'
  ).length;
  const pendingApprovalsCount = approvals.filter((a) => a.status === 'pending').length;

  const items: { id: TabType; label: string; icon: React.ElementType; badge?: number }[] = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'agents', label: 'Agents', icon: Users },
    { id: 'attack_lab', label: 'Attack Lab', icon: FlaskConical },
    { id: 'alerts', label: 'Alerts', icon: AlertTriangle, badge: activeAlertsCount },
    { id: 'approvals', label: 'Approval', icon: Clock, badge: pendingApprovalsCount },
    { id: 'graph', label: 'Graph', icon: GitBranch },
    { id: 'policy', label: 'Policy', icon: Sliders },
    { id: 'audit', label: 'Audit', icon: FileText },
    { id: 'test_results', label: 'Results', icon: Award },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-2 py-1.5 flex items-center justify-around overflow-x-auto">
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`relative flex flex-col items-center justify-center p-1.5 min-w-[52px] rounded-md transition-colors ${
              isActive
                ? 'text-teal-600 dark:text-teal-400 font-medium'
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
            }`}
          >
            <div className="relative">
              <Icon className="w-4 h-4" />
              {item.badge !== undefined && item.badge > 0 && (
                <span className="absolute -top-1 -right-2 px-1 py-0.2 rounded-full text-[9px] font-mono font-bold bg-rose-500 text-white">
                  {item.badge}
                </span>
              )}
            </div>
            <span className="text-[10px] whitespace-nowrap mt-0.5">{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}
