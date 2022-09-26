/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  webpack: (config, options) => {
    config.module.rules.push({
      test: /\.(ts)x?$/, // Just `tsx?` file only
      use: [
        // options.defaultLoaders.babel, I don't think it's necessary to have this loader too
        {
          loader: "ts-loader",
          options: {
            transpileOnly: true,
            experimentalWatchApi: true,
            onlyCompileBundledFiles: true,
          },
        },
      ],
    });

    return config;
  },
  async headers() {
    return [
      {
        source: '/api/path/:thing',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
        ],
      },
    ]
  },
  async rewrites() {
    return [
      {
        source: '/actor/:path',
        destination: '/api/thing/:path',
      },
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
    ]
  }
}

module.exports = nextConfig
