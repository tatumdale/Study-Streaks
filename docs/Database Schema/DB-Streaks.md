## 6. Streaks

### Tables

---
#### **StudentStreak** - Current streak status per club and overall
```prisma
model StudentStreak {
  id                    String       @id @default(cuid())
  schoolId              String       // Tenant isolation
  studentId             String
  clubId                String?      // NULL = overall student streak
  
  // Current Streak Status
  currentStreak         Int          @default(0)
  longestStreak         Int          @default(0)
  streakStatus          StreakStatus @default(ACTIVE)
  
  // Pause Management
  pausedAt              DateTime?    // When streak was paused
  pauseExpiresAt        DateTime?    // When pause expires (1 day later)
  canBeUnpaused         Boolean      @default(false)
  
  // Last Activity
  lastCompletionDate    Date?        // Last successful completion
  lastActivityDate      Date?        // Last activity (completion or pause)
  
  // Relationships
  school                School       @relation(fields: [schoolId], references: [id])
  student               Student      @relation(fields: [studentId], references: [id])
  club                  Club?        @relation(fields: [clubId], references: [id])
  progressTracking		StreakGoalProgress[]  //Daily progress tracking
  
  
  @@unique([studentId, clubId])     // One streak record per student per club
  @@index([schoolId])
  @@index([streakStatus])
}

enum StreakStatus {
  ACTIVE                // Currently building streak
  PAUSED                // Paused for 1 day, can be unpaused
  RESET                 // Reset to 0 after pause expired
  FROZEN                // Admin/teacher frozen (doesn't expire)
}
```

#### **StreakGoalProgress - Junction**
```prisma
model StreakGoalProgress {
  id                    String       @id @default(cuid())
  schoolId              String
  streakGoalId          String
  studentId             String
  
  // Daily Progress Tracking
  progressDate          Date
  dailyProgress         Int          // Progress made this day
  cumulativeProgress    Int          // Total progress to date
  streakEarned          Boolean      @default(false) // Did they earn streak this day
  
  // Goal Context
  daysRemaining         Int?         // Days left to achieve goal
  onTrack               Boolean      @default(true)  // Still on track to achieve
  
  // Relationships
  school                School       @relation(fields: [schoolId], references: [id])
  streakGoal            StreakGoal   @relation(fields: [streakGoalId], references: [id])
  student               Student      @relation(fields: [studentId], references: [id])
  
  @@unique([streakGoalId, progressDate])
  @@index([schoolId])
}
```

#### **DailyStreakRecord - Historical Daily Tracking**
```prisma
model DailyStreakRecord {
  id                    String       @id @default(cuid())
  schoolId              String       // Tenant isolation
  studentId             String
  clubId                String?      // NULL = overall student streak
  
  // Date Information
  recordDate            Date         // The specific day
  isSchoolDay           Boolean      // Was this a required day?
  academicWeek          Int          // Week number in academic year
  academicMonth         Int          // Month number in academic year
  academicTerm          String       // "Autumn", "Spring", "Summer"
  academicYear          String       // "2024-2025"
  
  // Daily Status
  wasCompleted          Boolean      @default(false)
  streakCountAtEndOfDay Int          @default(0)
  streakStatus          StreakStatus @default(ACTIVE)
  
  // Completion Context
  completionId          String?      // HomeworkCompletion ID if completed
  pauseApplied          Boolean      @default(false)
  retrospectivelyFixed  Boolean      @default(false)
  fixedBy               String?      // Teacher/admin who fixed it
  fixedAt               DateTime?    // When it was fixed
  
  // Relationships
  school                School       @relation(fields: [schoolId], references: [id])
  student               Student      @relation(fields: [studentId], references: [id])
  club                  Club?        @relation(fields: [clubId], references: [id])
  completion            HomeworkCompletion? @relation(fields: [completionId], references: [id])
  
  @@unique([studentId, clubId, recordDate]) // One record per student/club/date
  @@index([schoolId])
  @@index([studentId, recordDate])
  @@index([academicWeek, academicYear])
  @@index([academicMonth, academicYear])
  @@index([academicTerm, academicYear])
}	
```

#### **StreakPause Junction**
```prisma
model StreakPause {
  id                    String       @id @default(cuid())
  schoolId              String       // Tenant isolation
  studentId             String
  clubId                String?      // NULL = overall student streak
  
  // Pause Details
  pauseDate             Date         // The date that was paused
  reason                PauseReason
  reasonDescription     String?      // Additional details
  
  // Pause Type & Effect
  pauseType             PauseType    @default(ILLNESS)
  maintainsContinuity   Boolean      @default(true)  // Allows streak to continue
  preventsReset         Boolean      @default(true)  // Prevents auto-reset after 1 day
  
  // Administrative
  createdBy             String       // Teacher/admin who created pause
  createdAt             DateTime     @default(now())
  isActive              Boolean      @default(true)
  
  // Relationships
  school                School       @relation(fields: [schoolId], references: [id])
  student               Student      @relation(fields: [studentId], references: [id])
  club                  Club?        @relation(fields: [clubId], references: [id])
  
  @@unique([studentId, clubId, pauseDate])
  @@index([schoolId])
  @@index([pauseDate])
}
```

### Relationships
- **Student** (1) → Many (StudentStreak) [current streak per club + overall]
- **Student** (1) → Many (DailyStreakRecord) [historical daily tracking]
- **Student** (1) → Many (StreakPause) [retrospective adjustments]
- **HomeworkCompletion** (1) → One (DailyStreakRecord) [triggers streak update]
- **Club** (1) → Many (StudentStreak) [club-specific streaks]
- **Club** (1) → Many (DailyStreakRecord) [club daily records]

### Key Logic:

1. **Overall Student Streak**: `StudentStreak` with `clubId = NULL`
2. **Club-Specific Streaks**: `StudentStreak` with specific `clubId`
3. **Historical Views**: Query `DailyStreakRecord` by academic week/month/term
4. **Pause Management**: `StreakPause` prevents auto-reset, `StudentStreak.pauseExpiresAt` handles 1-day window

### Streak Dependencies

- HomeworkCompletion + StreakPause + SchoolCalendar → Individual Streaks
- BuddyGroupMember Completions + Group Rules → Buddy Group Streaks
- Login Events + Reminder Time + Cooldown → Nudge Opportunities

---