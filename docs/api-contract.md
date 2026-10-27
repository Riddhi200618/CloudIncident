# CloudIncident — API Gateway Contract Specification
**Target Backend:** AWS API Gateway + AWS Lambda + Amazon DynamoDB  
**Consumer:** CloudIncident React Frontend (`frontend/src`)  
**Status:** AGREED & FINALIZED FOR BACKEND INTEGRATION  
**Date:** October 2026 (Updated per backend architecture alignment)  
**Document Location:** `docs/api-contract.md`

---

## 1. Executive Summary & Architecture Overview

This document specifies the REST API contract between the **CloudIncident Frontend** and the teammate's **AWS Serverless Backend** (AWS API Gateway, AWS Lambda, and Amazon DynamoDB).

```
┌─────────────────────────┐          HTTPS (JSON)          ┌──────────────────────┐
│  CloudIncident Frontend │ ─────────────────────────────> │   AWS API Gateway    │
│  (React 19 + Vite UI)   │ <───────────────────────────── │    (REST / HTTP)     │
└─────────────────────────┘      CORS Enabled              └──────────┬───────────┘
                                                                      │ Lambda
                                                                      ▼ Proxy
                                                           ┌──────────────────────┐
                                                           │   AWS Lambda Handlers│
                                                           │ (Node.js / Python)   │
                                                           └──────────┬───────────┘
                                                                      │ CRUD
                                                                      ▼
                                                           ┌───────────────────────────┐
                                                           │      Amazon DynamoDB      │
                                                           │ `CloudIncident-Incidents` │
                                                           └───────────────────────────┘
```

### Environment & Integration Configuration
- **DynamoDB Target Table:** `CloudIncident-Incidents` (Partition Key: `incidentId`).
- **Base URL Setting:** Configured via `VITE_API_BASE_URL` in `frontend/.env` (e.g., `https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/prod`).
- **Mock Mode Toggle:** Controlled via `VITE_USE_MOCK_DATA`.
  - When `true` (default): Frontend reads from and writes to browser `localStorage` with mock delay.
  - When `false`: Frontend executes real HTTPS fetch requests via `frontend/src/services/api.js`.
- **Content Type:** All requests and responses use `Content-Type: application/json` and `Accept: application/json`.

---

## 2. Core Data Model & Attributes

The primary data entity is the **Incident**. Based on the frontend data model and campus operational workflow, the attributes are defined as follows:

| Attribute | Type | DynamoDB Type | Frontend Usage | Description |
| :--- | :--- | :--- | :--- | :--- |
| `incidentId` | `string` | `S` (Partition Key) | UI maps `id` / `incidentId` | Unique ticket identifier (UUID format, e.g., `"3fa85f64-5717-4562-b3fc-2c963f66afa6"`). |
| `title` | `string` | `S` | Required in forms & lists | High-level summary of the incident (min 6 chars). |
| `description` | `string` | `S` | Detailed triage card | Full incident description (min 15 chars). |
| `category` | `string` | `S` | Tagged badge & filter | Domain category (e.g., `"Network"`, `"IT Equipment"`). |
| `location` | `string` | `S` | Meta badge in tables | Physical campus location (building, floor, room). |
| `priority` | `string` | `S` | Color-coded urgency badge | Urgency tier: `"Low"`, `"Medium"`, `"High"`, `"Critical"`. |
| `reportedBy` | `string` | `S` | Meta card attribution | Name or department of reporter. |
| `assignedTo` | `string` | `S` | Assignee card & admin | Personnel/unit tasked with remediation (default `"Unassigned"`). |
| `status` | `string` | `S` | Progress bar & status tag | Workflow status: `"Open"`, `"Assigned"`, `"In Progress"`, `"Resolved"`, `"Closed"`. |
| `createdAt` | `string` | `S` | ISO 8601 UTC timestamp | Record creation time in UTC. |
| `updatedAt` | `string` | `S` | ISO 8601 UTC timestamp | Timestamp of last modification in UTC. |
| `resolutionRemarks` | `string` | `S` | Details resolution box | Remediation actions, diagnostic notes, or sign-off remarks. |
| `timeline` *(supplemental)* | `list` of `maps` | `L` | Timeline component | Array of lifecycle audit events: `[{ timestamp, status, actor, note }]`. |

