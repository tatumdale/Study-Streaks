import { faker } from '@faker-js/faker';
import { UserType, SchoolType, TeacherType, ParentType, ClassType, KeyStage } from '@study-streaks/database';

/**
 * Test data factories for StudyStreaks platform
 * Provides consistent, realistic test data for UK educational context
 */

// UK-specific data
export const ukSchoolData = {
  primary: {
    yearGroups: [0, 1, 2, 3, 4, 5, 6], // Reception through Year 6
    subjects: ['Mathematics', 'English', 'Science', 'History', 'Geography', 'Art', 'PE', 'PSHE'],
    keyStages: [KeyStage.EYFS, KeyStage.KS1, KeyStage.KS2],
  },
  secondary: {
    yearGroups: [7, 8, 9, 10, 11],
    subjects: ['Mathematics', 'English Language', 'English Literature', 'Science', 'History', 'Geography', 'Modern Languages', 'Art', 'Music', 'PE', 'Computing'],
    keyStages: [KeyStage.KS3, KeyStage.KS4],
  },
  termDates: {
    autumn: { start: '2025-09-01', end: '2025-12-20' },
    spring: { start: '2025-01-06', end: '2025-03-28' },
    summer: { start: '2025-04-14', end: '2025-07-18' }
  },
  holidays: [
    { name: 'Christmas Break', start: '2025-12-21', end: '2026-01-05' },
    { name: 'Easter Break', start: '2025-03-29', end: '2025-04-13' },
    { name: 'Summer Holiday', start: '2025-07-19', end: '2025-08-31' }
  ]
};

// School factory
export const createTestSchool = (overrides: Partial<any> = {}) => {
  const schoolType = overrides.schoolType || SchoolType.PRIMARY;
  const baseData = schoolType === SchoolType.PRIMARY ? ukSchoolData.primary : ukSchoolData.secondary;
  
  return {
    id: `school-${faker.string.nanoid()}`,
    name: `${faker.location.city()} ${schoolType === SchoolType.PRIMARY ? 'Primary' : 'Secondary'} School`,
    urn: faker.string.numeric(6), // UK URN format
    dfeNumber: faker.string.numeric(4), // DfE establishment number
    address: faker.location.streetAddress(),
    postcode: faker.location.zipCode('?? ???'), // UK postcode format
    phone: faker.phone.number('0#### ######'),
    email: `admin@${faker.internet.domainName()}`,
    website: `https://www.${faker.internet.domainName()}`,
    schoolType,
    minYearGroup: Math.min(...baseData.yearGroups),
    maxYearGroup: Math.max(...baseData.yearGroups),
    isActive: true,
    logoUrl: null,
    settings: {
      enabledFeatures: ['homework_tracking', 'streaks', 'clubs', 'leaderboards'],
      theme: 'default',
      timezone: 'Europe/London'
    },
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides
  };
};

// User factory
export const createTestUser = (overrides: Partial<any> = {}) => {
  return {
    id: `user-${faker.string.nanoid()}`,
    schoolId: overrides.schoolId || `school-${faker.string.nanoid()}`,
    email: faker.internet.email().toLowerCase(),
    emailVerified: new Date(),
    passwordHash: '$2a$10$example.hash.for.testing.purposes.only',
    isActive: true,
    lastLoginAt: faker.date.recent(),
    loginAttempts: 0,
    lockedUntil: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides
  };
};

