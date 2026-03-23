import { useState, useMemo, useEffect } from 'react';
import { SEOHelmet } from '../../components/SEOHelmet';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { CopyButton } from '../../components/ui/CopyButton';
import { FileDown, AlertTriangle } from 'lucide-react';
import { Textarea } from '../../components/ui/Input';

// Custom recursive viewer
const JsonViewer = ({ data, level = 0 }: { data: any, level?: number }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  if (data === null) return <span className="text-gray-500">null</span>;
  if (typeof data === 'boolean') return <span className="text-purple-500">{data ? 'true' : 'false'}</span>;
  if (typeof data === 'number') return <span className="text-blue-500">{data}</span>;
  if (typeof data === 'string') return <span className="text-green-600 dark:text-green-400">"{data}"</span>;

  if (Array.isArray(data)) {
    if (data.length === 0) return <span className="text-gray-500">[]</span>;
    return (
      <span>
        <span className="cursor-pointer text-gray-400 select-none mr-1" onClick={() => setIsExpanded(!isExpanded)}>{isExpanded ? '▼' : '▶'}</span>
        <span className="text-gray-600 dark:text-gray-300">[</span>
        {isExpanded ? (
          <div className="pl-4 border-l border-gray-200 dark:border-gray-700 ml-1.5 my-1">
            {data.map((item, i) => (
              <div key={i} className="py-0.5"><JsonViewer data={item} level={level+1} />{i<data.length-1 && <span className="text-gray-400">,</span>}</div>
            ))}
          </div>
        ) : (<span className="text-gray-400 px-1 cursor-pointer" onClick={()=>setIsExpanded(true)}>... {data.length} items ...</span>)}
        <span className="text-gray-600 dark:text-gray-300">]</span>
      </span>
    );
  }
  if (typeof data === 'object') {
    const keys = Object.keys(data);
    if (keys.length === 0) return <span className="text-gray-500">{"{}"}</span>;
    return (
      <span>
        <span className="cursor-pointer text-gray-400 select-none mr-1" onClick={() => setIsExpanded(!isExpanded)}>{isExpanded ? '▼' : '▶'}</span>
        <span className="text-gray-600 dark:text-gray-300">{"{"}</span>
        {isExpanded ? (
          <div className="pl-4 border-l border-gray-200 dark:border-gray-700 ml-1.5 my-1">
            {keys.map((k, i) => (
              <div key={k} className="py-0.5"><span className="text-indigo-600 dark:text-indigo-400">"{k}"</span><span className="text-gray-400 mr-2">:</span><JsonViewer data={data[k]} level={level+1}/>{i<keys.length-1 && <span className="text-gray-400">,</span>}</div>
            ))}
          </div>
        ) : (<span className="text-gray-400 px-1 cursor-pointer" onClick={()=>setIsExpanded(true)}>... {keys.length} keys ...</span>)}
        <span className="text-gray-600 dark:text-gray-300">{"}"}</span>
      </span>
    );
  }
  return <span>{String(data)}</span>;
};

export default function JsonFormatter() {
  const [input, setInput] = useState('');
  const [debouncedInput, setDebouncedInput] = useState('');

  // Debouncing heavy JSON parsing
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedInput(input), 300);
    return () => clearTimeout(timer);
  }, [input]);

  const parsedJson = useMemo(() => {
    if (!debouncedInput.trim()) return null;
    try { return JSON.parse(debouncedInput); } catch (e) { return e; }
  }, [debouncedInput]);

  const isValid = parsedJson && !(parsedJson instanceof Error);
  const formattedString = isValid ? JSON.stringify(parsedJson, null, 2) : '';

  const downloadJson = () => {
    if (!isValid) return;
    const blob = new Blob([formattedString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'formatted.json'; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500 flex flex-col min-h-[80vh]">
      <SEOHelmet title="JSON Formatter & Validator" description="Format, prettify, and validate JSON data instantly with debouncing." />
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">JSON Formatter</h1>
          <p className="mt-1 text-gray-500">Interactive JSON viewer with expand/collapse logic.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-[500px]">
        <Card className="flex flex-col h-full rounded-2xl overflow-hidden border">
          <CardHeader className="py-3 px-4 border-b">
            <CardTitle className="text-sm font-semibold">Input JSON</CardTitle>
            <Button size="sm" variant="ghost" onClick={() => setInput('')}>Clear</Button>
          </CardHeader>
          <Textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder='{"paste": "json here"}'
            className="flex-1 border-0 focus:ring-0 resize-none font-mono text-sm bg-gray-50 dark:bg-gray-900/50"
            spellCheck="false"
          />
        </Card>

        <Card className="flex flex-col h-full rounded-2xl overflow-hidden border">
          <CardHeader className="py-3 px-4 border-b flex justify-between">
            <CardTitle className="text-sm font-semibold">Formatted Output</CardTitle>
            <div className="flex gap-2">
              <Button size="sm" variant="ghost" onClick={downloadJson} disabled={!isValid}><FileDown className="w-4 h-4 mr-2"/> Download</Button>
              <CopyButton size="sm" value={formattedString} />
            </div>
          </CardHeader>
          <CardContent className="flex-1 p-0 overflow-auto bg-white dark:bg-[#1e1e1e]">
            {!debouncedInput.trim() ? (
              <div className="h-full flex items-center justify-center text-gray-400 italic">Awaiting input...</div>
            ) : !isValid ? (
              <div className="h-full flex items-center justify-center text-red-500 flex-col gap-2 p-6">
                <AlertTriangle className="w-8 h-8 opacity-50" />
                <span className="text-sm font-medium">Invalid JSON</span>
                <span className="text-xs opacity-75 text-center break-all">{(parsedJson as Error).message}</span>
              </div>
            ) : (
              <div className="p-4 font-mono text-sm leading-relaxed"><JsonViewer data={parsedJson} /></div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
