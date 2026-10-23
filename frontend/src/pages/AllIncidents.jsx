import React, { useState, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Search,
  Filter,
  X,
  PlusCircle,
  SlidersHorizontal,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { useIncidents } from '../context/IncidentContext';
import IncidentTable from '../components/IncidentTable';
import { CATEGORIES, PRIORITIES, STATUSES } from '../data/mockIncidents';

export default function AllIncidents() {
  const { incidents, loading } = useIncidents();
  const [searchParams, setSearchParams] = useSearchParams();

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState(searchParams.get('status') || 'All');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'All');
  const [selectedPriority, setSelectedPriority] = useState(searchParams.get('priority') || 'All');

  // Filtered incidents memoization
  const filteredIncidents = useMemo(() => {
    return incidents.filter((incident) => {
      // Search matches ID, Title, Location, or Reporter
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        incident.id.toLowerCase().includes(q) ||
        incident.title.toLowerCase().includes(q) ||
        (incident.location && incident.location.toLowerCase().includes(q)) ||
        (incident.reportedBy && incident.reportedBy.toLowerCase().includes(q));

      // Status Filter
      const matchesStatus =
        selectedStatus === 'All' || incident.status === selectedStatus;

      // Category Filter
      const matchesCategory =
        selectedCategory === 'All' || incident.category === selectedCategory;

      // Priority Filter
      const matchesPriority =
        selectedPriority === 'All' || incident.priority === selectedPriority;

      return matchesSearch && matchesStatus && matchesCategory && matchesPriority;
    });
  }, [incidents, searchQuery, selectedStatus, selectedCategory, selectedPriority]);

  const hasActiveFilters =
    searchQuery !== '' ||
    selectedStatus !== 'All' ||
    selectedCategory !== 'All' ||
    selectedPriority !== 'All';

  const resetAllFilters = () => {
    setSearchQuery('');
    setSelectedStatus('All');
    setSelectedCategory('All');
    setSelectedPriority('All');
    setSearchParams({});
  };

  return (
    <div className="space-y-8 pb-16 animate-fadeIn">
      {/* Top Editorial Header */}
      <div className="border-b border-[#DCCBBC] pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EAC4CF] text-[#501B24] border border-[#DFB0BD] text-[11px] font-bold uppercase tracking-widest mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>CENTRAL REGISTRY // LIVE FEED</span>
          </div>
          <h1 className="font-display text-4xl sm:text-6xl text-[#501B24] tracking-wide leading-none">
            EVERY ISSUE. ONE PLACE.
          </h1>
          <p className="mt-3 text-sm sm:text-base text-[#5A4647] max-w-2xl leading-relaxed">
            Filter, inspect, and track resolution timelines across all academic, network, and infrastructure services.
          </p>
        </div>

        <Link
          to="/report"
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#501B24] hover:bg-[#651F2B] text-[#F7EFE6] font-display text-sm tracking-widest uppercase transition-colors shadow-sm self-start md:self-auto"
        >
          <PlusCircle className="w-4 h-4 text-[#EAC4CF]" />
          <span>Report Incident</span>
        </Link>
      </div>

      {/* Filter and Search Bar Section */}
      <div className="p-5 sm:p-6 rounded-2xl bg-[#FAF5EE] border border-[#DCCBBC] shadow-sm space-y-4">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-[#857172]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by incident ID (e.g. INC-1048), title, reporter, or location..."
            className="w-full pl-12 pr-10 py-3 rounded-xl bg-white border border-[#DCCBBC] text-sm text-[#24191A] placeholder-[#857172]/60 focus:outline-none focus:ring-2 focus:ring-[#501B24] transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-[#857172] hover:text-[#501B24]"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter Badges & Selectors */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-2 border-t border-[#DCCBBC]/60">
          
          {/* Status Filter Pill Bar (Inspired by editorial tags) */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#857172] block">
              STATUS FILTER //
            </span>
            <div className="flex flex-wrap items-center gap-1.5">
              {['All', ...STATUSES].map((status) => {
                const isSelected = selectedStatus === status;
                return (
                  <button
                    type="button"
                    key={status}
                    onClick={() => setSelectedStatus(status)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${
                      isSelected
                        ? 'bg-[#501B24] text-[#F7EFE6] shadow-sm'
                        : 'bg-white text-[#501B24] border border-[#DCCBBC] hover:bg-[#FAF0F2]'
                    }`}
                  >
                    {status}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Category & Priority Dropdowns */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Category Dropdown */}
            <div>
              <label htmlFor="filter-cat" className="sr-only">Category</label>
              <select
                id="filter-cat"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3.5 py-2 rounded-lg bg-white border border-[#DCCBBC] text-xs font-semibold uppercase tracking-wider text-[#501B24] focus:outline-none focus:ring-1 focus:ring-[#501B24] cursor-pointer"
              >
                <option value="All">All Categories</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Priority Dropdown */}
            <div>
              <label htmlFor="filter-pri" className="sr-only">Priority</label>
              <select
                id="filter-pri"
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value)}
                className="px-3.5 py-2 rounded-lg bg-white border border-[#DCCBBC] text-xs font-semibold uppercase tracking-wider text-[#501B24] focus:outline-none focus:ring-1 focus:ring-[#501B24] cursor-pointer"
              >
                <option value="All">All Priorities</option>
                {PRIORITIES.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Reset Filters button */}
            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetAllFilters}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#FAF0F2] text-[#501B24] border border-[#EAC4CF] text-xs font-semibold uppercase tracking-wider hover:bg-[#EAC4CF] transition-colors"
                title="Reset all filters"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Incidents Count and Table Display */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs font-mono text-[#857172]">
          <span>
            SHOWING <strong className="text-[#501B24]">{filteredIncidents.length}</strong> OF{' '}
            <strong className="text-[#501B24]">{incidents.length}</strong> RECORDS
          </span>
          {hasActiveFilters && (
            <span className="text-[#651F2B] font-semibold">
              FILTERS ACTIVE
            </span>
          )}
        </div>

        <IncidentTable
          incidents={filteredIncidents}
          emptyMessage="No incidents match the selected search or filter criteria."
        />
      </div>
    </div>
  );
}
