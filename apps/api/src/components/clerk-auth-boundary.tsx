"use client";

import {
  ClerkDegraded,
  ClerkFailed,
  ClerkLoaded,
  ClerkLoading,
} from "@clerk/nextjs";
import { useEffect, useState } from "react";

type ClerkAuthBoundaryProps = {
  children: React.ReactNode;
};

function AuthLoading() {
  return (
    <div className="w-full max-w-md rounded-xl border bg-background p-8 text-center shadow-sm">
      <p className="text-sm text-muted-foreground">Loading sign in...</p>
    </div>
  );
}

function AuthFailed() {
  return (
    <div className="w-full max-w-md rounded-xl border border-destructive/40 bg-background p-8 text-center shadow-sm">
      <h1 className="text-lg font-semibold">Unable to load authentication</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Clerk could not be reached from this browser. Verify your Clerk custom domain TLS/DNS setup, then refresh.
      </p>
      <button
        type="button"
        className="mt-4 inline-flex h-9 items-center rounded-md border px-4 text-sm font-medium hover:bg-muted"
        onClick={() => window.location.reload()}
      >
        Retry
      </button>
    </div>
  );
}

export function ClerkAuthBoundary({ children }: ClerkAuthBoundaryProps) {
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setTimedOut(true);
    }, 8000);
    return () => window.clearTimeout(timeoutId);
  }, []);

  return (
    <>
      <ClerkLoading>
        {timedOut ? <AuthFailed /> : <AuthLoading />}
      </ClerkLoading>
      <ClerkLoaded>{children}</ClerkLoaded>
      <ClerkDegraded>
        <AuthFailed />
      </ClerkDegraded>
      <ClerkFailed>
        <AuthFailed />
      </ClerkFailed>
    </>
  );
}
