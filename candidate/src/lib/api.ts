/**
 * Mock API layer — frontend only, no backend.
 * Every function notes the endpoint it will map to later (see api-contract.md).
 * Data lives in memory (seed) + localStorage (accounts and applications).
 */
import type {
  Job, Application, AuthUser, AuthResponse, LoginRequest, SignupRequest, SubmitApplicationRequest,
} from '@/types';
import { seedJobs, SEED_CANDIDATE } from '@/data/seed';

const K = {
  token: 'bs_c_token',
  user: 'bs_c_user',
  users: 'bs_c_users', // accounts created through sign up
  apps: 'bs_c_apps', // { [userId]: Application[] }
  draft: (uid: string, jobId: string) => `bs_c_draft_${uid}_${jobId}`,
};

const delay = (ms = 350) => new Promise((r) => setTimeout(r, ms));
const read = <T,>(key: string, fallback: T): T => {
  try { const raw = localStorage.getItem(key); return raw ? (JSON.parse(raw) as T) : fallback; } catch { return fallback; }
};
const write = (key: string, value: unknown) => localStorage.setItem(key, JSON.stringify(value));

interface StoredUser extends AuthUser { password: string }

/** Drop the stored password before a user object leaves the mock store. */
function toAuthUser(u: StoredUser): AuthUser {
  const copy: Partial<StoredUser> = { ...u };
  delete copy.password;
  return copy as AuthUser;
}

function allApps(): Record<string, Application[]> { return read(K.apps, {}); }
function currentUser(): AuthUser {
  const u = read<AuthUser | null>(K.user, null);
  if (!u) throw new Error('Please sign in to continue');
  return u;
}

// ─── Auth ──────────────────────────────────────────────────────
function startSession(user: AuthUser): AuthResponse {
  const token = `mock-jwt-${Date.now()}`;
  localStorage.setItem(K.token, token);
  write(K.user, user);
  return { token, user };
}

/** POST /auth/login */
async function login(req: LoginRequest): Promise<AuthResponse> {
  await delay(500);
  const email = req.email.trim().toLowerCase();
  if (email === SEED_CANDIDATE.user.email && req.password === SEED_CANDIDATE.password) {
    return startSession(SEED_CANDIDATE.user);
  }
  const found = read<StoredUser[]>(K.users, []).find((u) => u.email === email && u.password === req.password);
  if (!found) throw new Error('Invalid email or password');
  return startSession(toAuthUser(found));
}

/** POST /auth/signup */
async function signup(req: SignupRequest): Promise<AuthResponse> {
  await delay(600);
  const email = req.email.trim().toLowerCase();
  const users = read<StoredUser[]>(K.users, []);
  if (email === SEED_CANDIDATE.user.email || users.some((u) => u.email === email)) {
    throw new Error('An account with this email already exists');
  }
  const user: StoredUser = { id: `cand-${Date.now()}`, name: req.name.trim(), email, role: 'candidate', password: req.password };
  write(K.users, [...users, user]);
  return startSession(toAuthUser(user));
}

/** POST /auth/logout */
async function logout(): Promise<void> {
  localStorage.removeItem(K.token);
  localStorage.removeItem(K.user);
}

const getStoredUser = (): AuthUser | null => read<AuthUser | null>(K.user, null);

// ─── Jobs (public) ─────────────────────────────────────────────
function withCounts(job: Job): Job {
  const mine = Object.values(allApps()).flat().filter((a) => a.jobId === job.id).length;
  return { ...job, applicantCount: job.applicantCount + mine };
}

/** GET /jobs  — published and closed jobs, no auth needed */
async function getJobs(): Promise<Job[]> {
  await delay();
  return seedJobs.map(withCounts);
}

/** GET /jobs/:id */
async function getJob(id: string): Promise<Job> {
  await delay(200);
  const job = seedJobs.find((j) => j.id === id);
  if (!job) throw new Error('This internship could not be found');
  return withCounts(job);
}

// ─── Applications (auth required) ──────────────────────────────
/** POST /jobs/:id/applications  — multipart/form-data */
async function submitApplication(req: SubmitApplicationRequest): Promise<Application> {
  await delay(900);
  const user = currentUser();
  const job = seedJobs.find((j) => j.id === req.jobId);
  if (!job) throw new Error('This internship could not be found');
  if (job.status === 'closed') throw new Error('This internship is closed');
  const apps = allApps();
  const mine = apps[user.id] ?? [];
  if (mine.some((a) => a.jobId === job.id)) throw new Error('You have already applied to this internship');

  const ref = Array.from({ length: 6 }, () => 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[Math.floor(Math.random() * 32)]).join('');
  const app: Application = {
    id: `BS-${ref}`,
    jobId: job.id,
    jobTitle: job.title,
    company: job.company,
    githubRepoUrl: req.githubRepoUrl.trim(),
    technicalExplanation: req.technicalExplanation.trim(),
    resumeFileName: req.resume.name,
    resumeSizeBytes: req.resume.size,
    submittedAt: new Date().toISOString(),
    status: 'submitted',
  };
  apps[user.id] = [app, ...mine];
  write(K.apps, apps);
  localStorage.removeItem(K.draft(user.id, job.id));
  return app;
}

/** GET /applications/me */
async function getMyApplications(): Promise<Application[]> {
  await delay(250);
  return allApps()[currentUser().id] ?? [];
}

/** GET /applications/:id */
async function getApplication(id: string): Promise<Application> {
  await delay(200);
  const app = (allApps()[currentUser().id] ?? []).find((a) => a.id === id);
  if (!app) throw new Error('Application not found');
  return app;
}

// ─── Local draft (never sent to the backend) ───────────────────
export interface Draft { githubRepoUrl: string; technicalExplanation: string }
const loadDraft = (uid: string, jobId: string): Draft => read(K.draft(uid, jobId), { githubRepoUrl: '', technicalExplanation: '' });
const saveDraft = (uid: string, jobId: string, d: Draft) => write(K.draft(uid, jobId), d);

export const api = {
  login, signup, logout, getStoredUser,
  getJobs, getJob,
  submitApplication, getMyApplications, getApplication,
  loadDraft, saveDraft,
};
