import { CalendarDays, Clock, Banknote } from 'lucide-react';
import type { Job } from '@/types';

/** Start date / duration / stipend row, as on Internshala cards. */
export default function JobMeta({ job }: { job: Job }) {
  const items = [
    { icon: CalendarDays, label: 'Start date', value: job.startDate },
    { icon: Clock, label: 'Duration', value: job.duration },
    { icon: Banknote, label: 'Stipend', value: job.stipend },
  ];
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {items.map(({ icon: Icon, label, value }) => (
        <div key={label} className="flex items-start gap-2.5">
          <Icon className="w-4 h-4 mt-0.5 text-gray-400" />
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{value}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
