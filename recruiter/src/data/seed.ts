import type { Job, Candidate } from '@/types';

export const seedJobs: Job[] = [
  {
    id: 'job-001',
    title: 'Senior Backend Engineer',
    department: 'Engineering',
    description:
      'We are looking for a senior backend engineer with deep experience in distributed systems and API design. You will architect and build scalable services that handle millions of requests per day.',
    requiredSkills: ['Go', 'PostgreSQL', 'Kafka', 'gRPC', 'AWS'],
    codingProblem:
      'Implement a rate limiter that supports both token bucket and sliding window algorithms. Your solution should be thread-safe and handle concurrent requests. Include unit tests that demonstrate correctness under load.',
    submissionFormat: 'repo_url',
    submissionInstructions:
      'Submit a public GitHub repository URL containing your solution. Include a README with setup instructions and a Makefile or docker-compose.yml for running tests.',
    testCases: [
      { id: 'tc-1', input: '10 requests in 1 second, burst=5', expectedOutput: 'First 5 allowed, next 5 rate-limited', hidden: false },
      { id: 'tc-2', input: 'Concurrent requests from 100 goroutines', expectedOutput: 'No race conditions, accurate count', hidden: true },
      { id: 'tc-3', input: 'Sliding window: 100 req/s limit, send 150', expectedOutput: '100 allowed, 50 rejected', hidden: true },
    ],
    scoringWeights: { codeQuality: 25, testPassRate: 35, problemSolving: 25, technicalExplanation: 15 },
    minQualifyingScore: 70,
    status: 'published',
    createdAt: '2026-10-15T09:00:00Z',
    applicantCount: 24,
    qualifiedCount: 8,
    needsReviewCount: 5,
    shortlistLocked: false,
    identitiesRevealed: false,
  },
  {
    id: 'job-002',
    title: 'Frontend Engineer (React)',
    department: 'Engineering',
    description:
      'Join our product team to build beautiful, accessible user interfaces. We value clean code, attention to detail, and a strong sense of design.',
    requiredSkills: ['React', 'TypeScript', 'CSS', 'Accessibility', 'Testing'],
    codingProblem:
      'Build an accessible autocomplete/search component with keyboard navigation, async data fetching, and virtualized results. Demonstrate proper ARIA attributes and focus management.',
    submissionFormat: 'repo_url',
    submissionInstructions:
      'Submit a public GitHub repository URL. The repo should run with npm install && npm run dev. Include tests demonstrating keyboard navigation and accessibility.',
    testCases: [
      { id: 'tc-4', input: 'Type "rea", expect 3 results', expectedOutput: 'Results show matching items', hidden: false },
      { id: 'tc-5', input: 'Arrow Down, Enter on first result', expectedOutput: 'First item selected, input shows value', hidden: true },
      { id: 'tc-6', input: 'Tab through results, check focus order', expectedOutput: 'Focus moves sequentially', hidden: true },
    ],
    scoringWeights: { codeQuality: 30, testPassRate: 20, problemSolving: 20, technicalExplanation: 30 },
    minQualifyingScore: 65,
    status: 'published',
    createdAt: '2026-10-18T14:30:00Z',
    applicantCount: 31,
    qualifiedCount: 12,
    needsReviewCount: 7,
    shortlistLocked: false,
    identitiesRevealed: false,
  },
  {
    id: 'job-003',
    title: 'DevOps Engineer',
    department: 'Infrastructure',
    description:
      'Manage our cloud infrastructure, CI/CD pipelines, and observability stack. Experience with Kubernetes and Terraform is essential.',
    requiredSkills: ['Kubernetes', 'Terraform', 'AWS', 'CI/CD', 'Prometheus'],
    codingProblem:
      'Write Terraform modules to provision a highly available RDS Postgres cluster with read replicas, automated backups, and encryption at rest. Include monitoring alerts.',
    submissionFormat: 'repo_url',
    submissionInstructions:
      'Submit a public GitHub repo with your Terraform modules. Include a README explaining the architecture decisions and how to run terraform plan.',
    testCases: [
      { id: 'tc-7', input: 'terraform plan output', expectedOutput: 'Valid plan, no errors', hidden: false },
      { id: 'tc-8', input: 'Multi-AZ configuration check', expectedOutput: '3 AZs, 1 primary + 2 read replicas', hidden: true },
    ],
    scoringWeights: { codeQuality: 20, testPassRate: 30, problemSolving: 30, technicalExplanation: 20 },
    minQualifyingScore: 75,
    status: 'published',
    createdAt: '2026-10-20T11:00:00Z',
    applicantCount: 18,
    qualifiedCount: 5,
    needsReviewCount: 3,
    shortlistLocked: false,
    identitiesRevealed: false,
  },
  {
    id: 'job-004',
    title: 'Machine Learning Engineer',
    department: 'AI/ML',
    description:
      'Build and deploy ML models for our recommendation engine. Experience with PyTorch, model optimization, and MLOps is required.',
    requiredSkills: ['Python', 'PyTorch', 'MLOps', 'Docker', 'Vector DB'],
    codingProblem:
      'Implement a content-based recommendation system using sentence embeddings. Optimize for latency and demonstrate batch vs real-time inference performance.',
    submissionFormat: 'repo_url',
    submissionInstructions:
      'Submit a GitHub repo with your implementation. Include a notebook demonstrating results and a Dockerfile for serving the model.',
    testCases: [
      { id: 'tc-9', input: '10 items, user likes 3', expectedOutput: 'Top-5 recommendations with relevance scores', hidden: false },
      { id: 'tc-10', input: 'Latency: 1000 concurrent requests', expectedOutput: 'P99 latency < 200ms', hidden: true },
    ],
    scoringWeights: { codeQuality: 20, testPassRate: 25, problemSolving: 35, technicalExplanation: 20 },
    minQualifyingScore: 72,
    status: 'draft',
    createdAt: '2026-10-21T16:00:00Z',
    applicantCount: 0,
    qualifiedCount: 0,
    needsReviewCount: 0,
    shortlistLocked: false,
    identitiesRevealed: false,
  },
];

