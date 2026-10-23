import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Calendar, MapPin, User, ChevronRight } from 'lucide-react';
import StatusBadge from './StatusBadge';
import PriorityBadge from './PriorityBadge';

export default function IncidentTable({ incidents, emptyMessage = 'No incidents found' }) {
  const formatDate = (isoString) => {
    if (!isoString) return '—';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return isoString;
    }
  };

  if (!incidents || incidents.length === 0) {
    return (
      <div className="editorial-card p-12 text-center rounded-xl bg-white">
        <div className="w-12 h-12 mx-auto rounded-full bg-[#FAF5EE] border border-[#DCCBBC] flex items-center justify-center text-[#501B24] mb-3">
          <MapPin className="w-6 h-6 text-[#857172]" />
        </div>
        <h3 className="font-display text-xl text-[#501B24] tracking-wide mb-1">
          {emptyMessage}
        </h3>
        <p className="text-sm text-[#857172] max-w-sm mx-auto mb-4">
          Try adjusting your search query, status filters, or category selection to see relevant issues.
        </p>
        <Link
          to="/report"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#501B24] text-[#F7EFE6] text-xs font-semibold uppercase tracking-wider hover:bg-[#651F2B]"
        >
          Report New Incident
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Desktop & Tablet Table View */}
      <div className="hidden md:block overflow-hidden rounded-xl border border-[#DCCBBC] bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#501B24] text-[#F7EFE6] text-[11px] font-semibold uppercase tracking-widest border-b border-[#651F2B]">
                <th className="py-3.5 px-4">Incident ID</th>
                <th className="py-3.5 px-4">Title & Context</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Priority</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Reported</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#FAF0F2] text-sm">
              {incidents.map((incident, idx) => {
                const isEven = idx % 2 === 0;
                return (
                  <tr
                    key={incident.id}
                    className={`hover:bg-[#FAF5EE] transition-colors group ${
                      isEven ? 'bg-white' : 'bg-[#FAF5EE]/40'
                    }`}
                  >
                    {/* ID */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <Link
                        to={`/incidents/${incident.id}`}
                        className="font-mono font-bold text-xs text-[#501B24] hover:text-[#651F2B] hover:underline flex items-center gap-1"
                      >
                        <span>{incident.id}</span>
                        <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </Link>
                    </td>

                    {/* Title & Location */}
                    <td className="py-3.5 px-4">
                      <Link
                        to={`/incidents/${incident.id}`}
                        className="font-medium text-[#24191A] group-hover:text-[#501B24] transition-colors line-clamp-1 max-w-md block"
                      >
                        {incident.title}
                      </Link>
                      <div className="flex items-center gap-2 mt-0.5 text-xs text-[#857172]">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          <span className="truncate max-w-[200px]">{incident.location}</span>
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          <span className="truncate max-w-[140px]">{incident.reportedBy}</span>
                        </span>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="inline-block text-xs font-medium px-2.5 py-1 rounded-md bg-[#FAF5EE] text-[#501B24] border border-[#DCCBBC]">
                        {incident.category}
                      </span>
                    </td>

                    {/* Priority */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <PriorityBadge priority={incident.priority} />
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <StatusBadge status={incident.status} />
                    </td>

                    {/* Date */}
                    <td className="py-3.5 px-4 whitespace-nowrap text-xs text-[#5A4647]">
                      {formatDate(incident.createdAt)}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          to={`/incidents/${incident.id}`}
                          className="px-2.5 py-1 text-xs font-semibold uppercase tracking-wider text-[#501B24] hover:bg-[#EAC4CF]/40 rounded transition-colors"
                        >
                          View
                        </Link>
                        <Link
                          to={`/admin?id=${incident.id}`}
                          className="px-2 py-1 text-xs font-medium text-[#857172] hover:text-[#501B24] hover:bg-[#FAF5EE] rounded transition-colors"
                          title="Admin Edit"
                        >
                          Manage
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card List View */}
      <div className="md:hidden space-y-3">
        {incidents.map((incident) => (
          <div
            key={incident.id}
            className="p-4 rounded-xl border border-[#DCCBBC] bg-white shadow-sm space-y-3"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono font-bold text-xs text-[#501B24]">
                {incident.id}
              </span>
              <div className="flex items-center gap-1.5">
                <PriorityBadge priority={incident.priority} size="sm" />
                <StatusBadge status={incident.status} size="sm" />
              </div>
            </div>

            <Link
              to={`/incidents/${incident.id}`}
              className="block font-medium text-[#24191A] hover:text-[#501B24] text-sm leading-snug"
            >
              {incident.title}
            </Link>

            <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-xs text-[#857172]">
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3 text-[#501B24]" />
                <span className="truncate max-w-[200px]">{incident.location}</span>
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3 text-[#501B24]" />
                <span>{formatDate(incident.createdAt)}</span>
              </span>
            </div>

            <div className="pt-2 border-t border-[#FAF0F2] flex items-center justify-between">
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-[#FAF5EE] text-[#501B24] border border-[#DCCBBC]">
                {incident.category}
              </span>

              <div className="flex items-center gap-2">
                <Link
                  to={`/admin?id=${incident.id}`}
                  className="text-xs font-medium text-[#857172] hover:text-[#501B24] px-2 py-1"
                >
                  Manage
                </Link>
                <Link
                  to={`/incidents/${incident.id}`}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[#501B24] hover:text-[#651F2B] px-2.5 py-1 rounded bg-[#EAC4CF]/50"
                >
                  <span>Details</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
