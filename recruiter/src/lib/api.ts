import type {
  Job,
  Candidate,
  LoginRequest,
  LoginResponse,
  CreateJobRequest,
  AuthUser,
  JobStatus,
  PaginatedCandidates,
  CodeEvidence,
  TestResult,
} from '@/types';
import { seedJobs, candidateStore, getRevealedCandidate } from '@/data/seed';

const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false';
const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

// ─── In-memory mutable store ──────────────────────────────────

const store = {
  jobs: [...seedJobs] as Job[],
  candidates: { ...candidateStore } as Record<string, Candidate[]>,
  currentToken: null as string | null,
  currentUser: null as AuthUser | null,
};

function delay(ms = 400) {
  return new Promise((r) => setTimeout(r, ms));
}

function clone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

// ─── Auth ──────────────────────────────────────────────────────

async function login(req: LoginRequest): Promise<LoginResponse> {
  await delay(500);
  if (USE_MOCK) {
    // Accept any non-empty email/password
    if (!req.email || !req.password) throw new Error('Invalid credentials');
    const user: AuthUser = {
      id: 'recruiter-001',
      name: 'Sarah Chen',
      email: req.email,
      role: 'recruiter',
    };
    const token = `mock-jwt-${Date.now()}`;
    store.currentToken = token;
    store.currentUser = user;
    localStorage.setItem('bs_token', token);
    localStorage.setItem('bs_user', JSON.stringify(user));
    return { token, user };
  }
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req),
  });
  if (!res.ok) throw new Error('Invalid credentials');
  return res.json();
}

async function logout(): Promise<void> {
  localStorage.removeItem('bs_token');
  localStorage.removeItem('bs_user');
  store.currentToken = null;
  store.currentUser = null;
}

function getStoredUser(): AuthUser | null {
  const raw = localStorage.getItem('bs_user');
  return raw ? JSON.parse(raw) : null;
}

function getStoredToken(): string | null {
  return localStorage.getItem('bs_token');
}

// ─── Jobs ──────────────────────────────────────────────────────

async function getJobs(): Promise<Job[]> {
  await delay(300);
  if (USE_MOCK) return clone(store.jobs);
  const res = await fetch(`${API_BASE}/jobs`, { headers: authHeaders() });
  if (!res.ok) throw new Error('Failed to fetch jobs');
  const data = await res.json();
  return data.jobs;
}

async function getJob(id: string): Promise<Job> {
  await delay(200);
  if (USE_MOCK) {
    const job = store.jobs.find((j) => j.id === id);
    if (!job) throw new Error('Job not found');
    return clone(job);
  }
  const res = await fetch(`${API_BASE}/jobs/${id}`, { headers: authHeaders() });
  if (!res.ok) throw new Error('Job not found');
  const data = await res.json();
  return data.job;
}

