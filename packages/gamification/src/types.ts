/**
 * Gamification types for StudyStreaks platform
 */

export interface Streak {
  id: string;
  studentId: string;
  clubId?: string;
  type: StreakType;
  currentCount: number;
  longestCount: number;
  lastActivity: Date;
  isActive: boolean;
  startDate: Date;
}

export enum StreakType {
  DAILY_HOMEWORK = 'daily_homework',
  WEEKLY_COMPLETION = 'weekly_completion',
  CLUB_ATTENDANCE = 'club_attendance',
  SUBJECT_FOCUS = 'subject_focus',
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  category: AchievementCategory;
  criteria: AchievementCriteria;
  reward: AchievementReward;
  difficulty: 'easy' | 'medium' | 'hard' | 'legendary';
  isActive: boolean;
}

export enum AchievementCategory {
  STREAK = 'streak',
  HOMEWORK = 'homework',
  CLUB = 'club',
  SOCIAL = 'social',
  SPECIAL = 'special',
}

export interface AchievementCriteria {
  type: 'streak_days' | 'homework_count' | 'club_participation' | 'custom';
  value: number;
  timeframe?: 'day' | 'week' | 'month' | 'term' | 'year' | 'all_time';
  conditions?: Record<string, any>;
}

export interface AchievementReward {
  type: 'badge' | 'certificate' | 'points' | 'prize';
  value: string | number;
  description?: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  iconUrl: string;
  color: string;
  category: BadgeCategory;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
}

export enum BadgeCategory {
  STREAK = 'streak',
  COMPLETION = 'completion',
  IMPROVEMENT = 'improvement',
  COLLABORATION = 'collaboration',
  MILESTONE = 'milestone',
}

export interface LeaderboardEntry {
  rank: number;
  studentId: string;
  studentName: string;
  score: number;
  streakLength: number;
  clubId?: string;
  badges: Badge[];
}

export interface Leaderboard {
  id: string;
  type: LeaderboardType;
  timeframe: 'daily' | 'weekly' | 'monthly' | 'term' | 'all_time';
  scope: 'school' | 'year_group' | 'club';
  entries: LeaderboardEntry[];
  lastUpdated: Date;
}

export enum LeaderboardType {
  STREAK_LENGTH = 'streak_length',
  HOMEWORK_COMPLETION = 'homework_completion',
  CLUB_PARTICIPATION = 'club_participation',
  ACHIEVEMENT_POINTS = 'achievement_points',
}