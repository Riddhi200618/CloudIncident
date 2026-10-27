import React, { useState } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  PlusCircle,
  ListFilter,
  ShieldAlert,
  Menu,
  X,
  Server,
} from 'lucide-react';
import { useIncidents } from '../context/IncidentContext';

export default function Navbar({ onOpenApiModal }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { incidents, systemStatus, isMockMode } = useIncidents();

  const openIncidentsCount = incidents.filter((i) => i.status === 'Open').length;

  const navLinks = [
    {
      to: '/',
      label: 'Dashboard',
      icon: LayoutDashboard,
    },
    {
      to: '/report',
      label: 'Report Incident',
      icon: PlusCircle,
    },
    {
      to: '/incidents',
      label: 'All Incidents',
      icon: ListFilter,
      badge: openIncidentsCount > 0 ? openIncidentsCount : null,
    },
    {
      to: '/admin',
      label: 'Admin Hub',
      icon: ShieldAlert,
    },
  ];

  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <header className="sticky top-0 z-40 bg-[#F7EFE6]/95 backdrop-blur-md border-b border-[#DCCBBC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 gap-3 sm:gap-6">
          
          {/* Brand Mark & Title */}
          <Link
            to="/"
            onClick={closeMenu}
            className="flex items-center gap-2.5 sm:gap-3 group focus:outline-none flex-shrink-0"
            aria-label="CloudIncident - Campus Incident Ops Home"
          >
            {/* CloudIncident Brand Icon */}
            <div className="w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform duration-200">
              <img
                src="/cloudincident-icon.svg"
                alt="CloudIncident Logo"
                className="w-full h-full object-contain"
                width="44"
                height="44"
              />
            </div>

            <div className="flex flex-col">
              <span className="font-display text-xl sm:text-2xl tracking-wider text-[#501B24] group-hover:text-[#651F2B] transition-colors leading-tight">
                CLOUDIN<span className="text-[#651F2B]">CIDENT</span>
              </span>
              <span className="text-[9px] sm:text-[10px] font-mono uppercase tracking-widest text-[#857172] -mt-0.5">
                Campus Incident Ops
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links (Visible on lg and above) */}
          <nav className="hidden lg:flex items-center gap-1.5 xl:gap-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    `px-3.5 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all duration-150 flex items-center gap-2 ${
                      isActive
                        ? 'bg-[#501B24] text-[#F7EFE6] shadow-sm ring-1 ring-[#501B24]'
                        : 'text-[#501B24] hover:bg-[#EAC4CF]/40 hover:text-[#501B24]'
                    }`
                  }
                >
                  <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{link.label}</span>
                  {link.badge && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#EAC4CF] text-[#501B24] font-bold">
                      {link.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>

          {/* Right Action & Status (Desktop lg and above) */}
          <div className="hidden lg:flex items-center gap-3 flex-shrink-0">
            {/* Subtle Divider */}
            <div className="h-6 w-px bg-[#DCCBBC]" />

            {/* Truthful Mode / Connection Indicator */}
            <button
              type="button"
              onClick={onOpenApiModal}
              title="Click to view API Gateway configuration & integration contract"
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[#DCCBBC] bg-white/70 hover:bg-white text-xs font-mono text-[#501B24] transition-colors cursor-pointer"
            >
              <span className={`w-2 h-2 rounded-full ${systemStatus.dotColor}`} />
              <span className="text-[11px] font-semibold tracking-wider">
                {systemStatus.label}
              </span>
              <Server className="w-3.5 h-3.5 text-[#857172]" />
            </button>

            {/* Primary Action Button */}
            <Link
              to="/report"
              className="px-4 py-2 rounded-lg bg-[#501B24] hover:bg-[#651F2B] active:bg-[#3D131B] text-[#F7EFE6] font-display text-xs tracking-widest uppercase transition-all shadow-sm hover:shadow flex items-center gap-1.5 flex-shrink-0"
            >
              <PlusCircle className="w-3.5 h-3.5 text-[#EAC4CF]" />
              <span>Report Issue</span>
            </Link>
          </div>

          {/* Tablet & Mobile Controls (Under lg) */}
          <div className="flex items-center gap-2 lg:hidden">
            {/* Status indicator compact badge */}
            <button
              type="button"
              onClick={onOpenApiModal}
              title="API Gateway / Mock Data Status"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-[#DCCBBC] bg-white/80 text-[10px] font-mono font-semibold text-[#501B24]"
            >
              <span className={`w-2 h-2 rounded-full ${systemStatus.dotColor}`} />
              <span className="hidden sm:inline">
                {isMockMode ? 'MOCK DATA' : 'API LIVE'}
              </span>
            </button>

            {/* Mobile Menu Hamburger Toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-[#501B24] text-[#F7EFE6] hover:bg-[#651F2B] focus:outline-none transition-colors"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Collapsible Navigation Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-[#DCCBBC] bg-[#F7EFE6] px-4 pt-3 pb-6 space-y-2 animate-fadeIn shadow-lg">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                onClick={closeMenu}
                className={`flex items-center justify-between px-4 py-3 rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors ${
                  isActive
                    ? 'bg-[#501B24] text-[#F7EFE6] shadow-sm'
                    : 'text-[#501B24] bg-white/60 hover:bg-[#EAC4CF]/40'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 text-[#EAC4CF]" />
                  <span>{link.label}</span>
                </div>
                {link.badge && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#EAC4CF] text-[#501B24] font-bold">
                    {link.badge} Open
                  </span>
                )}
              </Link>
            );
          })}

          {/* Quick Report Issue Button in Mobile Menu */}
          <div className="pt-2">
            <Link
              to="/report"
              onClick={closeMenu}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#501B24] hover:bg-[#651F2B] text-[#F7EFE6] font-display text-xs tracking-widest uppercase transition-colors shadow-sm"
            >
              <PlusCircle className="w-4 h-4 text-[#EAC4CF]" />
              <span>REPORT AN INCIDENT</span>
            </Link>
          </div>

          {/* System Status in Mobile Menu */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => {
                closeMenu();
                onOpenApiModal();
              }}
              className="w-full flex items-center justify-between py-2.5 px-4 rounded-xl border border-[#DCCBBC] bg-white text-xs font-mono text-[#501B24]"
            >
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${systemStatus.dotColor}`} />
                <span className="font-semibold">{systemStatus.label}</span>
              </div>
              <span className="text-[10px] uppercase font-bold text-[#857172]">
                Inspect Gateway //
              </span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
