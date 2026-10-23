import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Inbox } from 'lucide-react';
import { api } from '@/lib/api';
import type { Application } from '@/types';
import { SubmittedBadge } from '@/components/Badges';
import { formatDate } from '@/lib/utils';

export default function Applications() {
  const [apps, setApps] = useState<Application[] | null>(null);
  const [error, setError] = useState('');
  useEffect(() => { api.getMyApplications().then(setApps).catch((e: Error) => setError(e.message)); }, []);

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl text-gray-900 dark:text-white">My Applications</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Internships you have applied to.</p>
      </div>
      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
      {!apps && !error && <div className="card h-32 animate-pulse bg-gray-100 dark:bg-gray-900" />}
      {apps && apps.length === 0 && (
        <div className="card p-10 text-center">
          <Inbox className="w-8 h-8 mx-auto text-gray-400" />
          <p className="mt-3 font-semibold text-gray-900 dark:text-white">You haven't applied to anything yet</p>
          <Link to="/" className="btn-primary mt-4">Browse internships</Link>
        </div>
      )}
      <div className="space-y-3">
        {apps?.map((a) => (
          <Link key={a.id} to={`/applications/${a.id}`} className="card p-5 flex items-center gap-4 hover:border-brand-400 dark:hover:border-brand-600 transition-colors">
            <div className="min-w-0 flex-1">
              <h3 className="text-base text-gray-900 dark:text-white truncate">{a.jobTitle}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">{a.company}</p>
              <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                Reference <span className="font-mono font-medium text-gray-700 dark:text-gray-300">{a.id}</span> · {formatDate(a.submittedAt)}
              </p>
            </div>
            <SubmittedBadge />
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </Link>
        ))}
      </div>
    </div>
  );
}
