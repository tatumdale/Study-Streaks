/**
 * Application Constants
 * Centralized configuration values for StudyStreaks
 */

// User roles and permissions
export const USER_ROLES = {
  STUDENT: "student",
  TEACHER: "teacher", 
  PARENT: "parent",
  SCHOOL_ADMIN: "school_admin",
  SUPER_ADMIN: "super_admin",
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

// School year groups (UK education system)
export const YEAR_GROUPS = {
  RECEPTION: "reception",
  YEAR_1: "year_1",
  YEAR_2: "year_2",
  YEAR_3: "year_3",
  YEAR_4: "year_4",
  YEAR_5: "year_5",
  YEAR_6: "year_6",
  YEAR_7: "year_7",
  YEAR_8: "year_8",
  YEAR_9: "year_9",
  YEAR_10: "year_10",
  YEAR_11: "year_11",
  YEAR_12: "year_12",
  YEAR_13: "year_13",
} as const;

export type YearGroup = (typeof YEAR_GROUPS)[keyof typeof YEAR_GROUPS];

// Homework types and categories
export const HOMEWORK_TYPES = {
  READING: "reading",
  SPELLING: "spelling", 
  MATH: "math",
  SCIENCE: "science",
  WRITING: "writing",
  PROJECT: "project",
  RESEARCH: "research",
  PRACTICE: "practice",
  CREATIVE: "creative",
  OTHER: "other",
} as const;

export type HomeworkType = (typeof HOMEWORK_TYPES)[keyof typeof HOMEWORK_TYPES];

// Homework status
export const HOMEWORK_STATUS = {
  ASSIGNED: "assigned",
  IN_PROGRESS: "in_progress", 
  SUBMITTED: "submitted",
  REVIEWED: "reviewed",
  APPROVED: "approved",
  REJECTED: "rejected",
  OVERDUE: "overdue",
} as const;

export type HomeworkStatus = (typeof HOMEWORK_STATUS)[keyof typeof HOMEWORK_STATUS];

// Streak status
export const STREAK_STATUS = {
  ACTIVE: "active",
  BROKEN: "broken",
  PAUSED: "paused",
  COMPLETED: "completed",
} as const;

export type StreakStatus = (typeof STREAK_STATUS)[keyof typeof STREAK_STATUS];

// Achievement badges
export const BADGE_TYPES = {
  FIRST_HOMEWORK: "first_homework",
  WEEK_STREAK: "week_streak",
  MONTH_STREAK: "month_streak",
  PERFECT_WEEK: "perfect_week",
  EARLY_BIRD: "early_bird",
  CONSISTENCY: "consistency",
  HELPER: "helper",
  CREATIVE: "creative",
  IMPROVEMENT: "improvement",
  DEDICATION: "dedication",
} as const;

export type BadgeType = (typeof BADGE_TYPES)[keyof typeof BADGE_TYPES];

// File upload constraints
export const FILE_CONSTRAINTS = {
  MAX_SIZE: 5242880, // 5MB
  ALLOWED_TYPES: [
    "image/jpeg",
    "image/png", 
    "image/webp",
    "application/pdf",
  ],
  MAX_FILES_PER_UPLOAD: 5,
} as const;

// Pagination defaults
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  DEFAULT_PAGE: 1,
} as const;

// Rate limiting
export const RATE_LIMITS = {
  API_CALLS_PER_MINUTE: 60,
  LOGIN_ATTEMPTS_PER_HOUR: 5,
  HOMEWORK_SUBMISSIONS_PER_DAY: 50,
  FILE_UPLOADS_PER_HOUR: 20,
} as const;

// Time zones and date formats
export const TIME_CONFIG = {
  DEFAULT_TIMEZONE: "Europe/London",
  DATE_FORMAT: "dd/MM/yyyy",
  TIME_FORMAT: "HH:mm",
  DATETIME_FORMAT: "dd/MM/yyyy HH:mm",
} as const;

// Notification preferences
export const NOTIFICATION_TYPES = {
  HOMEWORK_ASSIGNED: "homework_assigned",
  HOMEWORK_DUE: "homework_due",
  STREAK_BROKEN: "streak_broken",
  BADGE_EARNED: "badge_earned",
  WEEKLY_SUMMARY: "weekly_summary",
  CLASS_ANNOUNCEMENT: "class_announcement",
} as const;

export type NotificationType = (typeof NOTIFICATION_TYPES)[keyof typeof NOTIFICATION_TYPES];

// Gamification settings
export const GAMIFICATION = {
  POINTS_PER_HOMEWORK: 10,
  BONUS_POINTS_EARLY_SUBMISSION: 5,
  STREAK_MULTIPLIER: 1.5,
  CURRENCY_EXCHANGE_RATE: 100, // 100 points = 1 fuel
  MAX_DAILY_POINTS: 200,
} as const;

// Multi-tenancy settings
export const TENANT_SETTINGS = {
  MAX_STUDENTS_PER_SCHOOL: 2000,
  MAX_TEACHERS_PER_SCHOOL: 100,
  MAX_CLASSES_PER_TEACHER: 10,
  MAX_STUDENTS_PER_CLASS: 35,
} as const;

// Error codes for consistent error handling
export const ERROR_CODES = {
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN", 
  NOT_FOUND: "NOT_FOUND",
  VALIDATION_ERROR: "VALIDATION_ERROR",
  RATE_LIMITED: "RATE_LIMITED",
  SERVER_ERROR: "SERVER_ERROR",
  TENANT_NOT_FOUND: "TENANT_NOT_FOUND",
  HOMEWORK_OVERDUE: "HOMEWORK_OVERDUE",
  STREAK_BROKEN: "STREAK_BROKEN",
  FILE_TOO_LARGE: "FILE_TOO_LARGE",
  INVALID_FILE_TYPE: "INVALID_FILE_TYPE",
} as const;

export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];

// Success messages
export const SUCCESS_MESSAGES = {
  HOMEWORK_SUBMITTED: "Homework submitted successfully! 🎉",
  STREAK_EXTENDED: "Streak extended! Keep up the great work! 🔥",
  BADGE_EARNED: "Congratulations! You've earned a new badge! 🏆",
  PROFILE_UPDATED: "Profile updated successfully! ✨",
  CLASS_JOINED: "Welcome to your new class! 👋",
} as const;