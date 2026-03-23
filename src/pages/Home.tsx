import { useState } from 'react';
import { Link } from 'react-router-dom';
import { tools } from '../utils/tools';
import { SEOHelmet } from '../components/SEOHelmet';
import { Search } from 'lucide-react';

export const Home = () => {
  const [search, setSearch] = useState('');

  const filteredTools = tools.filter((tool) =>
    tool.name.toLowerCase().includes(search.toLowerCase()) ||
    tool.description.toLowerCase().includes(search.toLowerCase()) ||
    tool.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <SEOHelmet
        title="Home"
        description="A premium collection of high-performance developer tools, available instantly online without any backend processing."
      />

      <div className="text-center max-w-2xl mx-auto space-y-4 pt-10 pb-6">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white">
          Developer Essentials, <span className="text-brand-600 dark:text-brand-500 text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-indigo-500">Zero Latency</span>.
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          Supercharge your workflow with instant, client-side utility tools. No data leaves your browser.
        </p>

        <div className="relative mt-8 max-w-lg mx-auto">
          <Search className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search tools (e.g. JSON, Password, Base64)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-2xl bg-white dark:bg-gray-800 border-2 border-transparent focus:border-brand-500 shadow-sm transition-all text-gray-900 dark:text-white dark:placeholder-gray-400 outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-6">
        {filteredTools.length > 0 ? (
          filteredTools.map((tool) => {
            const Icon = tool.icon;
            return (
              <Link
                key={tool.id}
                to={tool.path}
                className="group relative flex flex-col p-6 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 hover:border-brand-500 dark:hover:border-brand-500 hover:shadow-lg transition-all"
              >
                <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-brand-50 dark:bg-gray-700/50 text-brand-600 dark:text-brand-400 group-hover:scale-110 transition-transform">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="mt-4 text-xl font-bold text-gray-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                  {tool.name}
                </h3>
                <p className="mt-2 text-gray-500 dark:text-gray-400 text-sm line-clamp-2">
                  {tool.description}
                </p>
                <div className="mt-auto pt-4 flex gap-2 w-full">
                  <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                    {tool.category}
                  </span>
                </div>
              </Link>
            );
          })
        ) : (
          <div className="col-span-full py-12 text-center text-gray-500 dark:text-gray-400 text-lg">
            No tools found matching "{search}"
          </div>
        )}
      </div>
    </div>
  );
};
