/**
 * GDPR and Compliance Configuration
 * UK Educational Data Protection and Child Safety Settings
 */

// GDPR Data Categories
export const GDPR_DATA_CATEGORIES = {
  PERSONAL: "personal", // Name, email, phone
  EDUCATIONAL: "educational", // Homework, grades, progress
  BIOMETRIC: "biometric", // Photos, voice recordings (if any)
  BEHAVIORAL: "behavioral", // Usage patterns, learning analytics
  TECHNICAL: "technical", // IP addresses, device info
  COMMUNICATION: "communication", // Messages, notifications
} as const;

export type GDPRDataCategory = (typeof GDPR_DATA_CATEGORIES)[keyof typeof GDPR_DATA_CATEGORIES];

// Data Retention Periods (in days)
export const DATA_RETENTION = {
  STUDENT_RECORDS: 2555, // 7 years after leaving school
  HOMEWORK_SUBMISSIONS: 1095, // 3 years
  ACTIVITY_LOGS: 365, // 1 year
  SESSION_DATA: 30, // 30 days
  ANONYMIZED_ANALYTICS: -1, // Indefinite (no personal data)
  AUDIT_LOGS: 2555, // 7 years for compliance
  BACKUP_DATA: 90, // 90 days
  DELETED_USER_DATA: 30, // 30 days before permanent deletion
} as const;

// Child Protection Age Thresholds
export const AGE_RESTRICTIONS = {
  MINIMUM_AGE: 4, // Reception year
  DIGITAL_CONSENT_AGE: 13, // UK GDPR digital consent age
  PARENTAL_CONSENT_REQUIRED: 16, // Full parental consent required below this age
  RESTRICTED_COMMUNICATION: 13, // Limited messaging features below this age
} as const;

// Privacy Levels
export const PRIVACY_LEVELS = {
  PUBLIC: "public", // Visible to all school members
  CLASS_ONLY: "class_only", // Visible to class members only
  TEACHER_ONLY: "teacher_only", // Visible to teachers only
  PRIVATE: "private", // Visible to user and parents only
  ADMIN_ONLY: "admin_only", // Visible to school admins only
} as const;

export type PrivacyLevel = (typeof PRIVACY_LEVELS)[keyof typeof PRIVACY_LEVELS];

// Audit Event Types
export const AUDIT_EVENTS = {
  USER_LOGIN: "user_login",
  USER_LOGOUT: "user_logout",
  DATA_ACCESS: "data_access",
  DATA_MODIFICATION: "data_modification",
  DATA_DELETION: "data_deletion",
  DATA_EXPORT: "data_export",
  PERMISSION_CHANGE: "permission_change",
  PRIVACY_SETTING_CHANGE: "privacy_setting_change",
  PARENT_ACCESS: "parent_access",
  ADMIN_ACTION: "admin_action",
  COMPLIANCE_VIOLATION: "compliance_violation",
  DATA_BREACH_INCIDENT: "data_breach_incident",
} as const;

export type AuditEvent = (typeof AUDIT_EVENTS)[keyof typeof AUDIT_EVENTS];

// Data Processing Legal Bases (GDPR Article 6)
export const LEGAL_BASIS = {
  CONSENT: "consent", // Explicit consent from data subject
  CONTRACT: "contract", // Processing necessary for contract performance
  LEGAL_OBLIGATION: "legal_obligation", // Legal obligation compliance
  VITAL_INTERESTS: "vital_interests", // Protection of vital interests
  PUBLIC_TASK: "public_task", // Public task or official authority
  LEGITIMATE_INTERESTS: "legitimate_interests", // Legitimate interests
} as const;

export type LegalBasis = (typeof LEGAL_BASIS)[keyof typeof LEGAL_BASIS];

