import { ClerkProvider } from '@clerk/nextjs';
import { dark } from '@clerk/themes';
import { Inter } from 'next/font/google';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
});

import './globals.css';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'MLH Fellowship Toolbox',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider
      appearance={{
        baseTheme: dark,
      }}
    >
      <html lang='en' className={inter.className}>
        <body>{children}</body>
      </html>
    </ClerkProvider>
  );
}
