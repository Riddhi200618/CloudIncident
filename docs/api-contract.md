# CloudIncident — API Gateway Contract Specification
**Target Backend:** AWS API Gateway + AWS Lambda + Amazon DynamoDB  
**Consumer:** CloudIncident React Frontend (`frontend/src`)  
**Status:** PROPOSED & READY FOR BACKEND REVIEW  
**Date:** October 2026  
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
                                                           ┌──────────────────────┐
                                                           │   Amazon DynamoDB    │
                                                           │   (Incidents Table)  │
                                                           └──────────────────────┘
```

### Environment & Integration Configuration
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
| `incidentId` | `string` | `S` (Partition Key) | UI maps `id` / `incidentId` | Unique ticket identifier (e.g., `"INC-1048"`). |
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
  "incidentId": "INC-1049",
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
    "incidentId": "INC-1048",
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
    "incidentId": "INC-1047",
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
  - `id` (`string`, required): The unique ticket ID (e.g., `INC-1048`). Lookups should be case-insensitive (or normalized to uppercase).

**Example Request:**
```http
GET /incidents/INC-1048 HTTP/1.1
Host: api.example.com
Accept: application/json
```

#### Success Response
- **Status Code:** `200 OK`
- **Headers:** `Content-Type: application/json`

**Example Response:**
```json
{
  "incidentId": "INC-1048",
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
  "message": "Incident with ID 'INC-9999' was not found.",
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
  - `id` (`string`, required): Incident ID to update.
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
  "incidentId": "INC-1048",
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
| `id` / `incidentId` | Path param | Valid ID format matching `^INC-[A-Za-z0-9_-]+$`. | `400 Bad Request` / `404 Not Found` |

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
- **Format:** `INC-<number>` (e.g., `INC-1048`, `INC-1049`).
- **Regular Expression:** `^INC-[A-Za-z0-9_-]+$`
- **Case Sensitivity:** Lookups in API Gateway should handle case-insensitively or convert `{id}` to uppercase (e.g., `inc-1048` → `INC-1048`).
- **Proposed DynamoDB ID Strategy:** In a distributed serverless environment, generating sequential IDs requires an atomic counter item. Alternatively, a short alphanumeric hash (`INC-8A42F`) or UUID prefix can be agreed upon.

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

To ensure clear ownership between frontend and backend developers, the table below highlights what is already established and what requires mutual agreement:

### 8.1 Confirmed by Existing Frontend Implementation
- [x] **5 Target Endpoints:** `POST /incidents`, `GET /incidents`, `GET /incidents/{id}`, `PATCH /incidents/{id}`, `GET /stats`.
- [x] **Creation Payload Fields:** `title`, `description`, `category`, `location`, `priority`, `reportedBy`.
- [x] **Validation Minimum Lengths:** `title` (>= 6 chars), `description` (>= 15 chars), non-empty `location`, non-empty `reportedBy`.
- [x] **Category Enum Set:** `["IT Equipment", "Network", "Infrastructure", "Maintenance", "Safety", "Other"]`.
- [x] **Priority Enum Set:** `["Low", "Medium", "High", "Critical"]`.
- [x] **Status Enum Set:** `["Open", "Assigned", "In Progress", "Resolved", "Closed"]`.
- [x] **Default Creation Status:** Always starts as `"Open"`.
- [x] **Stats Metrics Schema:** Keys `total`, `open`, `inProgress`, `assigned`, `resolved`, `critical`, `categoryCounts`, `priorityCounts` are required for dashboard rendering.
- [x] **Audit Timeline Structure:** Array of objects with `{ timestamp, status, actor, note }`.
- [x] **Error Body Parsing:** Expects JSON containing a `.message` or `.error` property.

### 8.2 Proposed Conventions Requiring Backend Teammate Agreement
- [ ] **ID Attribute Name (`incidentId` vs `id`):** Frontend normalized to handle both. Teammate to confirm DynamoDB partition key name (proposed: `incidentId`).
- [ ] **Assignee Attribute Name (`assignedTo` vs `assignee`):** Frontend normalized to handle both. Teammate to confirm DynamoDB attribute name (proposed: `assignedTo`).
- [ ] **ID Generation Strategy:** Sequential integer (`INC-1049` via atomic counter) vs alphanumeric hash / UUID (e.g., `INC-8F12B`).
- [ ] **List Response Format:** Direct JSON array `[...]` vs wrapped object `{"incidents": [...], "count": N, "nextToken": "..."}`.
- [ ] **Server-Side Query Filtering:** Confirmation of whether Lambda will handle `?status=...&category=...` or if frontend continues client-side filtering.
- [ ] **Audit Timeline Ownership:** Confirmation that Lambda automatically creates initial timeline event on `POST` and appends transition event on `PATCH`.
- [ ] **Actor Identification on PATCH:** Whether `updatedBy` is supplied in the request body (current UI behavior) or extracted from AWS Cognito / API Gateway request context.
- [ ] **Authentication / Authorization:** Whether API Key (`x-api-key`) or AWS Cognito JWT tokens (`Authorization: Bearer <token>`) will be required for `/prod`.

---

## 9. Frontend Compatibility & Reported Inconsistencies

During code inspection and build verification (`npm run build`), the following potential inconsistencies between the raw UI mock code and the target backend contract were detected and resolved in the frontend service layer:

1. **`id` vs `incidentId` Property Mismatch:**
   - *Inconsistency:* The UI templates (`IncidentTable.jsx`, `IncidentDetails.jsx`, `AdminManagement.jsx`) referenced `.id`, whereas the proposed data model specification defines `incidentId`.
   - *Resolution:* Added `normalizeIncident()` in `frontend/src/services/incidentService.js` that maps `id: inc.incidentId || inc.id` and `incidentId: inc.incidentId || inc.id`.
2. **`assignee` vs `assignedTo` Field Mismatch:**
   - *Inconsistency:* The UI forms and badges referenced `.assignee`, whereas the proposed backend model specifies `assignedTo`.
   - *Resolution:* Normalized both properties in `incidentService.js` so both outgoing and incoming payloads support `assignedTo` and `assignee` simultaneously.
3. **`timeline` Array Persistence:**
   - *Inconsistency:* The 12-field starting model did not explicitly list `timeline`, but `IncidentDetails.jsx` relies on `incident.timeline` to render the transition history.
   - *Resolution:* Documented `timeline` as a supplemental list attribute and preserved fallback defaults in `normalizeIncident`.
4. **GET `/incidents` Query Parameter Construction:**
   - *Inconsistency:* `incidentService.getIncidents()` previously accepted no arguments, whereas the contract specifies query parameters (`status`, `category`, `priority`, `search`).
   - *Resolution:* Updated `incidentService.getIncidents(filters)` to serialize query parameters when `VITE_USE_MOCK_DATA=false`.
5. **Dashboard Statistics Safeguards:**
   - *Inconsistency:* `Dashboard.jsx` calculates `inProgressCount = stats.inProgress + (stats.assigned || 0)`. If the backend returns partial stats, `undefined` addition could cause `NaN`.
   - *Resolution:* Added fallback default values in `incidentService.getStats()` ensuring all keys default to `0` or empty objects.
