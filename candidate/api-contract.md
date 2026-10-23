# API Contract — Blind Screening (Candidate App)

Frontend only. Today every call below is served by the mock layer in `src/lib/api.ts`
(in-memory seed data + `localStorage`). When a backend exists, each function maps to the
endpoint shown here. Auth: `Authorization: Bearer <token>` on protected routes.

Candidates never receive recruiter-only data (scoring weights, hidden tests, cutoff score, scores, verdicts).

---

## Auth

### POST /auth/signup
Request
```json
{ "name": "Riya Sharma", "email": "riya@example.com", "password": "demo1234" }
```
Response 201
```json
{
  "token": "jwt-string",
  "user": { "id": "cand-001", "name": "Riya Sharma", "email": "riya@example.com", "role": "candidate" }
}
```
Response 409 `{ "error": "An account with this email already exists" }`

### POST /auth/login
Request
```json
{ "email": "riya@example.com", "password": "demo1234" }
```
Response 200 — same shape as signup.
Response 401 `{ "error": "Invalid email or password" }`

### POST /auth/logout
Response 200 `{ "ok": true }`

Seed login (mock): `riya@example.com` / `demo1234`

---

## Jobs (public, no token needed)

### GET /jobs
Returns published and closed jobs. The UI shows a "Closed" tag and disables Apply for closed ones.
Response 200
```json
{
  "jobs": [
    {
      "id": "job-001",
      "title": "Backend Engineering Intern",
      "company": "Northwind Labs",
      "department": "Engineering",
      "location": "Bengaluru",
      "workMode": "Remote | Hybrid | On-site",
      "startDate": "Immediately",
      "duration": "6 months",
      "stipend": "₹30,000 /month",
      "description": "string",
      "requiredSkills": ["Go", "PostgreSQL"],
      "codingProblem": "string",
      "problemRequirements": ["string"],
      "status": "published | closed",
      "postedAt": "2026-10-20T09:00:00Z",
      "applicantCount": 24
    }
  ]
}
```

### GET /jobs/:id
Response 200 `{ "job": { ...same fields as above } }`
Response 404 `{ "error": "This internship could not be found" }`

---

## Applications (token required)

### POST /jobs/:id/applications
`Content-Type: multipart/form-data`

| Part | Type | Rules |
|---|---|---|
| `resume` | file | PDF only, max 5 MB |
| `githubRepoUrl` | text | must match `https://github.com/<owner>/<repo>` |
| `technicalExplanation` | text | 150 to 2000 characters |

The text parts as JSON (for reference, sent as form fields, not as a JSON body):
```json
{
  "githubRepoUrl": "https://github.com/riya/rate-limiter",
  "technicalExplanation": "I implemented both strategies behind one Limiter interface..."
}
```
The `jobId` comes from the URL. The candidate is identified by the token, so no name or email is sent in the body.

Response 201
```json
{
  "application": {
    "id": "BS-7K2M9Q",
    "jobId": "job-001",
    "jobTitle": "Backend Engineering Intern",
    "company": "Northwind Labs",
    "githubRepoUrl": "https://github.com/riya/rate-limiter",
    "technicalExplanation": "string",
    "resumeFileName": "Riya_Resume.pdf",
    "resumeSizeBytes": 183422,
    "submittedAt": "2026-10-23T10:15:00Z",
    "status": "submitted"
  }
}
```
Errors
- 401 not signed in
- 403 `{ "error": "This internship is closed" }`
- 404 job not found
- 409 `{ "error": "You have already applied to this internship" }` (one submission per candidate per job, final)
- 413 resume larger than 5 MB
- 415 resume is not a PDF
- 422 invalid repo URL or explanation length

### GET /applications/me
Response 200 (newest first)
```json
{ "applications": [ { "id": "BS-7K2M9Q", "jobId": "job-001", "jobTitle": "string", "company": "string",
  "githubRepoUrl": "string", "technicalExplanation": "string", "resumeFileName": "string",
  "resumeSizeBytes": 183422, "submittedAt": "iso8601", "status": "submitted" } ] }
```
The listing page uses this to mark jobs as "Applied" and move them to the bottom.

### GET /applications/:id
Response 200 `{ "application": { ...same fields } }`
Response 404 if it does not exist or belongs to another candidate.

---

## Not sent to the backend
- The in-progress draft (repo URL and explanation) is autosaved in `localStorage` only.
- Theme choice (`bs_theme`).
- Candidates are never shown scores, verdicts or scoring status. `status` is always `"submitted"`.
