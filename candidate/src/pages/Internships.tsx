import { useEffect, useMemo, useState } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import type { Job, WorkMode } from '@/types';
import JobCard from '@/components/JobCard';

const MODES: (WorkMode | 'All')[] = ['All', 'Remote', 'Hybrid', 'On-site'];

export default function Internships() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[] | null>(null);
  const [error, setError] = useState('');
  const [applied, setApplied] = useState<Set<string>>(new Set());
  const [query, setQuery] = useState('');
  const [mode, setMode] = useState<WorkMode | 'All'>('All');
  const [dept, setDept] = useState('All');

  useEffect(() => { api.getJobs().then(setJobs).catch(() => setError('Could not load internships')); }, []);
  useEffect(() => {
    if (!user) { setApplied(new Set()); return; }
    api.getMyApplications().then((a) => setApplied(new Set(a.map((x) => x.jobId)))).catch(() => {});
  }, [user]);

  const departments = useMemo(() => ['All', ...Array.from(new Set((jobs ?? []).map((j) => j.department)))], [jobs]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    const rank = (j: Job) => (applied.has(j.id) ? 2 : j.status === 'closed' ? 1 : 0); // applied jobs sink to the bottom
    return (jobs ?? [])
      .filter((j) => mode === 'All' || j.workMode === mode)
      .filter((j) => dept === 'All' || j.department === dept)
      .filter((j) => !q || [j.title, j.company, j.location, ...j.requiredSkills].some((v) => v.toLowerCase().includes(q)))
      .sort((a, b) => rank(a) - rank(b) || +new Date(b.postedAt) - +new Date(a.postedAt));
  }, [jobs, applied, query, mode, dept]);

  const clear = () => { setQuery(''); setMode('All'); setDept('All'); };
  const filtered = query || mode !== 'All' || dept !== 'All';

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl text-gray-900 dark:text-white">Internships</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Solve a short coding problem and get reviewed on your work, not your resume.
        </p>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input value={query} onChange={(e) => setQuery(e.target.value)} className="input pl-10 py-2.5" placeholder="Search by role, company, skill or location" />
      </div>

      <div className="grid lg:grid-cols-[240px_1fr] gap-6 items-start">
        <aside className="card p-5 lg:sticky lg:top-24">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm inline-flex items-center gap-2"><SlidersHorizontal className="w-4 h-4" />Filters</h3>
            {filtered && <button onClick={clear} className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline">Clear</button>}
          </div>
          <div className="space-y-5">
            <fieldset>
              <legend className="label">Work mode</legend>
              <div className="space-y-1.5">
                {MODES.map((m) => (
                  <label key={m} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                    <input type="radio" name="mode" checked={mode === m} onChange={() => setMode(m)} className="accent-brand-600" />
                    {m === 'Remote' ? 'Work from home' : m}
                  </label>
                ))}
              </div>
            </fieldset>
            <div>
              <label className="label" htmlFor="dept">Department</label>
              <select id="dept" value={dept} onChange={(e) => setDept(e.target.value)} className="input">
                {departments.map((d) => <option key={d}>{d}</option>)}
              </select>
            </div>
          </div>
        </aside>

        <section className="space-y-4">
          {error && <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg px-3 py-2">{error}</p>}
          {!jobs && !error && [0, 1, 2].map((i) => <div key={i} className="card h-56 animate-pulse bg-gray-100 dark:bg-gray-900" />)}
          {jobs && <p className="text-sm text-gray-500 dark:text-gray-400">{visible.length} {visible.length === 1 ? 'internship' : 'internships'}</p>}
          {visible.map((j) => <JobCard key={j.id} job={j} applied={applied.has(j.id)} />)}
          {jobs && visible.length === 0 && (
            <div className="card p-10 text-center">
              <p className="font-semibold text-gray-900 dark:text-white">No internships match your filters</p>
              <button onClick={clear} className="btn-secondary mt-4">Clear filters</button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
