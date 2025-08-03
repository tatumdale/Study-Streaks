## Prizes

### Tables

#### ** Prize - Prize Definitions**
```prisma
model Prize {
  id                    String       @id @default(cuid())
  schoolId              String       // Tenant isolation
  
  // Prize Definition
  name                  String       // "£10 Book Voucher", "Pizza Lunch with Head Teacher"
  description           String       // Detailed prize description
  prizeType             PrizeType
  prizeCategory         PrizeCategory @default(ACADEMIC)
  
  // Prize Details
  value                 String?      // "£10", "Special Experience"
  physicalPrize         Boolean      @default(true)
  totalQuantity         Int          @default(1)     // Total prizes available
  remainingQuantity     Int          // How many left
  
  // Draw Configuration
  drawType              DrawType
  maxWinners            Int          @default(1)     // Max winners per draw
  maxWinnersPerYearGroup Int?        // Fair distribution limit
  drawFrequency         DrawFrequency @default(MONTHLY)
  
  // Eligibility
  eligibilityCriteriaId String?      // Link to reusable criteria
  customCriteria        Json?        // Additional custom criteria for this prize
  
  // Prize Timing
  availableFrom         Date         // When prize becomes available
  availableUntil        Date         // When prize expires
  isActive              Boolean      @default(true)
  
  // Documentation & Social Media
  imageUrl              String?      // Prize image
  requiresDocumentation Boolean      @default(false) // Photo of winner required
  socialMediaPolicy     SocialMediaPolicy @default(PHOTOS_ALLOWED)
  announcementTemplate  String?      // Template for winner announcements
  
  // Administrative
  createdBy             String       // School admin who created
  approvedBy            String?      // Who approved the prize
  budgetCode            String?      // Budget tracking
  supplier              String?      // Where sourced from
  
  // Timestamps
  createdAt             DateTime     @default(now())
  updatedAt             DateTime     @updatedAt
  
  // Relationships
  school                School       @relation(fields: [schoolId], references: [id])
  eligibilityCriteria   EligibilityCriteria? @relation(fields: [eligibilityCriteriaId], references: [id])
  prizeDraws            PrizeDraw[]
  prizeWinners          PrizeWinner[]
  
  @@index([schoolId])
  @@index([drawType, isActive])
  @@index([drawFrequency, availableUntil])
}

enum DrawType {
  RANDOM_THANKYOU       // Random from anyone who logged homework
  LUCKY_DRAW            // Random from criteria-qualified students
}

enum PrizeType {
  PHYSICAL_ITEM         // Physical prize
  EXPERIENCE            // Experience prize
  PRIVILEGE             // Special privilege
  GIFT_VOUCHER          // Vouchers/credits
  RECOGNITION           // Public recognition
}

enum PrizeCategory {
  ACADEMIC              // Academic achievement
  PARTICIPATION         // Participation rewards
  IMPROVEMENT           // Progress recognition
  RANDOM_KINDNESS       // Random thank you gifts
}

enum DrawFrequency {
  WEEKLY                // Weekly draws
  MONTHLY               // Monthly draws
  TERMLY                // Termly draws
  CUSTOM_PERIOD         // Custom date range
}

enum SocialMediaPolicy {
  PHOTOS_ALLOWED        // Photos allowed with consent
  NO_PHOTOS             // No photos allowed
  ANONYMOUS_ONLY        // Anonymous celebration only
  SCHOOL_DISCRETION     // School decides
}
```

