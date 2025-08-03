## 5. Homework Tracking & Evidence

### Tables

#### **HomeworkCompletion** - Evidence-based homework tracking with S3 photo URLs and XP earning
```prisma
model HomeworkCompletion {
  id                    String       @id @default(cuid())
  schoolId              String       // Tenant isolation
  studentId             String
  clubId                String
  clubLevelId           String
  
  // Completion Details
  completedDate         Date         // 2025-01-20 (date only, not datetime)
  completedAt           DateTime     @default(now()) // When logged in system
  loggedBy              String       // userId who logged this completion
  loggedByType          LoggedByType @default(STUDENT)
  
  // Evidence & Content
  evidenceType          CompletionEvidenceType
  photoUrls             String[]     // S3 URLs for photo evidence
  notes                 String?      // Student/parent notes about the work
  minutesSpent          Int?         // How long they spent on the activity
  
  // Learning Assessment
  difficultyRating      Int?         // 1-5: How challenging was this?
  enjoymentRating       Int?         // 1-5: How much did they enjoy it?
  confidenceRating      Int?         // 1-5: How confident do they feel?
  parentFeedback        String?      // Parent observations/comments
  
  // Gamification & Progress
  xpEarned              Int          @default(0)    // Experience points earned
  lpEarned              Int          @default(0)    // Learning points earned
  contributesToStreak   Boolean      @default(true) // Does this count for streaks?
  isWeekendWork         Boolean      @default(false) // Completed on weekend
  isHolidayWork         Boolean      @default(false) // Completed on holiday
  isBonusWork           Boolean      @default(false) // Above and beyond
  
  // Verification & Quality
  verifiedBy            String?      // Teacher who verified the work
  verifiedAt            DateTime?    // When teacher verified
  qualityScore          Int?         // Teacher assessment of work quality (1-5)
  needsFollowUp         Boolean      @default(false) // Requires additional support
  teacherFeedback       String?      // Teacher comments on the work
  
  // Status & Workflow
  status                CompletionStatus @default(SUBMITTED)
  isRevision            Boolean      @default(false) // Is this a revision/redo?
  originalCompletionId  String?      // If revision, link to original
  
  // Relationships
  school                School       @relation(fields: [schoolId], references: [id])
  student               Student      @relation(fields: [studentId], references: [id])
  club                  Club         @relation(fields: [clubId], references: [id])
  clubLevel             ClubLevel    @relation(fields: [clubLevelId], references: [id])
  readingLogEntries     ReadingLogEntry[] // For reading club completions
  dailyStreakRecord     DailyStreakRecord? // Links to daily streak tracking
  learningPointsTransactions LearningPointsTransaction[] // LP earned from this completion
  fuelTransactions      FuelTransaction[] // Fuel earned from this completion
  
  @@index([schoolId])
  @@index([studentId, completedDate])
  @@index([clubId, completedDate])
  @@index([schoolId, completedDate])
  @@index([loggedByType, completedDate])
  @@map("homework_completions")
}

enum LoggedByType {
  STUDENT               // Student logged their own work
  PARENT                // Parent logged on behalf of student
  TEACHER               // Teacher logged during school time
  ADMIN                 // Admin logged for data correction
}

enum CompletionEvidenceType {
  PHOTO_EVIDENCE        // Photo of completed work
  READING_LOG           // Reading log entry with book details
  TEACHER_OBSERVATION   // Teacher observed during school time
  PARENT_CONFIRMATION   // Parent confirmed completion
  DIGITAL_SUBMISSION    // Digital work submitted
  VERBAL_REPORT         // Verbal report of completion
  NO_EVIDENCE           // Simple completion mark
}

enum CompletionStatus {
  SUBMITTED             // Submitted by student/parent
  VERIFIED              // Verified by teacher
  NEEDS_REVIEW          // Flagged for teacher review
  INCOMPLETE            // Needs more work
  EXEMPLARY             // Outstanding work
  ARCHIVED              // Archived/historical record
}
```

