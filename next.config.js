/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  async rewrites() {
    return [
      {
        source: '/actor/:path',
        destination: '/api/thing/:path',
      },
      {
        source: '/actor/:username/:path',
        destination: '/api/thing/:path',
      },
      {
        source: '/actor/:username/:collection/:path',
        destination: '/api/thing/:path',
      },
      {
        source: '/actor/:username/:thing/:collection/:path',
        destination: '/api/thing/:path',
      },
      {
        source: '/object/:path',
        destination: '/api/thing/:path',
      },
      {
        source: '/object/:thing/:path',
        destination: '/api/thing/:path',
      },
      {
        source: '/activity/:path',
        destination: '/api/thing/:path',
      },
      {
        source: '/collection/:path',
        destination: '/api/thing/:path',
      },
      {
        source: '/collection-page/:path',
        destination: '/api/thing/:path',
      },
      {
        source: '/link/:path',
        destination: '/api/thing/:path',
      },
  ]}
}

module.exports = nextConfig
