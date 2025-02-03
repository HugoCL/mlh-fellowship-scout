import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { Open_Sans } from "next/font/google";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
const opensans = Open_Sans({
  subsets: ["latin"],
  display: "swap",
});

import "./globals.css";

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
      <html lang="en" className={opensans.className}>
        <body>{children}</body>
      </html>
    </ClerkProvider>
  );
}
