# StudyStreaks Tech Stack

## Admin Interface Framework

- **Refine** - Complete admin UI framework
- **@refinedev/core** - Core Refine functionality
- **@refinedev/nextjs-router** - Next.js router integration
- **@refinedev/simple-rest** - REST API data provider
- **@refinedev/react-hook-form** - Form management integration
- **@refinedev/inferencer** - Auto-generate CRUD pages
- **@refinedev/antd** - Ant Design components (optional)
- **@refinedev/mantine** - Mantine components (optional)

## Frontend

- **Next.js 14** - React framework with App Router
- **React 18** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling framework
- **Shadcn/ui** - Component library
- **React Hook Form** - Form handling
- **Zod** - Schema validation
- **TanStack Query (React Query)** - Server state management
- **Zustand** - Client state management

## Backend

- **Next.js API Routes** - Backend API endpoints
- **Prisma** - Database ORM and query builder
- **PostgreSQL** - Primary database
- **NextAuth.js** - Authentication system
- **Node.js** - Runtime environment

## Database & ORM

- **PostgreSQL 15** - Primary database
- **Prisma Client** - Type-safe database client
- **Prisma Schema** - Database schema definition
- **Prisma Migrate** - Database migrations
- **Prisma Studio** - Database GUI (development)

## Authentication & Security

- **NextAuth.js** - Authentication framework
- **JWT** - JSON Web Tokens
- **bcryptjs** - Password hashing
- **@auth/prisma-adapter** - Prisma adapter for NextAuth
- **next-safe-action** - Type-safe server actions

## Real-time Features

