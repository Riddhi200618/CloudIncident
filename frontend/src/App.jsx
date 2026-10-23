import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { IncidentProvider } from './context/IncidentContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Toast from './components/Toast';
import ApiStatusModal from './components/ApiStatusModal';
import ApiErrorBanner from './components/ApiErrorBanner';
import Dashboard from './pages/Dashboard';
import ReportIncident from './pages/ReportIncident';
import AllIncidents from './pages/AllIncidents';
import IncidentDetails from './pages/IncidentDetails';
import AdminManagement from './pages/AdminManagement';

function NotFound() {
  return (
    <div className="max-w-xl mx-auto py-24 text-center space-y-4">
      <h1 className="font-display text-6xl text-[#501B24]">404</h1>
      <h2 className="font-display text-2xl text-[#651F2B]">PAGE NOT FOUND</h2>
      <p className="text-sm text-[#857172]">
        The page you are looking for does not exist in the CloudIncident portal.
      </p>
      <a
        href="/"
        className="inline-block mt-4 px-6 py-2.5 rounded-xl bg-[#501B24] text-[#F7EFE6] text-xs font-semibold uppercase tracking-wider hover:bg-[#651F2B]"
      >
        Return to Dashboard
      </a>
    </div>
  );
}

export default function App() {
  const [apiModalOpen, setApiModalOpen] = useState(false);

  return (
    <BrowserRouter>
      <IncidentProvider>
        <div className="min-h-screen flex flex-col bg-[#F7EFE6] text-[#24191A]">
          {/* Top Sticky Navigation */}
          <Navbar onOpenApiModal={() => setApiModalOpen(true)} />

          {/* Main Workspace with warm cream background */}
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
            <ApiErrorBanner onOpenApiModal={() => setApiModalOpen(true)} />
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/report" element={<ReportIncident />} />
              <Route path="/incidents" element={<AllIncidents />} />
              <Route path="/incidents/:id" element={<IncidentDetails />} />
              <Route path="/admin" element={<AdminManagement />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>

          {/* Footer */}
          <Footer onOpenApiModal={() => setApiModalOpen(true)} />

          {/* System Components */}
          <Toast />
          <ApiStatusModal
            isOpen={apiModalOpen}
            onClose={() => setApiModalOpen(false)}
          />
        </div>
      </IncidentProvider>
    </BrowserRouter>
  );
}
