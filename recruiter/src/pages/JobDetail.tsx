import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '@/lib/api';
import type { Job, Candidate } from '@/types';
import { JobStatusBadge, VerdictBadge, StatusBadge, ScoreBar, SkillTag } from '@/components/Badges';
import {
  ArrowLeft, Users, CheckCircle2, AlertCircle, Lock, Eye, Star,
  FileText, Code, Settings, Target, ChevronDown, AlertTriangle,
} from 'lucide-react';

const PAGE_SIZE = 8;
const POLL_INTERVAL = 15000;

export default function JobDetail() {
  const { id = '' } = useParams();
  const navigate = useNavigate();

  const [job, setJob] = useState<Job | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'candidates' | 'details'>('candidates');
  const [shortlistCount, setShortlistCount] = useState(0);
  const [actionLoading, setActionLoading] = useState('');
  const offsetRef = useRef(0);

  const loadJob = useCallback(async () => {
    try {
      const j = await api.getJob(id);
      setJob(j);
    } catch {
      setError('Job not found');
    }
  }, [id]);

  const loadCandidates = useCallback(async (reset = false) => {
    const offset = reset ? 0 : offsetRef.current;
    if (!reset) setLoadingMore(true);
    try {
      const res = await api.getCandidates(id, offset, PAGE_SIZE);
      if (reset) {
        setCandidates(res.candidates);
        offsetRef.current = res.candidates.length;
      } else {
        setCandidates((prev) => [...prev, ...res.candidates]);
        offsetRef.current = offset + res.candidates.length;
      }
      setHasMore(res.hasMore);
      setTotal(res.total);
      setShortlistCount(res.candidates.filter((c) => c.shortlisted).length);
    } catch {
      setError('Failed to load candidates');
    } finally {
      setLoadingMore(false);
    }
  }, [id]);

  // Initial load
  useEffect(() => {
    (async () => {
      await loadJob();
      await loadCandidates(true);
      setLoading(false);
    })();
  }, [loadJob, loadCandidates]);

  // Polling for score updates
  useEffect(() => {
    if (!id) return;
    const interval = setInterval(() => {
      loadJob();
      // Refresh candidates silently
      (async () => {
        const res = await api.getCandidates(id, 0, Math.max(offsetRef.current, PAGE_SIZE));
        setCandidates(res.candidates);
        offsetRef.current = res.candidates.length;
        setHasMore(res.hasMore);
        setTotal(res.total);
      })();
    }, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [id, loadJob]);

  const handleToggleShortlist = async (cand: Candidate) => {
    if (job?.shortlistLocked) return;
    setActionLoading(cand.id);
    try {
      await api.toggleShortlist(id, cand.id, !cand.shortlisted);
      setCandidates((prev) => prev.map((c) => c.id === cand.id ? { ...c, shortlisted: !cand.shortlisted } : c));
      setShortlistCount((n) => cand.shortlisted ? n - 1 : n + 1);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to update shortlist');
    } finally {
      setActionLoading('');
    }
  };

  const handleLockShortlist = async () => {
    if (!confirm('Locking the shortlist prevents further changes. Continue?')) return;
    setActionLoading('lock');
    try {
      const j = await api.lockShortlist(id);
      setJob(j);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to lock shortlist');
    } finally {
      setActionLoading('');
    }
  };

  const handleReveal = async () => {
    if (!confirm('This will reveal the identities of shortlisted candidates. Continue?')) return;
    setActionLoading('reveal');
    try {
      const j = await api.revealIdentities(id);
      setJob(j);
      // Reload candidates to get revealed fields
      await loadCandidates(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to reveal identities');
    } finally {
      setActionLoading('');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-64 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
        <div className="h-32 card animate-pulse" />
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => <div key={i} className="h-20 card animate-pulse" />)}
        </div>
      </div>
    );
  }

  if (error && !job) {
    return (
      <div className="card p-8 text-center">
        <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
        <p className="text-gray-600 dark:text-gray-400">{error}</p>
        <Link to="/" className="btn-primary mt-4 inline-flex">Back to Dashboard</Link>
      </div>
    );
  }

  if (!job) return null;

  return (
    <div className="space-y-6">
      {/* Back link */}
      <button onClick={() => navigate('/')} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </button>

      {/* Job header */}
      <div className="card p-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2 mb-1.5 min-w-0">
              <h1 className="min-w-0 break-words text-2xl font-bold text-gray-900 dark:text-white">{job.title}</h1>
              <JobStatusBadge status={job.status} />
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">{job.department} · Created {new Date(job.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
            <div className="flex flex-wrap gap-1.5 mt-3">
              {job.requiredSkills.map((s) => <SkillTag key={s} skill={s} />)}
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="flex items-center gap-1.5 justify-center">
                <Users className="w-4 h-4 text-gray-400" />
                <span className="text-2xl font-bold tabular-nums text-gray-900 dark:text-white">{job.applicantCount}</span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Applicants</p>
            </div>
            <div className="text-center">
              <div className="flex items-center gap-1.5 justify-center">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <span className="text-2xl font-bold tabular-nums text-green-600 dark:text-green-400">{job.qualifiedCount}</span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Qualified</p>
            </div>
            <div className="text-center">
              <div className="flex items-center gap-1.5 justify-center">
                <AlertCircle className="w-4 h-4 text-amber-500" />
                <span className="text-2xl font-bold tabular-nums text-amber-600 dark:text-amber-400">{job.needsReviewCount}</span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Review</p>
            </div>
          </div>
        </div>
      </div>

      {/* Shortlist / Reveal bar */}
      <div className="card p-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Star className={`w-5 h-5 ${shortlistCount > 0 ? 'text-amber-400 fill-amber-400' : 'text-gray-300 dark:text-gray-600'}`} />
              <span className="text-sm font-semibold text-gray-900 dark:text-white">{shortlistCount} shortlisted</span>
            </div>
            {job.shortlistLocked && (
              <span className="badge bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                <Lock className="w-3 h-3" /> Shortlist locked
              </span>
            )}
            {job.identitiesRevealed && (
              <span className="badge bg-accent-50 text-accent-700 dark:bg-accent-900/30 dark:text-accent-300">
                <Eye className="w-3 h-3" /> Identities revealed
              </span>
            )}
          </div>
          <div className="flex gap-2">
            {!job.shortlistLocked ? (
              <button onClick={handleLockShortlist} disabled={!!actionLoading || shortlistCount === 0} className="btn-secondary">
                <Lock className="w-4 h-4" /> Lock Shortlist
              </button>
            ) : null}
            {job.shortlistLocked && !job.identitiesRevealed && (
              <button onClick={handleReveal} disabled={!!actionLoading} className="btn-primary">
                {actionLoading === 'reveal' ? 'Revealing...' : 'Reveal Identities'} <Eye className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200 dark:border-gray-800">
        <TabButton active={activeTab === 'candidates'} onClick={() => setActiveTab('candidates')}>
          <Users className="w-4 h-4" /> Candidates ({total})
        </TabButton>
        <TabButton active={activeTab === 'details'} onClick={() => setActiveTab('details')}>
          <FileText className="w-4 h-4" /> Job Details
        </TabButton>
      </div>

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      {/* Candidates tab */}
      {activeTab === 'candidates' && (
        <div className="space-y-3">
          {candidates.length === 0 && (
            <div className="card p-12 text-center">
              <Users className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400">No candidates have applied yet.</p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                Share the job link with candidates to start receiving submissions.
              </p>
            </div>
          )}

          {candidates.map((cand, index) => (
            <div
              key={cand.id}
              className={`card p-4 hover:shadow-md transition-all cursor-pointer ${
                cand.shortlisted ? 'ring-1 ring-amber-300 dark:ring-amber-700' : ''
              }`}
              onClick={() => navigate(`/jobs/${id}/candidates/${cand.id}`)}
            >
              <div className="flex items-center gap-4">
                {/* Rank */}
                <div className="shrink-0 w-10 text-center">
                  <span className={`text-lg font-bold ${index === 0 ? 'text-amber-500' : index < 3 ? 'text-brand-500' : 'text-gray-400 dark:text-gray-600'}`}>
                    #{index + 1}
                  </span>
                </div>

                {/* Avatar */}
                <div className="shrink-0">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-700 flex items-center justify-center text-white text-sm font-bold">
                    {cand.anonymousId.charAt(cand.anonymousId.length - 2) || '?'}
                  </div>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">{cand.anonymousId}</span>
                    {cand.status === 'done' && <VerdictBadge verdict={cand.verdict} />}
                    {cand.status !== 'done' && <StatusBadge status={cand.status} />}
                    {cand.shortlisted && (
                      <span className="badge bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
                        <Star className="w-3 h-3 fill-current" /> Shortlisted
                      </span>
                    )}
                    {cand.integrityFlags.length > 0 && (
                      <span className="badge bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300" title={cand.integrityFlags.join(', ')}>
                        <AlertTriangle className="w-3 h-3" /> Flag
                      </span>
                    )}
                  </div>
                  {cand.status === 'done' ? (
                    <div className="flex items-center gap-4">
                      <div className="flex-1 max-w-xs">
                        <ScoreBar score={cand.overallScore} />
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {cand.testPassCount}/{cand.testTotalCount} tests passed
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(cand.submittedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  ) : (
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Submitted {new Date(cand.submittedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </p>
                  )}
                </div>

                {/* Shortlist star */}
                <button
                  onClick={(e) => { e.stopPropagation(); handleToggleShortlist(cand); }}
                  disabled={job.shortlistLocked || actionLoading === cand.id}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
                  title={cand.shortlisted ? 'Remove from shortlist' : 'Add to shortlist'}
                >
                  <Star className={`w-5 h-5 ${cand.shortlisted ? 'text-amber-400 fill-amber-400' : 'text-gray-300 dark:text-gray-600'} hover:text-amber-400 transition-colors`} />
                </button>

                {/* Chevron */}
                <ChevronDown className="w-5 h-5 text-gray-300 dark:text-gray-600 -rotate-90" />
              </div>
            </div>
          ))}

          {/* Show more */}
          {hasMore && (
            <button
              onClick={() => loadCandidates(false)}
              disabled={loadingMore}
              className="w-full py-3 card hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors text-sm font-medium text-gray-700 dark:text-gray-300 disabled:opacity-50"
            >
              {loadingMore ? 'Loading...' : `Show more candidates (${total - candidates.length} remaining)`}
            </button>
          )}
        </div>
      )}

      {/* Job details tab */}
      {activeTab === 'details' && (
        <div className="space-y-4">
          <DetailSection icon={FileText} title="Description">
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{job.description}</p>
          </DetailSection>
          <DetailSection icon={Code} title="Coding Problem">
            <pre className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap font-mono bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">{job.codingProblem}</pre>
          </DetailSection>
          <DetailSection icon={Settings} title="Submission Format">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              Format: <span className="font-semibold">{job.submissionFormat.replace('_', ' ')}</span>
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">{job.submissionInstructions}</p>
          </DetailSection>
          <DetailSection icon={Settings} title={`Hidden Test Cases (${job.testCases.length})`}>
            <div className="space-y-2">
              {job.testCases.map((tc, i) => (
                <div key={tc.id} className="p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Case {i + 1}</span>
                    {tc.hidden && <span className="badge bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400">Hidden</span>}
                  </div>
                  <p className="text-xs font-mono text-gray-600 dark:text-gray-400">Input: {tc.input}</p>
                  <p className="text-xs font-mono text-gray-600 dark:text-gray-400">Expected: {tc.expectedOutput}</p>
                </div>
              ))}
            </div>
          </DetailSection>
          <DetailSection icon={Target} title="Scoring Configuration">
            <div className="space-y-2">
              {(Object.entries(job.scoringWeights) as [string, number][]).map(([key, val]) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">{val}%</span>
                </div>
              ))}
              <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                <span className="text-sm font-semibold text-gray-900 dark:text-white">Minimum qualifying score</span>
                <span className="text-sm font-bold text-brand-600 dark:text-brand-400">{job.minQualifyingScore}</span>
              </div>
            </div>
          </DetailSection>
        </div>
      )}
    </div>
  );
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
        active
          ? 'border-brand-600 text-brand-600 dark:text-brand-400'
          : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
      }`}
    >
      {children}
    </button>
  );
}

function DetailSection({ icon: Icon, title, children }: { icon: React.ComponentType<{ className?: string }>; title: string; children: React.ReactNode }) {
  return (
    <div className="card p-5">
      <div className="flex items-center gap-2 mb-3">
        <Icon className="w-4 h-4 text-gray-400" />
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{title}</h3>
      </div>
      {children}
    </div>
  );
}
