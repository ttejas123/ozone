import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOHelmetProps {
  title: string;
  description: string;
  canonical?: string;
  type?: string;
}

export const SEOHelmet: React.FC<SEOHelmetProps> = ({
  title,
  description,
  canonical,
  type = 'website',
}) => {
  const fullTitle = `${title} | Dev Tools Hub`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      
      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:title" content={fullTitle} />
      <meta property="twitter:description" content={description} />

      {canonical && <link rel="canonical" href={canonical} />}
    </Helmet>
  );
};