> [!NOTE]
> **Attribute Reconciliation Note:**
> In the existing frontend mock files, `id` and `assignee` were initially used, while the backend contract standardizes on `incidentId` and `assignedTo`. The frontend service layer (`frontend/src/services/incidentService.js`) has been normalized so that **both property names are supported seamlessly** across all components.

---

## 3. Proposed API Endpoints

### 3.1 POST `/incidents` — Create an Incident

Creates a new campus incident ticket. Invoked by `ReportIncident.jsx` via `incidentService.createIncident()`.

#### Request
- **Method:** `POST`
- **Path:** `/incidents`
- **Headers:** `Content-Type: application/json`

**Payload Schema:**
```json
{
  "title": "string (required, min 6, max 120 chars)",
  "description": "string (required, min 15, max 2000 chars)",
  "category": "string (required, enum: IT Equipment | Network | Infrastructure | Maintenance | Safety | Other)",
  "location": "string (required, max 150 chars)",
  "priority": "string (required, enum: Low | Medium | High | Critical)",
  "reportedBy": "string (required, max 100 chars)",
  "assignedTo": "string (optional, defaults to 'Unassigned' if omitted)"
}
```

**Example Request:**
```json
{
  "title": "Core Switch Fiber Uplink Failure — CS Block B",
  "description": "The primary 10Gbps fiber uplink on the second floor rack disconnected unexpectedly. Computer Science labs are operating on high-latency fallback.",
  "category": "Network",
  "location": "Computer Science Building, Block B - Server Room 204",
  "priority": "Critical",
  "reportedBy": "Prof. Ramesh Kulkarni (Dept. Head)"
}
```

#### Success Response
- **Status Code:** `201 Created`
- **Headers:** `Content-Type: application/json`

**Response Schema:**
Returns the complete initialized incident record with server-generated fields (`incidentId`, `status: "Open"`, `createdAt`, `updatedAt`, `resolutionRemarks: ""`, and initial `timeline` event).

**Example Response:**
```json
{
  "incidentId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "title": "Core Switch Fiber Uplink Failure — CS Block B",
  "description": "The primary 10Gbps fiber uplink on the second floor rack disconnected unexpectedly. Computer Science labs are operating on high-latency fallback.",
  "category": "Network",
  "location": "Computer Science Building, Block B - Server Room 204",
  "priority": "Critical",
  "reportedBy": "Prof. Ramesh Kulkarni (Dept. Head)",
  "assignedTo": "Unassigned",
  "status": "Open",
  "createdAt": "2026-10-24T13:00:00Z",
  "updatedAt": "2026-10-24T13:00:00Z",
  "resolutionRemarks": "",
  "timeline": [
    {
      "timestamp": "2026-10-24T13:00:00Z",
      "status": "Open",
      "actor": "Prof. Ramesh Kulkarni (Dept. Head)",
      "note": "Incident logged and queued for evaluation."
    }
  ]
}
```

---

### 3.2 GET `/incidents` — List Incidents

Retrieves incidents, with optional server-side filtering and sorting. Invoked by `AllIncidents.jsx`, `Dashboard.jsx`, and `AdminManagement.jsx` through `IncidentContext.jsx`.

#### Request
- **Method:** `GET`
- **Path:** `/incidents`
- **Query Parameters (All Optional):**
  - `status` (`string`): Filter by status (`"Open"`, `"Assigned"`, `"In Progress"`, `"Resolved"`, `"Closed"`).
  - `category` (`string`): Filter by category domain (e.g., `"Network"`, `"Infrastructure"`).
  - `priority` (`string`): Filter by urgency (`"Low"`, `"Medium"`, `"High"`, `"Critical"`).
  - `search` (`string`): Case-insensitive substring query matched against `incidentId`, `title`, `location`, or `reportedBy`.
  - `limit` (`integer`, proposed): Maximum items per page (default `50`, max `100`).
  - `nextToken` (`string`, proposed): Pagination cursor for DynamoDB evaluation keys.

