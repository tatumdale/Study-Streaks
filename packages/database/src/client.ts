import { PrismaClient } from "./generated";
import { createClient } from "@supabase/supabase-js";
import { env } from "@study-streaks/config";

/**
 * Prisma Client Configuration
 * Multi-tenant aware database client for StudyStreaks
 */

// Global prisma instance for connection pooling
declare global {
  var __prisma__: PrismaClient | undefined;
}

/**
 * Create Prisma client with proper configuration
 */
function createPrismaClient() {
  return new PrismaClient({
    log: env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
    datasources: {
      db: {
        url: env.DATABASE_URL,
      },
    },
  });
}

/**
 * Prisma client singleton
 */
export const prisma = globalThis.__prisma__ ?? createPrismaClient();

if (env.NODE_ENV !== "production") {
  globalThis.__prisma__ = prisma;
}

/**
 * Supabase client configuration
 */
export const supabase = createClient(
  env.SUPABASE_URL,
  env.SUPABASE_ANON_KEY,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  }
);

/**
 * Supabase admin client for server-side operations
 */
export const supabaseAdmin = createClient(
  env.SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

/**
 * Multi-tenant Prisma client that automatically filters by school
 */
export class TenantPrismaClient {
  private schoolId: string;
  private client: PrismaClient;

  constructor(schoolId: string) {
    this.schoolId = schoolId;
    this.client = prisma;
  }

  /**
   * Get users for the current school
   */
  get user() {
    return {
      ...this.client.user,
      findMany: (args?: any) =>
        this.client.user.findMany({
          ...args,
          where: {
            ...args?.where,
            schoolId: this.schoolId,
          },
        }),
      findFirst: (args?: any) =>
        this.client.user.findFirst({
          ...args,
          where: {
            ...args?.where,
            schoolId: this.schoolId,
          },
        }),
      findUnique: (args: any) =>
        this.client.user.findFirst({
          ...args,
          where: {
            ...args.where,
            schoolId: this.schoolId,
          },
        }),
      create: (args: any) =>
        this.client.user.create({
          ...args,
          data: {
            ...args.data,
            schoolId: this.schoolId,
          },
        }),
      update: (args: any) =>
        this.client.user.update({
          ...args,
          where: {
            ...args.where,
            schoolId: this.schoolId,
          },
        }),
      delete: (args: any) =>
        this.client.user.delete({
          ...args,
          where: {
            ...args.where,
            schoolId: this.schoolId,
          },
        }),
      count: (args?: any) =>
        this.client.user.count({
          ...args,
          where: {
            ...args?.where,
            schoolId: this.schoolId,
          },
        }),
    };
  }

  /**
   * Get classes for the current school
   */
  get class() {
    return {
      ...this.client.class,
      findMany: (args?: any) =>
        this.client.class.findMany({
          ...args,
          where: {
            ...args?.where,
            schoolId: this.schoolId,
          },
        }),
      findFirst: (args?: any) =>
        this.client.class.findFirst({
          ...args,
          where: {
            ...args?.where,
            schoolId: this.schoolId,
          },
        }),
      findUnique: (args: any) =>
        this.client.class.findFirst({
          ...args,
          where: {
            ...args.where,
            schoolId: this.schoolId,
          },
        }),
      create: (args: any) =>
        this.client.class.create({
          ...args,
          data: {
            ...args.data,
            schoolId: this.schoolId,
          },
        }),
      update: (args: any) =>
        this.client.class.update({
          ...args,
          where: {
            ...args.where,
            schoolId: this.schoolId,
          },
        }),
      delete: (args: any) =>
        this.client.class.delete({
          ...args,
          where: {
            ...args.where,
            schoolId: this.schoolId,
          },
        }),
      count: (args?: any) =>
        this.client.class.count({
          ...args,
          where: {
            ...args?.where,
            schoolId: this.schoolId,
          },
        }),
    };
  }

  /**
   * Get homework for the current school
   */
  get homework() {
    return {
      ...this.client.homework,
      findMany: (args?: any) =>
        this.client.homework.findMany({
          ...args,
          where: {
            ...args?.where,
            schoolId: this.schoolId,
          },
        }),
      findFirst: (args?: any) =>
        this.client.homework.findFirst({
          ...args,
          where: {
            ...args?.where,
            schoolId: this.schoolId,
          },
        }),
      findUnique: (args: any) =>
        this.client.homework.findFirst({
          ...args,
          where: {
            ...args.where,
            schoolId: this.schoolId,
          },
        }),
      create: (args: any) =>
        this.client.homework.create({
          ...args,
          data: {
            ...args.data,
            schoolId: this.schoolId,
          },
        }),
      update: (args: any) =>
        this.client.homework.update({
          ...args,
          where: {
            ...args.where,
            schoolId: this.schoolId,
          },
        }),
      delete: (args: any) =>
        this.client.homework.delete({
          ...args,
          where: {
            ...args.where,
            schoolId: this.schoolId,
          },
        }),
      count: (args?: any) =>
        this.client.homework.count({
          ...args,
          where: {
            ...args?.where,
            schoolId: this.schoolId,
          },
        }),
    };
  }

  /**
   * Get badges for the current school
   */
  get badge() {
    return {
      ...this.client.badge,
      findMany: (args?: any) =>
        this.client.badge.findMany({
          ...args,
          where: {
            ...args?.where,
            schoolId: this.schoolId,
          },
        }),
      findFirst: (args?: any) =>
        this.client.badge.findFirst({
          ...args,
          where: {
            ...args?.where,
            schoolId: this.schoolId,
          },
        }),
      findUnique: (args: any) =>
        this.client.badge.findFirst({
          ...args,
          where: {
            ...args.where,
            schoolId: this.schoolId,
          },
        }),
      create: (args: any) =>
        this.client.badge.create({
          ...args,
          data: {
            ...args.data,
            schoolId: this.schoolId,
          },
        }),
      update: (args: any) =>
        this.client.badge.update({
          ...args,
          where: {
            ...args.where,
            schoolId: this.schoolId,
          },
        }),
      delete: (args: any) =>
        this.client.badge.delete({
          ...args,
          where: {
            ...args.where,
            schoolId: this.schoolId,
          },
        }),
      count: (args?: any) =>
        this.client.badge.count({
          ...args,
          where: {
            ...args?.where,
            schoolId: this.schoolId,
          },
        }),
    };
  }

  /**
   * Get announcements for the current school
   */
  get announcement() {
    return {
      ...this.client.announcement,
      findMany: (args?: any) =>
        this.client.announcement.findMany({
          ...args,
          where: {
            ...args?.where,
            schoolId: this.schoolId,
          },
        }),
      findFirst: (args?: any) =>
        this.client.announcement.findFirst({
          ...args,
          where: {
            ...args?.where,
            schoolId: this.schoolId,
          },
        }),
      findUnique: (args: any) =>
        this.client.announcement.findFirst({
          ...args,
          where: {
            ...args.where,
            schoolId: this.schoolId,
          },
        }),
      create: (args: any) =>
        this.client.announcement.create({
          ...args,
          data: {
            ...args.data,
            schoolId: this.schoolId,
          },
        }),
      update: (args: any) =>
        this.client.announcement.update({
          ...args,
          where: {
            ...args.where,
            schoolId: this.schoolId,
          },
        }),
      delete: (args: any) =>
        this.client.announcement.delete({
          ...args,
          where: {
            ...args.where,
            schoolId: this.schoolId,
          },
        }),
      count: (args?: any) =>
        this.client.announcement.count({
          ...args,
          where: {
            ...args?.where,
            schoolId: this.schoolId,
          },
        }),
    };
  }

  /**
   * Access non-tenant specific models
   */
  get school() {
    return this.client.school;
  }

  get session() {
    return this.client.session;
  }

  get account() {
    return this.client.account;
  }

  get verificationToken() {
    return this.client.verificationToken;
  }

  get classStudent() {
    return this.client.classStudent;
  }

  get homeworkSubmission() {
    return this.client.homeworkSubmission;
  }

  get streak() {
    return this.client.streak;
  }

  get userBadge() {
    return this.client.userBadge;
  }

  get message() {
    return this.client.message;
  }

  get notification() {
    return this.client.notification;
  }

  get analyticsEvent() {
    return this.client.analyticsEvent;
  }

  get auditLog() {
    return this.client.auditLog;
  }

  /**
   * Execute raw queries with automatic school filtering
   */
  $queryRaw(query: TemplateStringsArray, ...values: any[]) {
    return this.client.$queryRaw(query, ...values);
  }

  /**
   * Execute transactions
   */
  $transaction(queries: any[]) {
    return this.client.$transaction(queries);
  }

  /**
   * Disconnect the client
   */
  $disconnect() {
    return this.client.$disconnect();
  }
}

/**
 * Create a tenant-aware Prisma client
 */
export function getTenantClient(schoolId: string): TenantPrismaClient {
  return new TenantPrismaClient(schoolId);
}

/**
 * Database connection utilities
 */
export async function testConnection(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    console.error("Database connection failed:", error);
    return false;
  }
}

/**
 * Close database connections
 */
export async function closeConnections(): Promise<void> {
  await prisma.$disconnect();
}