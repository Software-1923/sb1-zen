import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Zenarith',
  description: 'Memory next app',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/photo/favicon.ico" />
        <link rel="apple-touch-icon" href="/photo/apple-touch-icon.png" />
        <link rel="manifest" href="/photo/site.webmanifest" />
        <link rel="icon" type="image/png" sizes="16x16" href="/photo/favicon-16x16.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/photo/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/photo/android-chrome-192x192.png" />
        <link rel="icon" type="image/png" sizes="512x512" href="/photo/android-chrome-512x512.png" />
        <meta name="theme-color" content="#0a5959" />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
