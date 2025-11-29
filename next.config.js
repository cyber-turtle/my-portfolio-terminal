/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',  // Enable static HTML export
  images: {
    unoptimized: true  // Required for static export
  },
  // Uncomment the line below if deploying to GitHub Pages with a repository name
  // basePath: '/your-repo-name',
}

module.exports = nextConfig