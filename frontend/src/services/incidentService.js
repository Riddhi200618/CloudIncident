import { apiClient, USE_MOCK_DATA } from './api';
import { INITIAL_INCIDENTS } from '../data/mockIncidents';

const LOCAL_STORAGE_KEY = 'cloudincident_records_v1';

/**
 * Normalizes incident objects to bridge frontend UI conventions (`id`, `assignee`)
 * and backend DynamoDB data model specifications (`incidentId`, `assignedTo`).
 */
export function normalizeIncident(incident) {
  if (!incident || typeof incident !== 'object') return incident;
  const id = incident.incidentId || incident.id || '';
  const assignedTo = incident.assignedTo || incident.assignee || 'Unassigned';
  return {
    ...incident,
    id,
    incidentId: id,
    assignee: assignedTo,
    assignedTo,
    timeline: Array.isArray(incident.timeline) ? incident.timeline : [],
  };
}

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
 * Normalizes incoming and outgoing records for seamless compatibility with AWS API Gateway,
 * AWS Lambda, and Amazon DynamoDB.
 */
export const incidentService = {
  /**
   * Fetch all incidents (supports optional filter query parameters)
   * Prepares for: GET /incidents(?status=...&category=...&priority=...&search=...)
   */
  async getIncidents(filters = {}) {
    if (!USE_MOCK_DATA) {
      const queryParams = new URLSearchParams();
      if (filters && typeof filters === 'object') {
        if (filters.status && filters.status !== 'All') queryParams.set('status', filters.status);
        if (filters.category && filters.category !== 'All') queryParams.set('category', filters.category);
        if (filters.priority && filters.priority !== 'All') queryParams.set('priority', filters.priority);
        if (filters.search) queryParams.set('search', filters.search);
      }
      const qs = queryParams.toString();
      const endpoint = qs ? `/incidents?${qs}` : '/incidents';
      const response = await apiClient(endpoint, { method: 'GET' });
      const items = Array.isArray(response)
        ? response
        : response?.incidents || response?.items || [];
      return items.map(normalizeIncident);
    }
    // Simulate brief network latency for realistic UX feel
    await new Promise((r) => setTimeout(r, 120));
    const items = getLocalStore();
    return items.map(normalizeIncident);
  },

  /**
   * Fetch single incident by ID
   * Prepares for: GET /incidents/{id}
   */
  async getIncidentById(id) {
    if (!USE_MOCK_DATA) {
      const response = await apiClient(`/incidents/${encodeURIComponent(id)}`, { method: 'GET' });
      return normalizeIncident(response);
    }
    await new Promise((r) => setTimeout(r, 100));
    const items = getLocalStore();
    const found = items.find(
      (inc) =>
        (inc.id && inc.id.toLowerCase() === id.toLowerCase()) ||
        (inc.incidentId && inc.incidentId.toLowerCase() === id.toLowerCase())
    );
    if (!found) {
      throw new Error(`Incident with ID "${id}" was not found.`);
    }
    return normalizeIncident(found);
  },

  /**
   * Create new incident
   * Prepares for: POST /incidents
   */
  async createIncident(incidentData) {
    if (!USE_MOCK_DATA) {
      const payload = {
        title: incidentData.title?.trim(),
        description: incidentData.description?.trim(),
        category: incidentData.category || 'Other',
        location: incidentData.location?.trim(),
        priority: incidentData.priority || 'Medium',
        reportedBy: incidentData.reportedBy?.trim(),
        ...(incidentData.assignedTo || incidentData.assignee
          ? {
              assignedTo: incidentData.assignedTo || incidentData.assignee,
              assignee: incidentData.assignedTo || incidentData.assignee,
            }
          : {}),
      };
      const response = await apiClient('/incidents', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      return normalizeIncident(response);
    }
    await new Promise((r) => setTimeout(r, 200));
    const items = getLocalStore();
    
    // Generate new ID (e.g. INC-1049)
    const existingIds = items
      .map((i) => {
        const idVal = i.incidentId || i.id || '';
        const match = idVal.match(/INC-(\d+)/i);
        return match ? parseInt(match[1], 10) : 0;
      })
      .filter((n) => !isNaN(n));
    const nextNum = existingIds.length > 0 ? Math.max(...existingIds) + 1 : 1001;
    const newId = `INC-${nextNum}`;

    const now = new Date().toISOString();
    const newIncident = {
      id: newId,
      incidentId: newId,
      title: incidentData.title.trim(),
      description: incidentData.description.trim(),
      category: incidentData.category || 'Other',
      location: incidentData.location.trim(),
      priority: incidentData.priority || 'Medium',
      status: 'Open',
      reportedBy: incidentData.reportedBy.trim(),
      assignee: incidentData.assignedTo || incidentData.assignee || 'Unassigned',
      assignedTo: incidentData.assignedTo || incidentData.assignee || 'Unassigned',
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
    return normalizeIncident(newIncident);
  },

  /**
   * Update incident (Status, Assignee, Remarks)
   * Prepares for: PATCH /incidents/{id}
   */
  async updateIncident(id, patchData) {
    if (!USE_MOCK_DATA) {
      const payload = { ...patchData };
      if (payload.assignee && !payload.assignedTo) {
        payload.assignedTo = payload.assignee;
      }
      if (payload.assignedTo && !payload.assignee) {
        payload.assignee = payload.assignedTo;
      }
      const response = await apiClient(`/incidents/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      });
      return normalizeIncident(response);
    }
    await new Promise((r) => setTimeout(r, 200));
    const items = getLocalStore();
    const index = items.findIndex(
      (i) =>
        (i.id && i.id.toLowerCase() === id.toLowerCase()) ||
        (i.incidentId && i.incidentId.toLowerCase() === id.toLowerCase())
    );

    if (index === -1) {
      throw new Error(`Incident with ID "${id}" was not found.`);
    }

    const current = items[index];
    const now = new Date().toISOString();
    const newTimeline = [...(current.timeline || [])];

    const targetAssignee =
      patchData.assignedTo ||
      patchData.assignee ||
      current.assignee ||
      current.assignedTo ||
      'Unassigned';

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
      assignee: targetAssignee,
      assignedTo: targetAssignee,
      timeline: newTimeline,
      updatedAt: now,
    };

    items[index] = updated;
    saveLocalStore(items);
    return normalizeIncident(updated);
  },

  /**
   * Compute or fetch incident statistics
   * Prepares for: GET /stats
   */
  async getStats() {
    if (!USE_MOCK_DATA) {
      const data = await apiClient('/stats', { method: 'GET' });
      return {
        total: data?.total ?? 0,
        open: data?.open ?? 0,
        inProgress: data?.inProgress ?? 0,
        assigned: data?.assigned ?? 0,
        resolved: data?.resolved ?? 0,
        critical: data?.critical ?? 0,
        categoryCounts: data?.categoryCounts ?? {},
        priorityCounts: data?.priorityCounts ?? { Low: 0, Medium: 0, High: 0, Critical: 0 },
      };
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
