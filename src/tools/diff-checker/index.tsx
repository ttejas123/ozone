import { useState, useEffect } from 'react';
import { SEOHelmet } from '../../components/SEOHelmet';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Textarea } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { formatInput } from './utils';
import { DiffViewer } from './components/DiffViewer';
import { Columns, ListTree, RefreshCcw } from 'lucide-react';

export default function DiffChecker() {
  const [leftInput, setLeftInput] = useState('');
  const [rightInput, setRightInput] = useState('');
  const [isJsonMode, setIsJsonMode] = useState(false);
  const [viewMode, setViewMode] = useState<'split' | 'inline'>('split');
  
  const [debouncedLeft, setDebouncedLeft] = useState('');
  const [debouncedRight, setDebouncedRight] = useState('');

  // Debounce inputs for performance
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedLeft(formatInput(leftInput, isJsonMode));
      setDebouncedRight(formatInput(rightInput, isJsonMode));
    }, 400);
    return () => clearTimeout(timer);
  }, [leftInput, rightInput, isJsonMode]);

  const loadSampleData = () => {
    if (isJsonMode) {
      setLeftInput('{\n  "name": "John Doe",\n  "age": 30,\n  "role": "Developer"\n}');
      setRightInput('{\n  "name": "John Doe",\n  "age": 31,\n  "role": "Senior Developer",\n  "active": true\n}');
    } else {
      setLeftInput('The quick brown fox jumps over the lazy dog.\nHello World!');
      setRightInput('The quick brown foxy jumps over the lazy dog.\nHello React!');
    }
  };

  const handleClear = () => {
    setLeftInput('');
    setRightInput('');
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500">
      <SEOHelmet 
        title="Online Diff Checker" 
        description="Compare Text and JSON instantly. Find differences with side-by-side or inline view." 
      />
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Diff Checker</h1>
          <p className="mt-1 text-gray-500">Compare text or JSON differences instantly.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant={isJsonMode ? 'secondary' : 'ghost'}
            onClick={() => setIsJsonMode(!isJsonMode)}
            className={isJsonMode ? 'bg-brand-100 dark:bg-brand-900/30' : ''}
          >
            JSON Format
          </Button>
          
          <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => setViewMode('split')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'split' 
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' 
                  : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Columns className="w-4 h-4" />
              Split
            </button>
            <button
              onClick={() => setViewMode('inline')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'inline' 
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' 
                  : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <ListTree className="w-4 h-4" />
              Inline
            </button>
          </div>
          
          <Button variant="secondary" size="sm" onClick={loadSampleData}>
            Sample Data
          </Button>
          <Button variant="secondary" size="sm" onClick={handleClear} className="gap-2">
            <RefreshCcw className="w-4 h-4" />
            Clear
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Original Data</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={leftInput}
              onChange={e => setLeftInput(e.target.value)}
              placeholder={`Paste original ${isJsonMode ? 'JSON' : 'text'} here...`}
              className="min-h-[250px] font-mono text-sm border-0 focus:ring-0 px-0 resize-y bg-transparent"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Modified Data</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={rightInput}
              onChange={e => setRightInput(e.target.value)}
              placeholder={`Paste modified ${isJsonMode ? 'JSON' : 'text'} here...`}
              className="min-h-[250px] font-mono text-sm border-0 focus:ring-0 px-0 resize-y bg-transparent"
            />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Comparison Result</CardTitle>
        </CardHeader>
        <CardContent>
          {(debouncedLeft || debouncedRight) ? (
            <DiffViewer
              oldString={debouncedLeft}
              newString={debouncedRight}
              viewType={viewMode}
              isJson={isJsonMode}
            />
          ) : (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-lg">
              Enter text above to see the comparison
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