**Example Request:**
```http
GET /incidents?status=In%20Progress&category=Network HTTP/1.1
Host: api.example.com
Accept: application/json
```

#### Success Response
- **Status Code:** `200 OK`
- **Headers:** `Content-Type: application/json`

**Response Structure (Direct Array or Wrapped Object):**
The frontend service adapter supports either a direct array `[...]` or a wrapped envelope `{"incidents": [...]}`.

**Example Response (Direct Array — Frontend Default):**
```json
[
  {
    "incidentId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "title": "Core Switch Fiber Uplink Failure — CS Block B",
    "description": "The primary 10Gbps fiber uplink on the second floor rack disconnected unexpectedly.",
    "category": "Network",
    "location": "Computer Science Building, Block B - Server Room 204",
    "priority": "Critical",
    "reportedBy": "Prof. Ramesh Kulkarni (Dept. Head)",
    "assignedTo": "Alex Rivera (Network Ops Lead)",
    "status": "In Progress",
    "createdAt": "2026-10-23T09:15:00Z",
    "updatedAt": "2026-10-23T11:40:00Z",
    "resolutionRemarks": "SFP+ transceiver replaced; testing packet error rate before restoring routing.",
    "timeline": [
      {
        "timestamp": "2026-10-23T09:15:00Z",
        "status": "Open",
        "actor": "Prof. Ramesh Kulkarni",
        "note": "High latency and complete packet loss reported across Lab 3 and Lab 4."
      },
      {
        "timestamp": "2026-10-23T09:45:00Z",
        "status": "Assigned",
        "actor": "Campus Dispatch",
        "note": "Escalated to Tier-2 Network Operations Team."
      },
      {
        "timestamp": "2026-10-23T10:30:00Z",
        "status": "In Progress",
        "actor": "Alex Rivera",
        "note": "Diagnosed faulty LC optic module on patch panel port 18. Replacement initiated."
      }
    ]
  },
  {
    "incidentId": "8f3b2a1c-9d4e-4b7a-bc12-5e6f7a8b9c0d",
    "title": "HVAC Chiller Leak Threatening Server Rack 3",
    "description": "Ceiling condensation and line leakage observed directly above Rack 3.",
    "category": "Infrastructure",
    "location": "Central IT Data Center, Basement Level A",
    "priority": "High",
    "reportedBy": "Kavita Sundaram (SysAdmin)",
    "assignedTo": "Campus Facilities - HVAC Unit",
    "status": "In Progress",
    "createdAt": "2026-10-23T07:50:00Z",
    "updatedAt": "2026-10-23T09:20:00Z",
    "resolutionRemarks": "Temporary moisture deflector canopy installed.",
    "timeline": []
  }
]
```

> [!TIP]
> **DynamoDB Implementation Recommendation:**
> To sort by `createdAt DESC` efficiently without full table scans, create a Global Secondary Index (GSI) with a fixed partition key (e.g. `type = 'INCIDENT'`) and sort key `createdAt`.

---

### 3.3 GET `/incidents/{id}` — Retrieve a Single Incident

Retrieves the complete detail record and transition timeline for a specific incident. Invoked by `IncidentDetails.jsx` and `AdminManagement.jsx`.

#### Request
- **Method:** `GET`
- **Path:** `/incidents/{id}`
- **Path Parameter:**
  - `id` (`string`, required): The unique ticket ID (UUID format, e.g., `3fa85f64-5717-4562-b3fc-2c963f66afa6`). Lookups should be case-insensitive (or normalized to lowercase).

**Example Request:**
```http
GET /incidents/3fa85f64-5717-4562-b3fc-2c963f66afa6 HTTP/1.1
Host: api.example.com
Accept: application/json
```