async function createJob(req: CreateJobRequest): Promise<Job> {
  await delay(600);
  if (USE_MOCK) {
    const job: Job = {
      id: `job-${Date.now()}`,
      ...req,
      testCases: req.testCases.map((tc, i) => ({ ...tc, id: `tc-${Date.now()}-${i}` })),
      status: 'draft',
      createdAt: new Date().toISOString(),
      applicantCount: 0,
      qualifiedCount: 0,
      needsReviewCount: 0,
      shortlistLocked: false,
      identitiesRevealed: false,
    };
    store.jobs.unshift(job);
    store.candidates[job.id] = [];
    return clone(job);
  }
  const res = await fetch(`${API_BASE}/jobs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(req),
  });
  if (!res.ok) throw new Error('Failed to create job');
  const data = await res.json();
  return data.job;
}

async function updateJobStatus(id: string, status: JobStatus): Promise<Job> {
  await delay(300);
  if (USE_MOCK) {
    const job = store.jobs.find((j) => j.id === id);
    if (!job) throw new Error('Job not found');
    job.status = status;
    return clone(job);
  }
  const res = await fetch(`${API_BASE}/jobs/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error('Failed to update job');
  return res.json();
}

// ─── Candidates ────────────────────────────────────────────────

async function getCandidates(
  jobId: string,
  offset: number,
  limit: number
): Promise<PaginatedCandidates> {
  await delay(350);
  if (USE_MOCK) {
    const all = store.candidates[jobId] || [];
    const sorted = [...all].sort((a, b) => b.overallScore - a.overallScore);
    const slice = sorted.slice(offset, offset + limit);
    const job = store.jobs.find((j) => j.id === jobId);
    // If identities revealed, populate revealed fields for shortlisted candidates
    const enriched = slice.map((c, i) => {
      if (c.shortlisted && job?.identitiesRevealed) {
        return clone(getRevealedCandidate(c, offset + i));
      }
      return clone(c);
    });
    return {
      candidates: enriched,
      hasMore: offset + limit < sorted.length,
      total: sorted.length,
    };
  }
  const res = await fetch(`${API_BASE}/jobs/${jobId}/candidates?offset=${offset}&limit=${limit}`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error('Failed to fetch candidates');
  return res.json();
}

async function getCandidate(jobId: string, candidateId: string): Promise<Candidate> {
  await delay(250);
  if (USE_MOCK) {
    const all = store.candidates[jobId] || [];
    const c = all.find((c) => c.id === candidateId);
    if (!c) throw new Error('Candidate not found');
    const job = store.jobs.find((j) => j.id === jobId);
    let result = clone(c);
    if (c.shortlisted && job?.identitiesRevealed) {
      const idx = all.findIndex((x) => x.id === candidateId);
      result = clone(getRevealedCandidate(c, idx));
    }
    return result;
  }
  const res = await fetch(`${API_BASE}/jobs/${jobId}/candidates/${candidateId}`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error('Candidate not found');
  const data = await res.json();
  return data.candidate;
}

async function toggleShortlist(jobId: string, candidateId: string, shortlisted: boolean): Promise<Candidate> {
  await delay(200);
  if (USE_MOCK) {
    const job = store.jobs.find((j) => j.id === jobId);
    if (job?.shortlistLocked) throw new Error('Shortlist is locked');
    const all = store.candidates[jobId] || [];
    const c = all.find((c) => c.id === candidateId);
    if (!c) throw new Error('Candidate not found');
    c.shortlisted = shortlisted;
    return clone(c);
  }
  const res = await fetch(`${API_BASE}/jobs/${jobId}/candidates/${candidateId}/shortlist`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ candidateId, shortlisted }),
  });
  if (!res.ok) throw new Error('Failed to toggle shortlist');
  return res.json();
}

async function lockShortlist(jobId: string): Promise<Job> {
  await delay(300);
  if (USE_MOCK) {
    const job = store.jobs.find((j) => j.id === jobId);
    if (!job) throw new Error('Job not found');
    job.shortlistLocked = true;
    return clone(job);
  }
  const res = await fetch(`${API_BASE}/jobs/${jobId}/shortlist/lock`, {
    method: 'POST',
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error('Failed to lock shortlist');
  return res.json();
}

async function revealIdentities(jobId: string): Promise<Job> {
  await delay(500);
  if (USE_MOCK) {
    const job = store.jobs.find((j) => j.id === jobId);
    if (!job) throw new Error('Job not found');
    if (!job.shortlistLocked) throw new Error('Must lock shortlist before revealing identities');
    job.identitiesRevealed = true;
    return clone(job);
  }
  const res = await fetch(`${API_BASE}/jobs/${jobId}/reveal`, {
    method: 'POST',
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error('Failed to reveal identities');
  return res.json();
}

// ─── Helpers ───────────────────────────────────────────────────

function authHeaders(): Record<string, string> {
  const token = getStoredToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const api = {
  login,
  logout,
  getStoredUser,
  getStoredToken,
  getJobs,
  getJob,
  createJob,
  updateJobStatus,
  getCandidates,
  getCandidate,
  toggleShortlist,
  lockShortlist,
  revealIdentities,
};

export type { CodeEvidence, TestResult };
