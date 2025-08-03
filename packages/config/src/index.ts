/**
 * @package @study-streaks/config
 * Centralized configuration and environment management for StudyStreaks
 */

// Export environment configuration
export { env } from "./env";

// Export application constants
export * from "./constants";

// Export feature flags
export * from "./features";

// Export compliance configuration
export * from "./compliance";

// Re-export types for convenience
export type {
  UserRole,
  YearGroup,
  HomeworkType,
  HomeworkStatus,
  StreakStatus,
  BadgeType,
  NotificationType,
  ErrorCode,
  GDPRDataCategory,
  PrivacyLevel,
  AuditEvent,
  LegalBasis,
  DataSubjectRight,
} from "./constants";

export type { FeatureFlags, ComplianceConfig } from "./features";