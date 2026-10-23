import React from 'react';
import { X, Server, Database, Check, RotateCcw, Code, ExternalLink } from 'lucide-react';
import { useIncidents } from '../context/IncidentContext';

export default function ApiStatusModal({ isOpen, onClose }) {
  const { isMockMode, apiBaseUrl, resetMockData, systemStatus } = useIncidents();

  if (!isOpen) return null;

  const endpoints = [
    { method: 'POST', path: '/incidents', desc: 'Create a new campus incident report' },
    { method: 'GET', path: '/incidents', desc: 'Retrieve all incidents with optional filters' },
    { method: 'GET', path: '/incidents/{id}', desc: 'Fetch single incident details & timeline' },
    { method: 'PATCH', path: '/incidents/{id}', desc: 'Update status, assignee, or resolution remarks' },
    { method: 'GET', path: '/stats', desc: 'Aggregate metrics for dashboard summary' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#24191A]/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#FAF5EE] border border-[#DCCBBC] rounded-2xl max-w-2xl w-full shadow-editorial-dark overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-[#501B24] text-[#F7EFE6] p-5 flex items-center justify-between border-b border-[#651F2B]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#651F2B] border border-[#7A2B39] flex items-center justify-center text-[#EAC4CF]">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono tracking-widest text-[#EAC4CF] uppercase block">
                Architecture & Gateway //
              </span>
              <h2 className="font-display text-2xl tracking-wide text-white">
                AWS API GATEWAY INTEGRATION
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#EAC4CF] hover:text-white hover:bg-[#651F2B] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-[#24191A]">
          {/* Active Mode Banner */}
          <div className="p-4 rounded-xl border border-[#DCCBBC] bg-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className={`w-2.5 h-2.5 rounded-full ${systemStatus.dotColor}`} />
                <span className="text-xs font-bold uppercase tracking-wider text-[#501B24]">
                  Current Status: {systemStatus.label}
                </span>
              </div>
              <p className="text-xs text-[#857172]">
                {isMockMode
                  ? 'All changes are safely recorded into browser localStorage for local UI testing.'
                  : `Target API Gateway URL: ${apiBaseUrl}`}
              </p>
            </div>

            <button
              type="button"
              onClick={resetMockData}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FAF5EE] hover:bg-[#EAC4CF]/50 text-[#501B24] border border-[#DCCBBC] text-xs font-semibold tracking-wider uppercase transition-colors whitespace-nowrap"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Samples</span>
            </button>
          </div>

          {/* Planned Serverless Contract */}
          <div>
            <h3 className="font-display text-lg text-[#501B24] tracking-wide mb-2 flex items-center gap-2">
              <Code className="w-4 h-4 text-[#651F2B]" />
              <span>API Gateway Contract (Lambda & DynamoDB Ready)</span>
            </h3>
            <p className="text-xs text-[#857172] mb-3 leading-relaxed">
              The frontend centralized service layer (<code className="bg-[#FAF0F2] px-1.5 py-0.5 rounded text-[#501B24] font-mono">src/services/incidentService.js</code>) is already wired to switch to these routes when <code className="bg-[#FAF0F2] px-1.5 py-0.5 rounded text-[#501B24] font-mono">VITE_USE_MOCK_DATA=false</code>.
            </p>

            <div className="rounded-xl border border-[#DCCBBC] overflow-hidden bg-white">
              {endpoints.map((ep, idx) => (
                <div
                  key={ep.path + ep.method}
                  className={`p-3 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
                    idx !== endpoints.length - 1 ? 'border-b border-[#FAF0F2]' : ''
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`font-mono text-[11px] font-bold px-2 py-0.5 rounded ${
                        ep.method === 'POST'
                          ? 'bg-blue-50 text-blue-800 border border-blue-200'
                          : ep.method === 'GET'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : 'bg-amber-50 text-amber-800 border border-amber-200'
                      }`}
                    >
                      {ep.method}
                    </span>
                    <span className="font-mono font-semibold text-[#501B24]">
                      {ep.path}
                    </span>
                  </div>
                  <span className="text-[#857172] text-[11px]">
                    {ep.desc}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Environment Variables Reference */}
          <div className="p-4 rounded-xl bg-[#FAF0F2] border border-[#EAC4CF] text-xs">
            <h4 className="font-semibold text-[#501B24] uppercase tracking-wider mb-1.5">
              Environment Variables (.env.example)
            </h4>
            <div className="bg-[#501B24] text-[#EAC4CF] p-3 rounded-lg font-mono text-[11px] leading-relaxed overflow-x-auto">
              <div>VITE_USE_MOCK_DATA={isMockMode ? 'true' : 'false'}</div>
              <div>VITE_API_BASE_URL={apiBaseUrl}</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-[#FAF0F2] border-t border-[#DCCBBC] px-6 py-3.5 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-[#501B24] hover:bg-[#651F2B] text-[#F7EFE6] text-xs font-semibold uppercase tracking-wider transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
