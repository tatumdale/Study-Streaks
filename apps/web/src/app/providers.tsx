"use client";

import { SessionProvider as NextAuthSessionProvider } from "next-auth/react";
import { ReactNode } from "react";

/**
 * Client-side providers for StudyStreaks web application
 */

interface ProvidersProps {
  children: ReactNode;
}

export function SessionProvider({ children }: ProvidersProps) {
  return (
    <NextAuthSessionProvider>
      {children}
    </NextAuthSessionProvider>
  );
}