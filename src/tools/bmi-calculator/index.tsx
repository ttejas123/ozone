import { useState } from 'react';
import { SEOHelmet } from '../../components/SEOHelmet';
import { Card, CardContent } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';

export default function BmiCalculator() {
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState(''); // cm

  const bmi = weight && height ? (Number(weight) / Math.pow(Number(height) / 100, 2)).toFixed(1) : null;
  
  let category = '';
  let colorClass = 'text-gray-500';
  
  const b = Number(bmi);
  if (b > 0) {
    if (b < 18.5) { category = 'Underweight'; colorClass = 'text-blue-500'; }
    else if (b >= 18.5 && b < 24.9) { category = 'Normal weight'; colorClass = 'text-green-500'; }
    else if (b >= 25 && b < 29.9) { category = 'Overweight'; colorClass = 'text-yellow-500'; }
    else { category = 'Obesity'; colorClass = 'text-red-500'; }
  }

  return (
    <div className="max-w-xl mx-auto space-y-6 animate-in fade-in duration-500">
      <SEOHelmet title="BMI Calculator" description="Compute your Body Mass Index." />
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">BMI Calculator</h1>
        <p className="mt-1 text-gray-500">Check your health status.</p>
      </div>

      <Card>
        <CardContent className="p-8 space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Weight (kg)</label>
            <Input
              type="number"
              value={weight}
              onChange={e => setWeight(e.target.value)}
              placeholder="e.g. 70"
              className="text-lg"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Height (cm)</label>
            <Input
              type="number"
              value={height}
              onChange={e => setHeight(e.target.value)}
              placeholder="e.g. 175"
              className="text-lg"
            />
          </div>

          <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800 text-center space-y-2">
            <div className="text-sm text-gray-500">Your BMI</div>
            <div className="text-5xl font-bold tracking-tighter text-gray-900 dark:text-white">
              {bmi || '0.0'}
            </div>
            {bmi && (
              <div className={`text-lg font-medium inline-flex items-center gap-1.5 ${colorClass}`}>
                <span className="w-2 h-2 rounded-full bg-current"></span>
                {category}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
