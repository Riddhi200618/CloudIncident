import test from 'node:test';
import assert from 'node:assert/strict';
import {
  normalizeIncident,
  unwrapResponse,
  incidentService,
  STATUS_LIFECYCLE,
} from '../src/services/incidentService.js';
import { apiClient } from '../src/services/api.js';

test('normalizeIncident: bridges backend incidentId to id and assignedTo to assignee', () => {
  const backendIncident = {
    incidentId: 'INC-1826b05a-0a59-437a-95b6-dcfbf991fd85',
    title: 'WiFi Outage in Block B',
    description: 'Access points lost connection to controller',
    category: 'Network',
    location: 'Block B - Floor 2',
    priority: 'High',
    reportedBy: 'student001',
    assignedTo: 'Network Ops',
    status: 'Assigned',
    createdAt: '2026-10-27T12:00:00Z',
    updatedAt: '2026-10-27T12:05:00Z',
    resolutionRemarks: '',
    timeline: [
      {
        status: 'Open',
        timestamp: '2026-10-27T12:00:00Z',
        remarks: 'Incident reported by campus user',
      },
      {
        status: 'Assigned',
        timestamp: '2026-10-27T12:05:00Z',
        remarks: 'Status changed to Assigned',
      },
    ],
  };

  const normalized = normalizeIncident(backendIncident);

  // ID normalization
  assert.equal(normalized.id, 'INC-1826b05a-0a59-437a-95b6-dcfbf991fd85');
  assert.equal(normalized.incidentId, 'INC-1826b05a-0a59-437a-95b6-dcfbf991fd85');

  // Assignee normalization
  assert.equal(normalized.assignee, 'Network Ops');
  assert.equal(normalized.assignedTo, 'Network Ops');

  // Timeline remarks -> note and System actor fallback
  assert.equal(normalized.timeline.length, 2);
  assert.equal(normalized.timeline[0].note, 'Incident reported by campus user');
  assert.equal(normalized.timeline[0].remarks, 'Incident reported by campus user');
  assert.equal(normalized.timeline[0].actor, 'System');
  assert.equal(normalized.timeline[1].note, 'Status changed to Assigned');

  // Original fields preserved
  assert.equal(normalized.title, 'WiFi Outage in Block B');
  assert.equal(normalized.category, 'Network');
  assert.equal(normalized.status, 'Assigned');
});

test('normalizeIncident: handles empty assignment with Unassigned display fallback', () => {
  const blankAssigneeIncident = {
    incidentId: 'INC-test-blank',
    title: 'Water Leak',
    assignedTo: '',
    status: 'Open',
    timeline: [],
  };

  const normalized = normalizeIncident(blankAssigneeIncident);
  assert.equal(normalized.assignedTo, '');
  assert.equal(normalized.assignee, 'Unassigned');
});

test('unwrapResponse: unwraps { success, message, data } correctly', () => {
  const backendEnvelope = {
    success: true,
    message: 'Dashboard statistics retrieved successfully',
    data: {
      total: 5,
      open: 2,
      assigned: 1,
      inProgress: 1,
      resolved: 1,
      closed: 0,
    },
  };

  const unwrapped = unwrapResponse(backendEnvelope);
  assert.deepEqual(unwrapped, backendEnvelope.data);

  // Flat responses pass through untouched
  const flatArray = [{ id: '1' }, { id: '2' }];
  assert.deepEqual(unwrapResponse(flatArray), flatArray);

  // Null/undefined pass through safely
  assert.equal(unwrapResponse(null), null);
});

