/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  async rewrites() {
    return [
      {
        source: '/actor/:path',
        destination: '/api/actor/:path',
      },
      {
        source: '/object/:path',
        destination: '/api/object/:path',
      },
      {
        source: '/activity/:path',
        destination: '/api/activity/:path',
      },
      {
        source: '/collection/:path',
        destination: '/api/collection/:path',
      },
      {
        source: '/link/:path',
        destination: '/api/link/:path',
      },
      {
        source: '/collection-page/:path',
        destination: '/api/collection-page/:path',
      },
  ]}
}

module.exports = nextConfig
