import { Helmet } from 'react-helmet-async';
import { Shield } from 'lucide-react';

export const PrivacyPolicy = () => {
  return (
    <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <Helmet>
        <title>Privacy Policy - DevTools Hub</title>
        <meta name="description" content="Privacy Policy for DevTools Hub" />
      </Helmet>
      
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-xl bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center text-brand-600 dark:text-brand-400">
            <Shield className="w-6 h-6" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Privacy Policy</h1>
        </div>

        <div className="prose dark:prose-invert max-w-none text-gray-600 dark:text-gray-300">
          <p className="font-medium text-lg mb-6 text-gray-900 dark:text-white">We value your privacy.</p>
          
          <p>This website uses third-party services like Google AdSense and Google Analytics which may use cookies to serve ads and analyze traffic.</p>
          
          <h3 className="text-xl font-semibold mt-8 mb-4 text-gray-900 dark:text-white">Information collected:</h3>
          <ul className="list-disc pl-5 space-y-2 mb-6">
            <li>Usage data (pages visited, time spent)</li>
            <li>Device/browser information</li>
          </ul>
          
          <p className="mb-6">Google may use cookies to show relevant ads.</p>
          
          <p className="mb-6">
            You can opt out of personalized ads by visiting:{' '}
            <a href="https://adssettings.google.com/" target="_blank" rel="noopener noreferrer" className="text-brand-600 dark:text-brand-400 hover:underline break-all">
              https://adssettings.google.com/
            </a>
          </p>
          
          <p className="mb-8 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-100 dark:border-gray-700">
            We do not collect personal sensitive information.
          </p>
          
          <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Contact Us</h3>
            <p>
              If you have any questions, contact us at:{' '}
              <a href="mailto:tthakare73@gmail.com" className="text-brand-600 dark:text-brand-400 hover:underline">
                tthakare73@gmail.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
