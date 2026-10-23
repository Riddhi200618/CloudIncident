import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { incidentService } from '../services/incidentService';
import { USE_MOCK_DATA, API_BASE_URL } from '../services/api';

const IncidentContext = createContext(null);

export function IncidentProvider({ children }) {
  const [incidents, setIncidents] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    open: 0,
    inProgress: 0,
    assigned: 0,
    resolved: 0,
    critical: 0,
    categoryCounts: {},
    priorityCounts: { Low: 0, Medium: 0, High: 0, Critical: 0 },
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);
  const [apiConnected, setApiConnected] = useState(!USE_MOCK_DATA ? null : true);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ id: Date.now(), message, type });
    setTimeout(() => {
      setToast(null);
    }, 4500);
  }, []);

  const hideToast = useCallback(() => {
    setToast(null);
  }, []);

  const refreshData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [incidentList, statData] = await Promise.all([
        incidentService.getIncidents(),
        incidentService.getStats(),
      ]);
      setIncidents(incidentList);
      setStats(statData);
      setApiConnected(true);
    } catch (err) {
      console.error('Failed to load incident data:', err);
      setApiConnected(false);
      setError(err.message || 'Failed to load incident records');
      showToast(err.message || 'Error loading incidents', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const createIncident = async (formData) => {
    try {
      const created = await incidentService.createIncident(formData);
      showToast(`Incident #${created.id} reported successfully!`, 'success');
      await refreshData();
      return created;
    } catch (err) {
      showToast(err.message || 'Failed to report incident', 'error');
      throw err;
    }
  };

  const updateIncident = async (id, patchData) => {
    try {
      const updated = await incidentService.updateIncident(id, patchData);
      showToast(`Incident #${id} updated successfully!`, 'success');
      await refreshData();
      return updated;
    } catch (err) {
      showToast(err.message || 'Failed to update incident', 'error');
      throw err;
    }
  };

  const resetMockData = () => {
    incidentService.resetMockData();
    refreshData();
    showToast('Reset incident records to default campus samples', 'info');
  };

  // Truthful status label calculation
  const getSystemStatus = () => {
    if (USE_MOCK_DATA) {
      return {
        label: 'DEMO MODE · MOCK DATA',
        color: 'text-[#EAC4CF]',
        dotColor: 'bg-amber-400',
        badgeBg: 'bg-[#651F2B]',
        badgeBorder: 'border-[#7A2B39]',
        isMock: true,
      };
    }
    if (apiConnected === true) {
      return {
        label: 'API GATEWAY · CONNECTED',
        color: 'text-emerald-300',
        dotColor: 'bg-emerald-400',
        badgeBg: 'bg-[#651F2B]',
        badgeBorder: 'border-[#7A2B39]',
        isMock: false,
      };
    }
    if (apiConnected === false) {
      return {
        label: 'API GATEWAY · OFFLINE',
        color: 'text-rose-300',
        dotColor: 'bg-rose-400',
        badgeBg: 'bg-[#651F2B]',
        badgeBorder: 'border-[#7A2B39]',
        isMock: false,
      };
    }
    return {
      label: 'CONNECTING GATEWAY...',
      color: 'text-amber-300',
      dotColor: 'bg-amber-400 animate-pulse',
      badgeBg: 'bg-[#651F2B]',
      badgeBorder: 'border-[#7A2B39]',
      isMock: false,
    };
  };

  return (
    <IncidentContext.Provider
      value={{
        incidents,
        stats,
        loading,
        error,
        toast,
        showToast,
        hideToast,
        refreshData,
        createIncident,
        updateIncident,
        resetMockData,
        isMockMode: USE_MOCK_DATA,
        apiConnected,
        systemStatus: getSystemStatus(),
        apiBaseUrl: API_BASE_URL,
      }}
    >
      {children}
    </IncidentContext.Provider>
  );
}

export function useIncidents() {
  const context = useContext(IncidentContext);
  if (!context) {
    throw new Error('useIncidents must be used within an IncidentProvider');
  }
  return context;
}
