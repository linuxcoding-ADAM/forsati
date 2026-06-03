/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Local public/ images don't need a domain config.
    // The logo.png is served from public/ so Next.js Image works out of the box.
    unoptimized: false,
  },
  // Suppress the "use client" directive boundary warning noise
  reactStrictMode: true,
};
export default nextConfig;