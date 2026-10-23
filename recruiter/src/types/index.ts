// ─── Domain Types ──────────────────────────────────────────────

export type Verdict = 'qualified' | 'needs_review' | 'not_qualified';
export type ScoringStatus = 'queued' | 'anonymizing' | 'scoring' | 'done' | 'failed';
export type JobStatus = 'draft' | 'published' | 'closed';

export interface Skill {
  id: string;
  name: string;
}

export interface TestCase {
  id: string;
  input: string;
  expectedOutput: string;
  hidden: boolean;
}

export interface ScoringWeights {
  codeQuality: number;
  testPassRate: number;
  problemSolving: number;
  technicalExplanation: number;
}

export interface Job {
  id: string;
  title: string;
  department: string;
  description: string;
  requiredSkills: string[];
  codingProblem: string;
  submissionFormat: 'make_test' | 'dockerfile' | 'repo_url';
  submissionInstructions: string;
  testCases: TestCase[];
  scoringWeights: ScoringWeights;
  minQualifyingScore: number;
  status: JobStatus;
  createdAt: string;
  applicantCount: number;
  qualifiedCount: number;
  needsReviewCount: number;
  shortlistLocked: boolean;
  identitiesRevealed: boolean;
}

export interface CodeEvidence {
  id: string;
  file: string;
  line: number;
  snippet: string;
  issue: string;
}

export interface TestResult {
  name: string;
  passed: boolean;
  input: string;
  expected: string;
  actual: string;
}

export interface Candidate {
  id: string;
  jobId: string;
  anonymousId: string; // e.g. "Candidate A-7"
  avatarSeed: string; // for generating consistent avatar colors
  verdict: Verdict;
  status: ScoringStatus;
  overallScore: number;
  scores: {
    codeQuality: number;
    testPassRate: number;
    problemSolving: number;
    technicalExplanation: number;
  };
  testResults: TestResult[];
  testPassCount: number;
  testTotalCount: number;
  codeEvidence: CodeEvidence[];
  integrityFlags: string[];
  submittedAt: string;
  // Revealed fields (empty until identities revealed)
  revealedName: string;
  revealedEmail: string;
  revealedUniversity: string;
  revealedLinks: string[];
  resumeUrl: string | null;
  githubRepoUrl: string;
  technicalExplanation: string;
  shortlisted: boolean;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'recruiter';
}

// ─── API Shapes ────────────────────────────────────────────────

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: AuthUser;
}

export interface CreateJobRequest {
  title: string;
  department: string;
  description: string;
  requiredSkills: string[];
  codingProblem: string;
  submissionFormat: 'make_test' | 'dockerfile' | 'repo_url';
  submissionInstructions: string;
  testCases: Omit<TestCase, 'id'>[];
  scoringWeights: ScoringWeights;
  minQualifyingScore: number;
}

export interface UpdateJobStatusRequest {
  status: JobStatus;
}

export interface ShortlistToggleRequest {
  candidateId: string;
  shortlisted: boolean;
}

export interface PaginatedCandidates {
  candidates: Candidate[];
  hasMore: boolean;
  total: number;
}
