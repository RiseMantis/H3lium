'use client';

import React from 'react';
import { useHeliumStore } from '@/lib/store';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { MobileTabBar } from '@/components/MobileTabBar';
import { GuidedDemoBanner } from '@/components/GuidedDemoBanner';
import { CommandPalette } from '@/components/CommandPalette';
import { ToastContainer } from '@/components/ToastContainer';
import { EventDetailDrawer } from '@/components/EventDetailDrawer';
import { AgentDetailDrawer } from '@/components/AgentDetailDrawer';
import { AlertDetailDrawer } from '@/components/AlertDetailDrawer';

// Views
import { OverviewDashboardView } from '@/components/views/OverviewDashboardView';
import { AgentsView } from '@/components/views/AgentsView';
import { AttackLabView } from '@/components/views/AttackLabView';
import { AlertsView } from '@/components/views/AlertsView';
import { ApprovalQueueView } from '@/components/views/ApprovalQueueView';
import { ChainGraphView } from '@/components/views/ChainGraphView';
import { PolicyView } from '@/components/views/PolicyView';
import { AuditLogView } from '@/components/views/AuditLogView';
import { ArchitectureView } from '@/components/views/ArchitectureView';
import { TestResultsView } from '@/components/views/TestResultsView';

export default function HeliumApp() {
  const { activeTab } = useHeliumStore();

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans">
      {/* Top Header */}
      <Header />

      {/* Guided Demo Walkthrough Banner */}
      <GuidedDemoBanner />

      {/* Main Workspace Frame */}
      <div className="flex-1 flex w-full max-w-[1600px] mx-auto overflow-hidden pb-16 md:pb-0">
        {/* Sidebar Nav */}
        <Sidebar />

        {/* Dynamic Viewport */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 min-w-0">
          {activeTab === 'dashboard' && <OverviewDashboardView />}
          {activeTab === 'agents' && <AgentsView />}
          {activeTab === 'attack_lab' && <AttackLabView />}
          {activeTab === 'alerts' && <AlertsView />}
          {activeTab === 'approvals' && <ApprovalQueueView />}
          {activeTab === 'graph' && <ChainGraphView />}
          {activeTab === 'policy' && <PolicyView />}
          {activeTab === 'audit' && <AuditLogView />}
          {activeTab === 'architecture' && <ArchitectureView />}
          {activeTab === 'test_results' && <TestResultsView />}
        </main>
      </div>

      {/* Detail Drawers */}
      <EventDetailDrawer />
      <AgentDetailDrawer />
      <AlertDetailDrawer />

      {/* Floating System Utilities */}
      <CommandPalette />
      <ToastContainer />
      <MobileTabBar />
    </div>
  );
}
