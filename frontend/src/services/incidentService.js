import { apiClient, USE_MOCK_DATA } from './api.js';
import { INITIAL_INCIDENTS } from '../data/mockIncidents.js';

const LOCAL_STORAGE_KEY = 'cloudincident_records_v1';

export const STATUS_LIFECYCLE = [
  'Open',
  'Assigned',
  'In Progress',
  'Resolved',
  'Closed',
];

/**
 * Unwraps `{ success, message, data }` backend response envelope,
 * returning the inner `data` payload while gracefully handling flat responses.
 */
export function unwrapResponse(response) {
  if (response && typeof response === 'object' && 'data' in response && 'success' in response) {
    return response.data;
  }
  return response;
}

/**
 * Normalizes incident objects to bridge frontend UI conventions (`id`, `assignee`, timeline `note`/`actor`)
 * and backend DynamoDB data model specifications (`incidentId`, `assignedTo`, timeline `remarks`).
 */
export function normalizeIncident(incident) {
  if (!incident || typeof incident !== 'object') return incident;
  
  const id = incident.incidentId || incident.id || '';
  const rawAssignedTo = incident.assignedTo !== undefined ? incident.assignedTo : incident.assignee;
  const assignedTo = typeof rawAssignedTo === 'string' ? rawAssignedTo : '';
  const assignee = assignedTo.trim() ? assignedTo.trim() : 'Unassigned';

  const rawTimeline = Array.isArray(incident.timeline) ? incident.timeline : [];
  const normalizedTimeline = rawTimeline.map((entry) => {
    if (!entry || typeof entry !== 'object') return entry;
    const note = entry.note || entry.remarks || '';
    const remarks = entry.remarks || entry.note || '';
    return {
      ...entry,
      note,
      remarks,
      actor: entry.actor || 'System',
      status: entry.status || incident.status || 'Open',
      timestamp: entry.timestamp || incident.updatedAt || incident.createdAt || '',
    };
  });

  return {
    ...incident,
    id,
    incidentId: id,
    assignedTo,
    assignee,
    timeline: normalizedTimeline,
  };
}

/**
 * Filters an incident array in-memory
 */
function filterIncidents(items, filters = {}) {
  if (!filters || typeof filters !== 'object') return items;
  return items.filter((item) => {
    if (filters.status && filters.status !== 'All' && item.status !== filters.status) return false;
    if (filters.category && filters.category !== 'All' && item.category !== filters.category) return false;
    if (filters.priority && filters.priority !== 'All' && item.priority !== filters.priority) return false;
    if (filters.search) {
      const q = filters.search.toLowerCase().trim();
      const match =
        (item.id && item.id.toLowerCase().includes(q)) ||
        (item.incidentId && item.incidentId.toLowerCase().includes(q)) ||
        (item.title && item.title.toLowerCase().includes(q)) ||
        (item.location && item.location.toLowerCase().includes(q)) ||
        (item.reportedBy && item.reportedBy.toLowerCase().includes(q));
      if (!match) return false;
    }
    return true;
  });
}

let inMemoryStore = null;

/**
 * Initialize or retrieve incidents from localStorage for client mock testing
 */
function getLocalStore() {
  try {
    if (typeof localStorage !== 'undefined') {
      const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (!raw) {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_INCIDENTS));
        return INITIAL_INCIDENTS;
      }
      return JSON.parse(raw);
    }
  } catch (err) {
    console.warn('LocalStorage access issue, falling back to in-memory incidents', err);
  }
  if (!inMemoryStore) {
    inMemoryStore = JSON.parse(JSON.stringify(INITIAL_INCIDENTS));
  }
  return inMemoryStore;
}

function saveLocalStore(incidents) {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(incidents));
    }
  } catch (err) {
    console.warn('Failed to save to localStorage', err);
  }
  inMemoryStore = incidents;
}

/**
 * Incident Service Layer
 * Abstracts API calls so components interact through a clean asynchronous interface.
 * Normalizes incoming and outgoing records for seamless compatibility with AWS API Gateway,
 * AWS Lambda, and Amazon DynamoDB.
 */
