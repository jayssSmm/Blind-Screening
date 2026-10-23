import { Link } from 'react-router-dom';
import { MapPin, Home, Users } from 'lucide-react';
import type { Job } from '@/types';
import { SkillTag, ClosedBadge, ActivelyHiringBadge, AppliedBadge } from '@/components/Badges';
import JobMeta from '@/components/JobMeta';
import { timeAgo } from '@/lib/utils';

export default function JobCard({ job, applied }: { job: Job; applied: boolean }) {
  const closed = job.status === 'closed';
  return (
    <Link
      to={`/jobs/${job.id}`}
      className={`card block p-5 hover:border-brand-400 dark:hover:border-brand-600 transition-colors ${
        applied || closed ? 'opacity-80' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            {closed ? <ClosedBadge /> : <ActivelyHiringBadge />}
            {applied && <AppliedBadge />}
          </div>
          <h3 className="text-lg text-gray-900 dark:text-white">{job.title}</h3>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-0.5">{job.company}</p>
        </div>
        <div className="w-11 h-11 shrink-0 rounded-lg bg-gradient-to-br from-brand-100 to-accent-100 dark:from-brand-900/50 dark:to-accent-900/50 flex items-center justify-center text-brand-700 dark:text-brand-300 font-bold">
          {job.company.charAt(0)}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-600 dark:text-gray-400">
        <span className="inline-flex items-center gap-1.5">
          {job.workMode === 'Remote' ? <Home className="w-4 h-4" /> : <MapPin className="w-4 h-4" />}
          {job.workMode === 'Remote' ? 'Work from home' : `${job.location} (${job.workMode})`}
        </span>
      </div>

      <div className="mt-4"><JobMeta job={job} /></div>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {job.requiredSkills.map((s) => <SkillTag key={s} skill={s} />)}
      </div>

      <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
        <span className="inline-flex items-center gap-1.5"><Users className="w-3.5 h-3.5" />{job.applicantCount} applicants</span>
        <span>Posted {timeAgo(job.postedAt).toLowerCase()}</span>
      </div>
    </Link>
  );
}
