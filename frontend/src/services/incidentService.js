import { apiClient, USE_MOCK_DATA } from './api';
import { INITIAL_INCIDENTS } from '../data/mockIncidents';

const LOCAL_STORAGE_KEY = 'cloudincident_records_v1';

/**
 * Initialize or retrieve incidents from localStorage for client mock testing
 */
function getLocalStore() {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_INCIDENTS));
      return INITIAL_INCIDENTS;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.warn('LocalStorage access issue, falling back to in-memory incidents', err);
    return INITIAL_INCIDENTS;
  }
}

function saveLocalStore(incidents) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(incidents));
  } catch (err) {
    console.warn('Failed to save to localStorage', err);
  }
}

/**
 * Incident Service Layer
 * Abstracts API calls so components interact through a clean asynchronous interface.
 */
export const incidentService = {
  /**
   * Fetch all incidents
   * Prepares for: GET /incidents
   */
  async getIncidents() {
    if (!USE_MOCK_DATA) {
      return apiClient('/incidents', { method: 'GET' });
    }
    // Simulate brief network latency for realistic UX feel
    await new Promise((r) => setTimeout(r, 120));
    return getLocalStore();
  },

  /**
   * Fetch single incident by ID
   * Prepares for: GET /incidents/{id}
   */
  async getIncidentById(id) {
    if (!USE_MOCK_DATA) {
      return apiClient(`/incidents/${encodeURIComponent(id)}`, { method: 'GET' });
    }
    await new Promise((r) => setTimeout(r, 100));
    const items = getLocalStore();
    const found = items.find((inc) => inc.id.toLowerCase() === id.toLowerCase());
    if (!found) {
      throw new Error(`Incident with ID "${id}" was not found.`);
    }
    return found;
  },

  /**
   * Create new incident
   * Prepares for: POST /incidents
   */
  async createIncident(incidentData) {
    if (!USE_MOCK_DATA) {
      return apiClient('/incidents', {
        method: 'POST',
        body: JSON.stringify(incidentData),
      });
    }
    await new Promise((r) => setTimeout(r, 200));
    const items = getLocalStore();
    
    // Generate new ID (e.g. INC-1049)
    const existingIds = items
      .map((i) => {
        const match = i.id.match(/INC-(\d+)/i);
        return match ? parseInt(match[1], 10) : 0;
      })
      .filter((n) => !isNaN(n));
    const nextNum = existingIds.length > 0 ? Math.max(...existingIds) + 1 : 1001;
    const newId = `INC-${nextNum}`;

    const now = new Date().toISOString();
    const newIncident = {
      id: newId,
      title: incidentData.title.trim(),
      description: incidentData.description.trim(),
      category: incidentData.category || 'Other',
      location: incidentData.location.trim(),
      priority: incidentData.priority || 'Medium',
      status: 'Open',
      reportedBy: incidentData.reportedBy.trim(),
      assignee: 'Unassigned',
      createdAt: now,
      updatedAt: now,
      resolutionRemarks: '',
      timeline: [
        {
          timestamp: now,
          status: 'Open',
          actor: incidentData.reportedBy.trim(),
          note: 'Incident logged and queued for evaluation.',
        },
      ],
    };

    const updatedList = [newIncident, ...items];
    saveLocalStore(updatedList);
    return newIncident;
  },

  /**
   * Update incident (Status, Assignee, Remarks)
   * Prepares for: PATCH /incidents/{id}
   */
  async updateIncident(id, patchData) {
    if (!USE_MOCK_DATA) {
      return apiClient(`/incidents/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        body: JSON.stringify(patchData),
      });
    }
    await new Promise((r) => setTimeout(r, 200));
    const items = getLocalStore();
    const index = items.findIndex((i) => i.id.toLowerCase() === id.toLowerCase());

    if (index === -1) {
      throw new Error(`Incident with ID "${id}" was not found.`);
    }

    const current = items[index];
    const now = new Date().toISOString();
    const newTimeline = [...(current.timeline || [])];

    // If status changed, record to timeline
    if (patchData.status && patchData.status !== current.status) {
      newTimeline.push({
        timestamp: now,
        status: patchData.status,
        actor: patchData.updatedBy || 'Campus Admin',
        note: patchData.resolutionRemarks 
          ? `Status changed to ${patchData.status}: ${patchData.resolutionRemarks}`
          : `Status updated from ${current.status} to ${patchData.status}`,
      });
    } else if (patchData.resolutionRemarks && patchData.resolutionRemarks !== current.resolutionRemarks) {
      newTimeline.push({
        timestamp: now,
        status: current.status,
        actor: patchData.updatedBy || 'Campus Admin',
        note: `Remarks updated: ${patchData.resolutionRemarks}`,
      });
    }

    const updated = {
      ...current,
      ...patchData,
      timeline: newTimeline,
      updatedAt: now,
    };

    items[index] = updated;
    saveLocalStore(items);
    return updated;
  },

  /**
   * Compute or fetch incident statistics
   * Prepares for: GET /stats
   */
  async getStats() {
    if (!USE_MOCK_DATA) {
      return apiClient('/stats', { method: 'GET' });
    }
    const items = await this.getIncidents();
    const total = items.length;
    const open = items.filter((i) => i.status === 'Open').length;
    const inProgress = items.filter((i) => i.status === 'In Progress').length;
    const assigned = items.filter((i) => i.status === 'Assigned').length;
    const resolved = items.filter((i) => i.status === 'Resolved' || i.status === 'Closed').length;
    const critical = items.filter((i) => i.priority === 'Critical').length;

    // Categories breakdown
    const categoryCounts = {};
    const priorityCounts = { Low: 0, Medium: 0, High: 0, Critical: 0 };

    items.forEach((inc) => {
      categoryCounts[inc.category] = (categoryCounts[inc.category] || 0) + 1;
      if (priorityCounts[inc.priority] !== undefined) {
        priorityCounts[inc.priority] += 1;
      }
    });

    return {
      total,
      open,
      inProgress,
      assigned,
      resolved,
      critical,
      categoryCounts,
      priorityCounts,
    };
  },

  /**
   * Reset local storage back to initial sample dataset
   */
  resetMockData() {
    saveLocalStore(INITIAL_INCIDENTS);
    return INITIAL_INCIDENTS;
  },
};
