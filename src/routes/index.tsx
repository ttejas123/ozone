import { Suspense, lazy } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { Home } from '@/pages/Home';

// Lazy loaded tools mapped to the new structure
const JsonFormatter = lazy(() => import('@/tools/json-formatter'));
const PasswordGenerator = lazy(() => import('@/tools/password-generator'));
const TextToSlug = lazy(() => import('@/tools/text-to-slug'));
const Base64Encoder = lazy(() => import('@/tools/base64-encoder'));
const QrGenerator = lazy(() => import('@/tools/qr-generator'));
const TimestampConverter = lazy(() => import('@/tools/timestamp-converter'));
const UnitConverter = lazy(() => import('@/tools/unit-converter'));
const BmiCalculator = lazy(() => import('@/tools/bmi-calculator'));
const ColorPalette = lazy(() => import('@/tools/color-palette'));
const RandomData = lazy(() => import('@/tools/random-data'));

// New tools
const HashGenerator = lazy(() => import('@/tools/hash-generator'));
const TextCaseConverter = lazy(() => import('@/tools/text-case-converter'));
const WordCounter = lazy(() => import('@/tools/word-counter'));
const TinyUrlGenerator = lazy(() => import('@/tools/tinyurl-generator'));
const ImageToGif = lazy(() => import('@/tools/image-to-gif'));
const MergePdf = lazy(() => import('@/tools/merge-pdf'));
const WordToPdf = lazy(() => import('@/tools/word-to-pdf'));

// Advanced Tools
const DiffChecker = lazy(() => import('@/tools/diff-checker'));
const CompressionTool = lazy(() => import('@/tools/compression-tool'));
const DataVisualizer = lazy(() => import('@/tools/data-visualizer'));

// Minimal, Vercel-like Suspense fallback
const PageLoader = () => (
  <div className="flex justify-center items-center min-h-[60vh]">
    <div className="w-6 h-6 rounded-full border-2 border-brand-500 border-t-transparent animate-spin"></div>
  </div>
);

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: 'json-formatter',
        element: <Suspense fallback={<PageLoader />}><JsonFormatter /></Suspense>,
      },
      {
        path: 'password-generator',
        element: <Suspense fallback={<PageLoader />}><PasswordGenerator /></Suspense>,
      },
      {
        path: 'text-to-slug',
        element: <Suspense fallback={<PageLoader />}><TextToSlug /></Suspense>,
      },
      {
        path: 'base64-encoder',
        element: <Suspense fallback={<PageLoader />}><Base64Encoder /></Suspense>,
      },
      {
        path: 'qr-generator',
        element: <Suspense fallback={<PageLoader />}><QrGenerator /></Suspense>,
      },
      {
        path: 'timestamp-converter',
        element: <Suspense fallback={<PageLoader />}><TimestampConverter /></Suspense>,
      },
      {
        path: 'unit-converter',
        element: <Suspense fallback={<PageLoader />}><UnitConverter /></Suspense>,
      },
      {
        path: 'bmi-calculator',
        element: <Suspense fallback={<PageLoader />}><BmiCalculator /></Suspense>,
      },
      {
        path: 'color-palette',
        element: <Suspense fallback={<PageLoader />}><ColorPalette /></Suspense>,
      },
      {
        path: 'random-data',
        element: <Suspense fallback={<PageLoader />}><RandomData /></Suspense>,
      },
      {
        path: 'hash-generator',
        element: <Suspense fallback={<PageLoader />}><HashGenerator /></Suspense>,
      },
      {
        path: 'text-case-converter',
        element: <Suspense fallback={<PageLoader />}><TextCaseConverter /></Suspense>,
      },
      {
        path: 'word-counter',
        element: <Suspense fallback={<PageLoader />}><WordCounter /></Suspense>,
      },
      {
        path: 'tinyurl-generator',
        element: <Suspense fallback={<PageLoader />}><TinyUrlGenerator /></Suspense>,
      },
      {
        path: 'image-to-gif',
        element: <Suspense fallback={<PageLoader />}><ImageToGif /></Suspense>,
      },
      {
        path: 'merge-pdf',
        element: <Suspense fallback={<PageLoader />}><MergePdf /></Suspense>,
      },
      {
        path: 'word-to-pdf',
        element: <Suspense fallback={<PageLoader />}><WordToPdf /></Suspense>,
      },
      {
        path: 'diff-checker',
        element: <Suspense fallback={<PageLoader />}><DiffChecker /></Suspense>,
      },
      {
        path: 'compression-tool',
        element: <Suspense fallback={<PageLoader />}><CompressionTool /></Suspense>,
      },
      {
        path: 'data-visualizer',
        element: <Suspense fallback={<PageLoader />}><DataVisualizer /></Suspense>,
      },
      {
        path: '*',
        element: <Navigate to="/" replace />,
      },
    ],
  },
]);