test('apiClient: handles 400 Bad Request error payload with message', async () => {
  // Mock global fetch to return 400 with backend envelope
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => ({
    ok: false,
    status: 400,
    statusText: 'Bad Request',
    headers: {
      get: (h) => (h.toLowerCase() === 'content-type' ? 'application/json' : null),
    },
    json: async () => ({
      success: false,
      message: 'Invalid status transition',
      data: null,
    }),
  });

  try {
    await assert.rejects(
      async () => {
        await apiClient('/incidents/INC-123', { method: 'PATCH' });
      },
      (err) => {
        assert.equal(err.message, 'Invalid status transition');
        assert.equal(err.status, 400);
        return true;
      }
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('apiClient: handles success: false in 200 response', async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => ({
    ok: true,
    status: 200,
    statusText: 'OK',
    headers: {
      get: (h) => (h.toLowerCase() === 'content-type' ? 'application/json' : null),
    },
    json: async () => ({
      success: false,
      message: 'Assignment is required before progressing',
      data: null,
    }),
  });

  try {
    await assert.rejects(
      async () => {
        await apiClient('/incidents/INC-123', { method: 'PATCH' });
      },
      (err) => {
        assert.equal(err.message, 'Assignment is required before progressing');
        return true;
      }
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('incidentService (Mock Mode): list, detail, create, stats lifecycle', async () => {
  // Reset store to known sample state
  incidentService.resetMockData();

  // 1. GET /incidents (list)
  const incidents = await incidentService.getIncidents();
  assert.ok(Array.isArray(incidents));
  assert.ok(incidents.length > 0);
  const first = incidents[0];
  assert.ok(first.id);
  assert.ok(first.title);
  assert.ok(first.status);

  // 2. GET /incidents/:id (detail)
  const detail = await incidentService.getIncidentById(first.id);
  assert.equal(detail.id, first.id);
  assert.equal(detail.title, first.title);

  // 3. POST /incidents (create)
  const created = await incidentService.createIncident({
    title: 'Broken Lab Stool',
    description: 'Hydraulic cylinder leaking in Chemistry Lab 102',
    category: 'Safety',
    location: 'Chemistry Lab 102',
    priority: 'Medium',
    reportedBy: 'student999',
  });

  assert.ok(created.id.startsWith('INC-'));
  assert.equal(created.status, 'Open');
  assert.equal(created.title, 'Broken Lab Stool');
  assert.equal(created.assignee, 'Unassigned');
  assert.equal(created.assignedTo, '');
  assert.equal(created.timeline.length, 1);
  assert.equal(created.timeline[0].status, 'Open');

  // Verify created ticket is retrievable
  const fetchedCreated = await incidentService.getIncidentById(created.id);
  assert.equal(fetchedCreated.id, created.id);

  // 4. GET /stats
  const stats = await incidentService.getStats();
  assert.ok(typeof stats.total === 'number');
  assert.ok(stats.total >= 1);
  assert.ok(typeof stats.open === 'number');
  assert.ok(typeof stats.assigned === 'number');
  assert.ok(typeof stats.inProgress === 'number');
  assert.ok(typeof stats.resolved === 'number');
  assert.ok(typeof stats.closed === 'number');
  assert.ok(stats.categoryCounts);
  assert.ok(stats.priorityCounts);
});

test('incidentService (Mock Mode): enforces status transition rules strictly', async () => {
  incidentService.resetMockData();

  const newTicket = await incidentService.createIncident({
    title: 'Flickering Fluorescent Tube',
    description: 'Ceiling light buzzing and flickering continuously in Room 401',
    category: 'Maintenance',
    location: 'Room 401',
    priority: 'Low',
    reportedBy: 'staff001',
  });

  assert.equal(newTicket.status, 'Open');

  // Skipping step Open -> In Progress must throw
  await assert.rejects(
    async () => {
      await incidentService.updateIncident(newTicket.id, {
        status: 'In Progress',
        assignedTo: 'Facilities Team',
      });
    },
    (err) => {
      assert.equal(err.message, 'Invalid status transition');
      return true;
    }
  );

  // Progressing Open -> Assigned without assignment must throw
  await assert.rejects(
    async () => {
      await incidentService.updateIncident(newTicket.id, {
        status: 'Assigned',
        assignedTo: '',
      });
    },
    (err) => {
      assert.equal(err.message, 'Assignment is required before progressing');
      return true;
    }
  );

  // Valid step: Open -> Assigned with designated assignee
  const assigned = await incidentService.updateIncident(newTicket.id, {
    status: 'Assigned',
    assignedTo: 'Electrician Team',
  });
  assert.equal(assigned.status, 'Assigned');
  assert.equal(assigned.assignedTo, 'Electrician Team');
  assert.equal(assigned.assignee, 'Electrician Team');

  // Valid step: Assigned -> In Progress
  const inProgress = await incidentService.updateIncident(newTicket.id, {
    status: 'In Progress',
  });
  assert.equal(inProgress.status, 'In Progress');

  // Progressing to Resolved without resolution remarks must throw
  await assert.rejects(
    async () => {
      await incidentService.updateIncident(newTicket.id, {
        status: 'Resolved',
        resolutionRemarks: '',
      });
    },
    (err) => {
      assert.equal(err.message, 'Resolution remarks are required');
      return true;
    }
  );

  // Valid step: In Progress -> Resolved with remarks
  const resolved = await incidentService.updateIncident(newTicket.id, {
    status: 'Resolved',
    resolutionRemarks: 'Replaced ballast and bulb; light functioning normally.',
  });
  assert.equal(resolved.status, 'Resolved');
  assert.equal(resolved.resolutionRemarks, 'Replaced ballast and bulb; light functioning normally.');

  // Valid step: Resolved -> Closed
  const closed = await incidentService.updateIncident(newTicket.id, {
    status: 'Closed',
  });
  assert.equal(closed.status, 'Closed');
});
