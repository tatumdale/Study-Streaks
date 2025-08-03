'use client';

import React from 'react';
import { Layout, Menu, Button, Typography } from 'antd';
import { 
  DashboardOutlined,
  UserOutlined,
  BookOutlined,
  TrophyOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined
} from '@ant-design/icons';
import { signOut, useSession } from 'next-auth/react';
import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

const { Sider } = Layout;
const { Text } = Typography;

interface CustomSiderProps {
  collapsed?: boolean;
  onCollapse?: (collapsed: boolean) => void;
  [key: string]: any;
}

export default function CustomSider({ collapsed, onCollapse, ...props }: CustomSiderProps) {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    setLoading(true);
    await signOut({ 
      callbackUrl: '/auth/signin',
      redirect: true 
    });
  };

  const menuItems = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
      onClick: () => router.push('/dashboard')
    },
    {
      key: '/students',
      icon: <UserOutlined />,
      label: 'Students',
      onClick: () => router.push('/students')
    },
    {
      key: '/clubs',
      icon: <BookOutlined />,
      label: 'Clubs',
      onClick: () => router.push('/clubs')
    },
    {
      key: '/achievements',
      icon: <TrophyOutlined />,
      label: 'Achievements',
      onClick: () => router.push('/achievements')
    }
  ];

  return (
    <Sider 
      trigger={null} 
      collapsible 
      collapsed={collapsed}
      style={{ 
        background: '#fff',
        borderRight: '1px solid #f0f0f0',
        height: '100vh',
        position: 'fixed',
        left: 0,
        zIndex: 1000
      }}
      width={200}
    >
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        height: '100%' 
      }}>
        
        {/* Header with Logo */}
        <div style={{
          padding: '0 16px',
          display: 'flex',
          justifyContent: 'flex-start',
          alignItems: 'center',
          height: '64px',
          backgroundColor: '#fff',
          borderBottom: '1px solid #f0f0f0'
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            fontSize: '14px',
            fontWeight: 'bold',
            color: '#1890ff'
          }}>
            <div style={{ fontSize: '24px', marginRight: collapsed ? 0 : '8px' }}>📚</div>
            {!collapsed && <span>StudyStreaks</span>}
          </div>
        </div>

        {/* Navigation Menu */}
        <div style={{ flex: 1, paddingTop: '8px' }}>
          <Menu
            mode="inline"
            selectedKeys={[pathname]}
            items={menuItems}
            style={{ 
              border: 'none',
              background: 'transparent'
            }}
          />
        </div>

        {/* User Info and Logout */}
        <div style={{ 
          padding: collapsed ? '8px' : '16px',
          borderTop: '1px solid #f0f0f0',
          backgroundColor: '#fff'
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
              <Text ellipsis style={{ fontSize: '12px' }}>
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

        {/* Collapse Toggle */}
        <Button
          type="text"
          icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={() => onCollapse?.(!collapsed)}
          style={{
            width: '100%',
            height: '48px',
            borderTop: '1px solid #f0f0f0',
            borderRadius: 0,
            color: '#1890ff'
          }}
        />
      </div>
    </Sider>
  );
}