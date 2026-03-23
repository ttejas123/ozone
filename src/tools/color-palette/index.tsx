import { useState, useEffect } from 'react';
import { SEOHelmet } from '../../components/SEOHelmet';
import { Button } from '../../components/ui/Button';
import { useCopyToClipboard } from '../../hooks/useCopyToClipboard';
import { RefreshCw } from 'lucide-react';

export default function ColorPalette() {
  const [colors, setColors] = useState<string[]>([]);
  const { copyToClipboard } = useCopyToClipboard();

  const generatePalette = () => {
    const hslToHex = (h: number, s: number, l: number) => {
      l /= 100;
      const a = s * Math.min(l, 1 - l) / 100;
      const f = (n: number) => {
        const k = (n + h / 30) % 12;
        const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
        return Math.round(255 * color).toString(16).padStart(2, '0');
      };
      return `#${f(0)}${f(8)}${f(4)}`.toUpperCase();
    };

    const baseHue = Math.floor(Math.random() * 360);
    const newColors = Array.from({ length: 5 }).map((_, i) => {
      // Create analogous / monochromatic variations
      const h = (baseHue + (i * 15)) % 360;
      const s = 60 + Math.random() * 30; // 60-90%
      const l = 30 + (i * 12); // Lightness step
      return hslToHex(h, s, l);
    });
    setColors(newColors);
  };

  useEffect(() => {
    generatePalette();
  }, []);

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-500">
      <SEOHelmet title="Color Palette Generator" description="Generate beautiful UI color palettes." />
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Color Palette</h1>
          <p className="mt-1 text-gray-500">Click a color to copy its Hex code.</p>
        </div>
        <Button onClick={generatePalette} className="gap-2">
          <RefreshCw className="w-4 h-4" /> Generate
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row h-[50vh] min-h-[400px] rounded-2xl overflow-hidden shadow-sm border border-gray-200 dark:border-gray-800">
        {colors.map((color, i) => (
          <button
            key={i}
            onClick={() => copyToClipboard(color)}
            className="flex-1 flex flex-col justify-end p-6 group transition-all hover:flex-[1.5] relative"
            style={{ backgroundColor: color }}
          >
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
            <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur text-gray-900 dark:text-white px-4 py-2 rounded-lg font-mono text-sm font-semibold shadow-sm opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0">
              {color}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
