/**
 * @package @study-streaks/database
 * Database client and utilities for StudyStreaks
 */

// Export database clients
export { 
  prisma, 
  supabase, 
  supabaseAdmin, 
  TenantPrismaClient,
  getTenantClient,
  testConnection,
  closeConnections 
} from "./client";

// Export database utilities
export * from "./utils";

// Export Prisma generated types
export * from "./generated";

// Export type helpers
export type { Database } from "./types";