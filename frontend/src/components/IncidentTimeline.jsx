import React from 'react';
import { Clock, CheckCircle2, User, AlertCircle, ArrowRight } from 'lucide-react';
import StatusBadge from './StatusBadge';

export default function IncidentTimeline({ timeline = [] }) {
  if (!timeline || timeline.length === 0) {
    return (
      <div className="p-4 rounded-xl border border-dashed border-[#DCCBBC] text-center text-xs text-[#857172]">
        No previous status transitions recorded for this incident.
      </div>
    );
  }

  const formatTimestamp = (isoString) => {
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

  return (
    <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#EAC4CF]">
      {timeline.map((event, index) => {
        const isLatest = index === timeline.length - 1;
        return (
          <div key={index} className="relative group">
            {/* Dot Indicator */}
            <div
              className={`absolute -left-6 top-1 w-4.5 h-4.5 rounded-full border-2 flex items-center justify-center transition-transform group-hover:scale-110 ${
                isLatest
                  ? 'bg-[#501B24] border-[#EAC4CF] shadow-sm'
                  : 'bg-[#F4DDE2] border-[#501B24]'
              }`}
            >
              <div
                className={`w-1.5 h-1.5 rounded-full ${
                  isLatest ? 'bg-[#EAC4CF]' : 'bg-[#501B24]'
                }`}
              />
            </div>

            {/* Event Box */}
            <div className="p-4 rounded-xl border border-[#DCCBBC] bg-white group-hover:border-[#501B24]/40 transition-colors shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <StatusBadge status={event.status} size="sm" />
                  {event.actor && (
                    <span className="text-xs font-semibold text-[#501B24] flex items-center gap-1">
                      <User className="w-3 h-3 text-[#857172]" />
                      <span>{event.actor}</span>
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1 text-[11px] font-mono text-[#857172]">
                  <Clock className="w-3 h-3" />
                  <span>{formatTimestamp(event.timestamp)}</span>
                </div>
              </div>

              {event.note && (
                <p className="text-xs text-[#24191A] leading-relaxed">
                  {event.note}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
