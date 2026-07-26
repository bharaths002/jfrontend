import type { NextConfig } from 'next';



const nextConfig: NextConfig = {
  devIndicators: false,

    typescript: {
    // Also ignore TypeScript errors during build for deployment
    ignoreBuildErrors: true,
  },

  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '5000',
        pathname: '/logos/**',
      },
            {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;