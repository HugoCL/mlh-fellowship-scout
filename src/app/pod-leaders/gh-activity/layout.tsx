import { TrackedReposProvider } from "@/contexts/tracked-repos-context";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <TrackedReposProvider>{children}</TrackedReposProvider>
    </>
  );
}
