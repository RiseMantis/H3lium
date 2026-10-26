'use client';

import React, { useState } from 'react';
import { useHeliumStore } from '@/lib/store';
import { Sparkline } from '@/components/Sparkline';
import {
  Search,
  Filter,
  Shield,
  ShieldAlert,
  ArrowUpDown,
  UserCheck,
  Eye,
  Sliders,
  RotateCcw,
} from 'lucide-react';

export function AgentsView() {
  const { agents, setSelectedAgentId, setAgentStatus } = useHeliumStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<'trust' | 'name'>('trust');
  const [sortAsc, setSortAsc] = useState<boolean>(false);

  // Filter & Sort
  const filteredAgents = agents
    .filter((a) => {
      const matchSearch =
        a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.owner.toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus = statusFilter === 'all' || a.status === statusFilter;
      return matchSearch && matchStatus;
    })
    .sort((a, b) => {
      if (sortField === 'trust') {
        return sortAsc ? a.trustScore - b.trustScore : b.trustScore - a.trustScore;
      }
      return sortAsc ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
    });

  return (
    <div className="space-y-4">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            Autonomous AI Agents Directory
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            8 monitored agents with continuous behavioral profiling, role manifests, and trust metrics
          </p>
        </div>

        {/* Search & Status Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter agents by name, role, owner..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none w-56 sm:w-64"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 font-medium focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="normal">Normal</option>
            <option value="watch">Watch</option>
            <option value="safe_mode">Safe Mode</option>
            <option value="isolated">Isolated</option>
          </select>

          <button
            onClick={() => {
              if (sortField === 'trust') {
                setSortAsc(!sortAsc);
              } else {
                setSortField('trust');
                setSortAsc(false);
              }
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors font-medium"
          >
            <ArrowUpDown className="w-3 h-3 text-slate-400" />
            <span>Sort: Trust {sortField === 'trust' && (sortAsc ? '↑' : '↓')}</span>
          </button>
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 dark:bg-slate-800/50 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th className="px-4 py-3">Agent & Role</th>
              <th className="px-4 py-3">Owner</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Trust Score (0-100)</th>
              <th className="px-4 py-3">12-Event Sparkline</th>
              <th className="px-4 py-3">Last Observed Action</th>
              <th className="px-4 py-3 text-right">Controls</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
            {filteredAgents.map((agent) => (
              <tr
                key={agent.id}
                className="hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer transition-colors"
                onClick={() => setSelectedAgentId(agent.id)}
              >
                <td className="px-4 py-3.5">
                  <div className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <span>{agent.name}</span>
                    {agent.authorizedChange && (
                      <span className="text-[9px] font-mono font-semibold px-1.5 py-0.2 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                        CAB-GRACE
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-400">{agent.role}</div>
                </td>
                <td className="px-4 py-3.5 text-slate-600 dark:text-slate-400 text-xs">
                  {agent.owner}
                </td>
                <td className="px-4 py-3.5 whitespace-nowrap">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold ${
                      agent.status === 'isolated'
                        ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                        : agent.status === 'safe_mode'
                        ? 'bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-300'
                        : agent.status === 'watch'
                        ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                        : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        agent.status === 'isolated'
                          ? 'bg-rose-500'
                          : agent.status === 'safe_mode'
                          ? 'bg-orange-500'
                          : agent.status === 'watch'
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                    />
                    {agent.status.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-4 py-3.5 whitespace-nowrap">
                  <span
                    className={`text-sm font-bold font-mono ${
                      agent.trustScore >= 90
                        ? 'text-teal-600 dark:text-teal-400'
                        : agent.trustScore >= 70
                        ? 'text-amber-500'
                        : 'text-rose-500'
                    }`}
                  >
                    {agent.trustScore}
                  </span>
                  <span className="text-[10px] text-slate-400">/100</span>
                </td>
                <td className="px-4 py-3.5 whitespace-nowrap">
                  <Sparkline data={agent.trustHistory} width={80} height={20} />
                </td>
                <td className="px-4 py-3.5 text-slate-600 dark:text-slate-300 text-xs max-w-xs truncate">
                  {agent.lastAction}
                </td>
                <td className="px-4 py-3.5 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      onClick={() => setSelectedAgentId(agent.id)}
                      className="p-1.5 rounded-md hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
                      title="Inspect Profile"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    {agent.status === 'isolated' ? (
                      <button
                        onClick={() => setAgentStatus(agent.id, 'normal', 'Restored by analyst')}
                        className="px-2 py-1 rounded bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 hover:bg-teal-100 text-[11px] font-medium"
                      >
                        Restore
                      </button>
                    ) : (
                      <button
                        onClick={() => setAgentStatus(agent.id, 'safe_mode', 'Safe Mode initiated')}
                        className="px-2 py-1 rounded bg-orange-50 dark:bg-orange-950 text-orange-700 dark:text-orange-300 hover:bg-orange-100 text-[11px] font-medium"
                      >
                        Safe Mode
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card List View */}
      <div className="md:hidden space-y-3">
        {filteredAgents.map((agent) => (
          <div
            key={agent.id}
            onClick={() => setSelectedAgentId(agent.id)}
            className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs space-y-3"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-sm">
                  {agent.name}
                </h3>
                <div className="text-[11px] text-slate-400">{agent.role}</div>
              </div>
              <span
                className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded font-bold ${
                  agent.status === 'isolated'
                    ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                    : agent.status === 'safe_mode'
                    ? 'bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-300'
                    : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                }`}
              >
                {agent.status.replace('_', ' ')}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs py-2 border-y border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-slate-400 block text-[10px]">Trust Score</span>
                <span className="font-mono font-bold text-teal-600 dark:text-teal-400">
                  {agent.trustScore}/100
                </span>
              </div>
              <Sparkline data={agent.trustHistory} width={80} height={20} />
            </div>

            <p className="text-[11px] text-slate-600 dark:text-slate-300 truncate">
              {agent.lastAction}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
