## Achievements & Stickers

### Tables

#### **Achievement - Personal Best Badges**
```prisma
model Achievement {
  id                    String       @id @default(cuid())
  schoolId              String       // Tenant isolation
  
  // Achievement Definition
  name                  String       // "Longest Reading Streak", "Learning Points Champion"
  description           String       // What this achievement represents
  achievementType       AchievementType @default(PERSONAL_BEST)
  category              AchievementCategory
  
  // Personal Best Configuration
  metricType            MetricType   // What metric this tracks
  clubSpecific          Boolean      @default(false) // Is this club-specific?
  targetClubId          String?      // Specific club if club-specific
  
  // Threshold & Difficulty
  baseThreshold         Int?         // Minimum value to unlock (e.g., 7 days)
  isProgressive         Boolean      @default(true)  // Does it improve with better performance?
  difficultyTiers       Json?        // Bronze/Silver/Gold thresholds
  
  // Visual Design
  iconUrl               String?      // Achievement badge icon
  badgeDesign           Json?        // Badge visual design data
  color                 String       @default("#FFD700")
  rarity                AchievementRarity @default(COMMON)
  
  // Rewards
  fuelReward            Int          @default(0)
  lpReward              Int          @default(0)
  
  // Status
  isActive              Boolean      @default(true)
  sortOrder             Int          @default(0)
  
  // Administrative
  createdAt             DateTime     @default(now())
  updatedAt             DateTime     @updatedAt
  
  // Relationships
  school                School       @relation(fields: [schoolId], references: [id])
  club                  Club?        @relation(fields: [targetClubId], references: [id])
  studentAchievements   StudentAchievement[]
  triggers				AchievmentTrigger[] // What triggers this achievement
  
  @@index([schoolId])
  @@index([achievementType, isActive])
  @@index([metricType, clubSpecific])
}

enum AchievementType {
  PERSONAL_BEST         // Personal best achievements (badges)
  MILESTONE             // Milestone stickers (handled separately)
}

enum MetricType {
  LONGEST_STUDENT_STREAK    // Longest overall student streak
  LONGEST_CLUB_STREAK       // Longest streak in specific club
  LONGEST_BUDDY_STREAK      // Longest buddy group streak
  PERFECT_CLUB_WEEKS        // Weeks with all 3 club tasks completed
  TOTAL_LEARNING_POINTS     // Most LP earned
  CLUB_LEARNING_POINTS      // Most LP in specific club
  CONSECUTIVE_PERFECT_WEEKS // Perfect weeks in a row
  TOTAL_HOMEWORK_COMPLETED  // Total homework completions
}
```

#### **Sticker - Milestone Stickers**
```prisma
model Sticker {
  id                    String       @id @default(cuid())
  schoolId              String       // Tenant isolation
  
  // Sticker Definition
  name                  String       // "1st Week Study Streak", "Term Study Streak"
  description           String       // What milestone this represents
  stickerCategory       StickerCategory
  
  // Milestone Configuration
  milestoneType         MilestoneType
  targetValue           Int?         // Target value (1 week, 1 term, etc.)
  clubSpecific          Boolean      @default(false)
  targetClubId          String?      // Specific club if needed
  
  // Timing & Availability
  availableFromWeek     Int?         // Which academic week it becomes available
  availableUntilWeek    Int?         // When it expires (if applicable)
  isAnnualReset         Boolean      @default(true) // Resets each academic year
  
  // Visual Design
  stickerImageUrl       String?      // Sticker image
  animationUrl          String?      // Collection animation
  backgroundColor       String       @default("#4F46E5")
  borderColor           String       @default("#312E81")
  glowEffect            Boolean      @default(false)
  
  // Collection Context
  collectibleOnce       Boolean      @default(true)  // Can only be earned once per year
  displayOrder          Int          @default(0)     // Order in sticker book
  stickerSet            String?      // "Autumn Term", "Reading Milestones"
  
  // Status
  isActive              Boolean      @default(true)
  releaseDate           Date?        // When sticker was released
  
  // Administrative
  createdAt             DateTime     @default(now())
  updatedAt             DateTime     @updatedAt
  
  // Relationships
  school                School       @relation(fields: [schoolId], references: [id])
  club                  Club?        @relation(fields: [targetClubId], references: [id])
  studentStickers       StudentSticker[]
  
  @@index([schoolId])
  @@index([stickerCategory, isActive])
  @@index([milestoneType, availableFromWeek])
}

enum StickerCategory {
  STREAK_MILESTONES     // Streak-based stickers
  LEARNING_MILESTONES   // LP-based stickers
  TIME_MILESTONES       // Week/month/term based
  CLUB_MILESTONES       // Club-specific milestones
  SOCIAL_MILESTONES     // Buddy group milestones
  SEASONAL              // Seasonal/holiday stickers
}

enum MilestoneType {
  FIRST_WEEK_STREAK     // 1st week study streak
  FIRST_MONTH_STREAK    // 1st month study streak
  TERM_STREAK           // Full term streak
  FIRST_CLUB_LEVEL      // First club level completion
  FIRST_PERFECT_WEEK    // First week with all clubs completed
  READING_MILESTONE     // X pages read
  LP_MILESTONE          // X learning points earned
  BUDDY_GROUP_MEMBER    // Joined first buddy group
  HELPFUL_FRIEND        // Sent helpful nudges
}
```

