/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  serverExternalPackages: ['fs', 'path'],
};

module.exports = nextConfig;
