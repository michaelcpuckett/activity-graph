/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  async rewrites() {
    return [
      {
        source: '/object/:path/:object/:guid',
        destination: '/api/object/:path/:object/:guid',
      },
      {
        source: '/object/:path/:object',
        destination: '/api/object/:path/:object',
      },
      {
        source: '/object/:path',
        destination: '/api/object/:path',
      },
  ]}
}

module.exports = nextConfig
