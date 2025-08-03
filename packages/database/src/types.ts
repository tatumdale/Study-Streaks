/**
 * Database type definitions for StudyStreaks
 */

// Supabase database types (will be generated from schema)
export type Database = {
  public: {
    Tables: {
      [_ in never]: never;
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
};

// Multi-tenant context type
export interface TenantContext {
  schoolId: string;
  userId?: string;
  role?: string;
}

// Database connection options
export interface DatabaseOptions {
  log?: boolean;
  timeout?: number;
  retries?: number;
}

// Pagination options
export interface PaginationOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

// Filter options for database queries
export interface FilterOptions {
  search?: string;
  dateFrom?: Date;
  dateTo?: Date;
  status?: string;
  type?: string;
  yearGroup?: string;
  role?: string;
}

// Analytics query options
export interface AnalyticsOptions {
  startDate?: Date;
  endDate?: Date;
  events?: string[];
  groupBy?: string;
  aggregation?: "count" | "sum" | "avg" | "min" | "max";
}

// Audit log options
export interface AuditOptions {
  entityType?: string;
  entityId?: string;
  event?: string;
  userId?: string;
  startDate?: Date;
  endDate?: Date;
}

// Real-time subscription options
export interface SubscriptionOptions {
  table: string;
  event?: "INSERT" | "UPDATE" | "DELETE" | "*";
  filter?: string;
  callback: (payload: any) => void;
}

// Database query result types
export interface QueryResult<T = any> {
  data: T[];
  count: number;
  page?: number;
  totalPages?: number;
  hasNext?: boolean;
  hasPrev?: boolean;
}

// Database operation result
export interface OperationResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
}

// Bulk operation result
export interface BulkOperationResult {
  success: boolean;
  created: number;
  updated: number;
  deleted: number;
  errors: Array<{
    index: number;
    error: string;
  }>;
}