#### **StickerTrigger**
```prisma
model StickerTrigger {
  id                    String       @id @default(cuid())
  schoolId              String
  stickerId             String
  
  // Trigger Configuration
  triggerEvent          String       // "first_week_streak", "term_completion", etc.
  triggerValue          Int?         // Required value (7 days, 1 term, etc.)
  academicPeriod        String?      // "week", "month", "term", "year"
  
  // Evaluation Rules
  evaluationFrequency   String       @default("daily")
  canRetrigger          Boolean      @default(false) // Can be earned multiple times
  isActive              Boolean      @default(true)
  
  // Relationships
  school                School       @relation(fields: [schoolId], references: [id])
  sticker               Sticker      @relation(fields: [stickerId], references: [id])
  
  @@index([schoolId])
  @@index([triggerEvent, isActive])
}
```


#### **StudentAchievement - Personal Best Records**
```prisma
model StudentAchievement {
  id                    String       @id @default(cuid())
  schoolId              String       // Tenant isolation
  studentId             String
  achievementId         String
  
  // Achievement Context
  earnedAt              DateTime     @default(now())
  earnedDate            Date         @default(now())
  clubId                String?      // Club context if club-specific
  
  // Personal Best Details
  achievementValue      Int          // The value that earned the achievement (e.g., 21 day streak)
  previousBest          Int?         // Their previous best (e.g., 14 day streak)
  improvementAmount     Int?         // How much they improved by
  
  // Performance Context
  currentTier           String?      // "Bronze", "Silver", "Gold"
  triggerEvent          String?      // What triggered this achievement
  witnessingData        Json?        // Context about when/how achieved
  
  // Display & Celebration
  celebrationViewed     Boolean      @default(false)
  isDisplayed           Boolean      @default(true)
  displayOrder          Int?         // Order in achievement gallery
  isFeatured            Boolean      @default(false) // Featured in profile
  
  // Social Features  
  announcementMade      Boolean      @default(false)
  parentNotified        Boolean      @default(false)
  
  // Relationships
  school                School       @relation(fields: [schoolId], references: [id])
  student               Student      @relation(fields: [studentId], references: [id])
  achievement           Achievement  @relation(fields: [achievementId], references: [id])
  club                  Club?        @relation(fields: [clubId], references: [id])
  triggers				StickerTrigger[]  //What triggers this sticker
  
  @@unique([studentId, achievementId]) // Can only have one of each achievement
  @@index([schoolId])
  @@index([studentId, earnedDate])
  @@index([achievementValue]) // For leaderboards
}
```

#### **AchievementTrigger**
```prisma
model AchievementTrigger {
  id                    String       @id @default(cuid())
  schoolId              String
  achievementId         String
  
  // Trigger Configuration
  triggerType           TriggerType
  sourceTable           String       // "StudentStreak", "LearningPointsBalance", etc.
  triggerField          String       // "currentStreak", "totalLearningPoints", etc.
  comparisonOperator    String       // ">=", ">", "==", etc.
  thresholdValue        Int          // Value to trigger achievement
  
  // Evaluation Rules
  evaluationFrequency   String       // "immediate", "daily", "weekly"
  clubSpecific          Boolean      @default(false)
  isActive              Boolean      @default(true)
  
  // Relationships
  school                School       @relation(fields: [schoolId], references: [id])
  achievement           Achievement  @relation(fields: [achievementId], references: [id])
  
  @@index([schoolId])
  @@index([triggerType, isActive])
}

enum TriggerType {
  STREAK_MILESTONE      // Triggered by streak achievements
  LP_MILESTONE          // Triggered by learning points
  LEVEL_MILESTONE       // Triggered by club level progression
  CONSISTENCY_MILESTONE // Triggered by consistent activity
}
```

#### **StudentSticker - Collected Stickers**
```prisma
model StudentSticker {
  id                    String       @id @default(cuid())
  schoolId              String       // Tenant isolation
  studentId             String
  stickerId             String
  
  // Collection Details
  collectedAt           DateTime     @default(now())
  collectedDate         Date         @default(now())
  academicYear          String       // "2024-2025"
  academicWeek          Int?         // Week when collected
  
  // Collection Context
  triggerEvent          String?      // What milestone triggered collection
  milestoneValue        Int?         // Value that triggered milestone (e.g., 7 days)
  clubContext           String?      // Club context if relevant
  
  // Sticker Book Organization
  pageNumber            Int?         // Page in virtual sticker book
  positionOnPage        Int?         // Position on the page
  stickerBookSet        String?      // Which set it belongs to
  
  // Collection Celebration
  celebrationViewed     Boolean      @default(false)
  collectionAnimation   String?      // Which animation was shown
  
  // Status
  isNew                 Boolean      @default(true)  // New until viewed
  isFavorite            Boolean      @default(false) // Student favorited
  
  // Relationships
  school                School       @relation(fields: [schoolId], references: [id])
  student               Student      @relation(fields: [studentId], references: [id])
  sticker               Sticker      @relation(fields: [stickerId], references: [id])
  
  @@unique([studentId, stickerId, academicYear]) // One per student per sticker per year
  @@index([schoolId])
  @@index([studentId, collectedDate])
  @@index([academicYear, academicWeek])
}
```

### Relationships

- **School** (1) → Many (Achievement) [available personal best badges]
- **School** (1) → Many (Sticker) [available milestone stickers]
- **Student** (1) → Many (StudentAchievement) [earned personal best badges]
- **Student** (1) → Many (StudentSticker) [collected milestone stickers]
- **Club** (1) → Many (Achievement) [club-specific achievements]
- **Club** (1) → Many (Sticker) [club-specific stickers]
- **Achievement** (1) → Many (StudentAchievement) [students who earned it]
- **Sticker** (1) → Many (StudentSticker) [students who collected it]

---