#### Success Response
- **Status Code:** `200 OK`
- **Headers:** `Content-Type: application/json`

**Example Response:**
```json
{
  "incidentId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "title": "Core Switch Fiber Uplink Failure — CS Block B",
  "description": "The primary 10Gbps fiber uplink on the second floor rack disconnected unexpectedly. All research laboratories and computer labs in Block B are currently operating on high-latency fallback or without LAN access.",
  "category": "Network",
  "location": "Computer Science Building, Block B - Server Room 204",
  "priority": "Critical",
  "reportedBy": "Prof. Ramesh Kulkarni (Dept. Head)",
  "assignedTo": "Alex Rivera (Network Ops Lead)",
  "status": "In Progress",
  "createdAt": "2026-10-23T09:15:00Z",
  "updatedAt": "2026-10-23T11:40:00Z",
  "resolutionRemarks": "SFP+ transceiver replaced; testing packet error rate and CRC counters before restoring primary routing.",
  "timeline": [
    {
      "timestamp": "2026-10-23T09:15:00Z",
      "status": "Open",
      "actor": "Prof. Ramesh Kulkarni",
      "note": "High latency and complete packet loss reported across Lab 3 and Lab 4."
    },
    {
      "timestamp": "2026-10-23T09:45:00Z",
      "status": "Assigned",
      "actor": "Campus Dispatch",
      "note": "Escalated to Tier-2 Network Operations Team."
    },
    {
      "timestamp": "2026-10-23T10:30:00Z",
      "status": "In Progress",
      "actor": "Alex Rivera",
      "note": "Diagnosed faulty LC optic module on patch panel port 18. Replacement initiated."
    }
  ]
}
```

#### Error Response (Not Found)
- **Status Code:** `404 Not Found`
```json
{
  "error": "NOT_FOUND",
  "message": "Incident with ID '3fa85f64-5717-4562-b3fc-2c963f66afa6' was not found.",
  "statusCode": 404
}
```

---

### 3.4 PATCH `/incidents/{id}` — Update Assignment, Status, & Remarks

Updates mutable operational fields of an existing incident. Invoked by `AdminManagement.jsx` via `incidentService.updateIncident(id, patchData)`.

#### Request
- **Method:** `PATCH`
- **Path:** `/incidents/{id}`
- **Path Parameter:**
  - `id` (`string`, required): Incident UUID to update.
- **Headers:** `Content-Type: application/json`

**Payload Schema:**
```json
{
  "status": "string (optional, enum: Open | Assigned | In Progress | Resolved | Closed)",
  "assignedTo": "string (optional, technician or department unit)",
  "resolutionRemarks": "string (optional, remarks or remediation steps)",
  "updatedBy": "string (optional, campus dispatcher or admin actor for timeline attribution)"
}
```

**Example Request:**
```json
{
  "status": "Resolved",
  "assignedTo": "Alex Rivera (Network Ops Lead)",
  "resolutionRemarks": "Fiber link verified with OTDR at 0.02 dB loss. Core switch restored to production topology.",
  "updatedBy": "Alex Rivera"
}
```

#### Server-Side Behavior Requirements:
1. **Timestamp Update:** Lambda must update the `updatedAt` field to current UTC ISO 8601 (`new Date().toISOString()`).
2. **Audit Timeline Appending:** When `status` or `resolutionRemarks` changes, Lambda should append a new audit entry to the `timeline` list attribute:
   ```json
   {
     "timestamp": "2026-10-24T14:15:00Z",
     "status": "Resolved",
     "actor": "Alex Rivera",
     "note": "Status changed to Resolved: Fiber link verified with OTDR at 0.02 dB loss."
   }
   ```
3. **Idempotence / Safety:** Only fields supplied in the PATCH body should be modified; untouched attributes (`title`, `description`, `category`, `createdAt`, etc.) must remain intact.

#### Success Response
- **Status Code:** `200 OK`
- **Headers:** `Content-Type: application/json`

