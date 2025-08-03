## 4. Access Control (RBAC)

### Tables

#### **Role** - Flexible role definitions (Head Teacher, Class Teacher, Parent, etc.)
```prisma
model Role {
  id                    String       @id @default(cuid())
  schoolId              String?      // Tenant isolation (null for platform-wide roles)
  
  // Role Definition
  name                  String       // "Head Teacher", "Year 6 Teacher", "Parent"
  description           String?      // What this role does
  isDefault             Boolean      @default(false) // Platform default role
  isCustom              Boolean      @default(true)  // School-created custom role
  
  // Role Configuration
  isActive              Boolean      @default(true)
  priority              Int          @default(0)     // Higher priority = more permissions
  
  // Role Scope
  scope                 RoleScope    @default(SCHOOL)
  applicableUserTypes   UserType[]   // Which user types can have this role
  
  // Permissions
  permissions           RolePermission[] // Associated permissions
  userRoles             UserRole[]   // Users assigned this role
  
  // Audit
  createdBy             String?      // Who created this role
  createdAt             DateTime     @default(now())
  updatedAt             DateTime     @updatedAt
  
  // Relationships
  school                School?      @relation(fields: [schoolId], references: [id])
  
  @@index([schoolId])
  @@index([isDefault])
  @@index([scope])
  @@map("roles")
}

enum RoleScope {
  PLATFORM              // Across all schools (super admin)
  SCHOOL                 // School-wide permissions
  YEAR_GROUP             // Limited to specific year groups
  CLASS                  // Limited to specific classes
  SUBJECT                // Limited to specific subjects
  INDIVIDUAL             // Individual student/parent only
}

enum UserType {
  TEACHER
  STUDENT  
  PARENT
  SCHOOL_ADMIN
}
```

#### **Permission** - Granular permissions with risk levels and resource scope
```prisma
model Permission {
  id                    String       @id @default(cuid())
  
  // Permission Identity
  name                  String       // "read_students", "manage_homework", "view_analytics"
  description           String?      // Human-readable description
  
  // Permission Details
  resource              String       // "students", "homework", "clubs", "classes"
  action                String       // "read", "write", "delete", "manage", "assign"
  scope                 String       // "own", "class", "year_group", "school", "all"
  
  // Permission Configuration
  isDefault             Boolean      @default(true)  // Part of default permission set
  isActive              Boolean      @default(true)
  
  // Categorization
  category              PermissionCategory @default(GENERAL)
  riskLevel             RiskLevel    @default(LOW)   // How sensitive this permission is
  
  // Associated Roles
  rolePermissions       RolePermission[]
  
  // Audit
  createdAt             DateTime     @default(now())
  updatedAt             DateTime     @updatedAt
  
  @@unique([resource, action, scope])
  @@index([category])
  @@index([riskLevel])
  @@map("permissions")
}

enum PermissionCategory {
  USER_MANAGEMENT       // Creating, editing users
  ACADEMIC              // Students, classes, homework
  ADMINISTRATIVE        // School settings, reports
  COMMUNICATION         // Messaging, notifications
  DATA_ACCESS           // Viewing data, analytics
  SYSTEM                // Platform configuration
  GENERAL               // Basic permissions
}

enum RiskLevel {
  LOW                   // Basic read permissions
  MEDIUM                // Write permissions, data access
  HIGH                  // Delete, user management
  CRITICAL              // System configuration, data export
}
```

#### **RolePermission** - Assignment of specific permissions to roles
```prisma
model RolePermission {
  id                    String       @id @default(cuid())
  roleId                String
  permissionId          String
  
  // Permission Conditions
  conditions            Json?        // Additional conditions for this permission
  limitations           Json?        // Limitations on this permission
  
  // Temporal
  grantedAt             DateTime     @default(now())
  expiresAt             DateTime?    // When this permission expires
  isActive              Boolean      @default(true)
  
  // Audit
  grantedBy             String?      // Who granted this permission
  
  // Relationships
  role                  Role         @relation(fields: [roleId], references: [id])
  permission            Permission   @relation(fields: [permissionId], references: [id])
  
  @@unique([roleId, permissionId])
  @@index([roleId])
  @@index([permissionId])
  @@map("role_permissions")
}
```

#### **UserRole** - User role assignments with scope limitations (classes, year groups, students)
```prisma
model UserRole {
  id                    String       @id @default(cuid())
  schoolId              String       // Tenant isolation
  userId                String
  roleId                String
  
  // Assignment Scope (Limitations)
  classIds              String[]     // Empty = all classes user has access to
  yearGroups            Int[]        // Empty = all year groups user has access to
  subjects              String[]     // Empty = all subjects user has access to
  studentIds            String[]     // For parent roles - which children
  
  // Temporal Assignment
  assignedAt            DateTime     @default(now())
  expiresAt             DateTime?    // When this role assignment expires
  isActive              Boolean      @default(true)
  
  // Assignment Context
  assignedBy            String?      // Who assigned this role
  assignmentReason      String?      // Why this role was assigned
  
  // Override Permissions (rare use)
  additionalPermissions Json?        // Extra permissions beyond role
  restrictedPermissions Json?        // Permissions to remove from role
  
  // Audit
  createdAt             DateTime     @default(now())
  updatedAt             DateTime     @updatedAt
  
  // Relationships
  school                School       @relation(fields: [schoolId], references: [id])
  user                  User         @relation(fields: [userId], references: [id])
  role                  Role         @relation(fields: [roleId], references: [id])
  
  @@index([schoolId])
  @@index([userId, isActive])
  @@index([roleId, isActive])
  @@map("user_roles")
}
```

### Example Data
```json
{
  "role": {
    "id": "role_class_teacher",
    "schoolId": "clr8k3m5x0001t6y8z9q4w2e1",
    "name": "Class Teacher",
    "description": "Primary class teacher with access to assigned classes",
    "scope": "CLASS",
    "applicableUserTypes": ["TEACHER"]
  },
  "permission": {
    "id": "perm_manage_students",
    "name": "manage_students",
    "description": "Create, edit, and manage student records",
    "resource": "students",
    "action": "manage",
    "scope": "class",
    "category": "ACADEMIC",
    "riskLevel": "MEDIUM"
  },
  "userRole": {
    "id": "ur_emma_class_teacher",
    "schoolId": "clr8k3m5x0001t6y8z9q4w2e1",
    "userId": "user_emma_williams",
    "roleId": "role_class_teacher",
    "classIds": ["cls_weobley_year3_4_mixed"],
    "yearGroups": [3, 4]
  }
}
```

### Relationships
- **Role → Permission**: Many-to-Many via RolePermission junction
- **User → Role**: Many-to-Many via UserRole junction with scope limitations
- **Hierarchical Permissions**: Roles have priority levels for conflict resolution
- **Tenant Scoped**: Roles can be school-specific or platform-wide

### Key Features
- **Granular Control**: Resource-action-scope permission model
- **Scope Limitations**: Users can have roles limited to specific classes/students
- **Educational Context**: Permissions designed for UK school hierarchies
- **Temporal Control**: Role assignments and permissions can expire

---