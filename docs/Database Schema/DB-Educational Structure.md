## 2. Educational Structure

### Tables

#### **Class** - UK teaching groups with year group and key stage support
```prisma
model Class {
  id                    String       @id @default(cuid())
  schoolId              String       // Tenant isolation
  
  // Class Identity & Structure
  name                  String       // "5B", "Year 3/4 Mixed"
  displayName           String?      // Optional friendly name: "The Dragons"
  yearGroups            Int[]        // [3, 4] for mixed Year 3/4 class
  keyStages             KeyStage[]   // [KS1, KS2] for mixed key stage classes
  
  // Academic Structure
  classType             ClassType    @default(FORM)
  subject               String?      // For secondary: "Mathematics", "English"
  setLevel              String?      // For secondary sets: "Set 1", "Top Set"
  academicYear          String       // "2024-2025"
  
  // UK School House System
  houseGroup            String?      // "Red House", "Dragons"
  houseColor            String?      // Hex color for house branding
  
  // Class Configuration
  capacity              Int?         // Maximum number of students
  isActive              Boolean      @default(true)
  classroom             String?      // Physical room: "Room 12"
  
  // Gamification
  clubsEnabled          Boolean      @default(true)
  leaderboardEnabled    Boolean      @default(true)
  
  // Relationships
  school                School       @relation(fields: [schoolId], references: [id])
  teacherClasses        TeacherClass[]
  students              Student[]
  classClubLevels       ClassClubLevel[]
  
  @@index([schoolId])
  @@index([schoolId, yearGroups])
  @@index([schoolId, isActive])
  @@map("classes")
}

enum ClassType {
  FORM          // Primary form class / tutor group
  SUBJECT       // Secondary subject-specific class
  SET           // Ability-grouped class
  MIXED         // Mixed-age class (small schools)
  INTERVENTION  // Support/SEN intervention group
  CLUB          // Extra-curricular club class
  NURTURE       // Nurture group for pastoral support
}
```

#### **Club** - Subject-based homework clubs with progressive level systems
```prisma
model Club {
  id                    String       @id @default(cuid())
  schoolId              String       // Tenant isolation
  
  // Club Identity
  name                  String       // "Number Club", "Reading Club"
  description           String?      // What the club teaches
  clubType              ClubType     @default(ACADEMIC)
  subject               String       // "Mathematics", "Reading", "Spelling"
  
  // Club Configuration
  isActive              Boolean      @default(true)
  ageGroups             Int[]        // [3,4,5,6] - which year groups can participate
  keyStages             KeyStage[]   // [KS1, KS2] - which key stages
  
  // Progression System
  hasLevels             Boolean      @default(true)
  levelNaming           String?      // "Number Club {level} - {tier}" pattern
  customLevels          Boolean      @default(false)
  
  // Evidence & Tracking
  evidenceType          ClubEvidenceType
  logbookRequired       Boolean      @default(false)
  parentInvolvement     Boolean      @default(false)
  
  // Buddy System Configuration
  maxBuddyMembers       Int          @default(3)     // 0 = no buddy groups allowed
  buddyGroupsEnabled    Boolean      @default(true)
  
  // Gamification
  xpPerCompletion       Int          @default(10)
  streakEnabled         Boolean      @default(true)
  
  // Visual & Branding
  iconUrl               String?
  color                 String       @default("#3B82F6")
  
  // Administrative
  createdBy             String
  createdAt             DateTime     @default(now())
  updatedAt             DateTime     @updatedAt
  
  // Relationships
  school                School       @relation(fields: [schoolId], references: [id])
  clubLevels            ClubLevel[]
  classClubLevels       ClassClubLevel[]
  studentClubProgress   StudentClubProgress[]
  homeworkCompletions   HomeworkCompletion[]
  streakPauses          StreakPause[]
  streaks               StudentStreak[]
  dailyStreakRecords    DailyStreakRecord[]
  buddyGroups           BuddyGroup[]
  learningPointsBalances LearningPointsBalance[]
  learningPointsTransactions LearningPointsTransaction[]
  weeklyLPSnapshots     WeeklyLearningPointsSnapshot[]
  studentClubLevels     StudentClubLevel[]
  clubLevelValues       ClubLevelValue[]
  fuelTransactions      FuelTransaction[]
  studentFuelBalances   StudentFuelBalance[]
  achievements          Achievement[]
  studentAchievements   StudentAchievement[]
  stickers              Sticker[]
  
  @@index([schoolId])
  @@index([schoolId, isActive])
  @@index([schoolId, clubType])
  @@map("clubs")
}

enum ClubType {
  NUMBER        // Number/Mathematics clubs
  READING       // Reading clubs with reading logs
  SPELLING      // Spelling clubs with word lists
  WRITING       // Creative writing clubs
  SCIENCE       // Science investigation clubs
  TOPIC         // Cross-curricular topic clubs
  SKILL         // Life skills, problem solving
  WELLBEING     // Social/emotional learning
}

enum ClubEvidenceType {
  PHOTO               // Photo evidence of completed work
  READING_LOG         // Reading log with books/pages/comments
  COMPLETION_MARK     // Simple tick/completion marker
  AUDIO_RECORDING     // Voice recording (reading aloud)
  WRITTEN_WORK        // Uploaded written work
  TEACHER_OBSERVED    // Teacher observed during school time
}
```

