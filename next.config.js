/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true
  },
  basePath: '/my-portfolio-terminal',
  assetPrefix: '/my-portfolio-terminal/',
}

module.exports = nextConfig