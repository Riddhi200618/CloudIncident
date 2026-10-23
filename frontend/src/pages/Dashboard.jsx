import React from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  Clock,
  CheckCircle2,
  ListOrdered,
  PlusCircle,
  ArrowRight,
  ShieldAlert,
  Flame,
  Activity,
  Sparkles,
  Server,
} from 'lucide-react';
import { useIncidents } from '../context/IncidentContext';
import StatCard from '../components/StatCard';
import IncidentTable from '../components/IncidentTable';
import CategoryDistribution from '../components/CategoryDistribution';

export default function Dashboard() {
  const { incidents, stats, loading, systemStatus, isMockMode } = useIncidents();

  // Extract recent 5 incidents
  const recentIncidents = incidents.slice(0, 5);

  const resolutionRate =
    stats.total > 0 ? Math.round((stats.resolved / stats.total) * 100) : 0;
  const inProgressCount = stats.inProgress + (stats.assigned || 0);

  return (
    <div className="space-y-8 pb-12 animate-fadeIn">
      {/* Editorial Hero Section (Inspired by reference poster layout) */}
      <section className="relative overflow-hidden rounded-2xl bg-[#501B24] text-[#F7EFE6] border border-[#651F2B] p-6 sm:p-8 lg:p-10 shadow-editorial-dark">
        {/* Subtle decorative geometric background accents */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#651F2B]/40 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20 -z-0" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-[#EAC4CF]/10 rounded-full blur-2xl pointer-events-none -z-0" />
        
        {/* Decorative Editorial Watermark behind content */}
        <div className="absolute right-4 bottom-1 font-display text-7xl sm:text-8xl lg:text-9xl text-white/[0.03] select-none pointer-events-none -z-0 tracking-widest hidden md:block">
          CLOUDOPS \
        </div>

        {/* Top Eyebrow Tag Row */}
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#651F2B] text-[#EAC4CF] border border-[#7A2B39] text-xs font-semibold uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5 text-[#EAC4CF]" />
            <span>CAMPUS OPERATIONAL INTELLIGENCE // 2026</span>
          </div>

          {/* Truthful System Status (Item 3 requirement) */}
          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="text-[#EAC4CF]/80">SYS STATUS:</span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#3D131B] border border-[#651F2B] font-semibold text-[#EAC4CF]">
              <span className={`w-2 h-2 rounded-full ${systemStatus.dotColor}`} />
              <span>{systemStatus.label}</span>
            </span>
          </div>
        </div>

        {/* Hero Grid: Left Copy & Right Intentional Overview Panel (Item 2 requirement) */}
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Column: Headlines & CTAs (7 Cols) */}
          <div className="lg:col-span-7 space-y-4">
            <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl tracking-wide text-white leading-none">
              TAKE CHARGE. <br />
              <span className="text-[#EAC4CF]">RESOLVE FASTER.</span>
            </h1>

            <p className="text-sm sm:text-base lg:text-lg text-[#F4DDE2]/90 font-normal leading-relaxed max-w-xl">
              Every issue has a solution. Track incidents, prioritize action, and keep your campus running.
            </p>

            {/* Action CTAs */}
            <div className="pt-3 flex flex-wrap items-center gap-3">
              <Link
                to="/report"
                className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-[#EAC4CF] hover:bg-white text-[#501B24] font-display text-sm sm:text-base tracking-widest uppercase transition-all duration-200 shadow-md hover:shadow-lg group"
              >
                <PlusCircle className="w-5 h-5 text-[#501B24] group-hover:rotate-90 transition-transform duration-300" />
                <span>REPORT AN INCIDENT</span>
              </Link>

              <Link
                to="/incidents"
                className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl bg-[#651F2B] hover:bg-[#7A2B39] text-[#F7EFE6] font-display text-sm sm:text-base tracking-widest uppercase border border-[#7A2B39] transition-colors"
              >
                <span>VIEW INCIDENT LOG</span>
                <ArrowRight className="w-4 h-4 text-[#EAC4CF]" />
              </Link>
            </div>
          </div>

          {/* Right Column: Restrained Editorial Incident Overview Panel (5 Cols) */}
          <div className="lg:col-span-5">
            <div className="rounded-2xl bg-[#3D131B]/90 border border-[#EAC4CF]/20 p-5 sm:p-6 backdrop-blur-md shadow-inner text-[#F7EFE6] space-y-4">
              
              {/* Header */}
              <div className="flex items-center justify-between border-b border-[#651F2B] pb-3">
                <span className="text-[10px] font-mono tracking-widest text-[#EAC4CF] uppercase">
                  ACTIVE REGISTRY OVERVIEW //
                </span>
                <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-[#501B24] text-[#EAC4CF] border border-[#651F2B]">
                  {stats.total} REGISTERED
                </span>
              </div>

              {/* Multi-segment Live Telemetry Bar */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px] text-[#F4DDE2]">
                  <span>Status Ratio</span>
                  <span className="font-mono text-[#EAC4CF]">
                    {resolutionRate}% Resolved
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-[#501B24] flex overflow-hidden border border-[#651F2B]">
                  <div
                    className="bg-[#EAC4CF] transition-all duration-500"
                    style={{
                      width: `${stats.total > 0 ? (stats.resolved / stats.total) * 100 : 0}%`,
                    }}
                    title={`Resolved: ${stats.resolved}`}
                  />
                  <div
                    className="bg-amber-400 transition-all duration-500"
                    style={{
                      width: `${stats.total > 0 ? (inProgressCount / stats.total) * 100 : 0}%`,
                    }}
                    title={`In Progress: ${inProgressCount}`}
                  />
                  <div
                    className="bg-rose-400 transition-all duration-500"
                    style={{
                      width: `${stats.total > 0 ? (stats.open / stats.total) * 100 : 0}%`,
                    }}
                    title={`Open: ${stats.open}`}
                  />
                </div>
              </div>

              {/* 3 Metric Pills Derived from Shared State */}
              <div className="grid grid-cols-3 gap-2 pt-1">
                <div className="p-2.5 rounded-xl bg-[#501B24]/90 border border-[#651F2B] text-center">
                  <span className="text-[10px] font-mono uppercase text-[#F4DDE2]/80 block">
                    OPEN
                  </span>
                  <span className="font-display text-2xl sm:text-3xl text-rose-300 block">
                    {stats.open}
                  </span>
                  <span className="text-[9px] uppercase tracking-wider text-[#DCCBBC]">
                    Pending
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-[#501B24]/90 border border-[#651F2B] text-center">
                  <span className="text-[10px] font-mono uppercase text-[#F4DDE2]/80 block">
                    ACTIVE
                  </span>
                  <span className="font-display text-2xl sm:text-3xl text-amber-300 block">
                    {inProgressCount}
                  </span>
                  <span className="text-[9px] uppercase tracking-wider text-[#DCCBBC]">
                    In Work
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-[#501B24]/90 border border-[#651F2B] text-center">
                  <span className="text-[10px] font-mono uppercase text-[#F4DDE2]/80 block">
                    CRITICAL
                  </span>
                  <span className="font-display text-2xl sm:text-3xl text-[#EAC4CF] block">
                    {stats.critical || 0}
                  </span>
                  <span className="text-[9px] uppercase tracking-wider text-[#DCCBBC]">
                    Priority
                  </span>
                </div>
              </div>

              {/* Quick dispatch note */}
              <div className="pt-1 flex items-center justify-between text-[11px] text-[#DCCBBC]">
                <span>Automated triage routing active</span>
                <Link
                  to="/admin"
                  className="text-[#EAC4CF] hover:text-white font-semibold flex items-center gap-1 group"
                >
                  <span>Dispatch Hub</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* 4 Statistics Cards (Item 4 requirement: consistent heights, shared data) */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#501B24]" />
            <h2 className="font-display text-xl sm:text-2xl text-[#501B24] tracking-wide">
              CAMPUS INCIDENT METRICS
            </h2>
          </div>
          <span className="text-xs font-mono text-[#857172]">
            REAL-TIME AGGREGATION //
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-stretch">
          <StatCard
            title="Total Incidents"
            value={loading ? '...' : String(stats.total).padStart(2, '0')}
            subtitle="Logged across all campus departments"
            icon={ListOrdered}
            variant="burgundy"
            badgeText="All Time"
          />

          <StatCard
            title="Open"
            value={loading ? '...' : String(stats.open).padStart(2, '0')}
            subtitle="Awaiting dispatch or assessment"
            icon={AlertTriangle}
            variant="blush"
            badgeText={stats.open > 0 ? 'Requires Action' : 'Clear'}
          />

          <StatCard
            title="In Progress"
            value={loading ? '...' : String(inProgressCount).padStart(2, '0')}
            subtitle="Actively being worked by campus teams"
            icon={Clock}
            variant="cream"
            badgeText="Dispatched"
          />

          <StatCard
            title="Resolved"
            value={loading ? '...' : String(stats.resolved).padStart(2, '0')}
            subtitle="Successfully remediated and signed off"
            icon={CheckCircle2}
            variant="white"
            badgeText="Remediated"
          />
        </div>
      </section>

      {/* Two Column Grid: Distribution & Editorial Highlight */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Visualization */}
        <div className="lg:col-span-2">
          <CategoryDistribution
            categoryCounts={stats.categoryCounts}
            priorityCounts={stats.priorityCounts}
            total={stats.total}
          />
        </div>

        {/* Right Column: Editorial Highlight Box */}
        <div className="rounded-xl bg-[#EAC4CF] border border-[#DFB0BD] p-6 flex flex-col justify-between shadow-sm relative overflow-hidden">
          <div className="relative z-10">
            <span className="text-[10px] font-mono tracking-widest text-[#501B24] uppercase block mb-1">
              CAMPUS POLICY //
            </span>
            <h3 className="font-display text-2xl text-[#501B24] tracking-wide mb-3">
              ZERO-DOWNTIME COMMITMENT.
            </h3>
            <p className="text-xs text-[#501B24] leading-relaxed mb-4">
              All <strong>Critical</strong> severity reports automatically alert senior infrastructure administrators. Triage response is prioritized for physical security and campus networks.
            </p>

            <div className="space-y-2 mb-6">
              <div className="p-3 rounded-lg bg-white/70 border border-[#DFB0BD] text-xs text-[#501B24] flex items-center justify-between">
                <span className="font-semibold">Critical Incidents Active</span>
                <span className="font-mono font-bold text-sm text-[#651F2B] px-2 py-0.5 rounded bg-white">
                  {stats.critical || 0}
                </span>
              </div>
              <div className="p-3 rounded-lg bg-white/70 border border-[#DFB0BD] text-xs text-[#501B24] flex items-center justify-between">
                <span className="font-semibold">Overall Resolution Rate</span>
                <span className="font-mono font-bold text-sm text-[#2B5A3C] px-2 py-0.5 rounded bg-white">
                  {resolutionRate}%
                </span>
              </div>
            </div>
          </div>

          <Link
            to="/admin"
            className="relative z-10 w-full py-2.5 px-4 rounded-lg bg-[#501B24] hover:bg-[#651F2B] text-[#F7EFE6] text-xs font-semibold uppercase tracking-wider text-center transition-colors shadow-sm block"
          >
            Open Admin Dispatch Hub
          </Link>

          {/* Decorative geometric accent */}
          <div className="absolute -bottom-6 -right-6 w-32 h-32 rounded-full border-4 border-[#501B24]/10 pointer-events-none" />
        </div>
      </section>

      {/* Recent Incidents Table Section */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="text-[10px] font-mono tracking-widest text-[#857172] uppercase block">
              Live Feed //
            </span>
            <h2 className="font-display text-2xl text-[#501B24] tracking-wide">
              RECENTLY REPORTED INCIDENTS
            </h2>
          </div>

          <Link
            to="/incidents"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#501B24] hover:text-[#651F2B] uppercase tracking-wider group"
          >
            <span>View All ({stats.total})</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <IncidentTable incidents={recentIncidents} emptyMessage="No recent incidents reported." />
      </section>
    </div>
  );
}
