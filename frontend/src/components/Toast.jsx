import React from 'react';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';
import { useIncidents } from '../context/IncidentContext';

export default function Toast() {
  const { toast, hideToast } = useIncidents();

  if (!toast) return null;

  const typeConfig = {
    success: {
      bg: 'bg-[#501B24]',
      text: 'text-[#F7EFE6]',
      border: 'border-[#651F2B]',
      icon: CheckCircle2,
      iconColor: 'text-[#EAC4CF]',
      badge: 'SUCCESS //',
    },
    error: {
      bg: 'bg-[#651F2B]',
      text: 'text-[#F7EFE6]',
      border: 'border-[#8B2635]',
      icon: AlertTriangle,
      iconColor: 'text-amber-300',
      badge: 'ERROR //',
    },
    info: {
      bg: 'bg-[#24191A]',
      text: 'text-[#F7EFE6]',
      border: 'border-[#501B24]',
      icon: Info,
      iconColor: 'text-[#EAC4CF]',
      badge: 'NOTICE //',
    },
  };

  const config = typeConfig[toast.type] || typeConfig.info;
  const Icon = config.icon;

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-md w-full px-4 animate-slideUp">
      <div
        className={`p-4 rounded-xl border shadow-editorial-dark flex items-start gap-3 ${config.bg} ${config.text} ${config.border}`}
      >
        <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${config.iconColor}`} />
        <div className="flex-1 pr-2">
          <span className="text-[10px] font-mono tracking-widest text-[#EAC4CF] block uppercase mb-0.5">
            {config.badge}
          </span>
          <p className="text-xs font-medium leading-relaxed">
            {toast.message}
          </p>
        </div>
        <button
          type="button"
          onClick={hideToast}
          className="text-[#EAC4CF]/70 hover:text-white p-1 rounded-md transition-colors"
          aria-label="Dismiss toast"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
