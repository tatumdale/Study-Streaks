/**
 * Main export file for StudyStreaks authentication package
 * Provides NextAuth.js configuration and utilities for multi-tenant UK educational platform
 */

// Core NextAuth configuration
export { authOptions } from "./config";

// Authentication utilities
export {
  hashPassword,
  verifyPassword,
  getAuthSession,
  getCurrentUser,
  hasPermission,
  canAccessSchool,
  canAccessClass,
  canAccessStudent,
  createUserAccount,
  generateSecurePassword,
  validatePasswordStrength,
} from "./utils";

// Middleware and route protection
export {
  authMiddleware,
  requirePermission,
  requireSchoolAccess,
  getUserContext,
} from "./middleware";

// TypeScript types
export type {
  StudyStreaksUser,
  Permission,
  UserRole,
  TeacherProfile,
  StudentProfile,
  ParentProfile,
  SchoolAdminProfile,
  PermissionCheck,
  SchoolContext,
  AuthResponse,
  PasswordValidation,
  UserTypeRole,
  RoutePermissions,
} from "./types";

// Re-export NextAuth types for convenience
export type { Session } from "next-auth";
export type { JWT } from "next-auth/jwt";