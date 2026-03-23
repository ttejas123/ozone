import { useState } from 'react';
import { SEOHelmet } from '../../components/SEOHelmet';
import { Card, CardContent } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { ArrowLeftRight } from 'lucide-react';

export default function UnitConverter() {
  const [kg, setKg] = useState('');
  const [lb, setLb] = useState('');

  const handleKg = (val: string) => {
    setKg(val);
    if (!val || isNaN(Number(val))) {
      setLb('');
      return;
    }
    setLb((Number(val) * 2.20462).toFixed(4));
  };

  const handleLb = (val: string) => {
    setLb(val);
    if (!val || isNaN(Number(val))) {
      setKg('');
      return;
    }
    setKg((Number(val) / 2.20462).toFixed(4));
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-500">
      <SEOHelmet title="Unit Converter (Kg & Lb)" description="Convert Kilograms to Pounds instantly." />
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Unit Converter</h1>
        <p className="mt-1 text-gray-500">Fast 2-way conversion.</p>
      </div>

      <Card>
        <CardContent className="p-8 flex flex-col md:flex-row items-center gap-6">
          <div className="w-full space-y-2">
            <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Kilograms (kg)</label>
            <Input
              type="number"
              value={kg}
              onChange={e => handleKg(e.target.value)}
              placeholder="0.0"
              className="text-2xl h-14 font-semibold"
            />
          </div>
          <ArrowLeftRight className="w-8 h-8 text-gray-300 md:mt-6 shrink-0 rotate-90 md:rotate-0" />
          <div className="w-full space-y-2">
            <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Pounds (lb)</label>
            <Input
              type="number"
              value={lb}
              onChange={e => handleLb(e.target.value)}
              placeholder="0.0"
              className="text-2xl h-14 font-semibold"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
