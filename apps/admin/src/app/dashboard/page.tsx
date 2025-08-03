'use client';

import { Typography, Card, Row, Col, Statistic } from 'antd';
import { 
  UserOutlined, 
  BookOutlined, 
  TrophyOutlined, 
  FireOutlined 
} from '@ant-design/icons';

const { Title, Paragraph } = Typography;

export default function DashboardPage() {
  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '24px' }}>
        <Title level={1}>
          StudyStreaks Admin Dashboard
        </Title>
        <Paragraph>
          Welcome to the StudyStreaks school administration interface. 
          Manage students, track homework completion, and monitor study streaks 
          across your school.
        </Paragraph>
      </div>

      {/* Hello World Status Card */}
      <Card 
        title="System Status" 
        style={{ marginBottom: '24px' }}
        extra={<span style={{ color: '#52c41a' }}>● Online</span>}
      >
        <Paragraph>
          🎉 <strong>Hello World!</strong> The StudyStreaks Admin Dashboard is 
          successfully running with Refine.dev framework.
        </Paragraph>
        <Paragraph type="secondary">
          This dashboard provides school administrators with tools to manage 
          students, classes, homework assignments, and track educational progress 
          in compliance with UK GDPR requirements.
        </Paragraph>
      </Card>

      {/* Quick Stats */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Students"
              value={0}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Active Clubs"
              value={0}
              prefix={<BookOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Study Streaks"
              value={0}
              prefix={<FireOutlined />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Achievements"
              value={0}
              prefix={<TrophyOutlined />}
              valueStyle={{ color: '#f5222d' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Features Preview */}
      <Card title="Admin Features" style={{ marginTop: '24px' }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} md={8}>
            <Card type="inner" title="Student Management">
              <Paragraph>
                Add, edit, and manage student accounts with GDPR-compliant 
                data handling and parental consent tracking.
              </Paragraph>
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card type="inner" title="Homework Tracking">
              <Paragraph>
                Monitor homework completion rates, study streaks, and 
                academic progress across all year groups.
              </Paragraph>
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card type="inner" title="School Analytics">
              <Paragraph>
                Generate reports on student engagement, club participation, 
                and overall academic performance metrics.
              </Paragraph>
            </Card>
          </Col>
        </Row>
      </Card>
    </div>
  );
}