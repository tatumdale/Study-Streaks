'use client';

import { useState } from 'react';
import { signIn, getSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, Form, Input, Button, Typography, Alert, Space } from 'antd';
import { UserOutlined, LockOutlined, LoginOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

/**
 * StudyStreaks Admin Login Page
 * School administrator authentication for UK educational platform
 */
export default function AdminSignInPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (values: { email: string; password: string }) => {
    setLoading(true);
    setError('');

    try {
      const result = await signIn('credentials', {
        email: values.email,
        password: values.password,
        redirect: false,
      });

      if (result?.error) {
        setError(result.error);
      } else if (result?.ok) {
        // Get session to verify user is admin
        const session = await getSession();
        
        if (session?.user) {
          // Check if user has admin privileges
          if (session.user.userType === 'schoolAdmin' || session.user.userType === 'admin') {
            router.push('/dashboard');
          } else {
            setError('Access denied. Admin privileges required.');
            // Sign out non-admin user
            await signIn(); // This will clear the session
          }
        }
      }
    } catch (error) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px'
    }}>
      <Card 
        style={{ 
          width: '100%', 
          maxWidth: 400,
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          borderRadius: '12px'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <Space direction="vertical" size="small">
            <div style={{ fontSize: '48px' }}>📚</div>
            <Title level={2} style={{ margin: 0, color: '#1890ff' }}>
              StudyStreaks
            </Title>
            <Text type="secondary">Admin Dashboard</Text>
          </Space>
        </div>

        <Form
          name="signin"
          onFinish={handleSubmit}
          layout="vertical"
          size="large"
        >
          <Form.Item
            name="email"
            rules={[
              { required: true, message: 'Please enter your email address' },
              { type: 'email', message: 'Please enter a valid email address' },
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="Email address"
              autoComplete="email"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[
              { required: true, message: 'Please enter your password' },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Password"
              autoComplete="current-password"
            />
          </Form.Item>

          {error && (
            <Form.Item>
              <Alert
                message={error}
                type="error"
                showIcon
                style={{ marginBottom: '16px' }}
              />
            </Form.Item>
          )}

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              icon={<LoginOutlined />}
              block
              style={{ height: '48px', fontSize: '16px' }}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </Form.Item>
        </Form>

        <div style={{ textAlign: 'center', marginTop: '24px' }}>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            For school administrators only<br />
            Problems signing in? Contact technical support
          </Text>
        </div>
      </Card>
    </div>
  );
}