// Teacher factory
export const createTestTeacher = (overrides: Partial<any> = {}) => {
  const titles = ['Mr', 'Mrs', 'Miss', 'Ms', 'Dr'];
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();
  const title = faker.helpers.arrayElement(titles);
  
  return {
    id: `teacher-${faker.string.nanoid()}`,
    schoolId: overrides.schoolId || `school-${faker.string.nanoid()}`,
    userId: overrides.userId || `user-${faker.string.nanoid()}`,
    employeeId: faker.string.alphanumeric(6).toUpperCase(),
    title,
    firstName,
    lastName,
    displayName: `${title} ${lastName}`,
    teacherType: TeacherType.CLASS_TEACHER,
    isHeadTeacher: false,
    isSenCo: false,
    isDSL: false,
    isDeputyHead: false,
    subjects: faker.helpers.arrayElements(ukSchoolData.primary.subjects, { min: 1, max: 3 }),
    yearGroups: faker.helpers.arrayElements(ukSchoolData.primary.yearGroups, { min: 1, max: 2 }),
    qualifications: {
      degree: faker.helpers.arrayElement(['BA', 'BSc', 'MA', 'MSc']),
      teachingQualification: 'PGCE',
      specializations: []
    },
    startDate: faker.date.past({ years: 5 }),
    endDate: null,
    contractType: 'PERMANENT',
    schoolEmail: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@school.edu`,
    phoneExtension: faker.string.numeric(3),
    dbsCheckDate: faker.date.past({ years: 2 }),
    dbsCheckNumber: faker.string.numeric(12),
    safeguardingTraining: faker.date.past({ years: 1 }),
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides
  };
};

// Student factory
export const createTestStudent = (overrides: Partial<any> = {}) => {
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();
  const dateOfBirth = faker.date.birthdate({ min: 4, max: 18, mode: 'age' });
  const yearGroup = overrides.yearGroup || faker.helpers.arrayElement(ukSchoolData.primary.yearGroups);
  
  return {
    id: `student-${faker.string.nanoid()}`,
    schoolId: overrides.schoolId || `school-${faker.string.nanoid()}`,
    userId: overrides.createAccount ? `user-${faker.string.nanoid()}` : null,
    firstName,
    lastName,
    preferredName: faker.datatype.boolean() ? faker.person.firstName() : null,
    dateOfBirth,
    pupilId: faker.string.alphanumeric(8).toUpperCase(),
    admissionNumber: faker.string.numeric(6),
    yearGroup,
    classId: overrides.classId || `class-${faker.string.nanoid()}`,
    admissionDate: faker.date.past({ years: yearGroup }),
    leavingDate: null,
    uln: faker.string.numeric(10), // Unique Learner Number
    upn: faker.string.alphanumeric(13).toUpperCase(), // Unique Pupil Number
    sen: faker.datatype.boolean({ probability: 0.15 }), // 15% SEN rate
    senCategory: null,
    senSupport: null,
    pupilPremium: faker.datatype.boolean({ probability: 0.25 }), // 25% PP rate
    freeschoolMeals: faker.datatype.boolean({ probability: 0.2 }), // 20% FSM rate
    englishAsAdditional: faker.datatype.boolean({ probability: 0.1 }), // 10% EAL rate
    medicalConditions: null,
    dietaryRequirements: null,
    houseGroup: faker.helpers.arrayElement(['Red House', 'Blue House', 'Yellow House', 'Green House']),
    dataRetentionUntil: new Date(Date.now() + 7 * 365 * 24 * 60 * 60 * 1000), // 7 years
    consentGiven: true,
    consentGivenBy: 'parent',
    consentDate: faker.date.past({ years: 1 }),
    consentWithdrawn: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides
  };
};

// Parent factory
export const createTestParent = (overrides: Partial<any> = {}) => {
  const titles = ['Mr', 'Mrs', 'Miss', 'Ms', 'Dr'];
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();
  
  return {
    id: `parent-${faker.string.nanoid()}`,
    schoolId: overrides.schoolId || `school-${faker.string.nanoid()}`,
    userId: overrides.userId || `user-${faker.string.nanoid()}`,
    title: faker.helpers.arrayElement(titles),
    firstName,
    lastName,
    email: faker.internet.email().toLowerCase(),
    alternativeEmail: faker.datatype.boolean() ? faker.internet.email().toLowerCase() : null,
    mobilePhone: faker.phone.number('07### ######'),
    homePhone: faker.phone.number('01### ######'),
    workPhone: faker.datatype.boolean() ? faker.phone.number('020 #### ####') : null,
    addressLine1: faker.location.streetAddress(),
    addressLine2: faker.datatype.boolean() ? faker.location.secondaryAddress() : null,
    town: faker.location.city(),
    county: faker.location.county(),
    postcode: faker.location.zipCode('?? ???'),
    isEmergencyContact: true,
    priority: 1,
    preferredContact: 'EMAIL',
    canReceiveSMS: true,
    canReceiveEmail: true,
    canReceivePhoneCalls: true,
    canCollectChild: true,
    canConsentToTrips: true,
    canAccessOnlineInfo: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides
  };
};

// Class factory
export const createTestClass = (overrides: Partial<any> = {}) => {
  const yearGroup = overrides.yearGroup || faker.helpers.arrayElement(ukSchoolData.primary.yearGroups);
  const classLetter = faker.helpers.arrayElement(['A', 'B', 'C', 'D']);
  
  return {
    id: `class-${faker.string.nanoid()}`,
    schoolId: overrides.schoolId || `school-${faker.string.nanoid()}`,
    name: yearGroup === 0 ? `Reception ${classLetter}` : `${yearGroup}${classLetter}`,
    displayName: faker.helpers.arrayElement(['The Lions', 'The Tigers', 'The Dragons', 'The Eagles', null]),
    yearGroups: [yearGroup],
    keyStages: yearGroup <= 2 ? [KeyStage.KS1] : [KeyStage.KS2],
    classType: ClassType.FORM,
    subject: null,
    setLevel: null,
    academicYear: '2024-2025',
    houseGroup: faker.helpers.arrayElement(['Red House', 'Blue House', 'Yellow House', 'Green House']),
    houseColor: faker.internet.color(),
    capacity: faker.number.int({ min: 25, max: 32 }),
    isActive: true,
    classroom: `Room ${faker.number.int({ min: 1, max: 30 })}`,
    clubsEnabled: true,
    leaderboardEnabled: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides
  };
};

// Club factory
export const createTestClub = (overrides: Partial<any> = {}) => {
  const subjects = ukSchoolData.primary.subjects;
  const subject = faker.helpers.arrayElement(subjects);
  
  return {
    id: `club-${faker.string.nanoid()}`,
    schoolId: overrides.schoolId || `school-${faker.string.nanoid()}`,
    name: `${subject} Club`,
    description: `Improve your ${subject.toLowerCase()} skills with fun activities`,
    clubType: 'ACADEMIC',
    subject,
    isActive: true,
    ageGroups: faker.helpers.arrayElements(ukSchoolData.primary.yearGroups, { min: 2, max: 4 }),
    keyStages: [KeyStage.KS1, KeyStage.KS2],
    hasLevels: true,
    levelNaming: `${subject} Club Level {level}`,
    customLevels: false,
    evidenceType: 'PHOTO',
    logbookRequired: false,
    parentInvolvement: true,
    maxBuddyMembers: 3,
    buddyGroupsEnabled: true,
    xpPerCompletion: 10,
    streakEnabled: true,
    iconUrl: null,
    color: faker.internet.color(),
    createdBy: `teacher-${faker.string.nanoid()}`,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides
  };
};

// Homework completion factory
export const createTestHomeworkCompletion = (overrides: Partial<any> = {}) => {
  return {
    id: `homework-${faker.string.nanoid()}`,
    schoolId: overrides.schoolId || `school-${faker.string.nanoid()}`,
    studentId: overrides.studentId || `student-${faker.string.nanoid()}`,
    clubId: overrides.clubId || `club-${faker.string.nanoid()}`,
    completionDate: overrides.completionDate || faker.date.recent(),
    evidenceType: 'PHOTO',
    evidenceUrl: faker.image.url(),
    notes: faker.lorem.sentence(),
    parentNotes: faker.datatype.boolean() ? faker.lorem.sentence() : null,
    timeSpentMinutes: faker.number.int({ min: 10, max: 60 }),
    wasLate: faker.datatype.boolean({ probability: 0.1 }),
    verifiedBy: overrides.autoVerify ? `teacher-${faker.string.nanoid()}` : null,
    verifiedAt: overrides.autoVerify ? new Date() : null,
    isVerified: overrides.autoVerify || false,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides
  };
};

// Parent-Student relationship factory
export const createTestParentStudent = (overrides: Partial<any> = {}) => {
  return {
    id: `parent-student-${faker.string.nanoid()}`,
    schoolId: overrides.schoolId || `school-${faker.string.nanoid()}`,
    parentId: overrides.parentId || `parent-${faker.string.nanoid()}`,
    studentId: overrides.studentId || `student-${faker.string.nanoid()}`,
    relationshipType: ParentType.MOTHER,
    isPrimaryContact: true,
    isEmergencyContact: true,
    hasParentalResponsibility: true,
    canGiveConsent: true,
    canCollectChild: true,
    canAccessRecords: true,
    receivesReports: true,
    receivesNotifications: true,
    canContactTeachers: true,
    custodyArrangement: null,
    restrictedAccess: false,
    accessNotes: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides
  };
};

// Role factory
export const createTestRole = (overrides: Partial<any> = {}) => {
  const roleNames = {
    teacher: ['Class Teacher', 'Year Group Lead', 'Subject Coordinator'],
    parent: ['Parent', 'Guardian'],
    student: ['Student'],
    schoolAdmin: ['Head Teacher', 'Deputy Head', 'School Admin', 'Office Admin']
  };
  
  const userType = overrides.userType || UserType.TEACHER;
  const name = faker.helpers.arrayElement(roleNames[userType.toLowerCase() as keyof typeof roleNames]);
  
  return {
    id: `role-${faker.string.nanoid()}`,
    schoolId: overrides.schoolId || `school-${faker.string.nanoid()}`,
    name,
    description: `${name} role with appropriate permissions`,
    isDefault: false,
    isCustom: true,
    isActive: true,
    priority: faker.number.int({ min: 1, max: 10 }),
    scope: 'SCHOOL',
    applicableUserTypes: [userType],
    createdBy: `admin-${faker.string.nanoid()}`,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides
  };
};

// Authentication token factory
export const createTestAuthToken = (overrides: Partial<any> = {}) => {
  const school = createTestSchool();
  const user = createTestUser({ schoolId: school.id });
  
  return {
    id: user.id,
    email: user.email,
    name: `Test User ${faker.person.firstName()}`,
    image: null,
    schoolId: school.id,
    schoolName: school.name,
    userType: overrides.userType || 'teacher',
    profile: {
      id: `profile-${faker.string.nanoid()}`,
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
    },
    permissions: overrides.permissions || [
      {
        name: 'read_students',
        resource: 'students',
        action: 'read',
        scope: 'school',
        category: 'ACADEMIC',
        riskLevel: 'LOW'
      }
    ],
    roles: overrides.roles || [
      {
        id: `role-${faker.string.nanoid()}`,
        name: 'Class Teacher',
        scope: 'SCHOOL',
        classIds: [],
        yearGroups: [],
        subjects: [],
        studentIds: []
      }
    ],
    ...overrides
  };
};

// Multi-tenant test data helper
export const createMultiTenantTestData = async (schoolCount: number = 2) => {
  const schools = [];
  const allData = [];
  
  for (let i = 0; i < schoolCount; i++) {
    const school = createTestSchool({
      name: `Test School ${i + 1}`,
      id: `school-${i + 1}`
    });
    schools.push(school);
    
    // Create classes
    const classes = Array.from({ length: 3 }, (_, j) => 
      createTestClass({ 
        schoolId: school.id,
        yearGroup: j + 3, // Year 3, 4, 5
        id: `class-${i + 1}-${j + 1}`
      })
    );
    
    // Create teachers
    const teachers = Array.from({ length: 2 }, (_, j) => 
      createTestTeacher({ 
        schoolId: school.id,
        id: `teacher-${i + 1}-${j + 1}`
      })
    );
    
    // Create students
    const students = Array.from({ length: 15 }, (_, j) => 
      createTestStudent({ 
        schoolId: school.id,
        classId: faker.helpers.arrayElement(classes).id,
        id: `student-${i + 1}-${j + 1}`
      })
    );
    
    // Create clubs
    const clubs = Array.from({ length: 3 }, (_, j) => 
      createTestClub({ 
        schoolId: school.id,
        id: `club-${i + 1}-${j + 1}`
      })
    );
    
    allData.push({
      school,
      classes,
      teachers,
      students,
      clubs
    });
  }
  
  return { schools, allData };
};

// GDPR test data helper
export const createGDPRTestStudent = (schoolId: string) => {
  const student = createTestStudent({ schoolId });
  
  // Create comprehensive data profile for GDPR testing
  const relatedData = {
    homeworkCompletions: Array.from({ length: 25 }, () => 
      createTestHomeworkCompletion({ 
        studentId: student.id,
        schoolId 
      })
    ),
    // Additional data would be created in actual implementation
  };
  
  return { student, relatedData };
};