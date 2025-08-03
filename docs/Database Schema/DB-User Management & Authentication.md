## 3. User Management & Authentication

### Tables

#### **User** - Base authentication table linking to specific user type profiles
```prisma
model User {
  id                    String       @id @default(cuid())
  schoolId              String       // Tenant isolation
  
  // Authentication
  email                 String       @unique
  emailVerified         DateTime?
  passwordHash          String?      // For local auth
  
  // Account Status
  isActive              Boolean      @default(true)
  lastLoginAt           DateTime?
  loginAttempts         Int          @default(0)
  lockedUntil           DateTime?
  
  // User Type Links (one-to-one relationships)
  teacher               Teacher?
  student               Student?
  parent                Parent?
  schoolAdmin           SchoolAdmin?
  
  // RBAC
  userRoles             UserRole[]
  
  // Audit
  createdAt             DateTime     @default(now())
  updatedAt             DateTime     @updatedAt
  
  // Relationships
  school                School       @relation(fields: [schoolId], references: [id])
  
  @@index([schoolId])
  @@index([email])
  @@index([schoolId, isActive])
  @@map("users")
}
```

#### **Teacher** - Professional staff records with DBS checks and teaching qualifications
```prisma
model Teacher {
  id                    String       @id @default(cuid())
  schoolId              String       // Tenant isolation
  userId                String       @unique
  
  // Professional Identity
  employeeId            String?      // School's internal employee ID
  title                 String       // "Mr", "Mrs", "Miss", "Dr"
  firstName             String
  lastName              String
  displayName           String?      // "Mr. Smith", "Mrs. Jones"
  
  // Role & Permissions
  teacherType           TeacherType  @default(CLASS_TEACHER)
  isHeadTeacher         Boolean      @default(false)
  isSenCo               Boolean      @default(false) // Special Educational Needs Coordinator
  isDSL                 Boolean      @default(false) // Designated Safeguarding Lead
  isDeputyHead          Boolean      @default(false)
  
  // Teaching Details
  subjects              String[]     // ["Mathematics", "Science", "English"]
  yearGroups            Int[]        // [3, 4, 5] - which year groups they teach
  qualifications        Json?        // Teaching qualifications and training
  
  // Employment
  startDate             DateTime     // When they started at school
  endDate               DateTime?    // If they've left
  contractType          ContractType @default(PERMANENT)
  
  // Contact (Professional)
  schoolEmail           String?      // Professional email
  phoneExtension        String?      // School phone extension
  
  // Safeguarding & Compliance
  dbsCheckDate          DateTime?    // DBS (background check) date
  dbsCheckNumber        String?      // DBS certificate number
  safeguardingTraining  DateTime?    // Last safeguarding training
  
  // Class Management
  teacherClasses        TeacherClass[] // Many-to-many with classes
  
  // RBAC
  userRoles             UserRole[]
  
  // Audit
  createdAt             DateTime     @default(now())
  updatedAt             DateTime     @updatedAt
  
  // Relationships
  school                School       @relation(fields: [schoolId], references: [id])
  user                  User         @relation(fields: [userId], references: [id])
  
  @@index([schoolId])
  @@index([schoolId, teacherType])
  @@map("teachers")
}

enum TeacherType {
  HEAD_TEACHER          // Head teacher
  DEPUTY_HEAD           // Deputy head teacher
  ASSISTANT_HEAD        // Assistant head teacher
  CLASS_TEACHER         // Main class teacher
  SUBJECT_SPECIALIST    // Secondary subject teacher
  TEACHING_ASSISTANT    // Teaching assistant
  HIGHER_LEVEL_TA       // Higher Level Teaching Assistant
  SEN_COORDINATOR       // Special Educational Needs Coordinator
  SUPPLY_TEACHER        // Cover/supply teacher
  TRAINEE_TEACHER       // Student teacher/trainee
}

enum ContractType {
  PERMANENT             // Permanent contract
  TEMPORARY             // Fixed-term contract
  SUPPLY                // Supply/cover teacher
  TRAINEE               // Trainee teacher
  VOLUNTEER             // Volunteer helper
}
```

