import { TrackedReposProvider } from "../contexts/tracked-repos-context";

import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <TrackedReposProvider>{children}</TrackedReposProvider>
      </body>
    </html>
  );
}
