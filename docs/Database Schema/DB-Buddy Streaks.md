## 7. Buddy Streaks

### Tables

---
#### **Buddy Group - Group Management**
```prisma
model BuddyGroup {
  id                    String       @id @default(cuid())
  schoolId              String       // Tenant isolation
  
  // Group Identity
  groupName             String?      // Optional name
  groupType             BuddyGroupType
  createdBy             String       // Teacher or Student ID
  creatorRole           CreatorRole  // TEACHER or STUDENT
  
  // Group Status
  status                GroupStatus  @default(PENDING)
  isActive              Boolean      @default(true)
  isMandatory           Boolean      @default(false) // Teacher-created = true
  
  // Streak Tracking
  currentBuddyStreak    Int          @default(0)
  longestBuddyStreak    Int          @default(0)
  lastStreakDate        Date?        // Last successful group streak day
  streakStatus          BuddyStreakStatus @default(ACTIVE)
  
  // Administrative
  createdAt             DateTime     @default(now())
  updatedAt             DateTime     @updatedAt
  
  // Relationships
  school                School       @relation(fields: [schoolId], references: [id])
  members               BuddyGroupMember[]
  dailyRecords          BuddyGroupDailyRecord[]
  invitations           BuddyGroupInvitation[]
  
  @@index([schoolId])
  @@index([createdBy, creatorRole])
  @@index([status, isActive])
}

enum BuddyGroupType {
  TEACHER_CREATED       // Mandatory group created by teacher
  STUDENT_CREATED       // Consensus-driven student group
  MIXED                 // Started by student, approved by teacher
}

enum CreatorRole {
  TEACHER
  STUDENT
}

enum GroupStatus {
  PENDING               // Waiting for all members to accept
  ACTIVE                // All members accepted, group active
  INACTIVE              // Group paused/disabled
  DISSOLVED             // Group permanently ended
}

enum BuddyStreakStatus {
  ACTIVE                // Currently building buddy streak
  PAUSED                // Paused (some members didn't earn streak)
  FROZEN                // Admin/teacher frozen
}
```

#### **BuddyGroupMember - Membership Management**
```prisma
model BuddyGroupMember {
  id                    String       @id @default(cuid())
  schoolId              String       // Tenant isolation
  buddyGroupId          String
  studentId             String
  
  // Membership Status
  membershipStatus      MembershipStatus @default(INVITED)
  joinedAt              DateTime?    // When they accepted/joined
  invitedAt             DateTime     @default(now())
  leftAt                DateTime?    // When they left
  
  // Member Role
  role                  MemberRole   @default(MEMBER)
  canInviteOthers       Boolean      @default(false)
  canRemoveMembers      Boolean      @default(false)
  
  // Performance Tracking
  streakContributions   Int          @default(0) // Days they contributed to group streak
  missedDays            Int          @default(0) // Days they missed
  
  // Relationships
  school                School       @relation(fields: [schoolId], references: [id])
  buddyGroup            BuddyGroup   @relation(fields: [buddyGroupId], references: [id])
  student               Student      @relation(fields: [studentId], references: [id])
  
  @@unique([buddyGroupId, studentId]) // One membership per student per group
  @@index([schoolId])
  @@index([studentId, membershipStatus])
}

enum MembershipStatus {
  INVITED               // Invited but not yet responded
  ACCEPTED              // Accepted invitation, active member
  DECLINED              // Declined invitation
  LEFT                  // Was member but left voluntarily
  REMOVED               // Removed by admin/teacher
}

enum MemberRole {
  CREATOR               // Student who created the group
  CO_LEADER             // Can manage group (teacher-assigned)
  MEMBER                // Regular member
  OBSERVER              // Can see but limited participation
}
```

