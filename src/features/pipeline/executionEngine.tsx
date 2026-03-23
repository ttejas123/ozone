import { renderToStaticMarkup } from 'react-dom/server';
import { QRCodeSVG } from 'qrcode.react';
import { compressData } from '@/tools/compression-tool/utils';

export async function executeNode(toolId: string, input: any): Promise<any> {
  // Ensure we stringify input if needed
  const inputStr = typeof input === 'string' ? input : JSON.stringify(input || '');

  switch (toolId) {
    case 'qr-generator': {
      // Input: newline or comma separated URLs
      const urls = inputStr.split(/[\n,]+/).map((u: string) => u.trim()).filter(Boolean);
      
      const results = urls.map((url: string) => {
        // Render QR Code as static SVG markup
        const svgString = renderToStaticMarkup(
          <QRCodeSVG value={url} size={220} level="H" includeMargin={false} />
        );
        // Convert to base64 Data URI
        return 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgString)));
      });
      
      return results; // Returns string[]
    }
    
    case 'compression-tool': {
      // Input: any string (e.g. JSON stringified array of QRs)
      const compressed = await compressData(inputStr);
      return compressed; // Returns string
    }

    default: {
      if (toolId === 'text-to-slug') {
        return inputStr.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');
      }
      if (toolId === 'json-formatter') {
        try { return JSON.stringify(JSON.parse(inputStr), null, 2); } catch { return 'Invalid JSON'; }
      }
      // Demo delay
      await new Promise((res) => setTimeout(res, 500));
      return `Result of ${toolId} processing: ${inputStr.slice(0, 50)}...`;
    }
  }
}
