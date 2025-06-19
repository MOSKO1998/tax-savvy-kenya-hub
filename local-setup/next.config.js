
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  env: {
    NEXTCLOUD_URL: process.env.NEXTCLOUD_URL,
    NEXTCLOUD_USERNAME: process.env.NEXTCLOUD_USERNAME,
    NEXTCLOUD_PASSWORD: process.env.NEXTCLOUD_PASSWORD,
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: '/api/:path*',
      },
    ];
  },
};

module.exports = nextConfig;