const firstNames = ['Aarav', 'Bianca', 'Chen', 'Diego', 'Emma', 'Fatima', 'Gunther', 'Hiroshi', 'Ingrid', 'Jamal', 'Katarina', 'Liam', 'Maya', 'Noor', 'Olivia', 'Priya', 'Quentin', 'Ravi', 'Sofia', 'Tariq', 'Uma', 'Viktor', 'Wei', 'Ximena', 'Yuki', 'Zara', 'Akira', 'Beatrice', 'Cyrus', 'Daria'];
const lastNames = ['Patel', 'Schmidt', 'Okafor', 'Rossi', 'Nguyen', 'Cohen', 'Kowalski', 'Mendes', 'Anderson', 'Kumar', 'Lindqvist', 'Bauer', 'Costa', 'Dmitriev', 'Eriksson', 'Fontaine', 'Garcia', 'Hassan', 'Ivanov', 'Johnson'];
const universities = ['MIT', 'Stanford', 'ETH Zurich', 'IIT Bombay', 'TU Munich', 'Carnegie Mellon', 'UC Berkeley', 'Imperial College', 'Georgia Tech', 'University of Toronto'];

function pick<T>(arr: T[], idx: number): T {
  return arr[idx % arr.length];
}

function buildCandidates(jobId: string, count: number) {
  const candidates: Candidate[] = [];
  for (let i = 0; i < count; i++) {
    const overallScore = Math.round((30 + Math.random() * 65) * 10) / 10;
    const verdict: Candidate['verdict'] = overallScore >= 75 ? 'qualified' : overallScore >= 55 ? 'needs_review' : 'not_qualified';
    const testTotal = 5 + Math.floor(Math.random() * 4);
    const testPassed = Math.floor(Math.random() * (testTotal + 1));
    const status: Candidate['status'] = i < count - 2 ? 'done' : i === count - 2 ? 'scoring' : 'queued';

    candidates.push({
      id: `cand-${jobId}-${i}`,
      jobId,
      anonymousId: `Candidate ${String.fromCharCode(65 + (i % 26))}${Math.floor(i / 26) + 1}`,
      avatarSeed: `${i}-${jobId}`,
      verdict,
      status,
      overallScore: status === 'done' ? overallScore : 0,
      scores: {
        codeQuality: status === 'done' ? Math.round((40 + Math.random() * 55) * 10) / 10 : 0,
        testPassRate: status === 'done' ? Math.round((testPassed / testTotal) * 1000) / 10 : 0,
        problemSolving: status === 'done' ? Math.round((35 + Math.random() * 60) * 10) / 10 : 0,
        technicalExplanation: status === 'done' ? Math.round((30 + Math.random() * 65) * 10) / 10 : 0,
      },
      testResults: status === 'done' ? Array.from({ length: testTotal }, (_, j) => ({
        name: `Test case ${j + 1}`,
        passed: j < testPassed,
        input: `Input ${j + 1}`,
        expected: `Expected output ${j + 1}`,
        actual: j < testPassed ? `Expected output ${j + 1}` : `Got: wrong output ${j + 1}`,
      })) : [],
      testPassCount: status === 'done' ? testPassed : 0,
      testTotalCount: status === 'done' ? testTotal : 0,
      codeEvidence: status === 'done' ? [
        {
          id: `ev-${i}-1`,
          file: `src/solution.go`,
          line: 42 + i,
          snippet: `func rateLimit(req Request) bool {\n  // Missing mutex lock around counter\n  counter++\n  if counter > limit { return false }\n  return true\n}`,
          issue: 'Race condition: shared counter not protected by mutex, concurrent access can cause inaccurate rate counting.',
        },
        ...(i % 3 === 0 ? [{
          id: `ev-${i}-2`,
          file: 'src/main.go',
          line: 15,
          snippet: `func main() {\n  limiter := NewLimiter(100)\n  go handleRequests(limiter) // limiter not passed by reference`,
          issue: 'Potential issue: limiter instance may not be shared correctly across goroutines.',
        }] : []),
      ] : [],
      integrityFlags: status === 'done' && i % 7 === 0 ? ['Suspiciously similar to public solution on GitHub'] : [],
      submittedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      revealedName: '',
      revealedEmail: '',
      revealedUniversity: '',
      revealedLinks: [],
      resumeUrl: null,
      githubRepoUrl: '',
      technicalExplanation: '',
      shortlisted: false,
    });
  }
  // Sort by score descending
  candidates.sort((a, b) => b.overallScore - a.overallScore);
  return candidates;
}

