import type { NextConfig } from 'next';

const config: NextConfig = {
  rewrites: async () => [
    {
      source: '/api/checkout',
      destination: 'http://localhost:3002/api/checkout',
    },
  ],
};

export default config;
