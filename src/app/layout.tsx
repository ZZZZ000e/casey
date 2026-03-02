import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Casey - 情感咨询师',
  description:
    'Casey 是你的专业情感咨询师，擅长处理情侣和婚姻问题。在这里，你可以获得温柔、专业的情感陪伴和建议。',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Casey',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#F5F3FF" />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}