**Example Response:**
```json
{
  "incidentId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "title": "Core Switch Fiber Uplink Failure — CS Block B",
  "description": "The primary 10Gbps fiber uplink on the second floor rack disconnected unexpectedly.",
  "category": "Network",
  "location": "Computer Science Building, Block B - Server Room 204",
  "priority": "Critical",
  "reportedBy": "Prof. Ramesh Kulkarni (Dept. Head)",
  "assignedTo": "Alex Rivera (Network Ops Lead)",
  "status": "Resolved",
  "createdAt": "2026-10-23T09:15:00Z",
  "updatedAt": "2026-10-24T14:15:00Z",
  "resolutionRemarks": "Fiber link verified with OTDR at 0.02 dB loss. Core switch restored to production topology.",
  "timeline": [
    {
      "timestamp": "2026-10-23T09:15:00Z",
      "status": "Open",
      "actor": "Prof. Ramesh Kulkarni",
      "note": "High latency and complete packet loss reported across Lab 3 and Lab 4."
    },
    {
      "timestamp": "2026-10-23T09:45:00Z",
      "status": "Assigned",
      "actor": "Campus Dispatch",
      "note": "Escalated to Tier-2 Network Operations Team."
    },
    {
      "timestamp": "2026-10-23T10:30:00Z",
      "status": "In Progress",
      "actor": "Alex Rivera",
      "note": "Diagnosed faulty LC optic module on patch panel port 18. Replacement initiated."
    },
    {
      "timestamp": "2026-10-24T14:15:00Z",
      "status": "Resolved",
      "actor": "Alex Rivera",
      "note": "Status changed to Resolved: Fiber link verified with OTDR at 0.02 dB loss."
    }
  ]
}
```

---

### 3.5 GET `/stats` — Dashboard Statistics

Returns aggregated metrics required for `Dashboard.jsx`, the 4 hero stat cards, the telemetry ratio bar, and `CategoryDistribution.jsx`.

#### Request
- **Method:** `GET`
- **Path:** `/stats`
- **Headers:** `Accept: application/json`

#### Success Response
- **Status Code:** `200 OK`
- **Headers:** `Content-Type: application/json`

**Required Response Schema:**
```json
{
  "total": "integer (total incident count)",
  "open": "integer (status === 'Open')",
  "inProgress": "integer (status === 'In Progress')",
  "assigned": "integer (status === 'Assigned')",
  "resolved": "integer (status === 'Resolved' or 'Closed')",
  "critical": "integer (priority === 'Critical')",
  "categoryCounts": {
    "IT Equipment": "integer",
    "Network": "integer",
    "Infrastructure": "integer",
    "Maintenance": "integer",
    "Safety": "integer",
    "Other": "integer"
  },
  "priorityCounts": {
    "Low": "integer",
    "Medium": "integer",
    "High": "integer",
    "Critical": "integer"
  }
}
```

**Example Response:**
```json
{
  "total": 6,
  "open": 1,
  "inProgress": 2,
  "assigned": 1,
  "resolved": 2,
  "critical": 1,
  "categoryCounts": {
    "Network": 1,
    "Infrastructure": 1,
    "IT Equipment": 2,
    "Safety": 1,
    "Maintenance": 1,
    "Other": 0
  },
  "priorityCounts": {
    "Low": 1,
    "Medium": 2,
    "High": 2,
    "Critical": 1
  }
}
```

> [!NOTE]
> **Backend Aggregation Strategy:**
> For small datasets (< 1,000 items), Lambda can compute these counts on demand during table query. For high throughput, DynamoDB Streams or an atomic stats summary counter item can be maintained.

---

## 4. Validation Rules Matrix

