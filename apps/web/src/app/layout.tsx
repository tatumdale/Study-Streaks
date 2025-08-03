import './global.css';
import { SessionProvider } from './providers';

export const metadata = {
  title: 'StudyStreaks - UK Educational Platform',
  description: 'Comprehensive homework tracking and student progress platform for UK primary schools',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
