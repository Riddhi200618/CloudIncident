import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  ShieldAlert,
  CheckCircle2,
  UserCheck,
  FileCheck,
  Search,
  ExternalLink,
  RotateCw,
  Sparkles,
  ArrowRight,
  Info,
} from 'lucide-react';
import { useIncidents } from '../context/IncidentContext';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import { STATUSES } from '../data/mockIncidents';

export default function AdminManagement() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { incidents, updateIncident, loading } = useIncidents();

  const urlId = searchParams.get('id');

  // Selected incident
  const [selectedId, setSelectedId] = useState(
    urlId || (incidents.length > 0 ? incidents[0].id : '')
  );

  const [assignee, setAssignee] = useState('');
  const [status, setStatus] = useState('Open');
  const [resolutionRemarks, setResolutionRemarks] = useState('');
  const [adminName, setAdminName] = useState('Campus Ops Dispatcher');
  const [saving, setSaving] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');

  // Find currently active incident
  const activeIncident = incidents.find(
    (i) => i.id.toLowerCase() === (selectedId || '').toLowerCase()
  );

  // Sync state whenever activeIncident changes
  useEffect(() => {
    if (activeIncident) {
      setAssignee(activeIncident.assignee || '');
      setStatus(activeIncident.status || 'Open');
      setResolutionRemarks(activeIncident.resolutionRemarks || '');
    }
  }, [activeIncident]);

  // Sync with URL query parameter
  useEffect(() => {
    if (urlId && urlId !== selectedId) {
      setSelectedId(urlId);
    } else if (!selectedId && incidents.length > 0) {
      setSelectedId(incidents[0].id);
    }
  }, [urlId, incidents, selectedId]);

  const handleSelectIncident = (id) => {
    setSelectedId(id);
    setSearchParams({ id });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!activeIncident) return;

    setSaving(true);
    try {
      await updateIncident(activeIncident.id, {
        assignee: assignee.trim() || 'Unassigned',
        status,
        resolutionRemarks: resolutionRemarks.trim(),
        updatedBy: adminName.trim() || 'Campus Admin',
      });
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const filteredList = incidents.filter((i) => {
    const q = searchFilter.toLowerCase();
    return (
      i.id.toLowerCase().includes(q) ||
      i.title.toLowerCase().includes(q) ||
      i.category.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-8 pb-16 animate-fadeIn">
      {/* Top Editorial Header */}
      <div className="border-b border-[#DCCBBC] pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EAC4CF] text-[#501B24] border border-[#DFB0BD] text-[11px] font-bold uppercase tracking-widest mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>DISPATCH & RESOLUTION CONSOLE // 2026</span>
          </div>
          <h1 className="font-display text-4xl sm:text-6xl text-[#501B24] tracking-wide leading-none">
            MAKE IT HAPPEN.
          </h1>
          <p className="mt-3 text-sm sm:text-base text-[#5A4647] max-w-2xl leading-relaxed">
            Assign responsible personnel, progress lifecycle transitions (Open → Assigned → In Progress → Resolved → Closed), and append official remediation remarks.
          </p>
        </div>

        <div className="text-right">
          <span className="font-mono text-xs font-semibold text-[#857172] block">
            PREPARED FOR GATEWAY ROUTE:
          </span>
          <span className="font-mono text-xs font-bold text-[#501B24] px-2.5 py-1 rounded bg-[#FAF5EE] border border-[#DCCBBC] inline-block mt-1">
            PATCH /incidents/:id
          </span>
        </div>
      </div>

      {/* Main Grid: Selector Column & Management Editor Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Incident Selector List (4 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-4 rounded-xl bg-white border border-[#DCCBBC] shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#501B24]">
                Select Incident to Triage
              </span>
              <span className="font-mono text-[11px] text-[#857172]">
                {filteredList.length} Total
              </span>
            </div>

            {/* Quick search input */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#857172]" />
              <input
                type="text"
                placeholder="Filter by ID, title, or category..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-lg bg-[#FAF5EE] border border-[#DCCBBC] text-xs text-[#24191A] focus:outline-none focus:ring-1 focus:ring-[#501B24]"
              />
            </div>
          </div>

          {/* List of Incidents */}
          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
            {filteredList.length === 0 ? (
              <div className="p-6 text-center text-xs text-[#857172] bg-white rounded-xl border border-[#DCCBBC]">
                No incidents match filter.
              </div>
            ) : (
              filteredList.map((inc) => {
                const isSelected = activeIncident && activeIncident.id === inc.id;
                return (
                  <button
                    type="button"
                    key={inc.id}
                    onClick={() => handleSelectIncident(inc.id)}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all flex flex-col gap-1.5 ${
                      isSelected
                        ? 'bg-[#501B24] text-[#F7EFE6] border-[#651F2B] shadow-sm'
                        : 'bg-white text-[#24191A] border-[#DCCBBC] hover:bg-[#FAF5EE]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`font-mono text-xs font-bold ${
                          isSelected ? 'text-[#EAC4CF]' : 'text-[#501B24]'
                        }`}
                      >
                        {inc.id}
                      </span>
                      <div className="flex items-center gap-1">
                        <PriorityBadge priority={inc.priority} size="sm" />
                        <StatusBadge status={inc.status} size="sm" />
                      </div>
                    </div>

                    <p
                      className={`text-xs font-semibold line-clamp-1 ${
                        isSelected ? 'text-white' : 'text-[#24191A]'
                      }`}
                    >
                      {inc.title}
                    </p>

                    <div
                      className={`flex items-center justify-between text-[11px] ${
                        isSelected ? 'text-[#DCCBBC]' : 'text-[#857172]'
                      }`}
                    >
                      <span>{inc.category}</span>
                      <span>{inc.assignee || 'Unassigned'}</span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Edit Incident Form (7 Cols) */}
        <div className="lg:col-span-7">
          {activeIncident ? (
            <div className="rounded-2xl bg-[#FAF5EE] border border-[#DCCBBC] shadow-editorial overflow-hidden">
              {/* Form Top Accent Header */}
              <div className="bg-[#501B24] text-[#F7EFE6] p-5 border-b border-[#651F2B] flex flex-wrap items-center justify-between gap-3">
                <div>
                  <span className="font-mono text-[10px] tracking-widest text-[#EAC4CF] uppercase block">
                    ACTIVE TRIAGE RECORD //
                  </span>
                  <div className="flex items-center gap-2">
                    <h2 className="font-display text-2xl text-white tracking-wide">
                      {activeIncident.id}
                    </h2>
                    <span className="text-xs text-[#EAC4CF]">•</span>
                    <span className="text-xs font-medium text-[#F4DDE2]">
                      {activeIncident.category}
                    </span>
                  </div>
                </div>

                <Link
                  to={`/incidents/${activeIncident.id}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#651F2B] hover:bg-[#7A2B39] text-[#EAC4CF] hover:text-white text-xs font-semibold uppercase tracking-wider transition-colors"
                >
                  <span>Public View</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* Readonly Summary Banner */}
              <div className="p-5 bg-white border-b border-[#DCCBBC] space-y-2">
                <h3 className="font-bold text-sm text-[#24191A]">
                  {activeIncident.title}
                </h3>
                <p className="text-xs text-[#5A4647] line-clamp-2">
                  {activeIncident.description}
                </p>
                <div className="flex flex-wrap gap-4 pt-1 text-xs text-[#857172]">
                  <span>Location: <strong className="text-[#501B24]">{activeIncident.location}</strong></span>
                  <span>Reported By: <strong className="text-[#501B24]">{activeIncident.reportedBy}</strong></span>
                </div>
              </div>

              {/* Edit Form */}
              <form onSubmit={handleSave} className="p-6 sm:p-8 space-y-6">
                
                {/* Workflow Status Selector */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#501B24] mb-2">
                    Lifecycle Workflow Status <span className="text-[#C2415E]">*</span>
                  </label>
                  <p className="text-xs text-[#857172] mb-3">
                    Progress through lifecycle: <span className="font-semibold text-[#501B24]">Open → Assigned → In Progress → Resolved → Closed</span>
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {STATUSES.map((st) => {
                      const isCurrent = status === st;
                      return (
                        <button
                          type="button"
                          key={st}
                          onClick={() => setStatus(st)}
                          className={`py-2.5 px-2 rounded-xl text-xs font-bold uppercase tracking-wider text-center border transition-all ${
                            isCurrent
                              ? 'bg-[#501B24] text-[#EAC4CF] border-[#651F2B] shadow-sm ring-2 ring-[#EAC4CF]'
                              : 'bg-white text-[#501B24] border-[#DCCBBC] hover:bg-[#FAF0F2]'
                          }`}
                        >
                          {st}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Assignee Input */}
                <div>
                  <label
                    htmlFor="assignee"
                    className="block text-xs font-bold uppercase tracking-wider text-[#501B24] mb-2 flex items-center gap-1.5"
                  >
                    <UserCheck className="w-4 h-4 text-[#651F2B]" />
                    <span>Designated Assignee / Unit</span>
                  </label>
                  <input
                    id="assignee"
                    type="text"
                    value={assignee}
                    onChange={(e) => setAssignee(e.target.value)}
                    placeholder="e.g. Alex Rivera (Network Lead) or Electrical Facilities Team"
                    className="w-full px-4 py-3 rounded-xl bg-white border border-[#DCCBBC] text-sm text-[#24191A] focus:outline-none focus:ring-2 focus:ring-[#501B24] transition-all"
                  />
                  <p className="mt-1 text-[11px] text-[#857172]">
                    Specify the technician or departmental unit in charge of physical resolution.
                  </p>
                </div>

                {/* Resolution Remarks */}
                <div>
                  <label
                    htmlFor="resolutionRemarks"
                    className="block text-xs font-bold uppercase tracking-wider text-[#501B24] mb-2 flex items-center gap-1.5"
                  >
                    <FileCheck className="w-4 h-4 text-[#651F2B]" />
                    <span>Resolution Remarks & Actions Taken</span>
                  </label>
                  <textarea
                    id="resolutionRemarks"
                    rows={4}
                    value={resolutionRemarks}
                    onChange={(e) => setResolutionRemarks(e.target.value)}
                    placeholder="Describe remediation steps, parts replaced, diagnostic findings, or reason for status transition..."
                    className="w-full px-4 py-3 rounded-xl bg-white border border-[#DCCBBC] text-sm text-[#24191A] focus:outline-none focus:ring-2 focus:ring-[#501B24] transition-all resize-y"
                  />
                </div>

                {/* Admin Actor Tag */}
                <div className="p-3 rounded-xl bg-[#FAF0F2] border border-[#EAC4CF] flex items-center justify-between text-xs text-[#501B24]">
                  <span className="font-semibold">Audit Actor Logged As:</span>
                  <input
                    type="text"
                    value={adminName}
                    onChange={(e) => setAdminName(e.target.value)}
                    className="bg-white border border-[#DCCBBC] rounded px-2.5 py-1 text-xs text-[#501B24] font-medium focus:outline-none"
                    placeholder="Dispatcher Name"
                  />
                </div>

                {/* Submit Action */}
                <div className="pt-2 flex items-center justify-between">
                  <span className="text-xs text-[#857172]">
                    Updates create an entry in the incident's audit timeline.
                  </span>

                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#501B24] hover:bg-[#651F2B] active:bg-[#3D131B] text-[#F7EFE6] font-display text-sm tracking-widest uppercase transition-all shadow-md hover:shadow-lg disabled:opacity-60 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4 text-[#EAC4CF]" />
                    <span>{saving ? 'RECORDING UPDATES...' : 'SAVE INCIDENT STATUS'}</span>
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="p-12 text-center rounded-2xl bg-white border border-[#DCCBBC]">
              <p className="text-sm text-[#857172]">
                Select an incident from the left panel to update status and assignment.
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
