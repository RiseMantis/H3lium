'use client';

import React, { useEffect, useState } from 'react';
import { useHeliumStore, TabType } from '@/lib/store';
import {
  Search,
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
  Shield,
  X,
} from 'lucide-react';

export function CommandPalette() {
  const {
    isSearchOpen,
    setIsSearchOpen,
    setActiveTab,
    agents,
    alerts,
    resources,
    setSelectedAgentId,
    setSelectedAlertId,
    setProtectionEnabled,
    protectionEnabled,
  } = useHeliumStore();

  const [query, setQuery] = useState('');

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(!isSearchOpen);
      }
      if (e.key === 'Escape' && isSearchOpen) {
        setIsSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen, setIsSearchOpen]);

  if (!isSearchOpen) return null;

  const screens: { id: TabType; name: string; icon: React.ElementType; section: string }[] = [
    { id: 'dashboard', name: 'Overview Dashboard', icon: LayoutDashboard, section: 'Navigation' },
    { id: 'agents', name: 'Agents Directory', icon: Users, section: 'Navigation' },
    { id: 'attack_lab', name: 'Attack Lab Simulator', icon: FlaskConical, section: 'Navigation' },
    { id: 'alerts', name: 'Alerts & Explainability', icon: AlertTriangle, section: 'Navigation' },
    { id: 'approvals', name: 'Approval Queue', icon: Clock, section: 'Navigation' },
    { id: 'graph', name: 'Provenance & Chain Graph', icon: GitBranch, section: 'Navigation' },
    { id: 'policy', name: 'Policy & Role Manifests', icon: Sliders, section: 'Navigation' },
    { id: 'audit', name: 'Evidence & Hash-Chained Audit', icon: FileText, section: 'Navigation' },
    { id: 'architecture', name: 'Architecture & Tech Stack', icon: Boxes, section: 'Navigation' },
    { id: 'test_results', name: 'Benchmark Scorecard', icon: Award, section: 'Navigation' },
  ];

  const filteredScreens = screens.filter((s) =>
    s.name.toLowerCase().includes(query.toLowerCase())
  );

  const filteredAgents = agents.filter(
    (a) =>
      a.name.toLowerCase().includes(query.toLowerCase()) ||
      a.role.toLowerCase().includes(query.toLowerCase()) ||
      a.owner.toLowerCase().includes(query.toLowerCase())
  );

  const filteredAlerts = alerts.filter(
    (a) =>
      a.agentName.toLowerCase().includes(query.toLowerCase()) ||
      a.summary.toLowerCase().includes(query.toLowerCase()) ||
      a.level.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-slate-950/70 backdrop-blur-xs">
      <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[75vh]">
        {/* Search Input */}
        <div className="flex items-center px-4 py-3 border-b border-slate-200 dark:border-slate-800 gap-3">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Type a screen name, agent, alert, or command..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="w-full bg-transparent text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none"
          />
          <button
            onClick={() => setIsSearchOpen(false)}
            className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="overflow-y-auto p-2 space-y-3">
          {/* Quick Actions */}
          <div>
            <div className="px-2 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Quick Actions
            </div>
            <button
              onClick={() => {
                setProtectionEnabled(!protectionEnabled);
                setIsSearchOpen(false);
              }}
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs hover:bg-slate-100 dark:hover:bg-slate-800 text-left transition-colors"
            >
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-teal-500" />
                <span className="text-slate-800 dark:text-slate-200">
                  Toggle Protection ({protectionEnabled ? 'Currently ON' : 'Currently OFF'})
                </span>
              </div>
              <span className="text-[10px] font-mono text-slate-400">Switch</span>
            </button>
          </div>

          {/* Screens */}
          {filteredScreens.length > 0 && (
            <div>
              <div className="px-2 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Consoles & Views
              </div>
              <div className="space-y-0.5">
                {filteredScreens.map((screen) => {
                  const Icon = screen.icon;
                  return (
                    <button
                      key={screen.id}
                      onClick={() => {
                        setActiveTab(screen.id);
                        setIsSearchOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 text-left transition-colors"
                    >
                      <Icon className="w-4 h-4 text-slate-400" />
                      <span>{screen.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Agents */}
          {filteredAgents.length > 0 && (
            <div>
              <div className="px-2 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Agents
              </div>
              <div className="space-y-0.5">
                {filteredAgents.map((agent) => (
                  <button
                    key={agent.id}
                    onClick={() => {
                      setSelectedAgentId(agent.id);
                      setActiveTab('agents');
                      setIsSearchOpen(false);
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs hover:bg-slate-100 dark:hover:bg-slate-800 text-left transition-colors"
                  >
                    <div>
                      <div className="font-medium text-slate-900 dark:text-slate-100">
                        {agent.name}
                      </div>
                      <div className="text-[11px] text-slate-400">{agent.role}</div>
                    </div>
                    <span className="text-[11px] font-mono text-teal-500">
                      Trust: {agent.trustScore}/100
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Alerts */}
          {filteredAlerts.length > 0 && (
            <div>
              <div className="px-2 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Security Alerts
              </div>
              <div className="space-y-0.5">
                {filteredAlerts.slice(0, 4).map((alert) => (
                  <button
                    key={alert.id}
                    onClick={() => {
                      setSelectedAlertId(alert.id);
                      setActiveTab('alerts');
                      setIsSearchOpen(false);
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs hover:bg-slate-100 dark:hover:bg-slate-800 text-left transition-colors"
                  >
                    <div className="truncate mr-2">
                      <div className="font-medium text-slate-900 dark:text-slate-100">
                        {alert.agentName}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate">{alert.summary}</div>
                    </div>
                    <span className="text-[10px] font-mono uppercase text-rose-500 shrink-0">
                      {alert.level}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
