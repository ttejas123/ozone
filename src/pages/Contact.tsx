import { Helmet } from 'react-helmet-async';
import { Mail, Clock, MessageSquare } from 'lucide-react';

export const Contact = () => {
  return (
    <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <Helmet>
        <title>Contact Us - DevTools Hub</title>
        <meta name="description" content="Contact DevTools Hub for questions, feedback, or issues" />
      </Helmet>
      
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm border border-gray-200 dark:border-gray-700 text-center">
        <div className="w-16 h-16 rounded-2xl bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center text-brand-600 dark:text-brand-400 mx-auto mb-6">
          <MessageSquare className="w-8 h-8" />
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Contact Us</h1>
        
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-xl mx-auto mb-10">
          If you have any questions, feedback, or issues, feel free to reach out.
        </p>

        <div className="flex flex-col sm:flex-row gap-6 justify-center max-w-2xl mx-auto">
          <div className="flex-1 bg-gray-50 dark:bg-gray-900/50 p-6 rounded-xl border border-gray-100 dark:border-gray-700 flex flex-col items-center">
            <Mail className="w-6 h-6 text-brand-500 mb-3" />
            <h3 className="font-medium text-gray-900 dark:text-white mb-2">Email</h3>
            <a href="mailto:tthakare73@gmail.com" className="text-brand-600 dark:text-brand-400 hover:underline">
              tthakare73@gmail.com
            </a>
          </div>
          
          <div className="flex-1 bg-gray-50 dark:bg-gray-900/50 p-6 rounded-xl border border-gray-100 dark:border-gray-700 flex flex-col items-center">
            <Clock className="w-6 h-6 text-brand-500 mb-3" />
            <h3 className="font-medium text-gray-900 dark:text-white mb-2">Response Time</h3>
            <span className="text-gray-600 dark:text-gray-300">
              Usually 24–48 hours
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
