import { useEffect, useRef, useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, UploadCloud, FileText, X, Check, Circle, Github, Send } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import type { Job } from '@/types';
import { EXPLANATION_MAX, EXPLANATION_MIN, GITHUB_REPO_RE, MAX_RESUME_BYTES, formatBytes } from '@/lib/utils';

export default function Apply() {
  const { id = '' } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileInput = useRef<HTMLInputElement>(null);

  const [job, setJob] = useState<Job | null>(null);
  const [appliedId, setAppliedId] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [loadError, setLoadError] = useState('');

  const [repo, setRepo] = useState('');
  const [explanation, setExplanation] = useState('');
  const [resume, setResume] = useState<File | null>(null);
  const [resumeError, setResumeError] = useState('');
  const [dragging, setDragging] = useState(false);
  const [touchedRepo, setTouchedRepo] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [draftSaved, setDraftSaved] = useState(false);

  // Load job, existing application and any saved draft
  useEffect(() => {
    if (!user) return;
    Promise.all([api.getJob(id), api.getMyApplications()])
      .then(([j, apps]) => {
        setJob(j);
        setAppliedId(apps.find((a) => a.jobId === id)?.id ?? null);
        const d = api.loadDraft(user.id, id);
        setRepo(d.githubRepoUrl);
        setExplanation(d.technicalExplanation);
        setReady(true);
      })
      .catch((e: Error) => setLoadError(e.message));
  }, [id, user]);

  // Autosave draft (resume file cannot be stored, so it must be re-attached after a refresh)
  useEffect(() => {
    if (!ready || !user || submitting) return;
    const t = setTimeout(() => {
      api.saveDraft(user.id, id, { githubRepoUrl: repo, technicalExplanation: explanation });
      setDraftSaved(true);
    }, 500);
    setDraftSaved(false);
    return () => clearTimeout(t);
  }, [repo, explanation, ready, user, id, submitting]);

  if (loadError) return <p className="text-sm text-red-600 dark:text-red-400">{loadError}</p>;
  if (!job || !ready) return <div className="card h-96 animate-pulse bg-gray-100 dark:bg-gray-900" />;
  if (appliedId) return <Navigate to={`/applications/${appliedId}`} replace />;
  if (job.status === 'closed') return <Navigate to={`/jobs/${job.id}`} replace />;

  const repoValid = GITHUB_REPO_RE.test(repo.trim());
  const len = explanation.trim().length;
  const explanationValid = len >= EXPLANATION_MIN && len <= EXPLANATION_MAX;
  const canSubmit = !!resume && repoValid && explanationValid && !submitting;

  const pickFile = (file?: File) => {
    setResumeError('');
    if (!file) return;
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) { setResumeError('Resume must be a PDF file'); return; }
    if (file.size > MAX_RESUME_BYTES) { setResumeError(`File is ${formatBytes(file.size)}. Maximum size is 5 MB`); return; }
    setResume(file);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || !resume) return;
    setSubmitError('');
    setSubmitting(true);
    try {
      const app = await api.submitApplication({ jobId: job.id, githubRepoUrl: repo, technicalExplanation: explanation, resume });
      navigate(`/applications/${app.id}`, { replace: true, state: { justSubmitted: true } });
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Could not submit your application');
      setSubmitting(false);
    }
  };

  const checklist = [
    { label: 'Resume uploaded', done: !!resume },
    { label: 'GitHub repo link', done: repoValid },
    { label: `Explanation (${len}/${EXPLANATION_MIN} min)`, done: explanationValid },
  ];

  return (
    <div className="max-w-5xl mx-auto">
      <Link to={`/jobs/${job.id}`} className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4">
        <ArrowLeft className="w-4 h-4" />Back to internship
      </Link>
      <div className="mb-6">
        <h2 className="text-2xl text-gray-900 dark:text-white">Assessment: {job.title}</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{job.company} · No time limit. Your name is not shown to reviewers.</p>
      </div>

      <form onSubmit={submit} className="grid lg:grid-cols-[1fr_280px] gap-6 items-start">
        <div className="space-y-6">
          <section className="card p-6">
            <h3 className="text-lg mb-3 text-gray-900 dark:text-white">Coding problem</h3>
            <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">{job.codingProblem}</p>
            <p className="label mt-5">Requirements</p>
            <ul className="space-y-2">
              {job.problemRequirements.map((r) => (
                <li key={r} className="flex gap-2.5 text-sm text-gray-700 dark:text-gray-300">
                  <Check className="w-4 h-4 mt-0.5 shrink-0 text-brand-600 dark:text-brand-400" />{r}
                </li>
              ))}
            </ul>
            <p className="mt-5 text-xs text-gray-500 dark:text-gray-400">
              Submit a public GitHub repository link with your solution, a README, and a short explanation below.
            </p>
          </section>

          <section className="card p-6">
            <h3 className="text-lg mb-4 text-gray-900 dark:text-white">Your submission</h3>
            <div className="space-y-6">
              <div>
                <label className="label">Resume (PDF, max 5 MB)</label>
                {resume ? (
                  <div className="flex items-center gap-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2.5">
                    <FileText className="w-5 h-5 text-brand-600 dark:text-brand-400 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold truncate text-gray-900 dark:text-gray-100">{resume.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{formatBytes(resume.size)}</p>
                    </div>
                    <button type="button" onClick={() => { setResume(null); if (fileInput.current) fileInput.current.value = ''; }} className="p-1.5 rounded-md text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700" title="Remove file">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInput.current?.click()}
                    onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                    onDragLeave={() => setDragging(false)}
                    onDrop={(e) => { e.preventDefault(); setDragging(false); pickFile(e.dataTransfer.files[0]); }}
                    className={`w-full rounded-lg border-2 border-dashed px-4 py-8 text-center transition-colors ${
                      dragging ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20' : 'border-gray-300 dark:border-gray-700 hover:border-brand-400'
                    }`}
                  >
                    <UploadCloud className="w-7 h-7 mx-auto text-gray-400" />
                    <p className="mt-2 text-sm font-semibold text-gray-700 dark:text-gray-300">Drop your resume here or click to browse</p>
                  </button>
                )}
                <input ref={fileInput} type="file" accept="application/pdf,.pdf" className="hidden" onChange={(e) => pickFile(e.target.files?.[0])} />
                {resumeError && <p className="mt-1.5 text-xs text-red-600 dark:text-red-400">{resumeError}</p>}
              </div>

              <div>
                <label className="label" htmlFor="repo">GitHub repository URL</label>
                <div className="relative">
                  <Github className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input id="repo" value={repo} onChange={(e) => setRepo(e.target.value)} onBlur={() => setTouchedRepo(true)} className="input pl-10" placeholder="https://github.com/your-username/your-repo" />
                </div>
                {touchedRepo && repo && !repoValid && (
                  <p className="mt-1.5 text-xs text-red-600 dark:text-red-400">Use a link like https://github.com/owner/repo</p>
                )}
              </div>

              <div>
                <label className="label" htmlFor="explanation">Technical explanation</label>
                <textarea
                  id="explanation"
                  rows={9}
                  value={explanation}
                  onChange={(e) => setExplanation(e.target.value)}
                  className="input resize-y leading-relaxed"
                  placeholder="What did you build, which approach did you choose, and why? Mention trade-offs, what you tested and what you would improve."
                />
                <div className="mt-1.5 flex justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span className={len > 0 && len < EXPLANATION_MIN ? 'text-amber-600 dark:text-amber-400' : ''}>Minimum {EXPLANATION_MIN} characters</span>
                  <span className={len > EXPLANATION_MAX ? 'text-red-600 dark:text-red-400' : ''}>{len}/{EXPLANATION_MAX}</span>
                </div>
              </div>
            </div>
          </section>
        </div>

        <aside className="card p-5 lg:sticky lg:top-24">
          <h3 className="text-sm mb-3 text-gray-900 dark:text-white">Before you submit</h3>
          <ul className="space-y-2.5">
            {checklist.map((c) => (
              <li key={c.label} className={`flex items-center gap-2 text-sm ${c.done ? 'text-green-700 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'}`}>
                {c.done ? <Check className="w-4 h-4" /> : <Circle className="w-4 h-4" />}{c.label}
              </li>
            ))}
          </ul>
          {submitError && <p className="mt-4 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg px-3 py-2">{submitError}</p>}
          <button type="submit" disabled={!canSubmit} className="btn-primary w-full mt-5">
            {submitting ? 'Submitting...' : 'Submit application'}
            {!submitting && <Send className="w-4 h-4" />}
          </button>
          <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
            {draftSaved ? 'Draft saved on this device.' : 'Saving draft...'} You can submit only once, and it cannot be edited afterwards.
          </p>
        </aside>
      </form>
    </div>
  );
}
