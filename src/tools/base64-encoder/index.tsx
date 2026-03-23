import { useState, useEffect } from 'react';
import { SEOHelmet } from '../../components/SEOHelmet';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Textarea } from '../../components/ui/Input';
import { CopyButton } from '../../components/ui/CopyButton';
import { Button } from '../../components/ui/Button';
import { ArrowLeftRight } from 'lucide-react';

export default function Base64Encoder() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');

  // Debounced execution logic inside useEffect
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!input.trim()) {
        setOutput('');
        return;
      }
      try {
        if (mode === 'encode') {
          // encodeURIComponent handles unicode properly before btoa
          setOutput(btoa(unescape(encodeURIComponent(input))));
        } else {
          setOutput(decodeURIComponent(escape(atob(input))));
        }
      } catch (e) {
        setOutput('Error: Invalid input for chosen mode.');
      }
    }, 200);
    return () => clearTimeout(timer);
  }, [input, mode]);

  const toggleMode = () => {
    setMode(m => m === 'encode' ? 'decode' : 'encode');
    setInput(output);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
      <SEOHelmet title={`Base64 ${mode === 'encode' ? 'Encoder' : 'Decoder'}`} description="Fast Base64 encoding and decoding." />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Base64 Converter</h1>
          <p className="mt-1 text-gray-500">Encode or decode strings instantly.</p>
        </div>
        <Button onClick={toggleMode} variant="secondary" className="gap-2">
          <ArrowLeftRight className="w-4 h-4" />
          Switch to {mode === 'encode' ? 'Decode' : 'Encode'}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Input ({mode === 'encode' ? 'Text' : 'Base64'})</CardTitle>
            <Button size="sm" variant="ghost" onClick={() => setInput('')}>Clear</Button>
          </CardHeader>
          <CardContent>
            <Textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder={`Enter ${mode === 'encode' ? 'text to encode' : 'base64 to decode'}...`}
              className="min-h-[300px] border-0 focus:ring-0 px-0 resize-none bg-transparent"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Output ({mode === 'encode' ? 'Base64' : 'Text'})</CardTitle>
            <CopyButton value={output} />
          </CardHeader>
          <CardContent>
            <Textarea
              value={output}
              readOnly
              placeholder="Output will appear here..."
              className="min-h-[300px] border-0 focus:ring-0 px-0 resize-none bg-transparent text-brand-600 dark:text-brand-400 font-mono"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