| Field | Location | Validation Rule | Error on Breach |
| :--- | :--- | :--- | :--- |
| `title` | POST `/incidents` | Required. Trimmed string. Length between **6** and **120** characters. | `400 Bad Request` ("Title must be at least 6 characters.") |
| `description` | POST `/incidents` | Required. Trimmed string. Length between **15** and **2000** characters. | `400 Bad Request` ("Description must be at least 15 characters.") |
| `category` | POST `/incidents` | Required. Must be one of the 6 allowed category enums. | `400 Bad Request` ("Invalid category.") |
| `location` | POST `/incidents` | Required. Trimmed string. Non-empty, max 150 characters. | `400 Bad Request` ("Location is required.") |
| `priority` | POST `/incidents` | Required. Must be one of the 4 allowed priority enums. | `400 Bad Request` ("Invalid priority tier.") |
| `reportedBy` | POST `/incidents` | Required. Trimmed string. Non-empty, max 100 characters. | `400 Bad Request` ("Reported by is required.") |
| `status` | PATCH `/incidents/{id}` | Optional. If provided, must match one of the 5 status enums. | `400 Bad Request` ("Invalid status state.") |
| `assignedTo` | PATCH `/incidents/{id}` | Optional. Trimmed string, max 100 characters. | `400 Bad Request` |
| `resolutionRemarks` | PATCH `/incidents/{id}` | Optional. String, max 2000 characters. | `400 Bad Request` |
| `id` / `incidentId` | Path param | Valid UUID format matching `^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$` (standard RFC 4122 UUID). | `400 Bad Request` / `404 Not Found` |

### Allowed Enumerations

#### 1. Category (`category`)
Exact case-sensitive strings confirmed by `frontend/src/data/mockIncidents.js`:
- `"IT Equipment"`
- `"Network"`
- `"Infrastructure"`
- `"Maintenance"`
- `"Safety"`
- `"Other"`

#### 2. Priority (`priority`)
Exact case-sensitive strings confirmed by `frontend/src/components/PriorityBadge.jsx`:
- `"Low"` (Color: Emerald green `#2B5A3C`)
- `"Medium"` (Color: Amber `#D97706`)
- `"High"` (Color: Rose red `#C2415E`)
- `"Critical"` (Color: Deep burgundy `#501B24`)

#### 3. Status Workflow (`status`)
Exact case-sensitive strings confirmed by `frontend/src/components/StatusBadge.jsx`:
- `"Open"` (Initial state upon ticket creation)
- `"Assigned"` (Assigned to technician or facilities unit)
- `"In Progress"` (Active physical remediation underway)
- `"Resolved"` (Remediation completed and verified)
- `"Closed"` (Ticket archived and administrative sign-off completed)

---

## 5. Error Response Format

The frontend API client (`frontend/src/services/api.js`) parses error responses using:
```javascript
const errorJson = await response.json();
errorDetail = errorJson.message || errorJson.error || errorDetail;
```

To provide actionable messages to both the UI error toast and debug modal, the backend must return a standardized JSON error envelope:

```json
{
  "error": "BAD_REQUEST",
  "message": "Title must be at least 6 characters.",
  "statusCode": 400,
  "details": [
    {
      "field": "title",
      "message": "Title must be at least 6 characters."
    }
  ]
}
```

### Standard Status Codes

| HTTP Status | Reason | Trigger Scenario |
| :--- | :--- | :--- |
| `400 Bad Request` | Client validation error | Missing required field, failed length check, or invalid enum value. |
| `404 Not Found` | Resource missing | Requested `incidentId` does not exist in DynamoDB. |
| `409 Conflict` | Optimistic lock / duplicate | Unique ID collision or conflicting simultaneous status update. |
| `422 Unprocessable` | Business rule breach | Invalid lifecycle transition (e.g. attempting to jump Closed → Assigned without remark). |
| `500 Internal Error` | Server/Lambda exception | Unhandled exception, DynamoDB timeout, or AWS SDK fault. |
| `502 Bad Gateway` | Gateway failure | Lambda execution crash or API Gateway integration mapping error. |

---

## 6. Identifiers, Formatting, and Conventions