#### **BuddyGroupInvitation - Consensus Management**
```prisma
model BuddyGroupInvitation {
  id                    String       @id @default(cuid())
  schoolId              String       // Tenant isolation
  buddyGroupId          String
  inviterId             String       // Student who sent invitation
  inviteeId             String       // Student being invited
  
  // Invitation Status
  status                InvitationStatus @default(PENDING)
  sentAt                DateTime     @default(now())
  respondedAt           DateTime?
  expiresAt             DateTime?    // Optional expiry
  
  // Invitation Details
  personalMessage       String?      // Optional message from inviter
  autoAccept            Boolean      @default(false) // For teacher-created mandatory groups
  
  // Response
  responseMessage       String?      // Optional response from invitee
  
  // Relationships
  school                School       @relation(fields: [schoolId], references: [id])
  buddyGroup            BuddyGroup   @relation(fields: [buddyGroupId], references: [id])
  inviter               Student      @relation("SentInvitations", fields: [inviterId], references: [id])
  invitee               Student      @relation("ReceivedInvitations", fields: [inviteeId], references: [id])
  
  @@unique([buddyGroupId, inviteeId]) // One invitation per student per group
  @@index([schoolId])
  @@index([inviteeId, status])
}

enum InvitationStatus {
  PENDING               // Waiting for response
  ACCEPTED              // Invitation accepted
  DECLINED              // Invitation declined
  EXPIRED               // Invitation expired
  CANCELLED             // Cancelled by inviter or admin
}
```

#### **BuddyGroupDailyRecord - Historical Buddy Streak Tracking**
```prisma
model BuddyGroupDailyRecord {
  id                    String       @id @default(cuid())
  schoolId              String       // Tenant isolation
  buddyGroupId          String
  
  // Date Information
  recordDate            Date
  isSchoolDay           Boolean
  academicWeek          Int
  academicMonth         Int
  academicTerm          String
  academicYear          String
  
  // Group Performance
  totalActiveMembers    Int          // Active members on this date
  membersWithStreak     Int          // Members who earned individual streak
  allMembersEarnedStreak Boolean     @default(false) // Did ALL members earn streak?
  
  // Buddy Streak Status
  buddyStreakEarned     Boolean      @default(false) // Did group earn buddy streak?
  buddyStreakCount      Int          @default(0)     // Cumulative buddy streak count
  streakStatus          BuddyStreakStatus @default(ACTIVE)
  
  // Member Details
  memberDetails         Json         // Which members earned/missed streaks
  
  // Relationships
  school                School       @relation(fields: [schoolId], references: [id])
  buddyGroup            BuddyGroup   @relation(fields: [buddyGroupId], references: [id])
  
  @@unique([buddyGroupId, recordDate]) // One record per group per date
  @@index([schoolId])
  @@index([recordDate, isSchoolDay])
  @@index([academicWeek, academicYear])
}
```

### Relationships

- **BuddyGroup** (1) → Many (BuddyGroupMember) [group membership]
- **BuddyGroup** (1) → Many (BuddyGroupInvitation) [consensus invitations]
- **BuddyGroup** (1) → Many (BuddyGroupDailyRecord) [daily buddy streak tracking]
- **Student** (1) → Many (BuddyGroupMember) [can be in multiple groups]
- **Student** (1) → Many (BuddyGroupInvitation) [sent and received invitations]
- **StudentStreak** (overall) → BuddyGroupDailyRecord [individual streak feeds into buddy streak]

### Key Logic

1. **Teacher-Created Groups**: `isMandatory = true`, invitations auto-accept
2. **Student-Created Groups**: Require consensus through `BuddyGroupInvitation` acceptance
3. **Multiple Memberships**: Students can be in many groups via multiple `BuddyGroupMember` records
4. **Buddy Streak Earning**: ALL members must have earned their individual Student Streak (clubId = NULL) that day
5. **No Resets**: `BuddyGroupDailyRecord` tracks accumulation and pauses only

### Buddy System Relationships

- Clubs (1) → Many (BuddyRelationship) [if maxBuddyMembers > 0]
- BuddyRelationship (1) → Many (BuddyGroupMember)
- BuddyRelationship (1) → Many (BuddyGroupStreak) [daily tracking]
- BuddyGroupMember ↔ BuddyGroupMember (BuddyNudge) [peer nudging]
