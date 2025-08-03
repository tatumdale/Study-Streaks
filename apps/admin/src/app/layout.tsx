import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { getServerSession } from 'next-auth';
import { authOptions } from '@study-streaks/auth';
import { RefineContextProvider } from '@/providers/refine-context';
import SessionProviderWrapper from '@/providers/session-provider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'StudyStreaks Admin Dashboard',
  description: 'School administration interface for StudyStreaks platform',
  icons: {
    icon: '/favicon.ico',
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="en">
      <body className={inter.className}>
        <SessionProviderWrapper session={session}>
          <RefineContextProvider>
            {children}
          </RefineContextProvider>
        </SessionProviderWrapper>
      </body>
    </html>
  );
}