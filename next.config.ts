import type { NextConfig } from 'next';

const config: NextConfig = {
  rewrites: async () => [
    {
      source: '/api/checkout',
      destination: 'http://localhost:3002/api/checkout',
    },
  ],
  redirects: async () => [
    // Old URLs → new SEO URLs (301 permanent)
    {
      source: '/weil-am-rhein/privates-buero',
      destination: '/weil-am-rhein/buero-mieten',
      permanent: true,
    },
    {
      source: '/weil-am-rhein/geschaeftsadresse',
      destination: '/weil-am-rhein/geschaeftsadresse-mieten',
      permanent: true,
    },
    {
      source: '/weil-am-rhein/konferenzraum',
      destination: '/weil-am-rhein/konferenzraum-mieten',
      permanent: true,
    },
    {
      source: '/weil-am-rhein/coachingbuero',
      destination: '/weil-am-rhein/coachingbuero-mieten',
      permanent: true,
    },
    {
      source: '/weil-am-rhein/tagesbuero',
      destination: '/weil-am-rhein/tagesbuero-mieten',
      permanent: true,
    },
  ],
};

export default config;
