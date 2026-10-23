# API Contract — Blind Screening (Recruiter App)

Base URL: `VITE_API_BASE_URL` (default: `/api`)
Auth: JWT in `Authorization: Bearer <token>` header.

Mock mode: `VITE_USE_MOCK=true` serves all endpoints from in-memory seed data.

---

## Auth

### POST /auth/login
**Request**
```json
{ "email": "string", "password": "string" }
```
**Response 200**
```json
{
  "token": "jwt-string",
  "user": { "id": "string", "name": "string", "email": "string", "role": "recruiter" }
}
```
**Response 401**
```json
{ "error": "Invalid credentials" }
```

### POST /auth/logout
**Response 200** `{ "ok": true }`

### GET /auth/me
**Response 200**
```json
{ "id": "string", "name": "string", "email": "string", "role": "recruiter" }
```

---

## Jobs

### GET /jobs
**Response 200**
```json
{
  "jobs": [
    {
      "id": "string",
      "title": "string",
      "department": "string",
      "description": "string",
      "requiredSkills": ["string"],
      "codingProblem": "string",
      "submissionFormat": "make_test" | "dockerfile" | "repo_url",
      "submissionInstructions": "string",
      "testCases": [{ "id": "string", "input": "string", "expectedOutput": "string", "hidden": "boolean" }],
      "scoringWeights": { "codeQuality": "number", "testPassRate": "number", "problemSolving": "number", "technicalExplanation": "number" },
      "minQualifyingScore": "number",
      "status": "draft" | "published" | "closed",
      "createdAt": "iso8601",
      "applicantCount": "number",
      "qualifiedCount": "number",
      "needsReviewCount": "number",
      "shortlistLocked": "boolean",
      "identitiesRevealed": "boolean"
    }
  ]
}
```

### GET /jobs/:id
**Response 200** — single Job object (same shape as above, wrapped).

### POST /jobs
**Request** — CreateJobRequest
```json
{
  "title": "string",
  "department": "string",
  "description": "string",
  "requiredSkills": ["string"],
  "codingProblem": "string",
  "submissionFormat": "make_test" | "dockerfile" | "repo_url",
  "submissionInstructions": "string",
  "testCases": [{ "input": "string", "expectedOutput": "string", "hidden": "boolean" }],
  "scoringWeights": { "codeQuality": "number", "testPassRate": "number", "problemSolving": "number", "technicalExplanation": "number" },
  "minQualifyingScore": "number"
}
```
**Response 201** — created Job object.

### PATCH /jobs/:id/status
**Request**
```json
{ "status": "draft" | "published" | "closed" }
```
**Response 200** — updated Job object.

---

## Candidates

### GET /jobs/:id/candidates?offset=0&limit=10
Returns candidates sorted by score (highest first). Use offset+limit pagination with a `hasMore` flag.

**Response 200**
```json
{
  "candidates": [
    {
      "id": "string",
      "jobId": "string",
      "anonymousId": "string",
      "verdict": "qualified" | "needs_review" | "not_qualified",
      "status": "queued" | "anonymizing" | "scoring" | "done" | "failed",
      "overallScore": "number",
      "scores": { "codeQuality": "number", "testPassRate": "number", "problemSolving": "number", "technicalExplanation": "number" },
      "testPassCount": "number",
      "testTotalCount": "number",
      "integrityFlags": ["string"],
      "shortlisted": "boolean",
      "submittedAt": "iso8601",
      "revealedName": "string",
      "revealedEmail": "string",
      "revealedUniversity": "string",
      "revealedLinks": ["string"],
      "resumeUrl": "string | null",
      "githubRepoUrl": "string",
      "technicalExplanation": "string"
    }
  ],
  "hasMore": "boolean",
  "total": "number"
}
```

### GET /jobs/:id/candidates/:candidateId
Returns full candidate detail including `codeEvidence[]` and `testResults[]`.

**Response 200**
```json
{
  "candidate": {
    "...all fields above plus:",
    "codeEvidence": [{ "id": "string", "file": "string", "line": "number", "snippet": "string", "issue": "string" }],
    "testResults": [{ "name": "string", "passed": "boolean", "input": "string", "expected": "string", "actual": "string" }]
  }
}
```

### PATCH /jobs/:id/candidates/:candidateId/shortlist
**Request**
```json
{ "candidateId": "string", "shortlisted": "boolean" }
```
**Response 200** — updated Candidate object.

---

## Shortlist & Reveal

### POST /jobs/:id/shortlist/lock
Locks the shortlist. No further shortlist toggles allowed.

**Response 200**
```json
{ "ok": true, "job": { "...Job object with shortlistLocked: true" } }
```

### POST /jobs/:id/reveal
Reveals identity fields for shortlisted candidates only. Populates `revealedName`, `revealedEmail`, `revealedUniversity`, `revealedLinks`.

**Response 200**
```json
{ "ok": true, "job": { "...Job object with identitiesRevealed: true" } }
```

---

## Polling

Candidate scoring is asynchronous. The recruiter app polls `GET /jobs/:id/candidates` every 15 seconds. Each candidate has a `status` field: `queued → anonymizing → scoring → done` (or `failed`). Only `done` candidates have non-zero scores and verdicts.
