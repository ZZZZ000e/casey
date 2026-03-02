/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',      // 核心设置：开启静态导出，生成 out 文件夹
  images: {
    unoptimized: true,   // 必须设置：静态导出不支持 Next.js 默认的图片优化
  },
  // 如果你的资源加载路径有问题，可以尝试解除下面这行的注释
  // assetPrefix: './', 
};

export default nextConfig;