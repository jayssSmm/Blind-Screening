import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '@/lib/api';
import type { Job } from '@/types';
import { JobStatusBadge, SkillTag } from '@/components/Badges';
import { Plus, Users, CheckCircle2, AlertCircle, Briefcase, Clock } from 'lucide-react';

export default function JobsList() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.getJobs()
      .then(setJobs)
      .catch(() => setError('Failed to load jobs'))
      .finally(() => setLoading(false));
  }, []);

  const stats = {
    total: jobs.length,
    published: jobs.filter((j) => j.status === 'published').length,
    applicants: jobs.reduce((sum, j) => sum + j.applicantCount, 0),
    qualified: jobs.reduce((sum, j) => sum + j.qualifiedCount, 0),
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 card animate-pulse" />
          ))}
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 card animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card p-8 text-center">
        <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
        <p className="text-gray-600 dark:text-gray-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage your screening pipelines and review candidates
          </p>
        </div>
        <Link to="/jobs/new" className="btn-primary">
          <Plus className="w-4 h-4" />
          New Job
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Briefcase} label="Total Jobs" value={stats.total} color="brand" />
        <StatCard icon={Users} label="Total Applicants" value={stats.applicants} color="accent" />
        <StatCard icon={CheckCircle2} label="Qualified" value={stats.qualified} color="green" />
        <StatCard icon={Clock} label="Published" value={stats.published} color="amber" />
      </div>

      {/* Jobs list */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Your Jobs</h2>
        <div className="space-y-3">
          {jobs.map((job) => (
            <Link
              key={job.id}
              to={`/jobs/${job.id}`}
              className="card block p-5 hover:shadow-md hover:border-brand-300 dark:hover:border-brand-700 transition-all duration-200 group"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-2 mb-1.5 min-w-0">
                    <h3 className="min-w-0 break-words text-base font-semibold text-gray-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                      {job.title}
                    </h3>
                    <JobStatusBadge status={job.status} />
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                    {job.department} · Created {new Date(job.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {job.requiredSkills.slice(0, 5).map((s) => (
                      <SkillTag key={s} skill={s} />
                    ))}
                    {job.requiredSkills.length > 5 && (
                      <span className="badge bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                        +{job.requiredSkills.length - 5} more
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-6 shrink-0">
                  <div className="text-center">
                    <div className="flex items-center gap-1.5 text-gray-900 dark:text-white">
                      <Users className="w-4 h-4 text-gray-400" />
                      <span className="text-xl font-bold tabular-nums">{job.applicantCount}</span>
                    </div>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">Applicants</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                      <span className="text-xl font-bold text-green-600 dark:text-green-400 tabular-nums">{job.qualifiedCount}</span>
                    </div>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">Qualified</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4 text-amber-500" />
                      <span className="text-xl font-bold text-amber-600 dark:text-amber-400 tabular-nums">{job.needsReviewCount}</span>
                    </div>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">Review</p>
                  </div>
                </div>
              </div>

              {(job.shortlistLocked || job.identitiesRevealed) && (
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                  {job.shortlistLocked && (
                    <span className="badge bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                      Shortlist locked
                    </span>
                  )}
                  {job.identitiesRevealed && (
                    <span className="badge bg-accent-50 text-accent-700 dark:bg-accent-900/30 dark:text-accent-300">
                      Identities revealed
                    </span>
                  )}
                </div>
              )}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }: { icon: React.ComponentType<{ className?: string }>; label: string; value: number; color: string }) {
  const colorMap: Record<string, string> = {
    brand: 'bg-brand-50 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400',
    accent: 'bg-accent-50 text-accent-600 dark:bg-accent-900/30 dark:text-accent-400',
    green: 'bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400',
    amber: 'bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
  };
  return (
    <div className="card p-5">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorMap[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white tabular-nums">{value}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
        </div>
      </div>
    </div>
  );
}
