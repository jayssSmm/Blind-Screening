import type { JobStatus } from '@/types';
import { CheckCircle2 } from 'lucide-react';

export function SkillTag({ skill }: { skill: string }) {
  return <span className="badge bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300">{skill}</span>;
}

export function ClosedBadge() {
  return <span className="badge bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300">Closed</span>;
}

export function ActivelyHiringBadge() {
  return (
    <span className="badge bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300">
      <span className="inline-block w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
      Actively hiring
    </span>
  );
}

export function AppliedBadge() {
  return (
    <span className="badge bg-accent-100 text-accent-700 dark:bg-accent-900/40 dark:text-accent-300">
      <CheckCircle2 className="w-3 h-3" /> Applied
    </span>
  );
}

export function SubmittedBadge() {
  return <span className="badge bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300">Submitted</span>;
}

export function JobStatusBadge({ status }: { status: JobStatus }) {
  return status === 'closed' ? <ClosedBadge /> : <ActivelyHiringBadge />;
}