// Child Safety Features
export const CHILD_SAFETY = {
  // Content filtering
  ENABLE_CONTENT_FILTERING: true,
  ENABLE_IMAGE_MODERATION: true,
  ENABLE_TEXT_MODERATION: true,
  
  // Communication restrictions
  RESTRICT_DIRECT_MESSAGING: true,
  REQUIRE_TEACHER_APPROVAL: true,
  ENABLE_COMMUNICATION_LOGGING: true,
  
  // Time restrictions
  ENFORCE_SCHOOL_HOURS_ONLY: false,
  ENABLE_SCREEN_TIME_LIMITS: true,
  
  // Reporting mechanisms
  ENABLE_INCIDENT_REPORTING: true,
  REQUIRE_SAFEGUARDING_ALERTS: true,
  
  // Parental controls
  ENABLE_PARENTAL_OVERSIGHT: true,
  REQUIRE_PARENTAL_NOTIFICATIONS: true,
} as const;

// Accessibility Compliance (WCAG 2.1 AA)
export const ACCESSIBILITY = {
  // Visual accessibility
  SUPPORT_HIGH_CONTRAST: true,
  SUPPORT_SCREEN_READERS: true,
  SUPPORT_FONT_SCALING: true,
  
  // Motor accessibility
  SUPPORT_KEYBOARD_NAVIGATION: true,
  SUPPORT_VOICE_CONTROL: true,
  SUPPORT_SWITCH_ACCESS: true,
  
  // Cognitive accessibility
  SUPPORT_READING_ASSISTANCE: true,
  SUPPORT_SIMPLIFIED_INTERFACE: true,
  SUPPORT_CONTENT_READING: true,
  
  // Language support
  SUPPORT_MULTIPLE_LANGUAGES: true,
  SUPPORT_DYSLEXIA_FONTS: true,
  SUPPORT_AUDIO_DESCRIPTIONS: true,
} as const;

// Data Subject Rights (GDPR)
export const DATA_SUBJECT_RIGHTS = {
  RIGHT_TO_ACCESS: "right_to_access",
  RIGHT_TO_RECTIFICATION: "right_to_rectification", 
  RIGHT_TO_ERASURE: "right_to_erasure",
  RIGHT_TO_RESTRICT_PROCESSING: "right_to_restrict_processing",
  RIGHT_TO_DATA_PORTABILITY: "right_to_data_portability",
  RIGHT_TO_OBJECT: "right_to_object",
  RIGHT_NOT_TO_BE_SUBJECT_TO_AUTOMATED_DECISION_MAKING: "right_not_to_be_subject_to_automated_decision_making",
} as const;

export type DataSubjectRight = (typeof DATA_SUBJECT_RIGHTS)[keyof typeof DATA_SUBJECT_RIGHTS];

// Compliance Configuration
export interface ComplianceConfig {
  gdprEnabled: boolean;
  childProtectionEnabled: boolean;
  accessibilityEnabled: boolean;
  auditLoggingEnabled: boolean;
  dataRetentionEnabled: boolean;
  parentalControlsEnabled: boolean;
  contentModerationEnabled: boolean;
  incidentReportingEnabled: boolean;
}

export const COMPLIANCE_CONFIG: ComplianceConfig = {
  gdprEnabled: true,
  childProtectionEnabled: true,
  accessibilityEnabled: true,
  auditLoggingEnabled: true,
  dataRetentionEnabled: true,
  parentalControlsEnabled: true,
  contentModerationEnabled: true,
  incidentReportingEnabled: true,
};

// UK-Specific Education Compliance
export const UK_EDUCATION_COMPLIANCE = {
  // Data Protection Act 2018
  DPA_2018_COMPLIANT: true,
  
  // Children's Code (ICO)
  ICO_CHILDRENS_CODE_COMPLIANT: true,
  
  // Keeping Children Safe in Education (KCSIE)
  KCSIE_COMPLIANT: true,
  
  // Equality Act 2010
  EQUALITY_ACT_COMPLIANT: true,
  
  // Freedom of Information Act 2000
  FOIA_COMPLIANT: true,
  
  // Education Act requirements
  EDUCATION_ACT_COMPLIANT: true,
} as const;