
Object.defineProperty(exports, "__esModule", { value: true });

const {
  Decimal,
  objectEnumValues,
  makeStrictEnum,
  Public,
  getRuntime,
  skip
} = require('./runtime/index-browser.js')


const Prisma = {}

exports.Prisma = Prisma
exports.$Enums = {}

/**
 * Prisma Client JS version: 5.22.0
 * Query Engine version: 605197351a3c8bdd595af2d2a9bc3025bca48ea2
 */
Prisma.prismaVersion = {
  client: "5.22.0",
  engine: "605197351a3c8bdd595af2d2a9bc3025bca48ea2"
}

Prisma.PrismaClientKnownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientKnownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)};
Prisma.PrismaClientUnknownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientUnknownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientRustPanicError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientRustPanicError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientInitializationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientInitializationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientValidationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientValidationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.NotFoundError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`NotFoundError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.Decimal = Decimal

/**
 * Re-export of sql-template-tag
 */
Prisma.sql = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`sqltag is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.empty = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`empty is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.join = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`join is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.raw = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`raw is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.validator = Public.validator

/**
* Extensions
*/
Prisma.getExtensionContext = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.getExtensionContext is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.defineExtension = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.defineExtension is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}

/**
 * Shorthand utilities for JSON filtering
 */
Prisma.DbNull = objectEnumValues.instances.DbNull
Prisma.JsonNull = objectEnumValues.instances.JsonNull
Prisma.AnyNull = objectEnumValues.instances.AnyNull

Prisma.NullTypes = {
  DbNull: objectEnumValues.classes.DbNull,
  JsonNull: objectEnumValues.classes.JsonNull,
  AnyNull: objectEnumValues.classes.AnyNull
}



/**
 * Enums
 */

exports.Prisma.TransactionIsolationLevel = makeStrictEnum({
  ReadUncommitted: 'ReadUncommitted',
  ReadCommitted: 'ReadCommitted',
  RepeatableRead: 'RepeatableRead',
  Serializable: 'Serializable'
});

exports.Prisma.SchoolScalarFieldEnum = {
  id: 'id',
  name: 'name',
  urn: 'urn',
  dfeNumber: 'dfeNumber',
  address: 'address',
  postcode: 'postcode',
  phone: 'phone',
  email: 'email',
  website: 'website',
  schoolType: 'schoolType',
  minYearGroup: 'minYearGroup',
  maxYearGroup: 'maxYearGroup',
  isActive: 'isActive',
  logoUrl: 'logoUrl',
  settings: 'settings',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.UserScalarFieldEnum = {
  id: 'id',
  schoolId: 'schoolId',
  email: 'email',
  emailVerified: 'emailVerified',
  passwordHash: 'passwordHash',
  isActive: 'isActive',
  lastLoginAt: 'lastLoginAt',
  loginAttempts: 'loginAttempts',
  lockedUntil: 'lockedUntil',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.AccountScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  type: 'type',
  provider: 'provider',
  providerAccountId: 'providerAccountId',
  refresh_token: 'refresh_token',
  access_token: 'access_token',
  expires_at: 'expires_at',
  token_type: 'token_type',
  scope: 'scope',
  id_token: 'id_token',
  session_state: 'session_state'
};

exports.Prisma.SessionScalarFieldEnum = {
  id: 'id',
  sessionToken: 'sessionToken',
  userId: 'userId',
  expires: 'expires'
};

exports.Prisma.VerificationTokenScalarFieldEnum = {
  identifier: 'identifier',
  token: 'token',
  expires: 'expires'
};

exports.Prisma.TeacherScalarFieldEnum = {
  id: 'id',
  schoolId: 'schoolId',
  userId: 'userId',
  employeeId: 'employeeId',
  title: 'title',
  firstName: 'firstName',
  lastName: 'lastName',
  displayName: 'displayName',
  teacherType: 'teacherType',
  isHeadTeacher: 'isHeadTeacher',
  isSenCo: 'isSenCo',
  isDSL: 'isDSL',
  isDeputyHead: 'isDeputyHead',
  subjects: 'subjects',
  yearGroups: 'yearGroups',
  qualifications: 'qualifications',
  startDate: 'startDate',
  endDate: 'endDate',
  contractType: 'contractType',
  schoolEmail: 'schoolEmail',
  phoneExtension: 'phoneExtension',
  dbsCheckDate: 'dbsCheckDate',
  dbsCheckNumber: 'dbsCheckNumber',
  safeguardingTraining: 'safeguardingTraining',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.StudentScalarFieldEnum = {
  id: 'id',
  schoolId: 'schoolId',
  userId: 'userId',
  firstName: 'firstName',
  lastName: 'lastName',
  preferredName: 'preferredName',
  dateOfBirth: 'dateOfBirth',
  pupilId: 'pupilId',
  admissionNumber: 'admissionNumber',
  yearGroup: 'yearGroup',
  classId: 'classId',
  admissionDate: 'admissionDate',
  leavingDate: 'leavingDate',
  uln: 'uln',
  upn: 'upn',
  sen: 'sen',
  senCategory: 'senCategory',
  senSupport: 'senSupport',
  pupilPremium: 'pupilPremium',
  freeschoolMeals: 'freeschoolMeals',
  englishAsAdditional: 'englishAsAdditional',
  medicalConditions: 'medicalConditions',
  dietaryRequirements: 'dietaryRequirements',
  houseGroup: 'houseGroup',
  dataRetentionUntil: 'dataRetentionUntil',
  consentGiven: 'consentGiven',
  consentGivenBy: 'consentGivenBy',
  consentDate: 'consentDate',
  consentWithdrawn: 'consentWithdrawn',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ParentScalarFieldEnum = {
  id: 'id',
  schoolId: 'schoolId',
  userId: 'userId',
  title: 'title',
  firstName: 'firstName',
  lastName: 'lastName',
  email: 'email',
  alternativeEmail: 'alternativeEmail',
  mobilePhone: 'mobilePhone',
  homePhone: 'homePhone',
  workPhone: 'workPhone',
  addressLine1: 'addressLine1',
  addressLine2: 'addressLine2',
  town: 'town',
  county: 'county',
  postcode: 'postcode',
  isEmergencyContact: 'isEmergencyContact',
  priority: 'priority',
  preferredContact: 'preferredContact',
  canReceiveSMS: 'canReceiveSMS',
  canReceiveEmail: 'canReceiveEmail',
  canReceivePhoneCalls: 'canReceivePhoneCalls',
  canCollectChild: 'canCollectChild',
  canConsentToTrips: 'canConsentToTrips',
  canAccessOnlineInfo: 'canAccessOnlineInfo',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.SchoolAdminScalarFieldEnum = {
  id: 'id',
  schoolId: 'schoolId',
  userId: 'userId',
  firstName: 'firstName',
  lastName: 'lastName',
  jobTitle: 'jobTitle',
  adminLevel: 'adminLevel',
  canManageUsers: 'canManageUsers',
  canManageClasses: 'canManageClasses',
  canManageClubs: 'canManageClubs',
  canViewAnalytics: 'canViewAnalytics',
  canManageSettings: 'canManageSettings',
  canExportData: 'canExportData',
  canAccessAllClasses: 'canAccessAllClasses',
  canViewAllStudents: 'canViewAllStudents',
  canModifyHomework: 'canModifyHomework',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ParentStudentScalarFieldEnum = {
  id: 'id',
  schoolId: 'schoolId',
  parentId: 'parentId',
  studentId: 'studentId',
  relationshipType: 'relationshipType',
  isPrimaryContact: 'isPrimaryContact',
  isEmergencyContact: 'isEmergencyContact',
  hasParentalResponsibility: 'hasParentalResponsibility',
  canGiveConsent: 'canGiveConsent',
  canCollectChild: 'canCollectChild',
  canAccessRecords: 'canAccessRecords',
  receivesReports: 'receivesReports',
  receivesNotifications: 'receivesNotifications',
  canContactTeachers: 'canContactTeachers',
  custodyArrangement: 'custodyArrangement',
  restrictedAccess: 'restrictedAccess',
  accessNotes: 'accessNotes',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.RoleScalarFieldEnum = {
  id: 'id',
  schoolId: 'schoolId',
  name: 'name',
  description: 'description',
  isDefault: 'isDefault',
  isCustom: 'isCustom',
  isActive: 'isActive',
  priority: 'priority',
  scope: 'scope',
  applicableUserTypes: 'applicableUserTypes',
  createdBy: 'createdBy',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.PermissionScalarFieldEnum = {
  id: 'id',
  name: 'name',
  description: 'description',
  resource: 'resource',
  action: 'action',
  scope: 'scope',
  isDefault: 'isDefault',
  isActive: 'isActive',
  category: 'category',
  riskLevel: 'riskLevel',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.RolePermissionScalarFieldEnum = {
  id: 'id',
  roleId: 'roleId',
  permissionId: 'permissionId',
  conditions: 'conditions',
  limitations: 'limitations',
  grantedAt: 'grantedAt',
  expiresAt: 'expiresAt',
  isActive: 'isActive',
  grantedBy: 'grantedBy'
};

exports.Prisma.UserRoleScalarFieldEnum = {
  id: 'id',
  schoolId: 'schoolId',
  userId: 'userId',
  roleId: 'roleId',
  classIds: 'classIds',
  yearGroups: 'yearGroups',
  subjects: 'subjects',
  studentIds: 'studentIds',
  assignedAt: 'assignedAt',
  expiresAt: 'expiresAt',
  isActive: 'isActive',
  assignedBy: 'assignedBy',
  assignmentReason: 'assignmentReason',
  additionalPermissions: 'additionalPermissions',
  restrictedPermissions: 'restrictedPermissions',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ClassScalarFieldEnum = {
  id: 'id',
  schoolId: 'schoolId',
  name: 'name',
  displayName: 'displayName',
  yearGroups: 'yearGroups',
  keyStages: 'keyStages',
  classType: 'classType',
  subject: 'subject',
  setLevel: 'setLevel',
  academicYear: 'academicYear',
  houseGroup: 'houseGroup',
  houseColor: 'houseColor',
  capacity: 'capacity',
  isActive: 'isActive',
  classroom: 'classroom',
  clubsEnabled: 'clubsEnabled',
  leaderboardEnabled: 'leaderboardEnabled'
};

exports.Prisma.TeacherClassScalarFieldEnum = {
  id: 'id',
  schoolId: 'schoolId',
  teacherId: 'teacherId',
  classId: 'classId',
  role: 'role',
  isPrimaryTeacher: 'isPrimaryTeacher',
  subjects: 'subjects',
  timeAllocation: 'timeAllocation',
  timetableSlots: 'timetableSlots',
  canMarkHomework: 'canMarkHomework',
  canAssignClubs: 'canAssignClubs',
  canViewProgress: 'canViewProgress',
  canContactParents: 'canContactParents',
  startDate: 'startDate',
  endDate: 'endDate',
  isActive: 'isActive',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ClubScalarFieldEnum = {
  id: 'id',
  schoolId: 'schoolId',
  name: 'name',
  description: 'description',
  clubType: 'clubType',
  subject: 'subject',
  isActive: 'isActive',
  ageGroups: 'ageGroups',
  keyStages: 'keyStages',
  hasLevels: 'hasLevels',
  levelNaming: 'levelNaming',
  customLevels: 'customLevels',
  evidenceType: 'evidenceType',
  logbookRequired: 'logbookRequired',
  parentInvolvement: 'parentInvolvement',
  maxBuddyMembers: 'maxBuddyMembers',
  buddyGroupsEnabled: 'buddyGroupsEnabled',
  xpPerCompletion: 'xpPerCompletion',
  streakEnabled: 'streakEnabled',
  iconUrl: 'iconUrl',
  color: 'color',
  createdBy: 'createdBy',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.HomeworkCompletionScalarFieldEnum = {
  id: 'id',
  schoolId: 'schoolId',
  studentId: 'studentId',
  clubId: 'clubId',
  completionDate: 'completionDate',
  evidenceType: 'evidenceType',
  evidenceUrl: 'evidenceUrl',
  notes: 'notes',
  parentNotes: 'parentNotes',
  timeSpentMinutes: 'timeSpentMinutes',
  wasLate: 'wasLate',
  verifiedBy: 'verifiedBy',
  verifiedAt: 'verifiedAt',
  isVerified: 'isVerified',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.SortOrder = {
  asc: 'asc',
  desc: 'desc'
};

exports.Prisma.NullableJsonNullValueInput = {
  DbNull: Prisma.DbNull,
  JsonNull: Prisma.JsonNull
};

exports.Prisma.QueryMode = {
  default: 'default',
  insensitive: 'insensitive'
};

exports.Prisma.JsonNullValueFilter = {
  DbNull: Prisma.DbNull,
  JsonNull: Prisma.JsonNull,
  AnyNull: Prisma.AnyNull
};

exports.Prisma.NullsOrder = {
  first: 'first',
  last: 'last'
};
exports.SchoolType = exports.$Enums.SchoolType = {
  NURSERY: 'NURSERY',
  PRIMARY: 'PRIMARY',
  SECONDARY: 'SECONDARY',
  ALL_THROUGH: 'ALL_THROUGH',
  SPECIAL: 'SPECIAL',
  PRU: 'PRU'
};

exports.TeacherType = exports.$Enums.TeacherType = {
  HEAD_TEACHER: 'HEAD_TEACHER',
  DEPUTY_HEAD: 'DEPUTY_HEAD',
  ASSISTANT_HEAD: 'ASSISTANT_HEAD',
  CLASS_TEACHER: 'CLASS_TEACHER',
  SUBJECT_SPECIALIST: 'SUBJECT_SPECIALIST',
  TEACHING_ASSISTANT: 'TEACHING_ASSISTANT',
  HIGHER_LEVEL_TA: 'HIGHER_LEVEL_TA',
  SEN_COORDINATOR: 'SEN_COORDINATOR',
  SUPPLY_TEACHER: 'SUPPLY_TEACHER',
  TRAINEE_TEACHER: 'TRAINEE_TEACHER'
};

exports.ContractType = exports.$Enums.ContractType = {
  PERMANENT: 'PERMANENT',
  TEMPORARY: 'TEMPORARY',
  SUPPLY: 'SUPPLY',
  TRAINEE: 'TRAINEE',
  VOLUNTEER: 'VOLUNTEER'
};

exports.ContactMethod = exports.$Enums.ContactMethod = {
  EMAIL: 'EMAIL',
  SMS: 'SMS',
  PHONE: 'PHONE',
  APP_NOTIFICATION: 'APP_NOTIFICATION'
};

exports.AdminLevel = exports.$Enums.AdminLevel = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  SCHOOL_ADMIN: 'SCHOOL_ADMIN',
  OFFICE_ADMIN: 'OFFICE_ADMIN',
  DATA_MANAGER: 'DATA_MANAGER',
  SYSTEM_ADMIN: 'SYSTEM_ADMIN',
  CLUB_ADMIN: 'CLUB_ADMIN'
};

exports.ParentType = exports.$Enums.ParentType = {
  MOTHER: 'MOTHER',
  FATHER: 'FATHER',
  STEP_MOTHER: 'STEP_MOTHER',
  STEP_FATHER: 'STEP_FATHER',
  GUARDIAN: 'GUARDIAN',
  CARER: 'CARER',
  GRANDPARENT: 'GRANDPARENT',
  AUNT_UNCLE: 'AUNT_UNCLE',
  SIBLING: 'SIBLING',
  OTHER: 'OTHER'
};

exports.RoleScope = exports.$Enums.RoleScope = {
  PLATFORM: 'PLATFORM',
  SCHOOL: 'SCHOOL',
  YEAR_GROUP: 'YEAR_GROUP',
  CLASS: 'CLASS',
  SUBJECT: 'SUBJECT',
  INDIVIDUAL: 'INDIVIDUAL'
};

exports.UserType = exports.$Enums.UserType = {
  TEACHER: 'TEACHER',
  STUDENT: 'STUDENT',
  PARENT: 'PARENT',
  SCHOOL_ADMIN: 'SCHOOL_ADMIN'
};

exports.PermissionCategory = exports.$Enums.PermissionCategory = {
  USER_MANAGEMENT: 'USER_MANAGEMENT',
  ACADEMIC: 'ACADEMIC',
  ADMINISTRATIVE: 'ADMINISTRATIVE',
  COMMUNICATION: 'COMMUNICATION',
  DATA_ACCESS: 'DATA_ACCESS',
  SYSTEM: 'SYSTEM',
  GENERAL: 'GENERAL'
};

exports.RiskLevel = exports.$Enums.RiskLevel = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  CRITICAL: 'CRITICAL'
};

exports.ClassType = exports.$Enums.ClassType = {
  FORM: 'FORM',
  SUBJECT: 'SUBJECT',
  SET: 'SET',
  MIXED: 'MIXED',
  INTERVENTION: 'INTERVENTION',
  CLUB: 'CLUB',
  NURTURE: 'NURTURE'
};

exports.KeyStage = exports.$Enums.KeyStage = {
  EYFS: 'EYFS',
  KS1: 'KS1',
  KS2: 'KS2',
  KS3: 'KS3',
  KS4: 'KS4',
  KS5: 'KS5'
};

exports.ClassRole = exports.$Enums.ClassRole = {
  CLASS_TEACHER: 'CLASS_TEACHER',
  ASSISTANT_TEACHER: 'ASSISTANT_TEACHER',
  SUBJECT_SPECIALIST: 'SUBJECT_SPECIALIST',
  SUPPORT_TEACHER: 'SUPPORT_TEACHER',
  STUDENT_TEACHER: 'STUDENT_TEACHER',
  COVER_TEACHER: 'COVER_TEACHER',
  VOLUNTEER: 'VOLUNTEER'
};

exports.ClubType = exports.$Enums.ClubType = {
  ACADEMIC: 'ACADEMIC',
  NUMBER: 'NUMBER',
  READING: 'READING',
  SPELLING: 'SPELLING',
  WRITING: 'WRITING',
  SCIENCE: 'SCIENCE',
  TOPIC: 'TOPIC',
  SKILL: 'SKILL',
  WELLBEING: 'WELLBEING'
};

exports.ClubEvidenceType = exports.$Enums.ClubEvidenceType = {
  PHOTO: 'PHOTO',
  READING_LOG: 'READING_LOG',
  COMPLETION_MARK: 'COMPLETION_MARK',
  AUDIO_RECORDING: 'AUDIO_RECORDING',
  WRITTEN_WORK: 'WRITTEN_WORK',
  TEACHER_OBSERVED: 'TEACHER_OBSERVED'
};

exports.Prisma.ModelName = {
  School: 'School',
  User: 'User',
  Account: 'Account',
  Session: 'Session',
  VerificationToken: 'VerificationToken',
  Teacher: 'Teacher',
  Student: 'Student',
  Parent: 'Parent',
  SchoolAdmin: 'SchoolAdmin',
  ParentStudent: 'ParentStudent',
  Role: 'Role',
  Permission: 'Permission',
  RolePermission: 'RolePermission',
  UserRole: 'UserRole',
  Class: 'Class',
  TeacherClass: 'TeacherClass',
  Club: 'Club',
  HomeworkCompletion: 'HomeworkCompletion'
};

/**
 * This is a stub Prisma Client that will error at runtime if called.
 */
class PrismaClient {
  constructor() {
    return new Proxy(this, {
      get(target, prop) {
        let message
        const runtime = getRuntime()
        if (runtime.isEdge) {
          message = `PrismaClient is not configured to run in ${runtime.prettyName}. In order to run Prisma Client on edge runtime, either:
- Use Prisma Accelerate: https://pris.ly/d/accelerate
- Use Driver Adapters: https://pris.ly/d/driver-adapters
`;
        } else {
          message = 'PrismaClient is unable to run in this browser environment, or has been bundled for the browser (running in `' + runtime.prettyName + '`).'
        }
        
        message += `
If this is unexpected, please open an issue: https://pris.ly/prisma-prisma-bug-report`

        throw new Error(message)
      }
    })
  }
}

exports.PrismaClient = PrismaClient

Object.assign(exports, Prisma)
