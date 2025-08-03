import { z } from "zod";
import { USER_ROLES, YEAR_GROUPS, HOMEWORK_TYPES, HOMEWORK_STATUS } from "@study-streaks/config";

/**
 * Common validation schemas for StudyStreaks
 * Centralized validation logic using Zod
 */

// Basic data types
export const emailSchema = z.string().email("Please enter a valid email address");
export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character");

export const phoneSchema = z
  .string()
  .regex(/^(\+44\s?7\d{3}|\(?07\d{3}\)?)\s?\d{3}\s?\d{3}$/, "Please enter a valid UK mobile number");

export const postcodeSchema = z
  .string()
  .regex(
    /^[A-Z]{1,2}[0-9RCHNQ][0-9A-Z]?\s?[0-9][ABD-HJLNP-UW-Z]{2}$/i,
    "Please enter a valid UK postcode"
  );

// User validation schemas
export const userRoleSchema = z.enum(Object.values(USER_ROLES) as [string, ...string[]]);
export const yearGroupSchema = z.enum(Object.values(YEAR_GROUPS) as [string, ...string[]]);

export const userRegistrationSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string(),
  firstName: z.string().min(1, "First name is required").max(50, "First name too long"),
  lastName: z.string().min(1, "Last name is required").max(50, "Last name too long"),
  role: userRoleSchema,
  dateOfBirth: z.coerce.date().optional(),
  yearGroup: yearGroupSchema.optional(),
  schoolId: z.string().uuid("Invalid school ID").optional(),
  parentEmail: emailSchema.optional(),
  phone: phoneSchema.optional(),
  acceptTerms: z.boolean().refine(val => val === true, "You must accept the terms and conditions"),
  acceptPrivacy: z.boolean().refine(val => val === true, "You must accept the privacy policy"),
  parentalConsent: z.boolean().optional(),
}).refine(
  (data) => data.password === data.confirmPassword,
  {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  }
).refine(
  (data) => {
    // Require parental consent for users under 16
    if (data.dateOfBirth) {
      const age = new Date().getFullYear() - data.dateOfBirth.getFullYear();
      if (age < 16) {
        return data.parentalConsent === true;
      }
    }
    return true;
  },
  {
    message: "Parental consent is required for users under 16",
    path: ["parentalConsent"],
  }
);

export const userLoginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().default(false),
});

export const userProfileUpdateSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(50, "First name too long"),
  lastName: z.string().min(1, "Last name is required").max(50, "Last name too long"),
  phone: phoneSchema.optional(),
  bio: z.string().max(500, "Bio must be less than 500 characters").optional(),
  avatar: z.string().url("Invalid avatar URL").optional(),
  preferences: z.object({
    notifications: z.boolean().default(true),
    emailDigest: z.boolean().default(true),
    darkMode: z.boolean().default(false),
    language: z.string().default("en"),
  }).optional(),
});

// School validation schemas
export const schoolSchema = z.object({
  name: z.string().min(1, "School name is required").max(100, "School name too long"),
  address: z.string().min(1, "Address is required").max(200, "Address too long"),
  postcode: postcodeSchema,
  phone: z.string().regex(/^[0-9\s\-\+\(\)]+$/, "Invalid phone number"),
  email: emailSchema,
  website: z.string().url("Invalid website URL").optional(),
  logoUrl: z.string().url("Invalid logo URL").optional(),
  settings: z.object({
    allowParentAccess: z.boolean().default(true),
    enableGamification: z.boolean().default(true),
    requireHomeworkApproval: z.boolean().default(false),
    maxHomeworksPerDay: z.number().min(1).max(10).default(3),
  }).optional(),
});

// Homework validation schemas
export const homeworkTypeSchema = z.enum(Object.values(HOMEWORK_TYPES) as [string, ...string[]]);
export const homeworkStatusSchema = z.enum(Object.values(HOMEWORK_STATUS) as [string, ...string[]]);

export const homeworkSchema = z.object({
  title: z.string().min(1, "Homework title is required").max(100, "Title too long"),
  description: z.string().min(1, "Description is required").max(1000, "Description too long"),
  type: homeworkTypeSchema,
  yearGroup: yearGroupSchema,
  classId: z.string().uuid("Invalid class ID"),
  teacherId: z.string().uuid("Invalid teacher ID"),
  dueDate: z.coerce.date().min(new Date(), "Due date must be in the future"),
  estimatedMinutes: z.number().min(5, "Minimum 5 minutes").max(240, "Maximum 4 hours"),
  instructions: z.string().max(2000, "Instructions too long").optional(),
  resources: z.array(z.string().url("Invalid resource URL")).optional(),
  isOptional: z.boolean().default(false),
  allowLateSubmission: z.boolean().default(true),
  maxPoints: z.number().min(1).max(100).default(10),
});

