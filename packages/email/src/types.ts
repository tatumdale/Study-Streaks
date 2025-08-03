/**
 * Email types for StudyStreaks platform
 */

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  htmlContent: string;
  textContent: string;
  variables: string[];
  category: EmailCategory;
}

export enum EmailCategory {
  STREAK_NOTIFICATION = 'streak_notification',
  HOMEWORK_REMINDER = 'homework_reminder',
  ACHIEVEMENT_EARNED = 'achievement_earned',
  WEEKLY_REPORT = 'weekly_report',
  CLUB_UPDATE = 'club_update',
  PARENT_SUMMARY = 'parent_summary',
}

export interface EmailData {
  to: string;
  templateId: string;
  variables: Record<string, any>;
  schoolId: string;
  studentId?: string;
  consentVerified: boolean;
}