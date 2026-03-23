import { useState, useEffect } from 'react';
import { SEOHelmet } from '../../components/SEOHelmet';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Textarea, Input } from '../../components/ui/Input';
import { CopyButton } from '../../components/ui/CopyButton';
import { Button } from '../../components/ui/Button';
import { md5, sha1, sha256 } from './utils';

export default function HashGenerator() {
  const [input, setInput] = useState('');
  const [hashes, setHashes] = useState({
    md5: '',
    sha1: '',
    sha256: ''
  });

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (!input.trim()) {
        setHashes({ md5: '', sha1: '', sha256: '' });
        return;
      }
      try {
        const md5Hash = md5(input);
        const sha1Hash = await sha1(input);
        const sha256Hash = await sha256(input);
        setHashes({
          md5: md5Hash,
          sha1: sha1Hash,
          sha256: sha256Hash
        });
      } catch (error) {
        console.error("Hashing failed", error);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [input]);

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
      <SEOHelmet 
        title="Hash Generator" 
        description="Free Hash Generator Online - Instantly generate MD5, SHA-1, and SHA-256 hashes." 
      />
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Hash Generator</h1>
          <p className="mt-1 text-gray-500">Generate secure cryptographic hashes instantly.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Input Text</CardTitle>
          <Button size="sm" variant="ghost" onClick={() => setInput('')}>Clear</Button>
        </CardHeader>
        <CardContent>
          <Textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Type or paste your text here..."
            className="min-h-[150px] border-0 focus:ring-0 px-0 resize-y bg-transparent"
          />
        </CardContent>
      </Card>

      <div className="space-y-4">
        {[
          { label: 'MD5', value: hashes.md5 },
          { label: 'SHA-1', value: hashes.sha1 },
          { label: 'SHA-256', value: hashes.sha256 }
        ].map(algo => (
          <Card key={algo.label}>
            <CardHeader className="py-3">
              <CardTitle className="text-sm font-bold">{algo.label}</CardTitle>
              <CopyButton value={algo.value} />
            </CardHeader>
            <CardContent className="py-4">
              <Input
                readOnly
                value={algo.value}
                placeholder={`${algo.label} hash will appear here...`}
                className="font-mono text-brand-600 dark:text-brand-400 bg-transparent border-none focus:ring-0 px-0 h-auto"
              />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
