## 1. Multi-Tenancy & School Management

### Tables

#### **School** - Multi-tenant root with UK government data integration
```prisma
model School {
  id                    String       @id @default(cuid())
  
  // Core Identity
  name                  String       // Official establishment name from GIAS
  givenName             String       @unique  // School-chosen subdomain name
  slug                  String       @unique  // URL-safe version of givenName
  
  // Government Identifiers (from GIAS lookup)
  urn                   String       @unique  // Unique Reference Number
  dfeNumber             String       @unique  // DfE establishment number
  ukprn                 String?      @unique  // UK Provider Reference Number
  
  // Educational Classification
  schoolType            SchoolType   // PRIMARY, SECONDARY, etc.
  establishmentType     String       // "Community school", "Academy", etc.
  phase                 String       // "Primary", "Secondary", etc.
  keyStages             KeyStage[]   // [EYFS, KS1, KS2] etc.
  ageRange              String       // "2 to 11"
  yearGroups            Int[]        // [0,1,2,3,4,5,6] derived from ageRange
  
  // Location (from GIAS)
  addressLine1          String
  addressLine2          String?
  town                  String
  county                String
  postcode              String
  localAuthority        String
  localAuthorityCode    String
  
  // Platform Configuration
  status                SchoolStatus @default(TRIAL)
  timezone              String       @default("Europe/London")
  academicYear          String?      // "2024-2025"
  
  // GDPR & Compliance
  dataRetentionYears    Int          @default(7)
  gdprContactEmail      String?
  privacyPolicyUrl      String?
  consentWorkflow       ConsentType  @default(PARENTAL)
  
  // Branding & Features
  logoUrl               String?
  primaryColor          String       @default("#3B82F6")
  secondaryColor        String       @default("#10B981")
  featuresEnabled       Json?
  
  // All Relationships
  classes               Class[]
  clubs                 Club[]
  clubLevels            ClubLevel[]
  users                 User[]
  teachers              Teacher[]
  students              Student[]
  parents               Parent[]
  schoolAdmins          SchoolAdmin[]
  parentStudents        ParentStudent[]
  teacherClasses        TeacherClass[]
  roles                 Role[]
  userRoles             UserRole[]
  homeworkCompletions   HomeworkCompletion[]
  readingLogEntries     ReadingLogEntry[]
  streakPauses          StreakPause[]
  streaks               StudentStreak[]
  dailyStreakRecords    DailyStreakRecord[]
  buddyGroups           BuddyGroup[]
  buddyGroupMembers     BuddyGroupMember[]
  buddyGroupDailyRecords BuddyGroupDailyRecord[]
  buddyGroupInvitations BuddyGroupInvitation[]
  streakGoals           StreakGoal[]
  streakGoalProgress    StreakGoalProgress[]
  learningPointsBalances LearningPointsBalance[]
  learningPointsTransactions LearningPointsTransaction[]
  weeklyLPSnapshots     WeeklyLearningPointsSnapshot[]
  studentClubLevels     StudentClubLevel[]
  clubLevelValues       ClubLevelValue[]
  fuelTransactions      FuelTransaction[]
  studentFuelBalances   StudentFuelBalance[]
  achievements          Achievement[]
  studentAchievements   StudentAchievement[]
  achievementTriggers   AchievementTrigger[]
  stickers              Sticker[]
  studentStickers       StudentSticker[]
  stickerTriggers       StickerTrigger[]
  prizes                Prize[]
  prizeDraws            PrizeDraw[]
  prizeWinners          PrizeWinner[]
  eligibilityCriteria   EligibilityCriteria[]
  drawEligibility       DrawEligibility[]
  
  @@index([urn])
  @@index([status])
  @@map("schools")
}

enum SchoolType {
  PRIMARY     // Ages 4-11, Years R-6
  SECONDARY   // Ages 11-16, Years 7-11  
  SPECIAL     // Special educational needs schools
  NURSERY     // Ages 3-5, Nursery/Reception only
  THROUGH     // All-through: Primary + Secondary combined
}

enum SchoolStatus {
  TRIAL       // Trial period
  ACTIVE      // Active paid subscription
  SUSPENDED   // Temporarily suspended
  ARCHIVED    // Closed/archived school
}

enum KeyStage {
  EYFS        // Early Years Foundation Stage
  KS1         // Key Stage 1 (Years 1-2)
  KS2         // Key Stage 2 (Years 3-6)
  KS3         // Key Stage 3 (Years 7-9)
  KS4         // Key Stage 4 (Years 10-11)
  KS5         // Key Stage 5 (Years 12-13)
}

enum ConsentType {
  PARENTAL    // Under 13s - parent consent required
  STUDENT     // 13+ can consent themselves
  MIXED       // Some of each
}
```

### Example Data
```json
{
  "id": "clr8k3m5x0001t6y8z9q4w2e1",
  "name": "Weobley Primary School",
  "givenName": "weobley",
  "slug": "weobley",
  "urn": "116746",
  "dfeNumber": "884/2158",
  "ukprn": "10070797",
  "schoolType": "PRIMARY",
  "establishmentType": "Community school",
  "phase": "Primary",
  "keyStages": ["EYFS", "KS1", "KS2"],
  "yearGroups": [0, 1, 2, 3, 4, 5, 6],
  "addressLine1": "Burton Wood",
  "town": "Weobley",
  "county": "Herefordshire",
  "postcode": "HR4 8ST",
  "localAuthority": "Herefordshire, County of",
  "status": "TRIAL",
  "dataRetentionYears": 7,
  "consentWorkflow": "PARENTAL"
}
```

### Relationships
- **Root Tenant Entity**: All other tables connect via `schoolId` foreign key
- **Government Integration**: URN links to official GIAS database
- **One-to-Many**: School → Classes, Clubs, Users, Streaks, Achievements, Prizes

### Key Features
- **Government Data Sync**: Official URN validation with GIAS integration
- **Tenant Isolation**: Complete data separation between schools
- **UK Compliance**: Built-in GDPR and ICO Children's Code support
- **Customization**: School branding and feature configuration

---