/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Optimize images for Vercel
  images: {
    unoptimized: false,
    domains: [],
  },
  // Vercel-specific optimizations
  experimental: {
    optimizePackageImports: ['@heroicons/react', 'lucide-react'],
  },
};

export default nextConfig;
