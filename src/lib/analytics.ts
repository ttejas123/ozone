// src/lib/analytics.ts

// Define standard parameter types
export interface TrackEventParams {
  [key: string]: string | number | boolean | undefined;
}

// Ensure window.gtag exists for TypeScript
declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}

const GA_MEASUREMENT_ID = 'G-0M9TCY2JGB';
const ADSENSE_CLIENT_ID = 'ca-pub-9538506658422753';

// Only call once the user has granted cookie consent (see CookieConsent.tsx).
export const initGA = () => {
  if (typeof window === 'undefined') return;
  if (document.getElementById('ga-script')) return;

  window.dataLayer = window.dataLayer || [];
  window.gtag = function (...args: any[]) {
    window.dataLayer.push(args);
  };

  window.gtag('js', new Date());
  window.gtag('config', GA_MEASUREMENT_ID, {
    send_page_view: false // We will track page views manually on route changes
  });

  const gaScript = document.createElement('script');
  gaScript.id = 'ga-script';
  gaScript.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  gaScript.async = true;
  document.head.appendChild(gaScript);
};

// Only call once the user has granted cookie consent (see CookieConsent.tsx).
export const loadAds = () => {
  if (typeof window === 'undefined') return;
  if (document.getElementById('adsbygoogle-script')) return;

  const adsScript = document.createElement('script');
  adsScript.id = 'adsbygoogle-script';
  adsScript.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT_ID}`;
  adsScript.async = true;
  adsScript.crossOrigin = 'anonymous';
  document.head.appendChild(adsScript);
};

export const trackPageView = (path: string, title?: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'page_view', {
      page_path: path,
      page_title: title || document.title,
    });
  }
};

export const trackEvent = (eventName: string, params?: TrackEventParams) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, params);
  }
};