### 6.1 Incident ID Format
- **Agreed Decision:** UUID-based ticket identifiers.
- **Proposed Specification:** Standard RFC 4122 UUID v4 format (36-character canonical lowercase hexadecimal string with hyphens: `xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx`, e.g., `3fa85f64-5717-4562-b3fc-2c963f66afa6`).
- **Regular Expression:** `^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$`
- **Case Sensitivity & Normalization:** Lookups in API Gateway / Lambda handlers should handle UUIDs case-insensitively or convert to canonical lowercase prior to DynamoDB key querying.
- **DynamoDB Keying:** Stored under the primary partition key attribute `incidentId` (`S`) in the `CloudIncident-Incidents` table.

### 6.2 Timestamp Format
- **Specification:** ISO 8601 UTC format (`YYYY-MM-DDTHH:mm:ssZ` or `YYYY-MM-DDTHH:mm:ss.sssZ`).
- **Examples:** `"2026-10-24T18:30:00Z"`, `"2026-10-23T09:15:00.000Z"`.
- **Requirement:** All timestamps (`createdAt`, `updatedAt`, `timeline[].timestamp`) must be stored and returned in UTC (`Z` suffix). The frontend UI localizes dates for the client's time zone.

---

## 7. CORS Requirements for AWS API Gateway

When `VITE_USE_MOCK_DATA=false`, browser security enforces Cross-Origin Resource Sharing (CORS) against the AWS API Gateway base URL.

API Gateway must be configured with the following CORS headers across all endpoints (`/incidents`, `/incidents/{id}`, `/stats`):

| CORS Header | Value | Notes |
| :--- | :--- | :--- |
| `Access-Control-Allow-Origin` | `http://localhost:5173`, `http://127.0.0.1:5173`, `<production-frontend-domain>` | Local Vite dev server origin + deployed frontend origin. |
| `Access-Control-Allow-Methods` | `GET, POST, PATCH, OPTIONS` | All methods used by the frontend. |
| `Access-Control-Allow-Headers` | `Content-Type, Accept, Authorization, X-Amz-Date, X-Api-Key, X-Amz-Security-Token` | Enables standard JSON requests and future auth headers. |
| `Access-Control-Max-Age` | `86400` (24 hours) | Caches preflight `OPTIONS` results to reduce round-trips. |

### API Gateway Mock OPTIONS Configuration
An `OPTIONS` mock integration must be defined on `/incidents`, `/incidents/{id}`, and `/stats` returning HTTP `200` with the above headers so browser preflight checks pass without invoking Lambda.

---

## 8. Confirmation & Agreement Matrix

To ensure seamless integration between frontend and backend developers, the table below documents agreed decisions and open implementation questions:

### 8.1 Agreed Decisions & Confirmed Specifications
- [x] **DynamoDB Table Name:** `CloudIncident-Incidents`.
- [x] **DynamoDB Partition Key:** `incidentId` (`S`).
- [x] **Assignee Field Name:** `assignedTo` (`S`).
- [x] **History Field Name:** `timeline` (`L` of maps with `{ timestamp, status, actor, note }`).
- [x] **ID Format:** UUID-based (replacing sequential `INC-xxxx` IDs).
- [x] **Target Routes (5):**
  - `POST /incidents`
  - `GET /incidents`
  - `GET /incidents/{id}`
  - `PATCH /incidents/{id}`
  - `GET /stats`
- [x] **Status Lifecycle (5 States):** `Open` → `Assigned` → `In Progress` → `Resolved` → `Closed`.
- [x] **Initial Status on Creation:** Always starts as `"Open"`.
- [x] **Stats Metrics Schema:** Keys `total`, `open`, `inProgress`, `assigned`, `resolved`, `critical`, `categoryCounts`, `priorityCounts` are required for dashboard rendering.
- [x] **Audit Timeline Structure:** Array of objects with `{ timestamp, status, actor, note }`.
- [x] **Error Response Envelope:** Expects JSON containing `.message` (or `.errorMessage` / `.error`).