#### **EligibilityCriteria (NEW) - Reusable Criteria Definitions**
```prisma
model EligibilityCriteria {
  id                    String       @id @default(cuid())  
  schoolId              String       // Tenant isolation
  
  // Criteria Identity
  name                  String       // "4 Days Reading Per Week", "Active Homework Logger"
  description           String       // Human-readable description
  criteriaType          CriteriaType @default(ACTIVITY_BASED)
  
  // Student Filters
  targetYearGroups      Int[]        // [3,4,5,6] or [] for all
  targetClasses         String[]     // Class IDs or [] for all
  excludeStudentIds     String[]     // Students to exclude
  
  // Activity Requirements
  activityRequirements  Json         // Complex activity rules
  timePeriod            TimePeriod   @default(LAST_MONTH)
  customPeriodDays      Int?         // If CUSTOM_DAYS selected
  
  // Club-Specific Rules
  clubRequirements      Json?        // Club-specific requirements
  minimumClubTasks      Int?         // Minimum tasks across all clubs
  
  // Additional Filters
  minimumStreak         Int?         // Minimum streak requirement
  minimumLearningPoints Int?         // Minimum LP requirement
  goodBehaviourRequired Boolean      @default(false)
  parentConsentRequired Boolean      @default(true)
  
  // Status & Usage
  isActive              Boolean      @default(true)
  usageCount            Int          @default(0)     // How many prizes use this
  lastUsed              DateTime?    // When last used in a draw
  
  // Administrative
  createdBy             String       // Who created this criteria
  createdAt             DateTime     @default(now())
  updatedAt             DateTime     @updatedAt
  
  // Relationships
  school                School       @relation(fields: [schoolId], references: [id])
  prizes                Prize[]      // Prizes using this criteria
  drawEligibility       DrawEligibility[] // Students eligible in specific draws
  
  @@index([schoolId])
  @@index([criteriaType, isActive])
  @@map("eligibility_criteria")
}

enum CriteriaType {
  ACTIVITY_BASED        // Based on homework activity
  STREAK_BASED          // Based on streak performance
  LEARNING_BASED        // Based on learning points/progress
  COMBINED              // Multiple requirements combined
  SIMPLE_PARTICIPATION  // Just logged any homework
}

enum TimePeriod {
  LAST_WEEK             // Previous 7 days
  LAST_MONTH            // Previous 30 days
  LAST_TERM             // Current/previous term
  ACADEMIC_YEAR         // Current academic year
  CUSTOM_DAYS           // Custom number of days
}
```

#### **PrizeDraw - Draw Events**
```prisma
model PrizeDraw {
  id                    String       @id @default(cuid())
  schoolId              String       // Tenant isolation
  prizeId               String
  
  // Draw Event Details
  drawDate              Date         // When draw took place
  drawType              DrawType     // RANDOM_THANKYOU or LUCKY_DRAW
  periodStart           Date         // Start of eligibility period
  periodEnd             Date         // End of eligibility period
  conductedBy           String       // Admin who conducted draw
  
  // Eligibility Results
  totalEligibleStudents Int          // Total students who met criteria
  eligibilityBreakdown  Json         // Breakdown by year group, criteria, etc.
  criteriaUsed          String?      // Name of criteria used
  
  // Draw Configuration
  maxWinners            Int          // Maximum winners for this draw
  winnersPerYearGroup   Json?        // Year group distribution rules
  selectionMethod       SelectionMethod @default(RANDOM)
  
  // Draw Process
  randomSeed            String?      // Random seed for reproducibility
  drawAlgorithm         String       @default("secure_random") // Algorithm used
  drawWitnesses         String[]     // Staff who witnessed draw
  drawNotes             String?      // Notes about the draw process
  
  // Documentation
  drawVideoUrl          String?      // Video of draw being conducted
  eligibilityReportUrl  String?      // Report of eligible students
  
  // Verification & Approval
  isVerified            Boolean      @default(false)
  verifiedBy            String?      // Who verified fairness
  verifiedAt            DateTime?    // When verified
  
  // Results
  totalWinners          Int          @default(0)
  winnersSelected       Boolean      @default(false)
  
  // Administrative  
  createdAt             DateTime     @default(now())
  
  // Relationships
  school                School       @relation(fields: [schoolId], references: [id])
  prize                 Prize        @relation(fields: [prizeId], references: [id])
  winners               PrizeWinner[]
  eligibleStudents      DrawEligibility[] // Who was eligible
  
  @@index([schoolId])
  @@index([prizeId, drawDate])
  @@index([drawType, drawDate])
}

enum SelectionMethod {
  RANDOM                // Pure random selection
  WEIGHTED_RANDOM       // Weighted by performance
  FAIR_DISTRIBUTION     // Ensures year group spread
}
```

