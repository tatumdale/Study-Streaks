## Learning Points

### Tables

#### **LearningPointsBalance - Current LP Balance per Club**
```primsa
model LearningPointsBalance {
  id                    String       @id @default(cuid())
  schoolId              String       // Tenant isolation
  studentId             String
  clubId                String
  
  // Current Balance
  totalLearningPoints   Int          @default(0)
  currentLevel          Int          @default(1)    // Derived from total LP
  pointsInCurrentLevel  Int          @default(0)    // Progress within current level
  pointsToNextLevel     Int          @default(12)   // Points needed for next level
  
  // Performance Metrics
  averagePointsPerWeek  Float        @default(0.0)
  bestWeekPoints        Int          @default(0)
  totalLevelsAchieved   Int          @default(0)
  weeksAtCurrentLevel   Int          @default(0)    // How long stuck at this level
  
  // Last Activity
  lastPointsEarned      DateTime?    // When last earned points
  lastLevelUp           DateTime?    // When last moved up a level
  
  // Relationships
  school                School       @relation(fields: [schoolId], references: [id])
  student               Student      @relation(fields: [studentId], references: [id])
  club                  Club         @relation(fields: [clubId], references: [id])
  
  @@unique([studentId, clubId])      // One balance per student per club
  @@index([schoolId])
  @@index([currentLevel, clubId])    // For level-based leaderboards
  @@index([totalLearningPoints])     // For overall rankings
}
```

#### **LearningPointsTransaction (NEW) - LP Earning History**
```prisma
model LearningPointsTransaction {
  id                    String       @id @default(cuid())
  schoolId              String       // Tenant isolation
  studentId             String
  clubId                String
  
  // Transaction Details
  pointsEarned          Int          // Points earned in this transaction
  transactionType       LPTransactionType
  earnedAt              DateTime     @default(now())
  earnedDate            Date         @default(now())
  
  // Source Information
  sourceType            LPSourceType
  sourceId              String?      // HomeworkCompletion ID, ClubLevel ID, etc.
  sourceDescription     String       // "Read 15 pages of The BFG"
  
  // Club-Specific Details
  readingPages          Int?         // For reading: pages read
  levelAchieved         String?      // For maths/spelling: "Number Club 90"
  bookTitle             String?      // For reading: book being read
  
  // Normalization Context
  basePoints            Int          // Points before any adjustments
  normalizationFactor   Float        @default(1.0) // Applied normalization
  qualityMultiplier     Float        @default(1.0) // Quality-based multiplier
  
  // Level Progress Context
  levelBefore           Int?         // Student's level before this transaction
  levelAfter            Int?         // Student's level after this transaction
  levelUpAchieved       Boolean      @default(false) // Did this transaction cause level up?
  
  // Administrative
  verifiedBy            String?      // Teacher who verified the work
  verifiedAt            DateTime?    // When verified
  
  // Relationships
  school                School       @relation(fields: [schoolId], references: [id])
  student               Student      @relation(fields: [studentId], references: [id])
  club                  Club         @relation(fields: [clubId], references: [id])
  homeworkCompletion    HomeworkCompletion? @relation(fields: [sourceId], references: [id])
  
  @@index([schoolId])
  @@index([studentId, earnedDate])
  @@index([clubId, earnedDate])
  @@index([transactionType, earnedDate])
}

enum LPTransactionType {
  READING_PAGES         // Earned from reading pages
  LEVEL_PROGRESSION     // Earned from moving up club levels
  BONUS_ACHIEVEMENT     // Bonus points for special achievements
  QUALITY_BONUS         // Extra points for exceptional work
  TEACHER_AWARD         // Teacher-awarded bonus points
}

enum LPSourceType {
  HOMEWORK_COMPLETION   // From completing homework
  READING_LOG           // From reading log entry
  CLUB_LEVEL_UP         // From progressing club level
  TEACHER_ASSESSMENT    // From teacher verification
  ACHIEVEMENT_UNLOCK    // From unlocking achievements
}
```

#### **ClubLevelPoints - LP Values per Club Level**
```prisma
model ClubLevelValue {
  id                    String       @id @default(cuid())
  schoolId              String       // Tenant isolation
  clubId                String
  clubLevelId           String
  
  // Learning Points Configuration
  basePointsValue       Int          @default(12)   // MVP: 12 points = 1 level equivalent
  difficultyMultiplier  Float        @default(1.0)  // Adjust for level difficulty
  pageEquivalent        Int          @default(12)   // How many reading pages this equals
  
  // Level Context
  levelNumber           Int          // Which level this is (88, 90, 92, etc.)
  levelName             String       // "Number Club 88 - Stars"
  isCustomLevel         Boolean      @default(false) // Teacher-created custom level
  
  // Administrative
  createdBy             String?      // Who set these point values
  lastUpdated           DateTime     @updatedAt
  isActive              Boolean      @default(true)
  
  // Relationships
  school                School       @relation(fields: [schoolId], references: [id])
  club                  Club         @relation(fields: [clubId], references: [id])
  clubLevel             ClubLevel    @relation(fields: [clubLevelId], references: [id])
  
  @@unique([clubLevelId])            // One point value per club level
  @@index([schoolId])
  @@index([clubId, levelNumber])
}
```

