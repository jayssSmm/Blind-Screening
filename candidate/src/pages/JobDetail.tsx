import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, MapPin, Home, Users, CheckCircle2, ShieldCheck } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import type { Job, Application } from '@/types';
import { SkillTag, ClosedBadge, ActivelyHiringBadge } from '@/components/Badges';
import JobMeta from '@/components/JobMeta';
import { timeAgo } from '@/lib/utils';

export default function JobDetail() {
  const { id = '' } = useParams();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [job, setJob] = useState<Job | null>(null);
  const [error, setError] = useState('');
  const [myApp, setMyApp] = useState<Application | null>(null);

  useEffect(() => { api.getJob(id).then(setJob).catch((e: Error) => setError(e.message)); }, [id]);
  useEffect(() => {
    if (!isAuthenticated) { setMyApp(null); return; }
    api.getMyApplications().then((a) => setMyApp(a.find((x) => x.jobId === id) ?? null)).catch(() => {});
  }, [id, isAuthenticated]);

  if (error) return <p className="text-sm text-red-600 dark:text-red-400">{error}</p>;
  if (!job) return <div className="card h-96 animate-pulse bg-gray-100 dark:bg-gray-900" />;

  const closed = job.status === 'closed';
  const applyPath = `/jobs/${job.id}/apply`;
  const onApply = () => (isAuthenticated ? navigate(applyPath) : navigate('/login', { state: { from: applyPath } }));

  const ApplyButton = (
    myApp ? (
      <div className="flex items-center gap-3">
        <button disabled className="btn-primary"><CheckCircle2 className="w-4 h-4" />Applied</button>
        <Link to={`/applications/${myApp.id}`} className="text-sm font-semibold text-brand-600 dark:text-brand-400 hover:underline">View application</Link>
      </div>
    ) : closed ? (
      <button disabled className="btn-secondary">Closed</button>
    ) : (
      <button onClick={onApply} className="btn-primary">Apply now</button>
    )
  );

  return (
    <div className="max-w-3xl mx-auto">
      <Link to="/" className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4">
        <ArrowLeft className="w-4 h-4" />All internships
      </Link>

      <div className="card p-6 sm:p-8">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          {closed ? <ClosedBadge /> : <ActivelyHiringBadge />}
          <span className="text-xs text-gray-500 dark:text-gray-400">Posted {timeAgo(job.postedAt).toLowerCase()}</span>
        </div>
        <h2 className="text-2xl sm:text-3xl text-gray-900 dark:text-white">{job.title}</h2>
        <p className="mt-1 text-base font-medium text-gray-600 dark:text-gray-400">{job.company}</p>
        <p className="mt-3 inline-flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
          {job.workMode === 'Remote' ? <Home className="w-4 h-4" /> : <MapPin className="w-4 h-4" />}
          {job.workMode === 'Remote' ? 'Work from home' : `${job.location} (${job.workMode})`}
        </p>

        <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-800"><JobMeta job={job} /></div>

        <p className="mt-5 inline-flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
          <Users className="w-3.5 h-3.5" />{job.applicantCount} applicants
        </p>
      </div>

      <div className="card p-6 sm:p-8 mt-4 space-y-8">
        <section>
          <h3 className="text-lg mb-2 text-gray-900 dark:text-white">About the internship</h3>
          <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">{job.description}</p>
        </section>
        <section>
          <h3 className="text-lg mb-3 text-gray-900 dark:text-white">Skill(s) required</h3>
          <div className="flex flex-wrap gap-1.5">{job.requiredSkills.map((s) => <SkillTag key={s} skill={s} />)}</div>
        </section>
        <section className="rounded-xl bg-brand-50/60 dark:bg-brand-900/10 border border-brand-100 dark:border-brand-900/40 p-5">
          <h3 className="text-lg mb-2 inline-flex items-center gap-2 text-gray-900 dark:text-white">
            <ShieldCheck className="w-5 h-5 text-brand-600 dark:text-brand-400" />About the assessment
          </h3>
          <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
            Instead of a cover letter, you will solve a short coding problem. You submit a public GitHub repository link,
            a written explanation of what you built and why, and your resume (PDF, up to 5 MB). You can apply once per internship.
          </p>
        </section>
        <div className="pt-2 flex justify-center">{ApplyButton}</div>
      </div>
    </div>
  );
}
