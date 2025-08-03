'use client';

import { Button, Typography } from 'antd';
import { LogoutOutlined, UserOutlined } from '@ant-design/icons';
import { signOut, useSession } from 'next-auth/react';
import { useState } from 'react';

const { Text } = Typography;

interface LogoutSectionProps {
  collapsed?: boolean;
}

export default function LogoutSection({ collapsed }: LogoutSectionProps) {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    await signOut({ 
      callbackUrl: '/auth/signin',
      redirect: true 
    });
  };

  return (
    <div style={{ 
      padding: collapsed ? '8px' : '16px',
      borderTop: '1px solid #f0f0f0',
      backgroundColor: '#fff',
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      zIndex: 1001
    }}>
      {!collapsed && session?.user && (
        <div style={{ 
          marginBottom: '8px', 
          fontSize: '12px', 
          color: '#666',
          display: 'flex',
          alignItems: 'center'
        }}>
          <UserOutlined style={{ marginRight: '6px' }} />
          <Text ellipsis style={{ fontSize: '12px', color: '#666' }}>
            {session.user.name || session.user.email}
          </Text>
        </div>
      )}
      
      <Button
        type="text"
        icon={<LogoutOutlined />}
        loading={loading}
        onClick={handleLogout}
        block={!collapsed}
        size={collapsed ? 'small' : 'middle'}
        style={{ 
          color: '#ff4d4f',
          borderColor: 'transparent',
          justifyContent: collapsed ? 'center' : 'flex-start',
          padding: collapsed ? '4px' : '4px 8px'
        }}
        title={collapsed ? 'Sign Out' : undefined}
      >
        {!collapsed && 'Sign Out'}
      </Button>
    </div>
  );
}