#### **DrawEligibility - Students Eligible for Specific Draws**
```prisma
model DrawEligibility {
  id                    String       @id @default(cuid())
  schoolId              String       // Tenant isolation
  prizeDrawId           String
  studentId             String
  criteriaId            String?      // Which criteria qualified them
  
  // Eligibility Details
  qualifiedAt           DateTime     @default(now())
  yearGroup             Int          // Student's year group at time of draw
  classId               String       // Student's class at time of draw
  
  // Qualifying Activity
  qualifyingActivity    Json         // What activity qualified them
  activityCount         Int?         // Number of activities (e.g., 4 reading days)
  qualifyingPeriod      String       // Period they qualified for
  
  // Selection Process
  wasSelected           Boolean      @default(false)
  selectionWeight       Float?       // If weighted selection used
  randomValue           Float?       // Random value assigned for selection
  
  // Relationships
  school                School       @relation(fields: [schoolId], references: [id])
  prizeDraw             PrizeDraw    @relation(fields: [prizeDrawId], references: [id])
  student               Student      @relation(fields: [studentId], references: [id])
  criteria              EligibilityCriteria? @relation(fields: [criteriaId], references: [id])
  
  @@unique([prizeDrawId, studentId]) // One eligibility record per student per draw
  @@index([schoolId])
  @@index([studentId, qualifiedAt])
}
```

#### **PrizeWinner - Prize Recipients**
```prisma
model PrizeWinner {
  id                    String       @id @default(cuid())
  schoolId              String       // Tenant isolation
  prizeId               String
  prizeDrawId           String
  studentId             String
  
  // Winner Selection Details
  wonAt                 DateTime     @default(now())
  wonDate               Date         @default(now())
  selectionRank         Int?         // Order selected (1st, 2nd winner, etc.)
  yearGroupWhenWon      Int          // Year group at time of winning
  
  // Qualification Context
  qualifyingCriteria    String?      // Criteria name that qualified them
  qualifyingActivity    Json?        // Activity that qualified them
  selectionMethod       SelectionMethod // How they were selected
  
  // Prize Delivery
  prizeDelivered        Boolean      @default(false)
  deliveredAt           DateTime?    // When prize was given
  deliveredBy           String?      // Who delivered prize
  deliveryMethod        String?      // How delivered (assembly, class, etc.)
  deliveryNotes         String?      // Notes about delivery
  
  // Documentation
  celebrationPhotoUrl   String?      // Photo with prize
  celebrationVideoUrl   String?      // Video of presentation
  parentalConsent       Boolean      @default(false) // Consent for photos
  socialMediaShared     Boolean      @default(false)
  announcementMade      Boolean      @default(false)
  
  // Winner Feedback
  thankYouMessage       String?      // Student's thank you
  enjoymentRating       Int?         // 1-5 rating
  prizeRecommendation   String?      // Would they recommend prize
  
  // Administrative
  notes                 String?      // Admin notes
  
  // Relationships
  school                School       @relation(fields: [schoolId], references: [id])
  prize                 Prize        @relation(fields: [prizeId], references: [id])
  prizeDraw             PrizeDraw    @relation(fields: [prizeDrawId], references: [id])
  student               Student      @relation(fields: [studentId], references: [id])
  
  @@index([schoolId])
  @@index([studentId, wonDate])
  @@index([prizeId, wonDate])
}
```

### Example Criteria Configuration
```json
{
  "name": "Active Reading - 4 Days Weekly",
  "description": "Students who log reading homework 4+ days per week",
  "criteriaType": "ACTIVITY_BASED",
  "targetYearGroups": [3, 4, 5, 6],
  "targetClasses": [],
  "activityRequirements": {
    "club_requirements": {
      "reading_club": {
        "minimum_days_per_week": 4,
        "minimum_weeks": 4,
        "evidence_required": "reading_log"
      }
    }
  },
  "timePeriod": "LAST_MONTH",
  "minimumStreak": null,
  "goodBehaviourRequired": true
}

```

### Relationships

- **School** (1) → Many (Prize) [available prizes]
- **School** (1) → Many (EligibilityCriteria) [reusable criteria]
- **Prize** (1) → Many (PrizeDraw) [draw events]
- **PrizeDraw** (1) → Many (DrawEligibility) [eligible students]
- **PrizeDraw** (1) → Many (PrizeWinner) [selected winners]
- **EligibilityCriteria** (1) → Many (Prize) [prizes using criteria]
- **Student** (1) → Many (DrawEligibility) [draws they were eligible for]
- **Student** (1) → Many (PrizeWinner) [prizes they won]

### Key Features

1. **Reusable Criteria**: Schools create named criteria once, use for multiple prizes
2. **Two Draw Types**: Random Thank You vs Criteria-based Lucky Draw
3. **Fair Distribution**: Year group limits prevent same students winning repeatedly
4. **Transparent Process**: Random seeds, witnesses, verification workflow
5. **Admin UI Ready**: Structured for easy admin interface to manage draws
6. **Full Audit Trail**: Complete tracking from eligibility through delivery