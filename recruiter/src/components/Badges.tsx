import type { Verdict, ScoringStatus, JobStatus } from '@/types';

export function VerdictBadge({ verdict }: { verdict: Verdict }) {
  const styles: Record<Verdict, string> = {
    qualified: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
    needs_review: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
    not_qualified: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
  };
  const labels: Record<Verdict, string> = {
    qualified: 'Qualified',
    needs_review: 'Needs review',
    not_qualified: 'Not qualified',
  };
  return <span className={`badge ${styles[verdict]}`}>{labels[verdict]}</span>;
}

export function StatusBadge({ status }: { status: ScoringStatus }) {
  const styles: Record<ScoringStatus, string> = {
    queued: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
    anonymizing: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
    scoring: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
    done: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
    failed: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
  };
  const labels: Record<ScoringStatus, string> = {
    queued: 'Queued',
    anonymizing: 'Anonymizing',
    scoring: 'Scoring',
    done: 'Done',
    failed: 'Failed',
  };
  const animate = status === 'anonymizing' || status === 'scoring';
  return (
    <span className={`badge ${styles[status]}`}>
      {animate && <span className="inline-block w-1.5 h-1.5 rounded-full bg-current animate-pulse" />}
      {labels[status]}
    </span>
  );
}

export function JobStatusBadge({ status }: { status: JobStatus }) {
  const styles: Record<JobStatus, string> = {
    draft: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
    published: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
    closed: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
  };
  return <span className={`badge ${styles[status]}`}>{status.charAt(0).toUpperCase() + status.slice(1)}</span>;
}

export function ScoreBar({ score, max = 100 }: { score: number; max?: number }) {
  const pct = Math.min((score / max) * 100, 100);
  const color = score >= 75 ? 'bg-green-500' : score >= 55 ? 'bg-amber-500' : 'bg-red-500';
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
        <div className={`h-full rounded-full ${color} transition-all duration-500`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 tabular-nums w-12 text-right">
        {score.toFixed(1)}
      </span>
    </div>
  );
}

export function SkillTag({ skill }: { skill: string }) {
  return (
    <span className="badge bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300">
      {skill}
    </span>
  );
}
