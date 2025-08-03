/**
 * TypeScript definitions for StudyStreaks authentication system
 */

export interface StudyStreaksUser {
  id: string;
  email: string;
  name: string;
  image?: string | null;
  
  // StudyStreaks-specific fields
  schoolId: string;
  schoolName: string;
  userType: "teacher" | "student" | "parent" | "schoolAdmin";
  profile: TeacherProfile | StudentProfile | ParentProfile | SchoolAdminProfile;
  permissions: Permission[];
  roles: UserRole[];
}

export interface Permission {
  name: string;
  resource: string;
  action: string;
  scope: string;
  category: string;
  riskLevel: string;
  conditions?: any;
  limitations?: any;
}

export interface UserRole {
  id: string;
  name: string;
  scope: string;
  classIds: string[];
  yearGroups: number[];
  subjects: string[];
  studentIds: string[];
}

export interface TeacherProfile {
  id: string;
  employeeId?: string;
  title: string;
  firstName: string;
  lastName: string;
  displayName?: string;
  teacherType: string;
  isHeadTeacher: boolean;
  isSenCo: boolean;
  isDSL: boolean;
  isDeputyHead: boolean;
  subjects: string[];
  yearGroups: number[];
  qualifications?: any;
  startDate: Date;
  endDate?: Date;
  contractType: string;
  schoolEmail?: string;
  phoneExtension?: string;
  dbsCheckDate?: Date;
  dbsCheckNumber?: string;
  safeguardingTraining?: Date;
}

export interface StudentProfile {
  id: string;
  firstName: string;
  lastName: string;
  preferredName?: string;
  dateOfBirth: Date;
  pupilId: string;
  admissionNumber?: string;
  yearGroup: number;
  classId: string;
  admissionDate: Date;
  leavingDate?: Date;
  uln?: string;
  upn?: string;
  sen: boolean;
  senCategory?: string;
  senSupport?: any;
  pupilPremium: boolean;
  freeschoolMeals: boolean;
  englishAsAdditional: boolean;
  medicalConditions?: any;
  dietaryRequirements?: any;
  houseGroup?: string;
  dataRetentionUntil: Date;
  consentGiven: boolean;
  consentGivenBy?: string;
  consentDate?: Date;
  consentWithdrawn: boolean;
}

export interface ParentProfile {
  id: string;
  title?: string;
  firstName: string;
  lastName: string;
  email: string;
  alternativeEmail?: string;
  mobilePhone?: string;
  homePhone?: string;
  workPhone?: string;
  addressLine1?: string;
  addressLine2?: string;
  town?: string;
  county?: string;
  postcode?: string;
  isEmergencyContact: boolean;
  priority?: number;
  preferredContact: string;
  canReceiveSMS: boolean;
  canReceiveEmail: boolean;
  canReceivePhoneCalls: boolean;
  canCollectChild: boolean;
  canConsentToTrips: boolean;
  canAccessOnlineInfo: boolean;
}

export interface SchoolAdminProfile {
  id: string;
  firstName: string;
  lastName: string;
  jobTitle: string;
  adminLevel: string;
  canManageUsers: boolean;
  canManageClasses: boolean;
  canManageClubs: boolean;
  canViewAnalytics: boolean;
  canManageSettings: boolean;
  canExportData: boolean;
  canAccessAllClasses: boolean;
  canViewAllStudents: boolean;
  canModifyHomework: boolean;
}

// Extend NextAuth types
declare module "next-auth" {
  interface Session {
    user: StudyStreaksUser;
  }

  interface User extends StudyStreaksUser {}
}

declare module "next-auth/jwt" {
  interface JWT extends StudyStreaksUser {}
}

// Permission checking utilities
export interface PermissionCheck {
  resource: string;
  action: "read" | "write" | "delete" | "manage" | "assign";
  scope?: "own" | "class" | "year_group" | "school" | "all";
}

export interface SchoolContext {
  schoolId: string;
  schoolName: string;
  userType: StudyStreaksUser["userType"];
  userId: string;
}

// API response types
export interface AuthResponse {
  success: boolean;
  message?: string;
  user?: StudyStreaksUser;
  errors?: string[];
}

export interface PasswordValidation {
  isValid: boolean;
  errors: string[];
}

// Role-based access control
export type UserTypeRole = "teacher" | "student" | "parent" | "schoolAdmin";

export interface RoutePermissions {
  userTypes: UserTypeRole[];
  permissions?: PermissionCheck[];
  requireSchoolAccess?: boolean;
}