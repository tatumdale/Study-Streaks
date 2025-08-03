'use client';

import { Button, Result } from 'antd';
import { signOut } from 'next-auth/react';

export default function AccessDeniedPage() {
  const handleSignOut = () => {
    signOut({ callbackUrl: '/auth/signin' });
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      padding: '20px'
    }}>
      <Result
        status="403"
        title="Access Denied"
        subTitle="You don't have permission to access the admin dashboard. School administrator privileges are required."
        extra={
          <Button type="primary" onClick={handleSignOut}>
            Sign Out & Try Again
          </Button>
        }
      />
    </div>
  );
}