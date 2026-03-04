/** @type {import('next').NextConfig} */
const nextConfig = {
  // Force Turbopack to use this directory as the workspace root.
  // Fixes "Can't resolve 'tailwindcss' in '/Users/yodusanwo'" when a lockfile exists in the parent dir.
  experimental: {
    turbo: {
      root: __dirname,
    },
  },
};

module.exports = nextConfig;
