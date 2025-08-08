/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuration pour les images externes
  images: {
    // Pour Next.js 12.3.0+
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
    ],
    // Pour les versions antérieures de Next.js
    domains: ['images.unsplash.com'],
  },

  // Configuration pour les appels API vers le backend
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:5001/api/:path*'
      }
    ]
  },

  // Configuration des headers pour éviter les problèmes CORS
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,DELETE,PATCH,POST,PUT' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version' },
        ]
      }
    ]
  },

  // Options supplémentaires
  reactStrictMode: true,
  swcMinify: true,
}

module.exports = nextConfig