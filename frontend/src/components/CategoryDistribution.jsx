import React, { useState } from 'react';
import { PieChart, BarChart3, AlertOctagon, Layers } from 'lucide-react';

export default function CategoryDistribution({ categoryCounts = {}, priorityCounts = {}, total = 0 }) {
  const [viewMode, setViewMode] = useState('category'); // 'category' | 'priority'

  const categories = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1]);
  const priorities = [
    { name: 'Critical', count: priorityCounts.Critical || 0, color: '#501B24', barClass: 'bg-[#501B24]' },
    { name: 'High', count: priorityCounts.High || 0, color: '#C2415E', barClass: 'bg-[#C2415E]' },
    { name: 'Medium', count: priorityCounts.Medium || 0, color: '#D97706', barClass: 'bg-[#D97706]' },
    { name: 'Low', count: priorityCounts.Low || 0, color: '#2B5A3C', barClass: 'bg-[#2B5A3C]' },
  ];

  return (
    <div className="editorial-card p-6 rounded-xl bg-white">
      {/* Header with Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-[#FAF0F2]">
        <div>
          <span className="text-[10px] font-mono tracking-widest text-[#857172] uppercase block">
            Incident Breakdown //
          </span>
          <h3 className="font-display text-2xl text-[#501B24] tracking-wide">
            {viewMode === 'category' ? 'INCIDENTS BY DOMAIN' : 'PRIORITY DISTRIBUTION'}
          </h3>
        </div>

        {/* Pill Toggle */}
        <div className="inline-flex rounded-lg p-1 bg-[#FAF5EE] border border-[#DCCBBC] self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setViewMode('category')}
            className={`px-3 py-1 rounded-md text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-1.5 ${
              viewMode === 'category'
                ? 'bg-[#501B24] text-[#F7EFE6] shadow-sm'
                : 'text-[#651F2B] hover:text-[#501B24]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Category</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('priority')}
            className={`px-3 py-1 rounded-md text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-1.5 ${
              viewMode === 'priority'
                ? 'bg-[#501B24] text-[#F7EFE6] shadow-sm'
                : 'text-[#651F2B] hover:text-[#501B24]'
            }`}
          >
            <AlertOctagon className="w-3.5 h-3.5" />
            <span>Urgency</span>
          </button>
        </div>
      </div>

      {/* Content */}
      {viewMode === 'category' ? (
        <div className="space-y-4">
          {categories.length === 0 ? (
            <p className="text-xs text-[#857172] italic py-4">No category data recorded yet.</p>
          ) : (
            categories.map(([category, count]) => {
              const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
              return (
                <div key={category} className="group">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-medium text-[#24191A] group-hover:text-[#501B24] transition-colors">
                      {category}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[11px] text-[#857172]">
                        {percentage}%
                      </span>
                      <span className="font-bold text-xs px-2 py-0.5 rounded-full bg-[#FAF5EE] text-[#501B24] border border-[#DCCBBC]">
                        {count} {count === 1 ? 'issue' : 'issues'}
                      </span>
                    </div>
                  </div>
                  <div className="w-full h-2 rounded-full bg-[#FAF0F2] overflow-hidden">
                    <div
                      className="h-full bg-[#501B24] rounded-full transition-all duration-500 ease-out group-hover:bg-[#651F2B]"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {priorities.map((item) => {
            const percentage = total > 0 ? Math.round((item.count / total) * 100) : 0;
            return (
              <div key={item.name} className="group">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="font-semibold text-[#24191A] group-hover:text-[#501B24]">
                      {item.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] text-[#857172]">
                      {percentage}%
                    </span>
                    <span className="font-bold text-xs px-2 py-0.5 rounded-full bg-[#FAF5EE] text-[#501B24] border border-[#DCCBBC]">
                      {item.count}
                    </span>
                  </div>
                </div>
                <div className="w-full h-2 rounded-full bg-[#FAF0F2] overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ease-out ${item.barClass}`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Footer Summary Banner */}
      <div className="mt-6 pt-4 border-t border-[#FAF0F2] flex items-center justify-between text-[11px] text-[#857172]">
        <span>Aggregated from {total} active & historical incidents</span>
        <span className="font-semibold text-[#501B24]">DynamoDB partition ready</span>
      </div>
    </div>
  );
}
