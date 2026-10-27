import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer({ onOpenApiModal }) {
  return (
    <footer className="mt-auto bg-[#501B24] text-[#F7EFE6] border-t border-[#651F2B]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8 pb-8 border-b border-[#651F2B]">
          
          {/* Brand & Project Info */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 flex items-center justify-center flex-shrink-0">
                <img
                  src="/cloudincident-icon.svg"
                  alt="CloudIncident Logo"
                  className="w-full h-full object-contain"
                  width="32"
                  height="32"
                />
              </div>
              <span className="font-display text-2xl tracking-wider text-white">
                CLOUDIN<span className="text-[#EAC4CF]">CIDENT</span>
              </span>
            </div>
            <p className="text-xs text-[#F4DDE2]/80 leading-relaxed max-w-md">
              A Serverless Cloud-Based Incident Management & Issue Reporting System built for college campus operations. Architecture integrates React frontend via AWS API Gateway with AWS Lambda and Amazon DynamoDB.
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-2">
              <span className="text-[10px] uppercase font-mono tracking-wider px-2 py-0.5 rounded bg-[#651F2B] text-[#EAC4CF] border border-[#7A2B39]">
                College Cloud Mini-Project
              </span>
              <button
                type="button"
                onClick={onOpenApiModal}
                className="text-[10px] uppercase font-mono tracking-wider px-2 py-0.5 rounded bg-[#FAF5EE] text-[#501B24] hover:bg-white transition-colors"
              >
                Inspect API Gateway Routes
              </button>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="font-display text-sm tracking-widest text-[#EAC4CF] uppercase">
              NAVIGATION
            </h4>
            <ul className="space-y-2 text-xs text-[#F4DDE2]/80">
              <li>
                <Link to="/" className="hover:text-white transition-colors">
                  Dashboard Overview
                </Link>
              </li>
              <li>
                <Link to="/report" className="hover:text-white transition-colors">
                  Raise an Incident Flag
                </Link>
              </li>
              <li>
                <Link to="/incidents" className="hover:text-white transition-colors">
                  All Campus Incidents
                </Link>
              </li>
              <li>
                <Link to="/admin" className="hover:text-white transition-colors">
                  Admin Dispatch Hub
                </Link>
              </li>
            </ul>
          </div>

          {/* Architecture Status */}
          <div className="space-y-3">
            <h4 className="font-display text-sm tracking-widest text-[#EAC4CF] uppercase">
              SERVERLESS STACK
            </h4>
            <ul className="space-y-1.5 text-xs text-[#F4DDE2]/80 font-mono">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>Frontend: React + Vite + Tailwind</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                <span>Gateway: Amazon API Gateway</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                <span>Compute: AWS Lambda</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                <span>Database: Amazon DynamoDB</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#F4DDE2]/60">
          <p>© 2026 CloudIncident. Developed for College Cloud Computing Mini-Project.</p>
          <p className="font-mono text-[11px]">Editorial Burgundy & Blush Theme</p>
        </div>
      </div>
    </footer>
  );
}
