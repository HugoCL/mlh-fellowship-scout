import { TanstackQuery } from "@/providers/tanstack-query";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <TanstackQuery>{children}</TanstackQuery>
    </>
  );
}