#### **ClubLevel** - Individual difficulty levels within clubs
```prisma
model ClubLevel {
  id                    String       @id @default(cuid())
  schoolId              String       // Tenant isolation
  clubId                String       // Parent club
  
  // Level Identity
  levelNumber           Int          // 88, 90, 92, etc. or 1, 2, 3
  levelName             String       // "Stars", "Gold", "Platinum"
  displayName           String       // "Number Club 88 - Stars"
  description           String?      // What this level covers
  
  // Level Configuration
  isActive              Boolean      @default(true)
  difficulty            LevelDifficulty @default(APPROPRIATE)
  estimatedWeeks        Int?         // How long students typically spend
  
  // Homework Requirements
  weeklyTarget          Int          // Days per week required
  dailyMinutes          Int?         // Minutes per session
  flexibility           ClubFlexibility @default(FLEXIBLE)
  
  // Level Content
  levelContent          Json         // Content specific to club type
  successCriteria       Json?        // How to know student has mastered level
  
  // Progression Rules
  prerequisiteLevel     String?      // Must complete this level first
  autoAdvance           Boolean      @default(false)
  teacherApproval       Boolean      @default(true)
  
  // Administrative
  createdBy             String
  isCustomLevel         Boolean      @default(false)
  createdAt             DateTime     @default(now())
  updatedAt             DateTime     @updatedAt
  
  // Relationships
  school                School       @relation(fields: [schoolId], references: [id])
  club                  Club         @relation(fields: [clubId], references: [id])
  classLevelAssignments ClassClubLevel[]
  studentProgress       StudentClubProgress[]
  clubLevelValues       ClubLevelValue[]
  
  @@unique([clubId, levelNumber])
  @@index([schoolId])
  @@index([clubId, isActive])
  @@map("club_levels")
}

enum LevelDifficulty {
  FOUNDATION    // Below age-expected
  APPROPRIATE   // Age-appropriate
  CHALLENGE     // Above age-expected
  EXTENSION     // Gifted and talented
}

enum ClubFlexibility {
  STRICT        // Must complete exact target
  FLEXIBLE      // Can make up missed days
  ASPIRATIONAL  // Target to aim for, not mandatory
}
```