#### **WeeklyLearningPointsSnapshot (NEW) - Weekly Progress Tracking**
```prisma
model WeeklyLearningPointsSnapshot {
  id                    String       @id @default(cuid())
  schoolId              String       // Tenant isolation
  studentId             String
  clubId                String
  
  // Time Period
  academicWeek          Int          // Week number in academic year
  weekStartDate         Date         // Monday of the week
  weekEndDate           Date         // Sunday of the week
  academicYear          String       // "2024-2025"
  academicTerm          String       // "Autumn", "Spring", "Summer"
  
  // Weekly Performance
  pointsEarnedThisWeek  Int          @default(0)
  levelAtStartOfWeek    Int          @default(1)
  levelAtEndOfWeek      Int          @default(1)
  levelsProgressedThisWeek Int       @default(0)
  
  // Reading-Specific (if reading club)
  pagesReadThisWeek     Int?         // Total pages read this week
  booksCompletedThisWeek Int?        // Books finished this week
  averagePagesPerDay    Float?       // Daily reading average
  
  // Engagement Metrics
  daysActiveThisWeek    Int          @default(0)    // Days with LP activity
  consistencyScore      Float        @default(0.0)  // 0.0-1.0 consistency rating
  
  // Comparative Context
  classAverageThisWeek  Float?       // Average points in class this week
  personalBestWeek      Boolean      @default(false) // Is this their best week?
  improvementFromLastWeek Float      @default(0.0)   // % change from previous week
  
  // Calculated Metrics
  learningVelocity      Float        @default(0.0)   // Points per day trend
  progressPrediction    Float?       // Predicted points next week
  
  // Administrative
  calculatedAt          DateTime     @default(now())
  
  // Relationships
  school                School       @relation(fields: [schoolId], references: [id])
  student               Student      @relation(fields: [studentId], references: [id])
  club                  Club         @relation(fields: [clubId], references: [id])
  
  @@unique([studentId, clubId, academicWeek, academicYear]) // One snapshot per student/club/week
  @@index([schoolId])
  @@index([academicWeek, academicYear])
  @@index([clubId, academicWeek])
}
```

#### **StudentClubLevel (NEW) - Current Level per Club - Junction**
```prisma
model StudentClubLevel {
  id                    String       @id @default(cuid())
  schoolId              String       // Tenant isolation
  studentId             String
  clubId                String
  
  // Current Level Status
  currentLevel          Int          @default(1)    // Current level number
  currentLevelName      String       @default("Level 1") // "Number Club 88"
  achievedAt            DateTime     @default(now())
  
  // Progress Context
  pointsWhenAchieved    Int          @default(0)    // Total LP when reached this level
  daysToAchieveLevel    Int?         // How many days to reach this level
  previousLevel         Int?         // What level they came from
  
  // Performance
  timeAtThisLevel       Int          @default(0)    // Days spent at current level
  strugglingAtLevel     Boolean      @default(false) // Flagged if stuck too long
  
  // Relationships
  school                School       @relation(fields: [schoolId], references: [id])
  student               Student      @relation(fields: [studentId], references: [id])
  club                  Club         @relation(fields: [clubId], references: [id])
  
  @@unique([studentId, clubId])      // One current level per student per club
  @@index([schoolId])
  @@index([currentLevel, clubId])    // For level-based views
}
```

### Relationships

- **Student** (1) → Many (LearningPointsBalance) [current LP per club]
- **Student** (1) → Many (LearningPointsTransaction) [LP earning history]
- **Student** (1) → Many (WeeklyLearningPointsSnapshot) [weekly progress tracking]
- **Student** (1) → Many (StudentClubLevel) [current level per club]
- **Club** (1) → Many (ClubLevelValue) [point values per level]
- **HomeworkCompletion** (1) → Many (LearningPointsTransaction) [earning trigger]
- ClubLevel** (1) → One (ClubLevelValue) [point value configuration]

### Key Business Logic

1. **Reading Club**: Pages read → Direct LP (1 page = 1 point)
2. **Maths/Spelling Clubs**: Level progression → Fixed LP (12 points per level for MVP)
3. **Normalization**: 12 pages reading = 1 maths/spelling level = 12 LP
4. **Level Calculation**: Total LP ÷ 12 = Current Level
5. **Progress Tracking**: Weekly snapshots show engagement patterns
6. **Teacher Insights**: Can see which students are progressing vs struggling per subject

---