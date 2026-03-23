import { useState, useEffect } from 'react';
import { Link2, Trash2, ArrowRight } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { CopyButton } from '@/components/ui/CopyButton';
import { SEOHelmet } from '@/components/SEOHelmet';
import { generateShortLink, saveLinkToHistory, getHistory, clearHistory, type ShortLink } from './utils';

export default function TinyUrlGenerator() {
  const [url, setUrl] = useState('');
  const [history, setHistory] = useState<ShortLink[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    setHistory(getHistory());
  }, []);

  const handleShorten = () => {
    if (!url.trim()) {
      setError('Please enter a valid URL');
      return;
    }
    
    try {
      new URL(url); // basic validation
      setError('');
    } catch {
      setError('Invalid URL format. Make sure to include http:// or https://');
      return;
    }

    const newLink = generateShortLink(url);
    saveLinkToHistory(newLink);
    setHistory(getHistory());
    setUrl('');
  };

  const handleClear = () => {
    clearHistory();
    setHistory([]);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pt-8 pb-16">
      <SEOHelmet 
        title="TinyURL Generator | Free URL Shortener"
        description="Instantly generate short, readable URLs for long links. Fully works within your browser with local history. Zero latency."
      />

      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-brand-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-6 transform rotate-3">
          <Link2 className="w-8 h-8 text-brand-600 dark:text-brand-400" />
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white">
          TinyURL Generator
        </h1>
        <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto text-lg">
          Paste your long link below to instantly generate a shorter, more readable alternative.
        </p>
      </div>

      <Card className="p-6 md:p-8 border-brand-100 dark:border-gray-700 bg-white dark:bg-gray-800/50 shadow-xl shadow-brand-500/5">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
          <div className="flex-1 w-full">
            <Input
              placeholder="https://example.com/very/long/url/that/needs/shortening"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className={`w-full text-lg py-6 ${error ? 'border-red-500 focus:ring-red-500' : ''}`}
            />
            {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
          </div>
          <Button 
            onClick={handleShorten} 
            size="lg" 
            className="w-full md:w-auto mt-1 md:mt-0 py-6 px-8 bg-brand-600 hover:bg-brand-700 text-white shadow-md shadow-brand-500/20"
          >
            Shorten 
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </Card>

      {history.length > 0 && (
        <div className="space-y-4 pt-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Link2 className="w-5 h-5 text-brand-500" />
              Recent Links
            </h2>
            <Button 
              variant="secondary" 
              size="sm"
              onClick={handleClear}
              className="text-red-500 hover:text-red-600 dark:hover:text-red-400 border-red-200 dark:border-red-900/30 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear History
            </Button>
          </div>

          <div className="grid gap-4">
            {history.map((item) => (
              <Card key={item.id} className="p-4 md:p-5 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center hover:border-brand-500/50 transition-colors">
                <div className="min-w-0 flex-1 space-y-1 w-full">
                  <div className="flex items-center justify-between gap-4">
                    <p className="font-medium text-brand-600 dark:text-brand-400 truncate">
                      {item.shortUrl}
                    </p>
                    <span className="text-xs text-gray-400 whitespace-nowrap hidden sm:inline-block">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                    {item.originalUrl}
                  </p>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto flex-shrink-0">
                  <CopyButton value={item.shortUrl} className="w-full sm:w-auto" />
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
