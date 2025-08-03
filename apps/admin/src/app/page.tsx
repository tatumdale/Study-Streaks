'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Spin } from 'antd';

export default function RootPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return; // Still loading
    
    if (!session) {
      // Not authenticated, redirect to login
      router.push('/auth/signin');
    } else if (session.user?.userType === 'schoolAdmin' || session.user?.userType === 'admin') {
      // Authenticated admin user, redirect to dashboard
      router.push('/dashboard');
    } else {
      // Authenticated but not admin, redirect to access denied
      router.push('/auth/access-denied');
    }
  }, [session, status, router]);

  // Show loading spinner while redirecting
  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center' 
    }}>
      <Spin size="large" />
    </div>
  );
}