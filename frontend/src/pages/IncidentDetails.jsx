import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  User,
  ShieldAlert,
  Tag,
  CheckCircle2,
  Edit3,
  Share2,
  FileText,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { useIncidents } from '../context/IncidentContext';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import IncidentTimeline from '../components/IncidentTimeline';

export default function IncidentDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { incidents, loading } = useIncidents();

  const incident = incidents.find(
    (item) => item.id.toLowerCase() === (id || '').toLowerCase()
  );

  const formatDate = (isoString) => {
    if (!isoString) return '—';
    try {
      const d = new Date(isoString);
      return d.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  // Status progress calculations
  const statusSteps = ['Open', 'Assigned', 'In Progress', 'Resolved', 'Closed'];
  const currentStepIndex = incident ? statusSteps.indexOf(incident.status) : 0;

  if (loading) {
    return (
      <div className="py-24 text-center">
        <div className="w-10 h-10 border-4 border-[#501B24] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="font-display text-xl text-[#501B24]">LOADING INCIDENT OVERVIEW...</p>
      </div>
    );
  }

  if (!incident) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-[#FAF0F2] border border-[#EAC4CF] flex items-center justify-center text-[#501B24] mx-auto">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="font-display text-3xl text-[#501B24]">INCIDENT NOT FOUND</h2>
        <p className="text-sm text-[#5A4647]">
          We could not locate an incident with ID "{id}". It may have been deleted or the ID may be invalid.
        </p>
        <Link
          to="/incidents"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#501B24] text-[#F7EFE6] text-xs font-semibold uppercase tracking-wider hover:bg-[#651F2B]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to All Incidents</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16 animate-fadeIn">
      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#DCCBBC] pb-4">
        <Link
          to="/incidents"
          className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#501B24] hover:text-[#651F2B] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Incidents</span>
        </Link>

        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-bold text-[#857172]">
            ROUTE: GET /incidents/{incident.id}
          </span>
          <Link
            to={`/admin?id=${incident.id}`}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#501B24] hover:bg-[#651F2B] text-[#F7EFE6] text-xs font-semibold uppercase tracking-wider transition-colors shadow-sm"
          >
            <Edit3 className="w-3.5 h-3.5 text-[#EAC4CF]" />
            <span>Manage in Admin</span>
          </Link>
        </div>
      </div>

      {/* Editorial Header Banner */}
      <div className="rounded-2xl bg-[#501B24] text-[#F7EFE6] p-6 sm:p-10 border border-[#651F2B] shadow-editorial-dark relative overflow-hidden">
        {/* Decorative corner tag */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#651F2B] text-[#EAC4CF] border border-[#7A2B39] text-[11px] font-mono tracking-widest uppercase">
            <span>{incident.id}</span>
            <span>•</span>
            <span>{incident.category}</span>
          </div>

          <div className="flex items-center gap-2">
            <PriorityBadge priority={incident.priority} size="md" />
            <StatusBadge status={incident.status} size="md" />
          </div>
        </div>

        <h1 className="font-display text-3xl sm:text-5xl text-white tracking-wide leading-tight mb-4">
          {incident.title}
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-[#651F2B] text-xs text-[#EAC4CF]">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-[#EAC4CF] flex-shrink-0" />
            <span className="truncate">{incident.location}</span>
          </div>
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-[#EAC4CF] flex-shrink-0" />
            <span className="truncate">Reported by: {incident.reportedBy}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#EAC4CF] flex-shrink-0" />
            <span>Logged: {formatDate(incident.createdAt)}</span>
          </div>
        </div>
      </div>

      {/* Burgundy Progress Indicator Bar (Lifecycle tracker) */}
      <div className="p-6 rounded-2xl bg-[#FAF5EE] border border-[#DCCBBC] shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#857172]">
            INCIDENT RESOLUTION LIFECYCLE //
          </span>
          <span className="text-xs font-bold uppercase tracking-wider text-[#501B24]">
            CURRENT STATE: {incident.status}
          </span>
        </div>

        {/* Multi-step progress visual */}
        <div className="grid grid-cols-5 gap-2 relative">
          {statusSteps.map((step, idx) => {
            const isCompleted = idx <= currentStepIndex;
            const isCurrent = idx === currentStepIndex;
            return (
              <div key={step} className="flex flex-col items-center text-center">
                <div
                  className={`w-full h-2 rounded-full mb-2 transition-all ${
                    isCompleted
                      ? isCurrent
                        ? 'bg-[#501B24] ring-2 ring-[#EAC4CF]'
                        : 'bg-[#501B24]'
                      : 'bg-[#DCCBBC]/50'
                  }`}
                />
                <span
                  className={`text-[10px] sm:text-xs font-bold uppercase tracking-wider ${
                    isCurrent
                      ? 'text-[#501B24]'
                      : isCompleted
                      ? 'text-[#651F2B]'
                      : 'text-[#857172]'
                  }`}
                >
                  {step}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Two Column Layout: Details & Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Full Incident Details */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Detailed Problem Description Card */}
          <div className="editorial-card p-6 sm:p-8 rounded-2xl bg-white space-y-4">
            <div className="flex items-center gap-2 border-b border-[#FAF0F2] pb-3">
              <FileText className="w-4 h-4 text-[#501B24]" />
              <h3 className="font-display text-xl text-[#501B24] tracking-wide">
                INCIDENT DESCRIPTION
              </h3>
            </div>
            <p className="text-sm sm:text-base text-[#24191A] leading-relaxed whitespace-pre-line">
              {incident.description}
            </p>
          </div>

          {/* Resolution Remarks Card (if any) */}
          <div
            className={`p-6 sm:p-8 rounded-2xl border transition-all ${
              incident.resolutionRemarks
                ? 'bg-[#FAF0F2] border-[#EAC4CF]'
                : 'bg-white border-[#DCCBBC]'
            }`}
          >
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle2 className="w-5 h-5 text-[#501B24]" />
              <h3 className="font-display text-xl text-[#501B24] tracking-wide">
                RESOLUTION REMARKS & ACTION LOG
              </h3>
            </div>

            {incident.resolutionRemarks ? (
              <p className="text-sm text-[#501B24] leading-relaxed font-medium bg-white/80 p-4 rounded-xl border border-[#DFB0BD]">
                {incident.resolutionRemarks}
              </p>
            ) : (
              <p className="text-xs text-[#857172] italic">
                No formal resolution remarks recorded yet. Campus dispatch or assigned technician can append notes in the Admin Management interface.
              </p>
            )}
          </div>
        </div>

        {/* Right Column: Metadata Sidebar & Audit Timeline */}
        <div className="space-y-6">
          
          {/* Metadata Card */}
          <div className="p-6 rounded-2xl bg-[#FAF5EE] border border-[#DCCBBC] space-y-4 shadow-sm">
            <h3 className="font-display text-lg text-[#501B24] tracking-wide border-b border-[#DCCBBC] pb-2">
              DISPATCH ASSIGNMENT
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-[#857172] uppercase font-bold tracking-wider block">
                  Assignee
                </span>
                <span className="font-semibold text-sm text-[#24191A] mt-0.5 block">
                  {incident.assignee || 'Unassigned'}
                </span>
              </div>

              <div>
                <span className="text-[#857172] uppercase font-bold tracking-wider block">
                  Category Domain
                </span>
                <span className="font-semibold text-sm text-[#24191A] mt-0.5 block">
                  {incident.category}
                </span>
              </div>

              <div>
                <span className="text-[#857172] uppercase font-bold tracking-wider block">
                  Last Updated
                </span>
                <span className="font-mono text-[#5A4647] mt-0.5 block">
                  {formatDate(incident.updatedAt)}
                </span>
              </div>
            </div>

            <Link
              to={`/admin?id=${incident.id}`}
              className="w-full py-2.5 px-4 rounded-xl bg-[#501B24] hover:bg-[#651F2B] text-[#F7EFE6] text-xs font-semibold uppercase tracking-wider text-center block transition-colors shadow-sm"
            >
              Update Status or Assignee
            </Link>
          </div>

          {/* Audit Timeline */}
          <div className="p-6 rounded-2xl bg-white border border-[#DCCBBC] shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-[#FAF0F2] pb-3">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#501B24]" />
                <h3 className="font-display text-lg text-[#501B24] tracking-wide">
                  TRANSITION TIMELINE
                </h3>
              </div>
              <span className="font-mono text-[10px] text-[#857172]">
                {incident.timeline?.length || 0} EVENTS
              </span>
            </div>

            <IncidentTimeline timeline={incident.timeline} />
          </div>

        </div>
      </div>
    </div>
  );
}
