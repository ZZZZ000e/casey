/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  distDir: 'out', // 强制指定输出目录名为 out
  images: {
    unoptimized: true,
  },
  // 避免在打包时因为静态路由问题导致失败
  trailingSlash: true, 
};

export default nextConfig;