#### **ClassClubLevel** - Assignment of specific club levels to classes
```prisma
model ClassClubLevel {
  id                    String       @id @default(cuid())
  schoolId              String       // Tenant isolation
  classId               String
  clubId                String
  clubLevelId           String
  
  // Assignment Details
  assignedAt            DateTime     @default(now())
  assignedBy            String       // Teacher who made assignment
  isActive              Boolean      @default(true)
  
  // Class-Specific Overrides
  customWeeklyTarget    Int?         // Override level's weekly target
  customDailyMinutes    Int?         // Override level's daily minutes
  notes                 String?      // Teacher notes
  
  // Relationships
  school                School       @relation(fields: [schoolId], references: [id])
  class                 Class        @relation(fields: [classId], references: [id])
  club                  Club         @relation(fields: [clubId], references: [id])
  clubLevel             ClubLevel    @relation(fields: [clubLevelId], references: [id])
  
  @@unique([classId, clubId])
  @@index([schoolId])
  @@index([clubId, isActive])
  @@map("class_club_levels")
}
```

#### **StudentClubProgress** - Individual student progress through club levels
```prisma
model StudentClubProgress {
  id                    String       @id @default(cuid())
  schoolId              String       // Tenant isolation
  studentId             String
  clubId                String
  clubLevelId           String
  
  // Progress Status
  status                ProgressStatus @default(ACTIVE)
  startedAt             DateTime     @default(now())
  completedAt           DateTime?    // When level was completed
  advancedAt            DateTime?    // When student advanced to next level
  
  // Progress Tracking
  currentStreak         Int          @default(0)
  longestStreak         Int          @default(0)
  totalCompletions      Int          @default(0)
  weeklyCompletions     Json?        // Track completions by week
  
  // Mastery Assessment
  masteryScore          Int?         // Score on level mastery test
  teacherAssessment     Json?        // Teacher's assessment of progress
  readyToAdvance        Boolean      @default(false)
  parentFeedback        Json?        // Parent comments
  
  // Administrative
  assignedBy            String       // Teacher who assigned this level
  
  // Relationships
  school                School       @relation(fields: [schoolId], references: [id])
  student               Student      @relation(fields: [studentId], references: [id])
  club                  Club         @relation(fields: [clubId], references: [id])
  clubLevel             ClubLevel    @relation(fields: [clubLevelId], references: [id])
  
  @@unique([studentId, clubId])
  @@index([schoolId])
  @@index([clubId, status])
  @@index([studentId, status])
  @@map("student_club_progress")
}

enum ProgressStatus {
  ACTIVE      // Currently working on this level
  COMPLETED   // Completed but not yet advanced
  ADVANCED    // Completed and moved to next level
  PAUSED      // Temporarily paused
  REPEATED    // Repeating this level
}
```

### Example Data
```json
{
  "club": {
    "id": "club_weobley_reading",
    "schoolId": "clr8k3m5x0001t6y8z9q4w2e1",
    "name": "Reading Club",
    "description": "Daily reading to build fluency and love of books",
    "clubType": "READING",
    "subject": "Reading",
    "maxBuddyMembers": 4,
    "buddyGroupsEnabled": true,
    "evidenceType": "READING_LOG",
    "parentInvolvement": true
  },
  "clubLevel": {
    "id": "level_reading_3",
    "clubId": "club_weobley_reading",
    "levelNumber": 3,
    "levelName": "Confident Reader",
    "displayName": "Reading Level 3 - Confident Reader",
    "weeklyTarget": 4,
    "dailyMinutes": 20,
    "difficulty": "APPROPRIATE"
  }
}
```

### Relationships
- **School**: One-to-Many with Classes and Clubs
- **Club System**: Club → ClubLevel → StudentClubProgress (progression hierarchy)
- **Class Assignment**: Classes ↔ ClubLevels via ClassClubLevel junction
- **Student Progress**: Students track through levels via StudentClubProgress

### Key Features
- **Progressive Learning**: Numbered levels with clear advancement criteria
- **Evidence-Based**: Different evidence types per club (photos, reading logs)
- **Flexible Assignment**: Classes can work on different levels of same club
- **UK Education Alignment**: Supports key stages and year group structures

---