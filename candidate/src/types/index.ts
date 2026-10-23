export type JobStatus = 'published' | 'closed';
export type WorkMode = 'Remote' | 'Hybrid' | 'On-site';

/** Candidate-facing job. No scoring weights, hidden tests or cutoff scores. */
export interface Job {
  id: string;
  title: string;
  company: string;
  department: string;
  location: string;
  workMode: WorkMode;
  startDate: string;
  duration: string;
  stipend: string;
  description: string;
  requiredSkills: string[];
  codingProblem: string;
  problemRequirements: string[];
  status: JobStatus;
  postedAt: string;
  applicantCount: number;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'candidate';
}

export interface Application {
  id: string; // reference ID, e.g. "BS-7K2M9Q"
  jobId: string;
  jobTitle: string;
  company: string;
  githubRepoUrl: string;
  technicalExplanation: string;
  resumeFileName: string;
  resumeSizeBytes: number;
  submittedAt: string;
  status: 'submitted';
}

// ─── API shapes (see api-contract.md) ──────────────────────────
export interface LoginRequest { email: string; password: string }
export interface SignupRequest { name: string; email: string; password: string }
export interface AuthResponse { token: string; user: AuthUser }

export interface SubmitApplicationRequest {
  jobId: string;
  githubRepoUrl: string;
  technicalExplanation: string;
  resume: File;
}
