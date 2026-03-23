import { useState, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { SEOHelmet } from '../../components/SEOHelmet';
import { Card, CardContent } from '../../components/ui/Card';
import { Textarea } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Download } from 'lucide-react';

export default function QrGenerator() {
  const [text, setText] = useState('https://example.com');
  const svgRef = useRef<SVGSVGElement>(null);

  const downloadQr = () => {
    if (!svgRef.current) return;
    const svgData = new XMLSerializer().serializeToString(svgRef.current);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      if (ctx) {
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        const pngFile = canvas.toDataURL('image/png');
        const downloadLink = document.createElement('a');
        downloadLink.download = 'qr-code.png';
        downloadLink.href = `${pngFile}`;
        downloadLink.click();
      }
    };
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
      <SEOHelmet title="QR Code Generator" description="Generate and download custom high res QR codes." />
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">QR Code Generator</h1>
        <p className="mt-1 text-gray-500">Fast, local, high resolution QR codes for URLs and text.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <Card>
          <CardContent className="p-6 space-y-4">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Content</label>
            <Textarea
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="Enter URL, text or contact info..."
              className="h-32"
            />
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => setText('https://')}>URL</Button>
              <Button variant="secondary" onClick={() => setText('WIFI:S:NetworkName;T:WPA;P:Password;;')}>WiFi</Button>
            </div>
          </CardContent>
        </Card>

        <Card className="flex flex-col items-center justify-center p-8 bg-brand-50/30 dark:bg-gray-800/20">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            {text ? (
              <QRCodeSVG 
                value={text} 
                size={220} 
                level={"H"}
                includeMargin={false}
                ref={svgRef}
              />
            ) : (
              <div className="w-[220px] h-[220px] bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-sm text-gray-400">
                Enter text
              </div>
            )}
          </div>
          <div className="mt-8 flex gap-3 w-full justify-center">
            <Button onClick={downloadQr} disabled={!text} className="w-full md:w-auto gap-2">
              <Download className="w-4 h-4" /> Download PNG
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
