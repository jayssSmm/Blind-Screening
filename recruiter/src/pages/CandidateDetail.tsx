import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';
import type { Candidate, Job } from '@/types';
import { VerdictBadge, StatusBadge, ScoreBar } from '@/components/Badges';
import {
  ArrowLeft, Star, Download, ExternalLink, AlertTriangle, CheckCircle2, XCircle,
  Code, FileText, Mail, GraduationCap, Link as LinkIcon, Lock,
} from 'lucide-react';

export default function CandidateDetail() {
  const { id = '', candidateId = '' } = useParams();
  const navigate = useNavigate();

  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [c, j] = await Promise.all([
          api.getCandidate(id, candidateId),
          api.getJob(id),
        ]);
        setCandidate(c);
        setJob(j);
      } catch {
        setError('Failed to load candidate');
      } finally {
        setLoading(false);
      }
    })();
  }, [id, candidateId]);

  const handleToggleShortlist = async () => {
    if (!candidate || job?.shortlistLocked) return;
    setActionLoading(true);
    try {
      const updated = await api.toggleShortlist(id, candidate.id, !candidate.shortlisted);
      setCandidate({ ...candidate, shortlisted: updated.shortlisted });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to update shortlist');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
        <div className="h-40 card animate-pulse" />
        <div className="grid grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => <div key={i} className="h-28 card animate-pulse" />)}
        </div>
      </div>
    );
  }

  if (error || !candidate) {
    return (
      <div className="card p-8 text-center">
        <AlertTriangle className="w-10 h-10 text-red-500 mx-auto mb-3" />
        <p className="text-gray-600 dark:text-gray-400">{error || 'Candidate not found'}</p>
        <button onClick={() => navigate(`/jobs/${id}`)} className="btn-primary mt-4 inline-flex">
          Back to candidates
        </button>
      </div>
    );
  }

  const revealed = job?.identitiesRevealed && candidate.shortlisted;
  const scores = [
    { label: 'Code Quality', value: candidate.scores.codeQuality, key: 'codeQuality' },
    { label: 'Test Pass Rate', value: candidate.scores.testPassRate, key: 'testPassRate', suffix: '%' },
    { label: 'Problem Solving', value: candidate.scores.problemSolving, key: 'problemSolving' },
    { label: 'Technical Explanation', value: candidate.scores.technicalExplanation, key: 'technicalExplanation' },
  ];

  return (
    <div className="space-y-6">
      {/* Back link */}
      <button onClick={() => navigate(`/jobs/${id}`)} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to {job?.title || 'Job'}
      </button>

      {/* Header */}
      <div className="card p-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-700 flex items-center justify-center text-white text-xl font-bold">
              {candidate.anonymousId.charAt(candidate.anonymousId.length - 2) || '?'}
            </div>
            <div>
              <div className="flex items-center gap-2.5 mb-1.5">
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  {revealed ? candidate.revealedName || candidate.anonymousId : candidate.anonymousId}
                </h1>
                {candidate.status === 'done' && <VerdictBadge verdict={candidate.verdict} />}
                {candidate.status !== 'done' && <StatusBadge status={candidate.status} />}
              </div>
              <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                {revealed && candidate.revealedEmail && (
                  <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" /> {candidate.revealedEmail}</span>
                )}
                {revealed && candidate.revealedUniversity && (
                  <span className="flex items-center gap-1"><GraduationCap className="w-3.5 h-3.5" /> {candidate.revealedUniversity}</span>
                )}
                <span>Submitted {new Date(candidate.submittedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {candidate.status === 'done' && (
              <div className="text-center">
                <div className={`text-3xl font-bold tabular-nums ${
                  candidate.overallScore >= 75 ? 'text-green-600 dark:text-green-400'
                  : candidate.overallScore >= 55 ? 'text-amber-600 dark:text-amber-400'
                  : 'text-red-600 dark:text-red-400'
                }`}>
                  {candidate.overallScore.toFixed(1)}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Overall Score</p>
              </div>
            )}
            <button
              onClick={handleToggleShortlist}
              disabled={job?.shortlistLocked || actionLoading}
              className={candidate.shortlisted ? 'btn-secondary ring-1 ring-amber-300 dark:ring-amber-700' : 'btn-secondary'}
            >
              <Star className={`w-4 h-4 ${candidate.shortlisted ? 'text-amber-400 fill-amber-400' : ''}`} />
              {candidate.shortlisted ? 'Shortlisted' : 'Shortlist'}
            </button>
          </div>
        </div>

        {/* Integrity flags */}
        {candidate.integrityFlags.length > 0 && (
          <div className="mt-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
            <div className="flex items-center gap-2 mb-1.5">
              <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400" />
              <span className="text-sm font-semibold text-red-700 dark:text-red-400">Integrity Flags</span>
            </div>
            <ul className="space-y-1">
              {candidate.integrityFlags.map((flag, i) => (
                <li key={i} className="text-sm text-red-600 dark:text-red-400 pl-6">{flag}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Reveal notice */}
        {!revealed && job?.identitiesRevealed && !candidate.shortlisted && (
          <div className="mt-4 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 flex items-center gap-2">
            <Lock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="text-sm text-blue-700 dark:text-blue-400">Identity not revealed — only shortlisted candidates are visible.</span>
          </div>
        )}
      </div>

      {candidate.status !== 'done' ? (
        <div className="card p-12 text-center">
          <div className="inline-flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-2">
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-sm font-medium">{candidate.status === 'queued' ? 'Queued for scoring' : candidate.status === 'anonymizing' ? 'Anonymizing submission...' : 'Scoring in progress...'}</span>
          </div>
          <p className="text-sm text-gray-400 dark:text-gray-500">Scores will appear here once evaluation is complete. The page polls every 15 seconds.</p>
        </div>
      ) : (
        <>
          {/* Score breakdown */}
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Score Breakdown</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {scores.map((s) => (
                <div key={s.key} className="card p-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{s.label}</span>
                    <span className="text-xl font-bold text-gray-900 dark:text-white tabular-nums">
                      {s.value.toFixed(1)}{s.suffix || ''}
                    </span>
                  </div>
                  <ScoreBar score={s.value} />
                </div>
              ))}
            </div>
          </div>

          {/* Test results */}
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-gray-400" />
              Test Results
              <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
                ({candidate.testPassCount}/{candidate.testTotalCount} passed)
              </span>
            </h2>
            <div className="card divide-y divide-gray-200 dark:divide-gray-800">
              {candidate.testResults.map((t, i) => (
                <div key={i} className="p-4 flex items-start gap-3">
                  {t.passed ? (
                    <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{t.name}</p>
                    <div className="mt-1 space-y-0.5 text-xs font-mono text-gray-500 dark:text-gray-400">
                      <p>Input: {t.input}</p>
                      <p>Expected: {t.expected}</p>
                      {!t.passed && <p className="text-red-500 dark:text-red-400">Actual: {t.actual}</p>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Code evidence */}
          {candidate.codeEvidence.length > 0 && (
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Code className="w-5 h-5 text-gray-400" />
                Code Evidence
              </h2>
              <div className="space-y-3">
                {candidate.codeEvidence.map((ev) => (
                  <div key={ev.id} className="card overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-2.5 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-mono font-medium text-gray-700 dark:text-gray-300">{ev.file}:{ev.line}</span>
                      </div>
                    </div>
                    <pre className="p-4 text-sm font-mono text-gray-700 dark:text-gray-300 overflow-x-auto bg-gray-50 dark:bg-gray-900/50">{ev.snippet}</pre>
                    <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-800 flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                      <p className="text-sm text-gray-600 dark:text-gray-400">{ev.issue}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Submission details */}
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Submission</h2>
            <div className="card p-5 space-y-4">
              {/* GitHub repo */}
              <div>
                <label className="label">GitHub Repository</label>
                {candidate.githubRepoUrl ? (
                  <a
                    href={candidate.githubRepoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-brand-600 dark:text-brand-400 hover:underline"
                  >
                    <ExternalLink className="w-4 h-4" />
                    {candidate.githubRepoUrl}
                  </a>
                ) : (
                  <p className="text-sm text-gray-400 dark:text-gray-500">No repository submitted</p>
                )}
              </div>

              {/* Technical explanation */}
              <div>
                <label className="label">Technical Explanation</label>
                {candidate.technicalExplanation ? (
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{candidate.technicalExplanation}</p>
                ) : (
                  <p className="text-sm text-gray-400 dark:text-gray-500">No explanation provided</p>
                )}
              </div>

              {/* Resume */}
              <div>
                <label className="label">Resume</label>
                {candidate.resumeUrl ? (
                  <a
                    href={candidate.resumeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-brand-600 dark:text-brand-400 hover:underline"
                  >
                    <Download className="w-4 h-4" />
                    Download resume (PDF)
                  </a>
                ) : (
                  <div className="flex items-center gap-2 text-sm text-gray-400 dark:text-gray-500">
                    <FileText className="w-4 h-4" />
                    No resume uploaded
                  </div>
                )}
              </div>

              {/* Revealed links */}
              {revealed && candidate.revealedLinks.length > 0 && (
                <div>
                  <label className="label">Links</label>
                  <div className="flex flex-wrap gap-2">
                    {candidate.revealedLinks.map((link) => (
                      <a
                        key={link}
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-sm text-brand-600 dark:text-brand-400 hover:underline"
                      >
                        <LinkIcon className="w-3.5 h-3.5" />
                        {link.replace(/^https?:\/\//, '')}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
