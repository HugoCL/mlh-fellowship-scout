import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Image from "next/image";
import {
  ClerkLoaded,
  ClerkLoading,
  SignedIn,
  SignedOut,
  SignIn,
} from "@clerk/nextjs";

export default function LoginPage() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10 bg-blue-700">
        <div className="flex justify-center gap-2 md:justify-start">
          <Image
            src="/logo-light.svg"
            width={193}
            height={44}
            alt="MLH Fellowship"
          />
        </div>
        <div className="flex flex-1 items-center justify-center">
          <SignIn />
        </div>
      </div>
      <div className="relative hidden bg-muted lg:block">
        <img
          src="/placeholder.svg"
          alt="Image"
          className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
        />
      </div>
    </div>
  );
}
