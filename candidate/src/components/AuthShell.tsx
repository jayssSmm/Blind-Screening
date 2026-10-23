import { Link } from 'react-router-dom';
import { useTheme } from '@/context/ThemeContext';
import { Eye, Moon, Sun } from 'lucide-react';

export default function AuthShell({ subtitle, children }: { subtitle: string; children: React.ReactNode }) {
  const { theme, toggleTheme } = useTheme();
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-brand-50/30 to-accent-50/30 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 px-4 py-10">
      <button
        onClick={toggleTheme}
        className="absolute top-6 right-6 p-2.5 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm"
        title="Toggle theme"
      >
        {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
      </button>
      <div className="w-full max-w-md">
        <Link to="/" className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-500 to-accent-600 flex items-center justify-center mb-4 shadow-lg shadow-brand-500/25">
            <Eye className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Blind Screening</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{subtitle}</p>
        </Link>
        <div className="card p-8">{children}</div>
      </div>
    </div>
  );
}