#### **Student** - GDPR-compliant pupil records with consent tracking and data retention
```prisma
model Student {
  id                    String       @id @default(cuid())
  schoolId              String       // Tenant isolation
  userId                String?      @unique // Optional - only for older students
  
  // Core Identity (GDPR Minimal)
  firstName             String
  lastName              String
  preferredName         String?      // What they like to be called
  dateOfBirth           DateTime
  
  // School Identity
  pupilId               String       // School's internal student ID
  admissionNumber       String?      // Unique admission number
  yearGroup             Int          // Current year group
  classId               String       // Current main class
  
  // Educational Details
  admissionDate         DateTime     // When they started at school
  leavingDate           DateTime?    // When they left (if applicable)
  uln                   String?      // Unique Learner Number (UK)
  upn                   String?      // Unique Pupil Number (UK)
  
  // Special Educational Needs
  sen                   Boolean      @default(false)
  senCategory           String?      // Type of SEN support needed
  senSupport            Json?        // Details of SEN support
  
  // Additional Information
  pupilPremium          Boolean      @default(false) // Pupil Premium eligibility
  freeschoolMeals       Boolean      @default(false) // FSM eligibility
  englishAsAdditional   Boolean      @default(false) // EAL student
  
  // Medical & Dietary (Essential Only)
  medicalConditions     Json?        // Essential medical information
  dietaryRequirements   Json?        // Allergies, dietary needs
  
  // Academic Progress & Clubs
  houseGroup            String?      // School house (Red, Blue, etc.)
  clubProgress          StudentClubProgress[] // Progress through club levels
  
  // Parent Relationships
  parentStudents        ParentStudent[] // Links to parents/guardians
  
  // GDPR Compliance (Critical)
  dataRetentionUntil    DateTime     // When to delete data (7 years post-leaving)
  consentGiven          Boolean      @default(false) // Parental consent given
  consentGivenBy        String?      // Which parent gave consent
  consentDate           DateTime?    // When consent was given
  consentWithdrawn      Boolean      @default(false) // Consent withdrawn
  
  // All Student Relationships
  homeworkCompletions   HomeworkCompletion[]
  readingLogEntries     ReadingLogEntry[]
  streakPauses          StreakPause[]
  streaks               StudentStreak[]
  dailyStreakRecords    DailyStreakRecord[]
  buddyGroupMembers     BuddyGroupMember[]
  sentInvitations       BuddyGroupInvitation[] @relation("SentInvitations")
  receivedInvitations   BuddyGroupInvitation[] @relation("ReceivedInvitations")
  streakGoals           StreakGoal[]
  streakGoalProgress    StreakGoalProgress[]
  learningPointsBalances LearningPointsBalance[]
  learningPointsTransactions LearningPointsTransaction[]
  weeklyLPSnapshots     WeeklyLearningPointsSnapshot[]
  studentClubLevels     StudentClubLevel[]
  fuelTransactions      FuelTransaction[]
  studentFuelBalances   StudentFuelBalance[]
  studentAchievements   StudentAchievement[]
  studentStickers       StudentSticker[]
  prizeWinners          PrizeWinner[]
  drawEligibility       DrawEligibility[]
  
  // Audit
  createdAt             DateTime     @default(now())
  updatedAt             DateTime     @updatedAt
  
  // Relationships
  school                School       @relation(fields: [schoolId], references: [id])
  user                  User?        @relation(fields: [userId], references: [id])
  class                 Class        @relation(fields: [classId], references: [id])
  
  @@index([schoolId])
  @@index([schoolId, yearGroup])
  @@index([schoolId, classId])
  @@index([pupilId])
  @@index([dataRetentionUntil])
  @@map("students")
}
```

