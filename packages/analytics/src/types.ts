/**
 * Analytics types for StudyStreaks platform
 */

export interface AnalyticsEvent {
  id: string;
  type: AnalyticsEventType;
  timestamp: Date;
  schoolId: string;
  metadata: Record<string, any>;
  anonymized: boolean;
}

export enum AnalyticsEventType {
  HOMEWORK_COMPLETED = 'homework_completed',
  STREAK_ACHIEVED = 'streak_achieved',
  CLUB_JOINED = 'club_joined',
  ACHIEVEMENT_EARNED = 'achievement_earned',
  LOGIN = 'login',
  PAGE_VIEW = 'page_view',
}

export interface StreakAnalytics {
  schoolId: string;
  period: 'day' | 'week' | 'month' | 'term' | 'year';
  totalStreaks: number;
  averageStreakLength: number;
  longestStreak: number;
  activeStreaks: number;
  yearGroupBreakdown: Record<number, StreakStats>;
}

export interface StreakStats {
  count: number;
  averageLength: number;
  longestStreak: number;
}

export interface HomeworkAnalytics {
  schoolId: string;
  period: 'day' | 'week' | 'month' | 'term' | 'year';
  totalCompletions: number;
  completionRate: number;
  averageCompletionTime: number; // minutes
  subjectBreakdown: Record<string, number>;
  yearGroupBreakdown: Record<number, HomeworkStats>;
}

export interface HomeworkStats {
  completions: number;
  completionRate: number;
  averageTime: number;
}

export interface ClubAnalytics {
  schoolId: string;
  period: 'day' | 'week' | 'month' | 'term' | 'year';
  totalMembers: number;
  activeClubs: number;
  averageAttendance: number;
  topPerformingClubs: ClubPerformance[];
}

export interface ClubPerformance {
  clubId: string;
  clubName: string;
  memberCount: number;
  attendanceRate: number;
  averageStreak: number;
}