- [**Socket.io**](http://socket.io/) - WebSocket communication
- [**Socket.io](http://socket.io/) Client** - Frontend WebSocket client
- **Pusher** - Alternative real-time service (if needed)

## File Storage & Media

- **AWS S3 SDK** - File storage (migration ready)
- **Multer** - File upload handling
- **Sharp** - Image processing and optimization
- **@aws-sdk/client-s3** - AWS S3 integration

## API & Validation

- **Zod** - Runtime type checking and validation
- **@trpc/server** - Type-safe API framework (optional)
- **@trpc/client** - tRPC client
- **@trpc/next** - Next.js tRPC integration

## Background Tasks & Scheduling

- **Bull** - Job queue for background tasks
- **Redis** - Queue backend and caching
- **node-cron** - Scheduled tasks
- **@vercel/cron** - Vercel cron jobs (production)

## Email & Notifications

- **Nodemailer** - Email sending
- **React Email** - Email templates
- **AWS SES SDK** - Email service (migration ready)
- **Web Push** - Push notifications

## Testing

- **Jest** - JavaScript testing framework
- **React Testing Library** - React component testing
- **Playwright** - End-to-end testing
- **MSW (Mock Service Worker)** - API mocking
- **Prisma Test Environment** - Database testing

## Development Tools

- **ESLint** - JavaScript/TypeScript linting
- **Prettier** - Code formatting
- **Husky** - Git hooks
- **lint-staged** - Pre-commit linting
- **TypeScript** - Static type checking

## Animations & Visual Effects

- **Lottie React** - Lottie animations for web
- **Lottie React Native** - Lottie animations for mobile
- **Framer Motion** - Advanced React animations
- **React Spring** - Spring-physics animations
- **Auto-Animate** - Simple automatic animations
- **React Confetti** - Celebration effects for achievements
- **React Particle** - Particle effects for gamification

## UI Enhancement Libraries

- **React Hot Toast** - Toast notifications
- **React Loading Skeleton** - Loading state animations
- **React Intersection Observer** - Scroll-based animations
- **Embla Carousel** - Touch-friendly carousels
- **React DnD** - Drag and drop interactions
- **React Use Gesture** - Touch gesture handling
- **React Virtualized** - Performance for large lists

## Charts & Data Visualization

- **Recharts** - React chart library
- **Chart.js** - Canvas-based charts
- **D3.js** - Custom data visualizations
- **React Chartjs 2** - Chart.js React wrapper
- **Tremor** - Dashboard component library

## Calendar & Date Handling

- **Date-fns** - Date utility library
- **React Big Calendar** - Calendar component
- **React Date Picker** - Date input components
- **Day.js** - Lightweight date library

## Image Handling & Processing

- **Sharp** - Image processing and optimization
- **React Image Crop** - Image cropping for photo uploads
- **React Dropzone** - File upload with drag & drop
- **React Cropper** - Advanced image cropping

## Performance & Error Handling

- **React Error Boundary** - Graceful error handling for children
- **React Window Infinite Loader** - Performance for large lists
- **React Loading Skeleton** - Loading state animations
- **React Virtualized** - Performance for large lists

## UK-Specific Utilities

- **Libphonenumber-js** - UK phone number validation
- **Date-fns** - Date utility library (UK date formats)

## Utility Libraries

- **Lodash** - Utility functions
- **Clsx** - Conditional className utility
- **React Use** - Collection of React hooks
- **Use Debounce** - Debounced state updates
- **React Window** - Virtualized lists for performance

## Mobile Development

- **React Native** - Mobile app framework
- **Expo** - React Native development platform
- **React Navigation** - Navigation library
- **React Native AsyncStorage** - Local storage
- **React Native Gesture Handler** - Touch gestures
- **Expo SecureStore** - Secure storage
- **React Native Reanimated** - High-performance animations
- **Lottie React Native** - Lottie animations for mobile
- **React Native Skia** - 2D graphics (advanced animations)

## Deployment & Infrastructure

- **Docker** - Containerization (local development)
- **Docker Compose** - Multi-container setup
- **Vercel** - Frontend deployment (development/staging)
- **AWS** - Production infrastructure (migration target)

## Monitoring & Analytics

- **Sentry** - Error tracking
- **Vercel Analytics** - Performance monitoring
- **Prisma Pulse** - Database change streams (optional)

## Environment & Configuration

- **dotenv** - Environment variables
- **@t3-oss/env-nextjs** - Environment validation
- **zod** - Environment schema validation

## Multi-tenancy & Data Isolation

- **Prisma Row Level Security** - Database-level tenant isolation
- **Custom middleware** - Tenant context management
- **Redis** - Tenant-specific caching

## UK School Integrations

- **Axios** - HTTP client for external APIs
- **xml2js** - XML parsing for legacy school systems
- **csv-parse** - CSV data processing
- **Custom adapters** - MIS/LMS integration modules

## Package.json Dependencies

```json
{
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "typescript": "^5.0.0",
    "prisma": "^5.0.0",
    "@prisma/client": "^5.0.0",
    "next-auth": "^4.24.0",
    "@auth/prisma-adapter": "^1.0.0",
    "tailwindcss": "^3.3.0",
    "@tanstack/react-query": "^5.0.0",
    "zustand": "^4.4.0",
    "react-hook-form": "^7.47.0",
    "zod": "^3.22.0",
    "socket.io": "^4.7.0",
    "socket.io-client": "^4.7.0",
    "bcryptjs": "^2.4.3",
    "sharp": "^0.32.0",
    "@aws-sdk/client-s3": "^3.0.0",
    "redis": "^4.6.0",
    "bull": "^4.11.0",
    "nodemailer": "^6.9.0",
    "react-email": "^1.9.0",
    "axios": "^1.5.0",
    "lottie-react": "^2.4.0",
    "framer-motion": "^10.16.0",
    "react-spring": "^9.7.0",
    "@formkit/auto-animate": "^0.8.0",
    "react-confetti": "^6.1.0",
    "react-hot-toast": "^2.4.0",
    "react-loading-skeleton": "^3.3.0",
    "embla-carousel-react": "^8.0.0",
    "recharts": "^2.8.0",
    "date-fns": "^2.30.0",
    "react-select": "^5.7.0",
    "react-dropzone": "^14.2.0",
    "react-signature-canvas": "^1.0.3",
    "lodash": "^4.17.21",
    "clsx": "^2.0.0",
    "react-use": "^17.4.0",
    "use-debounce": "^9.0.0",
    "react-intersection-observer": "^9.5.0",
    "@refinedev/core": "^4.47.0",
    "@refinedev/nextjs-router": "^6.0.0",
    "@refinedev/simple-rest": "^5.0.0",
    "@refinedev/react-hook-form": "^4.8.0",
    "@refinedev/inferencer": "^4.5.0",
    "@tanstack/react-table": "^8.10.0",
    "react-image-crop": "^11.0.4",
    "react-error-boundary": "^4.0.11",
    "libphonenumber-js": "^1.10.44",
    "react-window-infinite-loader": "^1.0.9",
    "react-signature-canvas": "^1.0.3"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/react": "^18.0.0",
    "@types/bcryptjs": "^2.4.0",
    "@types/lodash": "^4.14.0",
    "eslint": "^8.0.0",
    "eslint-config-next": "^14.0.0",
    "prettier": "^3.0.0",
    "jest": "^29.0.0",
    "@testing-library/react": "^13.0.0",
    "@testing-library/jest-dom": "^6.0.0",
    "playwright": "^1.39.0",
    "msw": "^1.3.0",
    "husky": "^8.0.0",
    "lint-staged": "^14.0.0",
    "@t3-oss/env-nextjs": "^0.7.0"
  }
}

```

## Local Development Setup

```bash
# Database
docker-compose up -d postgres redis

# Install dependencies
npm install

# Setup database
npx prisma generate
npx prisma db push

# Development server
npm run dev

```

## AWS Migration Path

- **Database**: PostgreSQL → AWS RDS PostgreSQL
- **File Storage**: Local/S3 → AWS S3
- **Authentication**: NextAuth.js → AWS Cognito (optional)
- **Email**: Nodemailer → AWS SES
- **Caching**: Redis → AWS ElastiCache
- **Hosting**: Vercel → AWS ECS/Lambda
- **Background Jobs**: Bull + Redis → AWS SQS + Lambda

## Multi-tenant Architecture

- **Schema-based**: Each school gets own database schema
- **Row-level**: Single schema with tenant_id column + RLS
- **Database-per-tenant**: Separate databases (complex but isolated)

## Admin UI Setup Example

```bash
# Install Refine core packages
npm install @refinedev/core @refinedev/nextjs-router
npm install @refinedev/simple-rest @refinedev/react-hook-form
npm install @refinedev/inferencer @tanstack/react-table

# Optional UI library integrations
npm install @refinedev/antd antd  # If using Ant Design
npm install @refinedev/mantine @mantine/core  # If using Mantine

```

## Refine Features for StudyStreaks

- **School Admin Dashboard**: Manage all tenants, users, and analytics
- **Class Teacher Panel**: Class-specific student and homework management
- **Student Management**: CRUD operations with bulk actions
- **Homework Tracking**: Real-time completion status tables
- **Prize Administration**: Configure and manage school rewards
- **Analytics Widgets**: Custom dashboards for each user role
- **Multi-tenant Support**: Built-in tenant isolation
- **Role-based Access**: Different views for admin/teacher/parent roles
- **Real-time Updates**: Live data refresh for streaks and leaderboards
- **Export Functionality**: CSV/PDF exports for school reports

## MVP-Specific Benefits

### **React Image Crop**

- Parents can crop spelling homework photos for better quality
- Ensures clear visibility of handwriting for teacher review
- Reduces image file sizes for faster uploads
- Mobile-friendly touch cropping interface

### **React Error Boundary**

- Prevents app crashes when children interact unexpectedly
- Graceful error handling for image upload failures
- Maintains streak data even if UI components fail
- Child-friendly error messages and recovery options

### **Libphonenumber-js**

- Validates UK mobile numbers for parent accounts
- Formats phone numbers consistently in database
- Supports international formats for international families
- SMS notification capability preparation

### **React Window Infinite Loader**

- Handles large class lists (30+ students) efficiently
- Smooth scrolling through school-wide leaderboards
- Performant buddy group selection interfaces
- Scales with multi-class school deployments

*These libraries directly improve core MVP user flows without adding complexity*