#### **Parent** - Guardian contact details with communication preferences and consent management
```prisma
model Parent {
  id                    String       @id @default(cuid())
  schoolId              String       // Tenant isolation
  userId                String       @unique
  
  // Identity
  title                 String?      // "Mr", "Mrs", "Ms", "Dr"
  firstName             String
  lastName              String
  
  // Contact Information
  email                 String       // Primary email
  alternativeEmail      String?      // Secondary email
  mobilePhone           String?      // Mobile number
  homePhone             String?      // Home number
  workPhone             String?      // Work number
  
  // Address
  addressLine1          String?
  addressLine2          String?
  town                  String?
  county                String?
  postcode              String?
  
  // Emergency Contact Status
  isEmergencyContact    Boolean      @default(true)
  priority              Int?         // 1 = primary contact, 2 = secondary
  
  // Communication Preferences
  preferredContact      ContactMethod @default(EMAIL)
  canReceiveSMS         Boolean      @default(true)
  canReceiveEmail       Boolean      @default(true)
  canReceivePhoneCalls  Boolean      @default(true)
  
  // School Involvement
  canCollectChild       Boolean      @default(true)
  canConsentToTrips     Boolean      @default(true)
  canAccessOnlineInfo   Boolean      @default(true)
  
  // Children Relationships
  parentStudents        ParentStudent[] // Links to children
  
  // RBAC
  userRoles             UserRole[]
  
  // Audit
  createdAt             DateTime     @default(now())
  updatedAt             DateTime     @updatedAt
  
  // Relationships
  school                School       @relation(fields: [schoolId], references: [id])
  user                  User         @relation(fields: [userId], references: [id])
  
  @@index([schoolId])
  @@index([email])
  @@map("parents")
}

enum ContactMethod {
  EMAIL                 // Prefer email contact
  SMS                   // Prefer text messages
  PHONE                 // Prefer phone calls
  APP_NOTIFICATION      // Prefer app notifications
}
```

#### **SchoolAdmin** - Administrative staff with system management permissions
```prisma
model SchoolAdmin {
  id                    String       @id @default(cuid())
  schoolId              String       // Tenant isolation
  userId                String       @unique
  
  // Identity
  firstName             String
  lastName              String
  jobTitle              String       // "Head Teacher", "Deputy Head", "School Business Manager"
  
  // Administrative Level
  adminLevel            AdminLevel   @default(SCHOOL_ADMIN)
  
  // Permissions
  canManageUsers        Boolean      @default(false)
  canManageClasses      Boolean      @default(false)
  canManageClubs        Boolean      @default(false)
  canViewAnalytics      Boolean      @default(true)
  canManageSettings     Boolean      @default(false)
  canExportData         Boolean      @default(false)
  
  // System Access
  canAccessAllClasses   Boolean      @default(false)
  canViewAllStudents    Boolean      @default(false)
  canModifyHomework     Boolean      @default(false)
  
  // RBAC
  userRoles             UserRole[]
  
  // Audit
  createdAt             DateTime     @default(now())
  updatedAt             DateTime     @updatedAt
  
  // Relationships
  school                School       @relation(fields: [schoolId], references: [id])
  user                  User         @relation(fields: [userId], references: [id])
  
  @@index([schoolId])
  @@index([adminLevel])
  @@map("school_admins")
}

enum AdminLevel {
  SUPER_ADMIN           // Platform super admin (across schools)
  SCHOOL_ADMIN          // Full school administration
  OFFICE_ADMIN          // Administrative tasks only
  DATA_MANAGER          // Data and reporting focus
  SYSTEM_ADMIN          // Platform configuration
  CLUB_ADMIN            // Club and homework management
}
```

#### **ParentStudent** - Complex family relationships including step-parents and custody arrangements
```prisma
model ParentStudent {
  id                    String       @id @default(cuid())
  schoolId              String       // Tenant isolation
  parentId              String
  studentId             String
  
  // Relationship Details
  relationshipType      ParentType
  isPrimaryContact      Boolean      @default(false)
  isEmergencyContact    Boolean      @default(true)
  
  // Legal & Consent
  hasParentalResponsibility Boolean  @default(true)
  canGiveConsent        Boolean      @default(true)
  canCollectChild       Boolean      @default(true)
  canAccessRecords      Boolean      @default(true)
  
  // Communication
  receivesReports       Boolean      @default(true)
  receivesNotifications Boolean      @default(true)
  canContactTeachers    Boolean      @default(true)
  
  // Custody & Access (if relevant)
  custodyArrangement    String?      // Notes about custody
  restrictedAccess      Boolean      @default(false)
  accessNotes           String?      // Court orders, restrictions etc.
  
  // Audit
  createdAt             DateTime     @default(now())
  updatedAt             DateTime     @updatedAt
  
  // Relationships
  school                School       @relation(fields: [schoolId], references: [id])
  parent                Parent       @relation(fields: [parentId], references: [id])
  student               Student      @relation(fields: [studentId], references: [id])
  
  @@unique([parentId, studentId])
  @@index([schoolId])
  @@index([studentId])
  @@index([parentId])
  @@map("parent_students")
}

enum ParentType {
  MOTHER                // Biological mother
  FATHER                // Biological father
  STEP_MOTHER           // Step mother
  STEP_FATHER           // Step father
  GUARDIAN              // Legal guardian
  CARER                 // Foster carer
  GRANDPARENT           // Grandparent
  AUNT_UNCLE            // Aunt or uncle
  SIBLING               // Older sibling
  OTHER                 // Other relationship
}
```

