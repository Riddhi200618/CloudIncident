import React from 'react';
import { AlertTriangle, RotateCw, Server } from 'lucide-react';
import { useIncidents } from '../context/IncidentContext';

export default function ApiErrorBanner({ onOpenApiModal }) {
  const { error, isMockMode, apiBaseUrl, refreshData, loading } = useIncidents();

  if (isMockMode || !error) return null;

  return (
    <div className="p-5 rounded-2xl bg-[#501B24] border border-[#C2415E] text-[#F7EFE6] shadow-editorial-dark mb-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#651F2B] border border-[#C2415E] flex items-center justify-center flex-shrink-0 text-rose-300 mt-0.5">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-rose-300">
                REAL API GATEWAY MODE ACTIVE //
              </span>
            </div>
            <p className="text-xs sm:text-sm font-semibold text-white">
              Unable to reach backend endpoint:{' '}
              <span className="font-mono text-rose-200">{apiBaseUrl}</span>
            </p>
            <p className="text-xs text-[#F4DDE2]/80 mt-1 font-mono">
              Error: {error}
            </p>
            <p className="text-[11px] text-[#EAC4CF]/70 mt-1">
              To test local UI interactions without AWS deployed, set <code className="bg-[#651F2B] px-1 py-0.5 rounded text-white">VITE_USE_MOCK_DATA=true</code> in <code className="bg-[#651F2B] px-1 py-0.5 rounded text-white">.env</code>.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center flex-shrink-0">
          <button
            type="button"
            onClick={refreshData}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#651F2B] hover:bg-[#7A2B39] text-[#F7EFE6] text-xs font-semibold uppercase tracking-wider transition-colors disabled:opacity-50"
          >
            <RotateCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Retry</span>
          </button>
          {onOpenApiModal && (
            <button
              type="button"
              onClick={onOpenApiModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#EAC4CF] hover:bg-white text-[#501B24] text-xs font-semibold uppercase tracking-wider transition-colors"
            >
              <Server className="w-3.5 h-3.5" />
              <span>Inspect Config</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
