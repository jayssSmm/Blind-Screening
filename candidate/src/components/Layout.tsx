import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { Eye, Moon, Sun, LogOut, Briefcase, FileText } from 'lucide-react';

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { pathname } = useLocation();

  const navItems = [
    { to: '/', label: 'Internships', icon: Briefcase, active: pathname === '/' || pathname.startsWith('/jobs'), show: true },
    { to: '/applications', label: 'My Applications', icon: FileText, active: pathname.startsWith('/applications'), show: isAuthenticated },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950">
      <header className="sticky top-0 z-30 border-b border-gray-200 dark:border-gray-800 bg-white/90 dark:bg-gray-900/90 backdrop-blur">
        <div className="max-w-6xl mx-auto h-16 px-4 sm:px-6 flex items-center gap-4 sm:gap-8">
          <Link to="/" className="flex items-center gap-2.5 shrink-0">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-brand-500 to-accent-600 flex items-center justify-center">
              <Eye className="w-5 h-5 text-white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-base font-bold text-gray-900 dark:text-white leading-none">Blind Screening</h1>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">Candidate Portal</p>
            </div>
          </Link>

          <nav className="flex items-center gap-1 flex-1">
            {navItems.filter((n) => n.show).map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    item.active
                      ? 'bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300'
                      : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
                  }`}
                >
                  <Icon className="w-4 h-4" strokeWidth={2} />
                  <span className="hidden sm:inline">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors"
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            {isAuthenticated ? (
              <>
                <div className="hidden md:flex items-center gap-2.5 pl-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-400 to-accent-500 flex items-center justify-center text-white text-sm font-bold">
                    {user?.name?.charAt(0) || 'C'}
                  </div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white max-w-[140px] truncate">{user?.name}</p>
                </div>
                <button
                  onClick={logout}
                  className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors"
                  title="Log out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn-ghost">Log in</Link>
                <Link to="/signup" className="btn-primary hidden sm:inline-flex">Sign up</Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 animate-fade-in">{children}</div>
      </main>
    </div>
  );
}
