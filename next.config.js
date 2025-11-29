/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',  // Enable static HTML export
  images: {
    unoptimized: true  // Required for static export
  },
  // Required for GitHub Pages deployment with repository name
  basePath: '/my-portfolio-terminal',
}

module.exports = nextConfig