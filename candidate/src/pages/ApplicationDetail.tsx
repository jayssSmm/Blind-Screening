import { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Copy, Check, FileText, Github } from 'lucide-react';
import { api } from '@/lib/api';
import type { Application } from '@/types';
import { SubmittedBadge } from '@/components/Badges';
import { formatBytes, formatDate } from '@/lib/utils';

export default function ApplicationDetail() {
  const { id = '' } = useParams();
  const location = useLocation();
  const justSubmitted = (location.state as { justSubmitted?: boolean } | null)?.justSubmitted;
  const [app, setApp] = useState<Application | null>(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => { api.getApplication(id).then(setApp).catch((e: Error) => setError(e.message)); }, [id]);

  if (error) return <p className="text-sm text-red-600 dark:text-red-400">{error}</p>;
  if (!app) return <div className="card h-80 animate-pulse bg-gray-100 dark:bg-gray-900" />;

  const copy = async () => {
    try { await navigator.clipboard.writeText(app.id); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch { /* ignore */ }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <Link to="/applications" className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4">
        <ArrowLeft className="w-4 h-4" />My applications
      </Link>

      {justSubmitted && (
        <div className="mb-4 rounded-xl border border-green-200 dark:border-green-900/60 bg-green-50 dark:bg-green-900/20 p-5 flex gap-3">
          <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400 shrink-0" />
          <div>
            <h3 className="text-base text-green-900 dark:text-green-200">Application submitted</h3>
            <p className="mt-1 text-sm text-green-800 dark:text-green-300">
              Your work will be reviewed without your name attached. Keep your reference ID for any questions.
            </p>
          </div>
        </div>
      )}

      <div className="card p-6 sm:p-8">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-2xl text-gray-900 dark:text-white">{app.jobTitle}</h2>
            <p className="mt-1 text-gray-600 dark:text-gray-400">{app.company}</p>
          </div>
          <SubmittedBadge />
        </div>

        <dl className="mt-6 grid sm:grid-cols-2 gap-5 pt-6 border-t border-gray-100 dark:border-gray-800">
          <div>
            <dt className="text-xs text-gray-500 dark:text-gray-400">Reference ID</dt>
            <dd className="mt-1 flex items-center gap-2">
              <span className="font-mono font-semibold text-gray-900 dark:text-gray-100">{app.id}</span>
              <button onClick={copy} className="p-1 rounded-md text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800" title="Copy reference ID">
                {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
              </button>
            </dd>
          </div>
          <div>
            <dt className="text-xs text-gray-500 dark:text-gray-400">Submitted</dt>
            <dd className="mt-1 text-sm font-semibold text-gray-900 dark:text-gray-100">{formatDate(app.submittedAt)}</dd>
          </div>
          <div>
            <dt className="text-xs text-gray-500 dark:text-gray-400">GitHub repository</dt>
            <dd className="mt-1">
              <a href={app.githubRepoUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 dark:text-brand-400 hover:underline break-all">
                <Github className="w-4 h-4 shrink-0" />{app.githubRepoUrl.replace('https://github.com/', '')}
              </a>
            </dd>
          </div>
          <div>
            <dt className="text-xs text-gray-500 dark:text-gray-400">Resume</dt>
            <dd className="mt-1 inline-flex items-center gap-1.5 text-sm font-semibold text-gray-900 dark:text-gray-100 break-all">
              <FileText className="w-4 h-4 shrink-0 text-gray-400" />{app.resumeFileName}
              <span className="font-normal text-gray-500 dark:text-gray-400">({formatBytes(app.resumeSizeBytes)})</span>
            </dd>
          </div>
        </dl>

        <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-800">
          <h3 className="text-sm mb-2 text-gray-900 dark:text-white">Technical explanation</h3>
          <p className="text-sm leading-relaxed whitespace-pre-wrap break-words [overflow-wrap:anywhere] text-gray-700 dark:text-gray-300">{app.technicalExplanation}</p>
        </div>
      </div>
    </div>
  );
}
