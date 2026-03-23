import { useState, useCallback } from 'react';
import { SEOHelmet } from '../../components/SEOHelmet';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { CopyButton } from '../../components/ui/CopyButton';
import { Toggle } from '../../components/ui/Toggle';
import { Database, RefreshCw } from 'lucide-react';

const fNames = ['Alex', 'Jordan', 'Taylor', 'Morgan', 'Casey', 'Sam', 'Jamie', 'Riley'];
const lNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis'];
const domains = ['example.com', 'test.org', 'demo.net', 'mail.co'];

export default function RandomData() {
  const [data, setData] = useState<any[]>([]);
  const [count, setCount] = useState<number>(5);
  const [options, setOptions] = useState({ id: true, name: true, email: true, age: true });

  const generate = useCallback(() => {
    const newData = Array.from({ length: count }).map(() => {
      const record: any = {};
      const f = fNames[Math.floor(Math.random() * fNames.length)];
      const l = lNames[Math.floor(Math.random() * lNames.length)];
      
      if (options.id) record.id = crypto.randomUUID();
      if (options.name) record.name = `${f} ${l}`;
      if (options.email) record.email = `${f.toLowerCase()}.${l.toLowerCase()}@${domains[Math.floor(Math.random() * domains.length)]}`;
      if (options.age) record.age = Math.floor(Math.random() * (65 - 18 + 1)) + 18;
      return record;
    });
    setData(newData);
  }, [count, options]);

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-500">
      <SEOHelmet title="Random Data Generator" description="Generate valid JSON dummy data instantly." />
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Random Data</h1>
          <p className="mt-1 text-gray-500">Generate dummy JSON records locally.</p>
        </div>
        <Button onClick={generate} className="gap-2">
          <RefreshCw className="w-4 h-4" /> Generate Data
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1 h-fit">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Database className="w-5 h-5"/> Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Number of Rows</label>
              <input
                type="range" min="1" max="100" value={count}
                onChange={e => setCount(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-brand-600"
              />
              <div className="text-right text-sm font-mono text-brand-600 dark:text-brand-400">{count} records</div>
            </div>
            
            <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-gray-800">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Fields to Include</label>
              <div className="flex flex-col gap-3">
                <Toggle checked={options.id} onChange={e => setOptions({...options, id: e.target.checked})} label="UUID (id)" />
                <Toggle checked={options.name} onChange={e => setOptions({...options, name: e.target.checked})} label="Full Name" />
                <Toggle checked={options.email} onChange={e => setOptions({...options, email: e.target.checked})} label="Email Address" />
                <Toggle checked={options.age} onChange={e => setOptions({...options, age: e.target.checked})} label="Age (18-65)" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Generated JSON</CardTitle>
            <CopyButton value={JSON.stringify(data, null, 2)} />
          </CardHeader>
          <CardContent className="p-0">
            <div className="bg-gray-50 dark:bg-gray-900 min-h-[400px] max-h-[600px] overflow-auto p-4 rounded-b-2xl font-mono text-sm text-gray-800 dark:text-gray-200">
              {data.length ? (
                <pre>{JSON.stringify(data, null, 2)}</pre>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400 py-12">
                  Click 'Generate Data' to start
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