#### **TeacherClass** - Teaching assignments with roles and subject responsibilities
```prisma
model TeacherClass {
  id                    String       @id @default(cuid())
  schoolId              String       // Tenant isolation
  teacherId             String
  classId               String
  
  // Teaching Role
  role                  ClassRole    @default(CLASS_TEACHER)
  isPrimaryTeacher      Boolean      @default(false)
  
  // Subject & Time Allocation
  subjects              String[]     // ["Mathematics", "English"]
  timeAllocation        Int?         // Percentage of time with this class
  
  // Scheduling
  timetableSlots        Json?        // When they teach this class
  
  // Permissions for this class
  canMarkHomework       Boolean      @default(true)
  canAssignClubs        Boolean      @default(true)
  canViewProgress       Boolean      @default(true)
  canContactParents     Boolean      @default(true)
  
  // Temporal Assignment
  startDate             DateTime     @default(now())
  endDate               DateTime?    // When assignment ends
  isActive              Boolean      @default(true)
  
  // Audit
  createdAt             DateTime     @default(now())
  updatedAt             DateTime     @updatedAt
  
  // Relationships
  school                School       @relation(fields: [schoolId], references: [id])
  teacher               Teacher      @relation(fields: [teacherId], references: [id])
  class                 Class        @relation(fields: [classId], references: [id])
  
  @@unique([teacherId, classId, role])
  @@index([schoolId])
  @@index([classId, isActive])
  @@index([teacherId, isActive])
  @@map("teacher_classes")
}

enum ClassRole {
  CLASS_TEACHER         // Main class teacher
  ASSISTANT_TEACHER     // Teaching assistant
  SUBJECT_SPECIALIST    // Specialist teacher (e.g., PE, Music)
  SUPPORT_TEACHER       // SEN support teacher
  STUDENT_TEACHER       // Trainee/student teacher
  COVER_TEACHER         // Supply/cover teacher
  VOLUNTEER             // Volunteer helper
}
```

### Example Data
```json
{
  "teacher": {
    "id": "teacher_emma_williams",
    "schoolId": "clr8k3m5x0001t6y8z9q4w2e1",
    "firstName": "Emma",
    "lastName": "Williams",
    "teacherType": "CLASS_TEACHER",
    "isSenCo": true,
    "subjects": ["English", "Reading", "Phonics"],
    "dbsCheckDate": "2024-01-20T00:00:00.000Z"
  },
  "student": {
    "id": "student_emma_johnson",
    "schoolId": "clr8k3m5x0001t6y8z9q4w2e1",
    "firstName": "Emma",
    "lastName": "Johnson",
    "yearGroup": 4,
    "consentGiven": true,
    "dataRetentionUntil": "2032-07-31T00:00:00.000Z"
  },
  "parent": {
    "id": "parent_sarah_johnson",
    "schoolId": "clr8k3m5x0001t6y8z9q4w2e1",
    "firstName": "Sarah",
    "lastName": "Johnson",
    "email": "sarah.johnson@gmail.com",
    "preferredContact": "EMAIL"
  }
}
```

### Relationships
- **User → Profiles**: One-to-one relationships to Teacher, Student, Parent, SchoolAdmin
- **Family Connections**: Parents ↔ Students via ParentStudent junction table
- **Teaching Assignments**: Teachers ↔ Classes via TeacherClass junction table
- **Tenant Isolation**: All users connected to School via `schoolId`

### Key Features
- **UK Educational Roles**: Support for complex teaching hierarchies and responsibilities
- **GDPR Compliance**: Data retention, consent tracking, right to erasure
- **Family Complexity**: Handles step-parents, guardians, custody arrangements
- **Professional Standards**: DBS checks, safeguarding training tracking

---