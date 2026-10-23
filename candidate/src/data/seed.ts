import type { Job, AuthUser } from '@/types';

const daysAgo = (n: number) => new Date(Date.now() - n * 86_400_000).toISOString();

export const SEED_CANDIDATE = {
  user: { id: 'cand-001', name: 'Riya Sharma', email: 'riya@example.com', role: 'candidate' } as AuthUser,
  password: 'demo1234',
};

export const seedJobs: Job[] = [
  {
    id: 'job-001',
    title: 'Backend Engineering Intern',
    company: 'Northwind Labs',
    department: 'Engineering',
    location: 'Bengaluru',
    workMode: 'Hybrid',
    startDate: 'Immediately',
    duration: '6 months',
    stipend: '₹30,000 /month',
    description:
      'Work alongside our platform team on distributed services and API design. You will build, test and ship backend components that handle millions of requests per day, and learn how production systems are monitored and scaled.',
    requiredSkills: ['Go', 'PostgreSQL', 'Kafka', 'gRPC', 'AWS'],
    codingProblem:
      'Build a rate limiter library that can protect an API from bursts of traffic. It should support two strategies, token bucket and sliding window, behind one common interface.',
    problemRequirements: [
      'Expose a single Allow(key) style interface that both strategies implement.',
      'Be safe under concurrent use; document how you handled shared state.',
      'Make limits configurable per key (for example per user or per IP).',
      'Include unit tests, including at least one that exercises concurrent callers.',
      'Add a README with setup, usage and the trade-offs between the two strategies.',
    ],
    status: 'published',
    postedAt: daysAgo(3),
    applicantCount: 24,
  },
  {
    id: 'job-002',
    title: 'Frontend Developer Intern (React)',
    company: 'Pixel & Co.',
    department: 'Engineering',
    location: 'Remote',
    workMode: 'Remote',
    startDate: 'Immediately',
    duration: '3 months',
    stipend: '₹20,000 /month',
    description:
      'Join our product team to build accessible, well-crafted interfaces in React and TypeScript. You will pair with designers, review pull requests and own small features from idea to release.',
    requiredSkills: ['React', 'TypeScript', 'CSS', 'Accessibility', 'Testing'],
    codingProblem:
      'Build an accessible autocomplete search box that fetches suggestions from a mock async source and lets users pick a result using only the keyboard.',
    problemRequirements: [
      'Support Arrow Up/Down, Enter and Escape, with correct ARIA roles and focus handling.',
      'Debounce input and handle loading, empty and error states.',
      'Keep rendering fast when the result list has thousands of items.',
      'Add tests covering keyboard navigation.',
      'Add a README explaining your component API and accessibility decisions.',
    ],
    status: 'published',
    postedAt: daysAgo(6),
    applicantCount: 31,
  },
  {
    id: 'job-003',
    title: 'DevOps Engineer Intern',
    company: 'Cloudline Systems',
    department: 'Infrastructure',
    location: 'Kolkata',
    workMode: 'On-site',
    startDate: 'Immediately',
    duration: '4 months',
    stipend: '₹25,000 /month',
    description:
      'Help the infrastructure team automate deployments, improve observability and keep our Kubernetes clusters healthy. Great for students who like automating things and reading logs.',
    requiredSkills: ['Docker', 'Kubernetes', 'Terraform', 'CI/CD', 'Linux'],
    codingProblem:
      'Containerise a small web service and automate its build and deployment pipeline end to end, with a health check and a rollback story.',
    problemRequirements: [
      'Provide a multi-stage Dockerfile that produces a small, non-root image.',
      'Add a CI workflow that lints, tests, builds and tags the image.',
      'Include Kubernetes manifests (or Helm chart) with readiness and liveness probes.',
      'Describe how you would roll back a bad release.',
      'Document everything in a README so a teammate can reproduce your setup.',
    ],
    status: 'published',
    postedAt: daysAgo(10),
    applicantCount: 17,
  },
  {
    id: 'job-004',
    title: 'Machine Learning Intern',
    company: 'Neuron Works',
    department: 'AI/ML',
    location: 'Hyderabad',
    workMode: 'Hybrid',
    startDate: 'Immediately',
    duration: '6 months',
    stipend: '₹35,000 /month',
    description:
      'Work with our ML team on training, evaluating and serving models. You will clean data, run experiments and help turn notebooks into reliable pipelines.',
    requiredSkills: ['Python', 'PyTorch', 'SQL', 'MLOps', 'Docker'],
    codingProblem:
      'Train a small text classifier on a public dataset of your choice, then wrap it in a reproducible pipeline with evaluation and a simple inference endpoint.',
    problemRequirements: [
      'Split data properly and report at least two metrics, not just accuracy.',
      'Make the run reproducible (seeds, pinned dependencies, config file).',
      'Expose a minimal inference function or HTTP endpoint with input validation.',
      'Explain one failure case you found and how you would improve on it.',
      'Add a README with results and how to re-run training.',
    ],
    status: 'closed',
    postedAt: daysAgo(21),
    applicantCount: 58,
  },
];
