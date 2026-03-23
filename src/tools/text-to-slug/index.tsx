import { useState } from 'react';
import { SEOHelmet } from '../../components/SEOHelmet';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Textarea } from '../../components/ui/Input';
import { CopyButton } from '../../components/ui/CopyButton';

export default function TextToSlug() {
  const [input, setInput] = useState('');

  const slugify = (text: string) => {
    return text.toLowerCase().trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const output = slugify(input);

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
      <SEOHelmet title="Text to Slug Converter" description="Convert any string into an SEO-friendly URL slug." />
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Text to Slug Converter</h1>
        <p className="mt-1 text-gray-500">Generate clean, URL-friendly strings instantly.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Input Text</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="h-64 border-0 focus:ring-0 rounded-b-xl rounded-t-none resize-none bg-gray-50 dark:bg-gray-900/50"
              placeholder="Type or paste your text here..."
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Generated Slug</CardTitle>
            <CopyButton value={output} />
          </CardHeader>
          <CardContent className="p-0">
            <div className="w-full h-64 p-4 font-mono text-sm break-all overflow-y-auto bg-white dark:bg-[#1e1e1e] rounded-b-xl border-t-0 text-gray-800 dark:text-gray-200">
              {output || <span className="text-gray-400">your-url-slug-will-appear-here</span>}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