#### **ReadingLogEntry** - Detailed reading logs with parent feedback and book progress tracking
```prisma
model ReadingLogEntry {
  id                    String       @id @default(cuid())
  schoolId              String       // Tenant isolation
  homeworkCompletionId  String       // Links to main homework completion
  studentId             String       // For easier querying
  
  // Reading Session Details
  sessionDate           Date         // When the reading happened
  startTime             DateTime?    // When reading session started
  endTime               DateTime?    // When reading session ended
  totalMinutes          Int          // How long they read
  
  // Book Information
  bookTitle             String       // "The BFG", "Diary of a Wimpy Kid"
  bookAuthor            String?      // "Roald Dahl"
  bookSeries            String?      // "Diary of a Wimpy Kid Series"
  bookLevel             String?      // "ORT Stage 7", "AR Level 4.2"
  bookGenre             String?      // "Fiction", "Non-fiction", "Poetry"
  
  // Reading Progress
  startPage             String?      // "Chapter 3" or "Page 45"
  endPage               String?      // "Chapter 4" or "Page 62"
  pagesRead             String?      // "Pages 45-62" or "Chapter 3-4"
  totalPagesInBook      Int?         // Total pages in the book
  percentageComplete    Int?         // How much of book completed (0-100)
  isBookFinished        Boolean      @default(false)
  
  // Reading Assessment
  readingType           ReadingType  @default(INDEPENDENT)
  difficultyLevel       DifficultyLevel @default(JUST_RIGHT)
  enjoymentRating       Int?         // 1-5 stars
  comprehensionLevel    ComprehensionLevel? // How well they understood
  
  // Support & Help
  needsHelp             Boolean      @default(false)
  helpWith              String[]     // ["vocabulary", "pronunciation", "comprehension"]
  whoHelped             String?      // "Mum helped with difficult words"
  supportProvided       String?      // Description of help given
  
  // Comments & Observations
  studentComment        String?      // Student's thoughts about the book
  parentComment         String?      // Parent observations
  teacherComment        String?      // Teacher feedback
  keyVocabulary         String[]     // New words learned
  discussionPoints      String[]     // What was discussed
  
  // Quality & Engagement
  readingFluency        Int?         // 1-5 scale (teacher assessment)
  readingExpression     Int?         // 1-5 scale (reading with expression)
  engagementLevel       Int?         // 1-5 scale (how engaged they were)
  
  // Logged Information
  loggedBy              String       // userId who created this entry
  loggedByType          LoggedByType // PARENT, TEACHER, STUDENT
  loggedAt              DateTime     @default(now())
  
  // Relationships
  school                School       @relation(fields: [schoolId], references: [id])
  homeworkCompletion    HomeworkCompletion @relation(fields: [homeworkCompletionId], references: [id])
  student               Student      @relation(fields: [studentId], references: [id])
  
  @@index([schoolId])
  @@index([studentId, sessionDate])
  @@index([homeworkCompletionId])
  @@index([loggedByType, sessionDate])
  @@map("reading_log_entries")
}

enum ReadingType {
  INDEPENDENT           // Reading alone
  SHARED               // Reading with adult support
  GUIDED               // Teacher-guided reading
  PAIRED               // Reading with another child
  LISTENING            // Being read to (audiobook/adult)
}

enum DifficultyLevel {
  TOO_EASY             // Book was too simple
  JUST_RIGHT           // Perfect difficulty level
  CHALLENGING          // Difficult but manageable
  TOO_HARD             // Book was too difficult
  UNKNOWN              // Difficulty not assessed
}

enum ComprehensionLevel {
  EXCELLENT            // Understood everything, made inferences
  GOOD                 // Understood main ideas and some details
  SATISFACTORY         // Understood basic story/information
  NEEDS_SUPPORT        // Struggled with comprehension
  NOT_ASSESSED         // Comprehension not evaluated
}
```

#### **StreakPause** - Retrospective streak adjustments for illness and emergencies
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
  approvedBy            String?      // If approval workflow needed
  approvedAt            DateTime?
  isActive              Boolean      @default(true)
  
  // Evidence & Documentation
  evidenceProvided      Boolean      @default(false)
  evidenceDescription   String?      // "Medical certificate provided"
  evidenceUrl           String?      // S3 URL if documentation uploaded
  
  // Relationships
  school                School       @relation(fields: [schoolId], references: [id])
  student               Student      @relation(fields: [studentId], references: [id])
  club                  Club?        @relation(fields: [clubId], references: [id])
  
  @@unique([studentId, clubId, pauseDate])
  @@index([schoolId])
  @@index([studentId, pauseDate])
  @@index([clubId, pauseDate])
  @@map("streak_pauses")
}

enum PauseReason {
  ILLNESS               // Student was ill
  MEDICAL_APPOINTMENT   // Medical/dental appointment
  FAMILY_EMERGENCY      // Family emergency or bereavement
  SCHOOL_TRIP           // Educational visit during homework time
  TECHNICAL_ISSUES      // Platform/technical problems
  ADMIN_ERROR           // Administrative error correction
  EXCEPTIONAL_CIRCUMSTANCES // Other valid circumstances
}

enum PauseType {
  ILLNESS               // Medical reasons
  ADMINISTRATIVE        // Admin corrections
  TECHNICAL             // Platform issues
  EDUCATIONAL           // School-related absences
  EXCEPTIONAL           // Unusual circumstances
}
```

### Example Data
```json
{
  "homeworkCompletion": {
    "id": "completion_emma_number_20250120",
    "schoolId": "clr8k3m5x0001t6y8z9q4w2e1",
    "studentId": "student_emma_johnson",
    "clubId": "club_weobley_number",
    "completedDate": "2025-01-20",
    "loggedByType": "PARENT",
    "evidenceType": "PHOTO_EVIDENCE",
    "photoUrls": [
      "https://studystreaks-media.s3.eu-west-2.amazonaws.com/weobley/completions/2025/01/20/emma_number_bonds.jpg"
    ],
    "xpEarned": 12,
    "lpEarned": 12,
    "status": "VERIFIED"
  },
  "readingLogEntry": {
    "id": "reading_james_bfg_20250120",
    "homeworkCompletionId": "completion_james_reading_20250120",
    "sessionDate": "2025-01-20",
    "totalMinutes": 25,
    "bookTitle": "The BFG",
    "bookAuthor": "Roald Dahl",
    "pagesRead": "Pages 45-62",
    "readingType": "SHARED",
    "difficultyLevel": "JUST_RIGHT",
    "enjoymentRating": 5,
    "parentComment": "James read with great expression and asked lots of questions"
  }
}
```

### Relationships
- **Homework → Evidence**: HomeworkCompletion → ReadingLogEntry (one-to-many)
- **Student Activity**: Students → HomeworkCompletion (one-to-many)
- **Club Progress**: Clubs → HomeworkCompletion (tracking by subject)
- **Streak Integration**: HomeworkCompletion → DailyStreakRecord (streak calculation)

### Key Features
- **Evidence-Based Learning**: Photo uploads, detailed reading logs, teacher verification
- **Parent Involvement**: Parents can log homework and provide rich feedback
- **Retrospective Fairness**: Teachers can add streak pauses for illness/emergencies
- **Multi-Modal Assessment**: Different evidence types for different club types

---