export const incidentService = {
  /**
   * Fetch all incidents (supports optional filter query parameters applied client-side)
   * Prepares for: GET /incidents
   */
  async getIncidents(filters = {}) {
    if (!USE_MOCK_DATA) {
      const response = await apiClient('/incidents', { method: 'GET' });
      const data = unwrapResponse(response);
      const items = Array.isArray(data)
        ? data
        : data?.incidents || data?.items || [];
      const normalized = items.map(normalizeIncident);
      return filterIncidents(normalized, filters);
    }
    // Simulate brief network latency for realistic UX feel
    await new Promise((r) => setTimeout(r, 120));
    const items = getLocalStore();
    const normalized = items.map(normalizeIncident);
    return filterIncidents(normalized, filters);
  },

  /**
   * Fetch single incident by ID
   * Prepares for: GET /incidents/{id}
   */
  async getIncidentById(id) {
    if (!USE_MOCK_DATA) {
      const response = await apiClient(`/incidents/${encodeURIComponent(id)}`, { method: 'GET' });
      const data = unwrapResponse(response);
      const item = data?.incident || data?.item || data;
      return normalizeIncident(item);
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
   * Request body includes ONLY the 6 backend-required fields:
   * title, description, category, location, priority, reportedBy
   */
  async createIncident(incidentData) {
    if (!USE_MOCK_DATA) {
      const payload = {
        title: incidentData.title?.trim() || '',
        description: incidentData.description?.trim() || '',
        category: incidentData.category?.trim() || 'Other',
        location: incidentData.location?.trim() || '',
        priority: incidentData.priority || 'Medium',
        reportedBy: incidentData.reportedBy?.trim() || '',
      };
      const response = await apiClient('/incidents', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      const data = unwrapResponse(response);
      const item = data?.incident || data?.item || data;
      return normalizeIncident(item);
    }
    await new Promise((r) => setTimeout(r, 200));
    const items = getLocalStore();
    
    // Generate new UUID-based ID matching backend pattern: INC-<uuid>
    const uuidPart =
      typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
            const r = (Math.random() * 16) | 0;
            const v = c === 'x' ? r : (r & 0x3) | 0x8;
            return v.toString(16);
          });
    const newId = `INC-${uuidPart}`;

    const now = new Date().toISOString();
    const newIncident = {
      incidentId: newId,
      id: newId,
      title: (incidentData.title || '').trim(),
      description: (incidentData.description || '').trim(),
      category: (incidentData.category || 'Other').trim(),
      location: (incidentData.location || '').trim(),
      priority: incidentData.priority || 'Medium',
      reportedBy: (incidentData.reportedBy || '').trim(),
      assignedTo: '',
      assignee: 'Unassigned',
      status: 'Open',
      createdAt: now,
      updatedAt: now,
      resolutionRemarks: '',
      timeline: [
        {
          status: 'Open',
          timestamp: now,
          remarks: 'Incident reported',
          note: 'Incident reported',
          actor: 'System',
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
   * Request body includes ONLY: status, assignedTo, resolutionRemarks
   */
  async updateIncident(id, patchData) {
    if (!USE_MOCK_DATA) {
      const payload = {};
      if (patchData.status) {
        payload.status = patchData.status;
      }
      if (patchData.assignedTo !== undefined || patchData.assignee !== undefined) {
        const raw = patchData.assignedTo !== undefined ? patchData.assignedTo : patchData.assignee;
        if (typeof raw === 'string') {
          payload.assignedTo = raw.trim();
        }
      }
      if (patchData.resolutionRemarks !== undefined) {
        if (typeof patchData.resolutionRemarks === 'string') {
          payload.resolutionRemarks = patchData.resolutionRemarks.trim();
        }
      }

      if (Object.keys(payload).length === 0) {
        throw new Error('At least one field (status, assignedTo, resolutionRemarks) is required for update');
      }

      const response = await apiClient(`/incidents/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      });
      const data = unwrapResponse(response);
      const item = data?.incident || data?.item || data;
      return normalizeIncident(item);
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
    const oldStatus = current.status || 'Open';
    const newStatus = patchData.status || oldStatus;

    if (!STATUS_LIFECYCLE.includes(newStatus)) {
      throw new Error('Invalid status');
    }

    const oldIndex = STATUS_LIFECYCLE.indexOf(oldStatus);
    const newIndex = STATUS_LIFECYCLE.indexOf(newStatus);

    // Strictly enforce backend transition rule: same status or one-step forward
    if (newIndex < oldIndex || newIndex > oldIndex + 1) {
      throw new Error('Invalid status transition');
    }

    const rawAssigned = patchData.assignedTo !== undefined ? patchData.assignedTo : patchData.assignee;
    const assignedTo = rawAssigned !== undefined ? (typeof rawAssigned === 'string' ? rawAssigned.trim() : '') : (current.assignedTo || '');

    if (newIndex >= 1 && !assignedTo) {
      throw new Error('Assignment is required before progressing');
    }

    const rawRemarks = patchData.resolutionRemarks !== undefined ? patchData.resolutionRemarks : (current.resolutionRemarks || '');
    const remarks = typeof rawRemarks === 'string' ? rawRemarks.trim() : '';

    if ((newStatus === 'Resolved' || newStatus === 'Closed') && !remarks) {
      throw new Error('Resolution remarks are required');
    }

    const now = new Date().toISOString();
    const newTimeline = [...(current.timeline || [])];

    // Status changes append a timeline entry
    if (newStatus !== oldStatus) {
      const entryText = newStatus === 'Resolved' && remarks ? remarks : `Status changed to ${newStatus}`;
      newTimeline.push({
        status: newStatus,
        timestamp: now,
        remarks: entryText,
        note: entryText,
        actor: 'System',
      });
    }

    const updated = {
      ...current,
      status: newStatus,
      assignedTo,
      assignee: assignedTo || 'Unassigned',
      resolutionRemarks: remarks,
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
      const response = await apiClient('/stats', { method: 'GET' });
      const statsPayload = unwrapResponse(response) || {};
      const resolvedCount = (statsPayload.resolved ?? 0) + (statsPayload.closed ?? 0);

      return {
        total: statsPayload.total ?? 0,
        open: statsPayload.open ?? 0,
        assigned: statsPayload.assigned ?? 0,
        inProgress: statsPayload.inProgress ?? 0,
        resolved: resolvedCount,
        closed: statsPayload.closed ?? 0,
        critical: statsPayload.critical ?? 0,
        categoryCounts: statsPayload.categoryCounts || statsPayload.byCategory || {},
        priorityCounts: statsPayload.priorityCounts || statsPayload.byPriority || { Low: 0, Medium: 0, High: 0, Critical: 0 },
        byStatus: statsPayload.byStatus || {},
        byPriority: statsPayload.byPriority || {},
        byCategory: statsPayload.byCategory || {},
      };
    }
    const items = await this.getIncidents();
    const total = items.length;
    const open = items.filter((i) => i.status === 'Open').length;
    const assigned = items.filter((i) => i.status === 'Assigned').length;
    const inProgress = items.filter((i) => i.status === 'In Progress').length;
    const resolvedOnly = items.filter((i) => i.status === 'Resolved').length;
    const closed = items.filter((i) => i.status === 'Closed').length;
    const resolved = resolvedOnly + closed;
    const critical = items.filter((i) => i.priority === 'Critical').length;

    // Categories and priorities breakdown
    const categoryCounts = {};
    const priorityCounts = { Low: 0, Medium: 0, High: 0, Critical: 0 };
    const byStatus = {
      Open: open,
      Assigned: assigned,
      'In Progress': inProgress,
      Resolved: resolvedOnly,
      Closed: closed,
    };

    items.forEach((inc) => {
      if (inc.category) {
        categoryCounts[inc.category] = (categoryCounts[inc.category] || 0) + 1;
      }
      if (priorityCounts[inc.priority] !== undefined) {
        priorityCounts[inc.priority] += 1;
      }
    });

    return {
      total,
      open,
      assigned,
      inProgress,
      resolved,
      closed,
      critical,
      categoryCounts,
      priorityCounts,
      byStatus,
      byPriority: priorityCounts,
      byCategory: categoryCounts,
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