// Pre-generate candidate pool for each published job
const candidateStore: Record<string, Candidate[]> = {
  'job-001': buildCandidates('job-001', 24),
  'job-002': buildCandidates('job-002', 31),
  'job-003': buildCandidates('job-003', 18),
};

// Attach revealed info to top candidates for demo (only after reveal)
export function getRevealedCandidate(c: Candidate, index: number): Candidate {
  return {
    ...c,
    revealedName: `${pick(firstNames, index)} ${pick(lastNames, index * 3 + 7)}`,
    revealedEmail: `${pick(firstNames, index).toLowerCase()}.${pick(lastNames, index * 3 + 7).toLowerCase()}@email.com`,
    revealedUniversity: pick(universities, index * 2 + 3),
    revealedLinks: [
      `https://github.com/${pick(firstNames, index).toLowerCase()}-${index}`,
      `https://linkedin.com/in/${pick(firstNames, index).toLowerCase()}-${index}`,
    ],
    githubRepoUrl: `https://github.com/${pick(firstNames, index).toLowerCase()}-${index}/submission`,
    technicalExplanation: 'I approached this problem by first understanding the constraints: the rate limiter needs to handle concurrent requests while maintaining accurate counts. I chose a token bucket algorithm for its burst-tolerance properties and used sync.Mutex for thread safety. The sliding window implementation uses a sorted list of timestamps, pruning entries older than the window. I wrote extensive table-driven tests including a race detector run. The key trade-off I made was between memory usage and accuracy — I chose to store individual timestamps for the sliding window rather than approximating, which gives precise limits at the cost of O(n) cleanup.',
  };
}

export { candidateStore };