export const homeworkSubmissionSchema = z.object({
  homeworkId: z.string().uuid("Invalid homework ID"),
  studentId: z.string().uuid("Invalid student ID"),
  content: z.string().min(1, "Submission content is required").max(5000, "Content too long"),
  attachments: z.array(z.object({
    filename: z.string().min(1, "Filename is required"),
    url: z.string().url("Invalid file URL"),
    type: z.string().min(1, "File type is required"),
    size: z.number().min(1, "File size is required"),
  })).optional(),
  timeSpentMinutes: z.number().min(1, "Time spent is required").max(480, "Maximum 8 hours"),
  submittedAt: z.coerce.date().default(() => new Date()),
  isLate: z.boolean().default(false),
});

// Class validation schemas
export const classSchema = z.object({
  name: z.string().min(1, "Class name is required").max(50, "Class name too long"),
  yearGroup: yearGroupSchema,
  schoolId: z.string().uuid("Invalid school ID"),
  teacherId: z.string().uuid("Invalid teacher ID"),
  description: z.string().max(200, "Description too long").optional(),
  maxStudents: z.number().min(1, "Minimum 1 student").max(35, "Maximum 35 students").default(30),
  settings: z.object({
    allowStudentCommunication: z.boolean().default(true),
    enableBuddySystem: z.boolean().default(false),
    requireParentNotifications: z.boolean().default(true),
  }).optional(),
});

// File upload validation schemas
export const fileUploadSchema = z.object({
  filename: z.string().min(1, "Filename is required").max(255, "Filename too long"),
  type: z.string().refine(
    (type) => [
      "image/jpeg",
      "image/png", 
      "image/webp",
      "application/pdf",
      "text/plain",
    ].includes(type),
    "Invalid file type"
  ),
  size: z.number().max(5242880, "File size must be less than 5MB"), // 5MB
});

export const multipleFileUploadSchema = z.object({
  files: z.array(fileUploadSchema).min(1, "At least one file is required").max(5, "Maximum 5 files"),
});

// Streak validation schemas
export const streakSchema = z.object({
  studentId: z.string().uuid("Invalid student ID"),
  type: z.enum(["homework", "reading", "practice", "attendance"]),
  currentStreak: z.number().min(0, "Streak cannot be negative"),
  longestStreak: z.number().min(0, "Longest streak cannot be negative"),
  lastActivityDate: z.coerce.date(),
  streakStartDate: z.coerce.date(),
  isActive: z.boolean().default(true),
});

// Badge validation schemas
export const badgeSchema = z.object({
  name: z.string().min(1, "Badge name is required").max(50, "Badge name too long"),
  description: z.string().min(1, "Description is required").max(200, "Description too long"),
  iconUrl: z.string().url("Invalid icon URL"),
  criteria: z.object({
    type: z.enum(["streak", "points", "homework_count", "consistency", "improvement"]),
    threshold: z.number().min(1, "Threshold must be positive"),
    timeframe: z.enum(["day", "week", "month", "term", "year"]).optional(),
  }),
  rarity: z.enum(["common", "uncommon", "rare", "epic", "legendary"]).default("common"),
  points: z.number().min(0, "Points cannot be negative").default(10),
});

// Search and pagination schemas
export const paginationSchema = z.object({
  page: z.coerce.number().min(1, "Page must be at least 1").default(1),
  limit: z.coerce.number().min(1, "Limit must be at least 1").max(100, "Limit cannot exceed 100").default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export const searchSchema = z.object({
  query: z.string().min(1, "Search query is required").max(100, "Query too long"),
  filters: z.record(z.string(), z.any()).optional(),
  ...paginationSchema.shape,
});

// Analytics validation schemas
export const analyticsEventSchema = z.object({
  event: z.string().min(1, "Event name is required"),
  userId: z.string().uuid("Invalid user ID").optional(),
  schoolId: z.string().uuid("Invalid school ID").optional(),
  properties: z.record(z.string(), z.any()).optional(),
  timestamp: z.coerce.date().default(() => new Date()),
});

// Export all schemas for easy importing
export const schemas = {
  email: emailSchema,
  password: passwordSchema,
  phone: phoneSchema,
  postcode: postcodeSchema,
  userRole: userRoleSchema,
  yearGroup: yearGroupSchema,
  userRegistration: userRegistrationSchema,
  userLogin: userLoginSchema,
  userProfileUpdate: userProfileUpdateSchema,
  school: schoolSchema,
  homeworkType: homeworkTypeSchema,
  homeworkStatus: homeworkStatusSchema,
  homework: homeworkSchema,
  homeworkSubmission: homeworkSubmissionSchema,
  class: classSchema,
  fileUpload: fileUploadSchema,
  multipleFileUpload: multipleFileUploadSchema,
  streak: streakSchema,
  badge: badgeSchema,
  pagination: paginationSchema,
  search: searchSchema,
  analyticsEvent: analyticsEventSchema,
};