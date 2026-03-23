import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { toolRegistry } from '@/tools/toolRegistry';
import { ErrorBoundary } from '../ErrorBoundary';
import { useAppStore } from '../../store';
import { Moon, Sun, Wrench } from 'lucide-react';
import { ToastContainer } from '../ui/Toast';

export const AppLayout = () => {
  const { theme, toggleTheme } = useAppStore();
  const location = useLocation();

  useEffect(() => {
    const currentPath = location.pathname.substring(1);
    if (!currentPath) return; // ignore home
    
    // Check if path is a known tool
    const matchedTool = toolRegistry.find(t => t.path === currentPath);
    if (matchedTool) {
      try {
        const recentStr = localStorage.getItem('recentTools');
        const recent = recentStr ? JSON.parse(recentStr) : [];
        const newRecent = [matchedTool.id, ...recent.filter((id: string) => id !== matchedTool.id)].slice(0, 4);
        localStorage.setItem('recentTools', JSON.stringify(newRecent));
      } catch (e) {
        // ignore storage errors
      }
    }
  }, [location.pathname]);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  return (
    <div className="min-h-screen flex flex-col transition-colors duration-200">
      {/* Navbar implementation built-in for simplicity */}
      <header className="sticky top-0 z-50 w-full border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 text-brand-600 dark:text-brand-500 font-bold text-xl tracking-tight">
            <Wrench className="w-6 h-6" />
            <a href="/">DevTools Hub</a>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 container mx-auto px-4 py-8">
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </main>

      <footer className="border-t border-gray-200 dark:border-gray-800 py-6 mt-auto">
        <div className="container mx-auto px-4 text-center text-gray-500 dark:text-gray-400 text-sm">
          Built for Developers. Fast & Secure. {new Date().getFullYear()}
        </div>
      </footer>
      <ToastContainer />
    </div>
  );
};
