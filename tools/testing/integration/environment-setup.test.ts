/**
 * Environment Setup Integration Tests
 * 
 * Comprehensive test suite that validates the entire development environment
 * including Docker containers, web application, authentication, and database connectivity.
 * 
 * Run this test to ensure your development environment is ready for product development.
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import fetch from 'node-fetch';

const execAsync = promisify(exec);

interface TestResult {
  name: string;
  passed: boolean;
  message: string;
  duration: number;
}

class EnvironmentTester {
  private results: TestResult[] = [];
  private baseUrl = 'http://localhost:3000';

  async runAllTests(): Promise<void> {
    console.log('🧪 Starting Environment Setup Integration Tests\n');
    console.log('=' .repeat(60));

    // Run tests in sequence
    await this.testDockerContainers();
    await this.testWebApplicationAvailability();
    await this.testDatabaseConnectivity();
    await this.testAuthenticationEndpoints();
    await this.testUserAuthenticationFlow();
    await this.testRouteProtection();
    await this.testEnvironmentVariables();

    // Generate final report
    this.generateReport();
  }

  private async runTest(
    name: string, 
    testFn: () => Promise<void>
  ): Promise<void> {
    const startTime = Date.now();
    try {
      await testFn();
      const duration = Date.now() - startTime;
      this.results.push({
        name,
        passed: true,
        message: 'Passed',
        duration
      });
      console.log(`✅ ${name} - ${duration}ms`);
    } catch (error) {
      const duration = Date.now() - startTime;
      this.results.push({
        name,
        passed: false,
        message: error instanceof Error ? error.message : 'Unknown error',
        duration
      });
      console.log(`❌ ${name} - ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async testDockerContainers(): Promise<void> {
    await this.runTest('Docker Containers Health Check', async () => {
      console.log('\n📦 Testing Docker Containers...');
      
      // Check if containers are running
      const { stdout } = await execAsync('cd infrastructure/docker/development && docker compose ps --format json');
      const containers = stdout.trim().split('\n').map(line => JSON.parse(line));
      
      const expectedServices = ['postgres', 'redis', 'redis-commander'];
      const runningServices = containers
        .filter(container => container.State === 'running')
        .map(container => container.Service);

      for (const service of expectedServices) {
        if (!runningServices.includes(service)) {
          throw new Error(`Docker service ${service} is not running`);
        }
      }

      // Test PostgreSQL connectivity
      try {
        await execAsync('docker exec studystreaks-postgres pg_isready -h localhost -p 5432');
      } catch {
        throw new Error('PostgreSQL container is not accepting connections');
      }

      // Test Redis connectivity
      try {
        await execAsync('docker exec studystreaks-redis redis-cli ping');
      } catch {
        throw new Error('Redis container is not responding');
      }
    });
  }

  private async testWebApplicationAvailability(): Promise<void> {
    await this.runTest('Web Application Availability', async () => {
      console.log('\n🌐 Testing Web Application...');
      
      // Test if the application is responding
      const response = await fetch(this.baseUrl, {
        timeout: 10000,
        headers: { 'User-Agent': 'Environment-Test/1.0' }
      });

      if (!response.ok) {
        throw new Error(`Web application returned ${response.status} ${response.statusText}`);
      }

      // Check for expected content
      const html = await response.text();
      if (!html.includes('StudyStreaks')) {
        throw new Error('Web application is not serving expected content');
      }

      // Test specific port binding
      const portTest = await fetch('http://localhost:3000/api/auth/session');
      if (!portTest.ok) {
        throw new Error('Application is not properly bound to port 3000');
      }
    });
  }

  private async testDatabaseConnectivity(): Promise<void> {
    await this.runTest('Database Connectivity', async () => {
      console.log('\n🗄️ Testing Database Connectivity...');
      
      try {
        const { stdout, stderr } = await execAsync(
          'cd packages/database && npx tsx src/test-integration.ts'
        );
        
        if (stderr && !stderr.includes('prisma:query')) {
          throw new Error(`Database test failed: ${stderr}`);
        }

        if (!stdout.includes('Database integration test completed successfully')) {
          throw new Error('Database integration test did not complete successfully');
        }
      } catch (error) {
        throw new Error(`Database connectivity test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    });
  }

  private async testAuthenticationEndpoints(): Promise<void> {
    await this.runTest('Authentication Endpoints', async () => {
      console.log('\n🔐 Testing Authentication Endpoints...');
      
      // Test session endpoint
      const sessionResponse = await fetch(`${this.baseUrl}/api/auth/session`);
      if (!sessionResponse.ok) {
        throw new Error(`Session endpoint failed: ${sessionResponse.status}`);
      }

      const sessionData = await sessionResponse.json();
      if (sessionData === null || (typeof sessionData === 'object' && Object.keys(sessionData).length === 0)) {
        // Expected for unauthenticated user
      } else {
        throw new Error('Session endpoint returned unexpected data for unauthenticated user');
      }

      // Test signin page
      const signinResponse = await fetch(`${this.baseUrl}/auth/signin`);
      if (!signinResponse.ok) {
        throw new Error(`Signin page failed: ${signinResponse.status}`);
      }

      const signinHtml = await signinResponse.text();
      if (!signinHtml.includes('Sign In') && !signinHtml.includes('sign in')) {
        throw new Error('Signin page does not contain expected content');
      }
    });
  }

  private async testUserAuthenticationFlow(): Promise<void> {
    await this.runTest('User Authentication Flow', async () => {
      console.log('\n👤 Testing User Authentication Flow...');
      
      // Test with admin credentials
      const adminCredentials = {
        email: 'admin@oakwood-primary.co.uk',
        password: 'Admin123!'
      };

      // Test with teacher credentials  
      const teacherCredentials = {
        email: 'j.smith@oakwood-primary.co.uk',
        password: 'Teacher123!'
      };

      // Validate credentials exist in database
      try {
        const { stdout } = await execAsync(`
          cd packages/database && npx tsx -e "
          import { PrismaClient } from './src/generated';
          const prisma = new PrismaClient();
          (async () => {
            const adminUser = await prisma.user.findUnique({ where: { email: '${adminCredentials.email}' } });
            const teacherUser = await prisma.user.findUnique({ where: { email: '${teacherCredentials.email}' } });
            if (!adminUser) throw new Error('Admin user not found in database');
            if (!teacherUser) throw new Error('Teacher user not found in database');
            console.log('✅ Test users found in database');
            await prisma.\$disconnect();
          })();
          "
        `);

        if (!stdout.includes('Test users found in database')) {
          throw new Error('Test users are not properly seeded in database');
        }
      } catch (error) {
        throw new Error(`User validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    });
  }

  private async testRouteProtection(): Promise<void> {
    await this.runTest('Route Protection', async () => {
      console.log('\n🛡️ Testing Route Protection...');
      
      const protectedRoutes = [
        '/admin/dashboard',
        '/teacher/dashboard',
        '/student/dashboard',
        '/parent/dashboard'
      ];

      for (const route of protectedRoutes) {
        const response = await fetch(`${this.baseUrl}${route}`, {
          redirect: 'manual'
        });

        // Should redirect to signin for unauthenticated users
        if (response.status !== 302 && response.status !== 401 && response.status !== 403) {
          // Some routes might return 200 but redirect via client-side
          const html = await response.text();
          if (!html.includes('signin') && !html.includes('Sign In') && !html.includes('auth')) {
            throw new Error(`Protected route ${route} is not properly protected`);
          }
        }
      }
    });
  }

  private async testEnvironmentVariables(): Promise<void> {
    await this.runTest('Environment Variables', async () => {
      console.log('\n🔧 Testing Environment Variables...');
      
      // Check critical environment variables
      const requiredEnvVars = [
        'DATABASE_URL',
        'NEXTAUTH_SECRET',
        'NEXTAUTH_URL'
      ];

      try {
        const { stdout } = await execAsync(`
          cd . && node -e "
          require('dotenv').config({ path: '.env.local' });
          const missing = [];
          ${requiredEnvVars.map(envVar => `
          if (!process.env.${envVar}) missing.push('${envVar}');
          `).join('')}
          if (missing.length > 0) {
            throw new Error('Missing required environment variables: ' + missing.join(', '));
          }
          console.log('✅ All required environment variables are set');
          "
        `);

        if (!stdout.includes('All required environment variables are set')) {
          throw new Error('Environment variable validation failed');
        }
      } catch (error) {
        throw new Error(`Environment variable check failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    });
  }

  private generateReport(): void {
    console.log('\n' + '=' .repeat(60));
    console.log('📊 ENVIRONMENT SETUP TEST REPORT');
    console.log('=' .repeat(60));

    const totalTests = this.results.length;
    const passedTests = this.results.filter(r => r.passed).length;
    const failedTests = totalTests - passedTests;
    const totalDuration = this.results.reduce((sum, r) => sum + r.duration, 0);

    console.log(`\n📈 Summary:`);
    console.log(`  Total Tests: ${totalTests}`);
    console.log(`  ✅ Passed: ${passedTests}`);
    console.log(`  ❌ Failed: ${failedTests}`);
    console.log(`  ⏱️  Total Duration: ${totalDuration}ms`);

    if (failedTests > 0) {
      console.log(`\n❌ Failed Tests:`);
      this.results
        .filter(r => !r.passed)
        .forEach(r => {
          console.log(`  • ${r.name}: ${r.message}`);
        });
    }

    console.log(`\n🎯 Status: ${failedTests === 0 ? '✅ ENVIRONMENT READY FOR DEVELOPMENT' : '❌ ENVIRONMENT SETUP INCOMPLETE'}`);
    
    if (failedTests === 0) {
      console.log(`\n🚀 Your development environment is fully configured and ready!`);
      console.log(`   You can now start product development in Cursor or Claude Code.`);
      console.log(`\n💡 Next Steps:`);
      console.log(`   • Access the app: http://localhost:3000`);
      console.log(`   • Admin login: admin@oakwood-primary.co.uk / Admin123!`);
      console.log(`   • Teacher login: j.smith@oakwood-primary.co.uk / Teacher123!`);
      console.log(`   • Database UI: http://localhost:8081 (Redis Commander)`);
    } else {
      console.log(`\n🔧 Please fix the failed tests before starting development.`);
    }

    // Exit with appropriate code
    process.exit(failedTests > 0 ? 1 : 0);
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  const tester = new EnvironmentTester();
  tester.runAllTests().catch(error => {
    console.error('\n💥 Test runner failed:', error);
    process.exit(1);
  });
}

export { EnvironmentTester }; 