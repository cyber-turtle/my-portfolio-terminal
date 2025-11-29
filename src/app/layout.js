import './globals.css'

export const metadata = {
  title: 'Mobile Terminal Portfolio',
  description: 'Interactive terminal-style portfolio',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}