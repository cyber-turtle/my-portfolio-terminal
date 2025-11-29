/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',  // Enable static HTML export
  images: {
    unoptimized: true  // Required for static export
  },
  // Note: basePath removed for custom domain deployment
  // If deploying to GitHub Pages without custom domain, uncomment:
  // basePath: '/my-portfolio-terminal',
}

module.exports = nextConfig