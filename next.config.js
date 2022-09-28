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
        source: '/_entity',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
        ],
      },
      {
        source: '/api/[username]/inbox',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
        ],
      },
      {
        source: '/api/[username]/outbox',
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
        source: '/actor/:path/outbox',
        destination: '/_outbox',
      },
      {
        source: '/actor/:path/inbox',
        destination: '/_inbox',
      },
      {
        source: '/actor/:username/:thing/inbox',
        destination: '/_inbox',
      },
      {
        source: '/actor/:username/:thing/outbox',
        destination: '/_outbox',
      },
      {
        source: '/actor/:username/:collection/:path/:thing/inbox',
        destination: '/_inbox',
      },
      {
        source: '/actor/:username/:collection/:path/:thing/outbox',
        destination: '/_outbox',
      },
      {
        source: '/actor/:path',
        destination: '/_entity',
      },
      {
        source: '/actor/:path',
        destination: '/_entity',
      },
      {
        source: '/actor/:username/:path',
        destination: '/_entity',
      },
      {
        source: '/actor/:username/:collection/:path',
        destination: '/_entity',
      },
      {
        source: '/actor/:username/:thing/:collection/:path',
        destination: '/_entity',
      },
      {
        source: '/object/:path',
        destination: '/_entity',
      },
      {
        source: '/object/:thing/:path',
        destination: '/_entity',
      },
      {
        source: '/activity/:path',
        destination: '/_entity',
      },
      {
        source: '/collection/:path',
        destination: '/_entity',
      },
      {
        source: '/collection-page/:path',
        destination: '/_entity',
      },
      {
        source: '/link/:path',
        destination: '/_entity',
      },
    ]
  }
}

module.exports = nextConfig
