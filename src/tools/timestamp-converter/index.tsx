import { useState, useEffect } from 'react';
import { SEOHelmet } from '../../components/SEOHelmet';
import { Card, CardContent } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { CopyButton } from '../../components/ui/CopyButton';
import { Button } from '../../components/ui/Button';

export default function TimestampConverter() {
  const [inputTs, setInputTs] = useState('');
  const [outputDate, setOutputDate] = useState('');
  const [currentTs, setCurrentTs] = useState(Math.floor(Date.now() / 1000));

  useEffect(() => {
    const timer = setInterval(() => setCurrentTs(Math.floor(Date.now() / 1000)), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!inputTs) {
      setOutputDate('');
      return;
    }
    const val = Number(inputTs);
    if (isNaN(val)) {
      setOutputDate('Invalid timestamp');
      return;
    }
    // Auto detect seconds vs milliseconds (approx threshold year 2001 vs 2301)
    const isMillis = val > 1e11;
    const date = new Date(isMillis ? val : val * 1000);
    setOutputDate(date.toUTCString() + ' \\n' + date.toString());
  }, [inputTs]);

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-500">
      <SEOHelmet title="Timestamp to Date Converter" description="Convert Unix timestamps to dates." />
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Timestamp Converter</h1>
        <p className="mt-1 text-gray-500">Easily decode unix seconds and milliseconds.</p>
      </div>

      <div className="flex gap-4 items-center bg-brand-50 dark:bg-gray-800/50 p-4 rounded-xl border border-brand-100 dark:border-gray-700">
        <span className="font-semibold text-gray-700 dark:text-gray-300">Current Epoch: </span>
        <span className="font-mono text-brand-600 dark:text-brand-400 text-lg">{currentTs}</span>
        <div className="ml-auto flex gap-2">
          <Button size="sm" variant="ghost" onClick={() => setInputTs(currentTs.toString())}>Use</Button>
          <CopyButton value={currentTs.toString()} size="sm" variant="secondary" />
        </div>
      </div>

      <Card>
        <CardContent className="p-6 space-y-6">
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Unix Timestamp</label>
            <div className="flex gap-2">
              <Input
                value={inputTs}
                onChange={e => setInputTs(e.target.value)}
                placeholder="e.g. 1711200000"
                className="font-mono text-lg"
              />
              <Button onClick={() => setInputTs('')} variant="secondary">Clear</Button>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Human Readable Output</label>
              <CopyButton value={outputDate} variant="ghost" size="sm" />
            </div>
            <div className="min-h[100px] p-4 rounded-lg bg-gray-50 dark:bg-gray-900 font-mono text-sm whitespace-pre-wrap text-gray-800 dark:text-gray-200 border border-gray-100 dark:border-gray-800">
              {outputDate || <span className="text-gray-400">Date will appear here...</span>}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
