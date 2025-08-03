'use client';

import { Refine } from '@refinedev/core';
import { RefineKbar, RefineKbarProvider } from '@refinedev/kbar';
import {
  useNotificationProvider,
  ThemedLayoutV2,
  ThemedSiderV2,
  ThemedTitleV2,
} from '@refinedev/antd';
import routerBindings from '@refinedev/nextjs-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { App as AntdApp, ConfigProvider } from 'antd';
import dataProvider from '@refinedev/simple-rest';
import { 
  DashboardOutlined,
  UserOutlined,
  BookOutlined,
  TrophyOutlined,
} from '@ant-design/icons';
import CustomSider from '@/components/custom-sider';
import LogoutSection from '@/components/logout-section';

import '@refinedev/antd/dist/reset.css';

const queryClient = new QueryClient();

export function RefineContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <QueryClientProvider client={queryClient}>
      <ConfigProvider
        theme={{
          token: {
            colorPrimary: '#1890ff',
            borderRadius: 6,
          },
        }}
      >
        <AntdApp>
          <RefineKbarProvider>
            <Refine
              routerProvider={routerBindings}
              dataProvider={dataProvider('http://localhost:3002/api')}
              notificationProvider={useNotificationProvider}
              resources={[
                {
                  name: 'dashboard',
                  list: '/dashboard',
                  meta: {
                    label: 'Dashboard',
                    icon: <DashboardOutlined />,
                  },
                },
                {
                  name: 'students',
                  list: '/students',
                  meta: {
                    label: 'Students',
                    icon: <UserOutlined />,
                  },
                },
                {
                  name: 'clubs',
                  list: '/clubs',
                  meta: {
                    label: 'Clubs',
                    icon: <BookOutlined />,
                  },
                },
                {
                  name: 'achievements',
                  list: '/achievements',
                  meta: {
                    label: 'Achievements',
                    icon: <TrophyOutlined />,
                  },
                },
              ]}
              options={{
                syncWithLocation: true,
                warnWhenUnsavedChanges: true,
                useNewQueryKeys: true,
                projectId: 'study-streaks-admin',
              }}
            >
              <ThemedLayoutV2
                Header={() => null}
                Sider={(props) => {
                  // Create a wrapper that adds logout functionality to the existing sider
                  return (
                    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                      {/* Original Refine Sider */}
                      <div style={{ flex: 1 }}>
                        <ThemedSiderV2
                          {...props}
                          Title={({ collapsed }) => (
                            <ThemedTitleV2
                              collapsed={collapsed}
                              text="StudyStreaks"
                              icon="📚"
                            />
                          )}
                        />
                      </div>
                      
                      {/* Custom Logout Section */}
                      <LogoutSection collapsed={props.collapsed} />
                    </div>
                  );
                }}
              >
                {children}
              </ThemedLayoutV2>
              <RefineKbar />
            </Refine>
          </RefineKbarProvider>
        </AntdApp>
      </ConfigProvider>
    </QueryClientProvider>
  );
}