### 8.2 Questions Requiring Backend Developer Confirmation Before Live Integration
- [ ] **Exact UUID Generator / Format:** Does Lambda generate standard lowercase RFC 4122 v4 UUIDs (e.g., `3fa85f64-5717-4562-b3fc-2c963f66afa6`) via Node `crypto.randomUUID()` / `uuidv4()`, or does it prepend a prefix (e.g., `INC-...`)?
- [ ] **`GET /incidents` List-Response Shape:** Does Lambda return a direct JSON array `[...]` or an envelope object (e.g., `{"incidents": [...]}` or `{"items": [...]}`)?
- [ ] **List Pagination:** Does `GET /incidents` paginate results (e.g. `limit` and `nextToken` / `LastEvaluatedKey`), or return all incidents in the table? If paginated, does the backend support fetching all records or pass a pagination cursor?
- [ ] **Single Incident Response Envelope:** Do `GET /incidents/{id}`, `POST /incidents`, and `PATCH /incidents/{id}` return the incident object directly at root (`{ "incidentId": "...", ... }`), or wrapped in `{"incident": {...}}` / `{"item": {...}}`?
- [ ] **`GET /stats` Endpoint Implementation:** Is `GET /stats` actively deployed as a dedicated Lambda route? Does `categoryCounts` contain keys for all 6 categories (with 0 if no incidents exist), and does `priorityCounts` contain all 4 priorities (`Low`, `Medium`, `High`, `Critical`)?
- [ ] **Server-Side Filtering on `GET /incidents`:** Does Lambda execute DynamoDB query/filter expressions for `?status=...&category=...&priority=...&search=...`, or is filtering left to the client?
- [ ] **Timeline Creation & Mutation Ownership:** Does Lambda automatically generate the initial `timeline` event on `POST /incidents` and append transition events on `PATCH /incidents/{id}`? Is `updatedBy` accepted from the PATCH body for actor attribution?
- [ ] **CORS Configuration on API Gateway:** Are CORS headers (`Access-Control-Allow-Origin: *` or allowed origins, `Access-Control-Allow-Methods: GET, POST, PATCH, OPTIONS`, and `Access-Control-Allow-Headers`) and mock `OPTIONS` integrations deployed for all 5 routes?
- [ ] **Authentication / Authorization:** Does `/prod` require an API Key (`x-api-key`), AWS IAM signature, or Cognito JWT token (`Authorization: Bearer <token>`)?

---

## 9. Frontend Compatibility & Service Layer Mapping

The frontend service layer (`frontend/src/services/incidentService.js` and `frontend/src/services/api.js`) bridges UI conventions and backend DynamoDB specifications:

1. **`id` vs `incidentId` Property Normalization:**
   - *Mapping:* `normalizeIncident()` guarantees that both `.id` and `.incidentId` point to the ticket identifier across all components.
2. **`assignee` vs `assignedTo` Request Sanitization:**
   - *Mapping:* When dispatching `POST /incidents` and `PATCH /incidents/{id}`, the service layer maps frontend `assignee` to `assignedTo` and strips `assignee` from outgoing wire payloads, ensuring strict conformance with the agreed DynamoDB schema.
3. **`timeline` Array Persistence:**
   - *Mapping:* Documented `timeline` as the official history attribute; `normalizeIncident` ensures fallback to `[]` if undefined.
4. **List Response Flexibility:**
   - *Mapping:* `incidentService.getIncidents()` unpacks direct arrays (`[...]`), `{ incidents: [...] }`, `{ items: [...] }`, or `{ data: [...] }`.
5. **Single Incident Response Flexibility:**
   - *Mapping:* `incidentService.getIncidentById()` unpacks direct root objects, `{ incident: {...} }`, or `{ item: {...} }`.
6. **Dashboard Statistics Safeguards:**
   - *Mapping:* `incidentService.getStats()` provides fallback defaults ensuring all keys default to `0` or empty objects to prevent `NaN` during UI aggregation.
7. **UUID-Based Mock Generation:**
   - *Mapping:* Local mock mode generates RFC-compliant UUIDs via `crypto.randomUUID()` to mirror production backend behavior.
