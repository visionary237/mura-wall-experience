/** @type {import('next').NextConfig} */
const nextConfig = {
  output: process.env.STATIC_EXPORT ? 'export' : undefined,
  trailingSlash: true,
  images: { unoptimized: true },
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || '',
};
export default nextConfig;
