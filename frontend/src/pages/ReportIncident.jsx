import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Send,
  AlertCircle,
  CheckCircle2,
  MapPin,
  Tag,
  ShieldAlert,
  User,
  FileText,
  Sparkles,
  ArrowRight,
  Info,
} from 'lucide-react';
import { useIncidents } from '../context/IncidentContext';
import { CATEGORIES, PRIORITIES } from '../data/mockIncidents';

export default function ReportIncident() {
  const navigate = useNavigate();
  const { createIncident } = useIncidents();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'IT Equipment',
    location: '',
    priority: 'Medium',
    reportedBy: '',
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submittedIncident, setSubmittedIncident] = useState(null);

  const validate = () => {
    const newErrors = {};
    if (!formData.title.trim()) {
      newErrors.title = 'Incident title is required.';
    } else if (formData.title.trim().length < 6) {
      newErrors.title = 'Title must be at least 6 characters.';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Please provide a clear description of the issue.';
    } else if (formData.description.trim().length < 15) {
      newErrors.description = 'Description should be at least 15 characters to aid triage.';
    }

    if (!formData.location.trim()) {
      newErrors.location = 'Specify the building, floor, lab, or campus location.';
    }

    if (!formData.reportedBy.trim()) {
      newErrors.reportedBy = 'Your name or department identifier is required.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const created = await createIncident(formData);
      setSubmittedIncident(created);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetForm = () => {
    setFormData({
      title: '',
      description: '',
      category: 'IT Equipment',
      location: '',
      priority: 'Medium',
      reportedBy: '',
    });
    setErrors({});
    setSubmittedIncident(null);
  };

  return (
    <div className="max-w-4xl mx-auto py-4 sm:py-8 space-y-8 animate-fadeIn pb-16">
      {/* Top Editorial Heading */}
      <div className="border-b border-[#DCCBBC] pb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EAC4CF] text-[#501B24] border border-[#DFB0BD] text-[11px] font-bold uppercase tracking-widest mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>CAMPUS INCIDENT DISPATCH // 2026</span>
        </div>
        <h1 className="font-display text-4xl sm:text-6xl text-[#501B24] tracking-wide leading-none">
          RAISE THE FLAG.
        </h1>
        <p className="mt-3 text-sm sm:text-base text-[#5A4647] max-w-2xl leading-relaxed">
          Report technical faults, facility breakdowns, or security concerns across campus grounds. Every ticket is routed immediately to responsible department units.
        </p>
      </div>

      {/* Success Banner if Submitted */}
      {submittedIncident ? (
        <div className="p-8 rounded-2xl bg-white border border-[#DCCBBC] shadow-editorial text-center space-y-6 animate-fadeIn">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-[#EAC4CF] border border-[#DFB0BD] flex items-center justify-center text-[#501B24] shadow-sm">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <div className="space-y-2">
            <span className="font-mono text-xs uppercase tracking-widest text-[#857172]">
              TICKET LOGGED CONFIRMATION //
            </span>
            <h2 className="font-display text-3xl sm:text-4xl text-[#501B24]">
              INCIDENT #{submittedIncident.id} REGISTERED
            </h2>
            <p className="text-sm text-[#5A4647] max-w-md mx-auto">
              "{submittedIncident.title}" has been assigned priority{' '}
              <strong className="text-[#501B24]">{submittedIncident.priority}</strong> in category{' '}
              <strong className="text-[#501B24]">{submittedIncident.category}</strong>.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              to={`/incidents/${submittedIncident.id}`}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#501B24] hover:bg-[#651F2B] text-[#F7EFE6] font-display text-sm tracking-widest uppercase transition-colors"
            >
              <span>VIEW INCIDENT DETAILS</span>
              <ArrowRight className="w-4 h-4 text-[#EAC4CF]" />
            </Link>

            <button
              type="button"
              onClick={handleResetForm}
              className="px-5 py-3 rounded-xl bg-[#FAF5EE] hover:bg-[#EAC4CF]/40 text-[#501B24] border border-[#DCCBBC] font-display text-sm tracking-widest uppercase transition-colors"
            >
              Report Another Issue
            </button>
          </div>
        </div>
      ) : (
        /* Spacious Cream Panel with Blush-Pink Accents */
        <div className="rounded-2xl bg-[#FAF5EE] border border-[#DCCBBC] shadow-editorial overflow-hidden">
          {/* Top Panel Accent Bar */}
          <div className="bg-[#501B24] text-[#EAC4CF] px-6 py-3 text-xs font-mono tracking-widest uppercase flex items-center justify-between border-b border-[#651F2B]">
            <span>FORM REF: INC-INTAKE // DIRECT GATEWAY ROUTE: POST /incidents</span>
            <span className="text-white hidden sm:inline">CAMPUS CLOUD V1</span>
          </div>

          <form onSubmit={handleSubmit} className="p-6 sm:p-10 space-y-6">
            {/* Title */}
            <div>
              <label
                htmlFor="title"
                className="block text-xs font-bold uppercase tracking-wider text-[#501B24] mb-2"
              >
                Incident Title <span className="text-[#C2415E]">*</span>
              </label>
              <input
                id="title"
                name="title"
                type="text"
                placeholder="e.g. WiFi outage in Computer Science Lab 4"
                value={formData.title}
                onChange={handleChange}
                className={`w-full px-4 py-3 rounded-xl bg-white border text-sm text-[#24191A] placeholder-[#857172]/60 focus:outline-none focus:ring-2 focus:ring-[#501B24] focus:border-transparent transition-all ${
                  errors.title ? 'border-[#C2415E] bg-rose-50/20' : 'border-[#DCCBBC]'
                }`}
              />
              {errors.title && (
                <p className="mt-1.5 text-xs text-[#C2415E] flex items-center gap-1 font-medium">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{errors.title}</span>
                </p>
              )}
            </div>

            {/* Category & Priority Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Category */}
              <div>
                <label
                  htmlFor="category"
                  className="block text-xs font-bold uppercase tracking-wider text-[#501B24] mb-2 flex items-center gap-1.5"
                >
                  <Tag className="w-3.5 h-3.5 text-[#651F2B]" />
                  <span>Category <span className="text-[#C2415E]">*</span></span>
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl bg-white border border-[#DCCBBC] text-sm text-[#24191A] focus:outline-none focus:ring-2 focus:ring-[#501B24] transition-all cursor-pointer"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Priority */}
              <div>
                <label
                  htmlFor="priority"
                  className="block text-xs font-bold uppercase tracking-wider text-[#501B24] mb-2 flex items-center gap-1.5"
                >
                  <ShieldAlert className="w-3.5 h-3.5 text-[#651F2B]" />
                  <span>Priority Level <span className="text-[#C2415E]">*</span></span>
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {PRIORITIES.map((p) => {
                    const isSelected = formData.priority === p.value;
                    return (
                      <button
                        type="button"
                        key={p.value}
                        onClick={() => setFormData((prev) => ({ ...prev, priority: p.value }))}
                        className={`py-2.5 px-2 rounded-lg text-xs font-bold uppercase tracking-wider text-center border transition-all ${
                          isSelected
                            ? 'bg-[#501B24] text-[#EAC4CF] border-[#651F2B] shadow-sm'
                            : 'bg-white text-[#501B24] border-[#DCCBBC] hover:bg-[#FAF0F2]'
                        }`}
                      >
                        {p.value}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Location & Reported By Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Location */}
              <div>
                <label
                  htmlFor="location"
                  className="block text-xs font-bold uppercase tracking-wider text-[#501B24] mb-2 flex items-center gap-1.5"
                >
                  <MapPin className="w-3.5 h-3.5 text-[#651F2B]" />
                  <span>Campus Location <span className="text-[#C2415E]">*</span></span>
                </label>
                <input
                  id="location"
                  name="location"
                  type="text"
                  placeholder="e.g. Science Block, 3rd Floor, Physics Lab"
                  value={formData.location}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-xl bg-white border text-sm text-[#24191A] placeholder-[#857172]/60 focus:outline-none focus:ring-2 focus:ring-[#501B24] transition-all ${
                    errors.location ? 'border-[#C2415E] bg-rose-50/20' : 'border-[#DCCBBC]'
                  }`}
                />
                {errors.location && (
                  <p className="mt-1.5 text-xs text-[#C2415E] flex items-center gap-1 font-medium">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{errors.location}</span>
                  </p>
                )}
              </div>

              {/* Reported By */}
              <div>
                <label
                  htmlFor="reportedBy"
                  className="block text-xs font-bold uppercase tracking-wider text-[#501B24] mb-2 flex items-center gap-1.5"
                >
                  <User className="w-3.5 h-3.5 text-[#651F2B]" />
                  <span>Reported By <span className="text-[#C2415E]">*</span></span>
                </label>
                <input
                  id="reportedBy"
                  name="reportedBy"
                  type="text"
                  placeholder="e.g. Prof. David Miller (ECE) or Student ID 2024CS089"
                  value={formData.reportedBy}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-xl bg-white border text-sm text-[#24191A] placeholder-[#857172]/60 focus:outline-none focus:ring-2 focus:ring-[#501B24] transition-all ${
                    errors.reportedBy ? 'border-[#C2415E] bg-rose-50/20' : 'border-[#DCCBBC]'
                  }`}
                />
                {errors.reportedBy && (
                  <p className="mt-1.5 text-xs text-[#C2415E] flex items-center gap-1 font-medium">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{errors.reportedBy}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Description */}
            <div>
              <label
                htmlFor="description"
                className="block text-xs font-bold uppercase tracking-wider text-[#501B24] mb-2 flex items-center gap-1.5"
              >
                <FileText className="w-3.5 h-3.5 text-[#651F2B]" />
                <span>Problem Description & Diagnostics <span className="text-[#C2415E]">*</span></span>
              </label>
              <textarea
                id="description"
                name="description"
                rows={5}
                placeholder="Describe symptoms, error codes, affected equipment, or timing. What broke, and how does it hinder campus activities?"
                value={formData.description}
                onChange={handleChange}
                className={`w-full px-4 py-3 rounded-xl bg-white border text-sm text-[#24191A] placeholder-[#857172]/60 focus:outline-none focus:ring-2 focus:ring-[#501B24] transition-all resize-y ${
                  errors.description ? 'border-[#C2415E] bg-rose-50/20' : 'border-[#DCCBBC]'
                }`}
              />
              {errors.description && (
                <p className="mt-1.5 text-xs text-[#C2415E] flex items-center gap-1 font-medium">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{errors.description}</span>
                </p>
              )}
            </div>

            {/* Blush Notice Banner */}
            <div className="p-4 rounded-xl bg-[#EAC4CF]/60 border border-[#DFB0BD] flex items-start gap-3 text-xs text-[#501B24]">
              <Info className="w-4 h-4 text-[#501B24] mt-0.5 flex-shrink-0" />
              <p className="leading-relaxed">
                By submitting this ticket, an automated campus event dispatch is created. You will receive an incident tracking identifier to monitor progress through resolution.
              </p>
            </div>

            {/* Distinct Burgundy Submit Button */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className="text-xs text-[#857172]">
                Fields marked with <span className="text-[#C2415E]">*</span> are required.
              </span>

              <button
                type="submit"
                disabled={submitting}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-xl bg-[#501B24] hover:bg-[#651F2B] active:bg-[#3D131B] text-[#F7EFE6] font-display text-base tracking-widest uppercase transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-60 cursor-pointer"
              >
                <Send className="w-4 h-4 text-[#EAC4CF]" />
                <span>{submitting ? 'DISPATCHING TICKET...' : 'SUBMIT INCIDENT REPORT'}</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
