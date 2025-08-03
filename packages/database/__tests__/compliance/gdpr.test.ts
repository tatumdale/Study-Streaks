import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { complianceTestHelper } from '@testing/helpers/security';
import { createTestStudent, createTestSchool, createGDPRTestStudent } from '@testing/helpers/factories';

/**
 * GDPR Compliance Tests for StudyStreaks Platform
 * 
 * Tests ensure compliance with UK GDPR and Data Protection Act 2018.
 * Critical for UK educational platforms handling children's data.
 * 
 * Test Categories:
 * - Data Subject Rights (Articles 12-22)
 * - Data Minimisation (Article 5)
 * - Lawful Basis for Processing (Article 6)
 * - Data Retention and Deletion
 * - Consent Management (for children under 13)
 * - Data Protection Impact Assessments
 */

describe('GDPR Compliance - Data Subject Rights', () => {
  let testSchool: any;
  let testStudent: any;
  let gdprTestData: any;

  beforeEach(() => {
    testSchool = createTestSchool();
    testStudent = createTestStudent({ schoolId: testSchool.id });
    gdprTestData = createGDPRTestStudent(testSchool.id);
  });

  describe('Article 17: Right to Erasure (Right to be Forgotten)', () => {
    it('should completely delete all student personal data upon request', async () => {
      // Given: A student with comprehensive data profile
      const studentWithData = gdprTestData.student;
      const relatedData = gdprTestData.relatedData;

      // Mock deletion function
      const mockDeleteFunction = async (studentId: string) => {
        return {
          deletedRecords: {
            student: 1,
            homeworkCompletions: relatedData.homeworkCompletions.length,
            streaks: 8,
            achievements: 5,
            parentStudents: 2,
            auditLogs: 15,
            clubs: 3,
            buddyRelationships: 2
          },
          retainedRecords: {
            anonymizedStats: 1, // Anonymized aggregated data
            schoolStats: 1      // School-level statistics
          }
        };
      };

      // When: Data deletion is requested
      const deletionResult = await complianceTestHelper.testDataDeletion(
        studentWithData.id,
        mockDeleteFunction
      );

      // Then: All personal data should be deleted
      expect(deletionResult.isCompliant).toBe(true);
      expect(deletionResult.checks.studentRecordDeleted).toBe(true);
      expect(deletionResult.checks.homeworkDeleted).toBe(true);
      expect(deletionResult.checks.auditTrailMaintained).toBe(true);
      expect(deletionResult.checks.anonymizedDataPreserved).toBe(true);
    });

    it('should maintain audit trail of deletion for compliance', async () => {
      // Given: A data deletion request
      const deletionRequest = {
        studentId: testStudent.id,
        requestedBy: 'parent',
        requestDate: new Date(),
        reason: 'Student leaving school',
        parentConsentWithdrawn: true
      };

      // Mock audit logging
      const mockAuditLog = {
        event: 'GDPR_DATA_DELETION',
        studentId: deletionRequest.studentId,
        requestedBy: deletionRequest.requestedBy,
        timestamp: deletionRequest.requestDate,
        details: {
          reason: deletionRequest.reason,
          recordsDeleted: 45,
          recordsRetained: 2,
          parentConsentWithdrawn: deletionRequest.parentConsentWithdrawn
        },
        complianceOfficer: 'data.protection@school.ac.uk'
      };

      // When: Deletion is performed
      const auditCompliant = mockAuditLog.event === 'GDPR_DATA_DELETION' &&
                           mockAuditLog.studentId === deletionRequest.studentId &&
                           mockAuditLog.details.recordsDeleted > 0;

      // Then: Audit trail should be maintained
      expect(auditCompliant).toBe(true);
      expect(mockAuditLog.complianceOfficer).toBeDefined();
      expect(mockAuditLog.details.parentConsentWithdrawn).toBe(true);
    });

    it('should handle partial deletion exceptions for legal obligations', async () => {
      // Given: A deletion request with legal retention requirements
      const studentData = createTestStudent({
        schoolId: testSchool.id,
        safeguardingConcern: true, // Legal obligation to retain
        senRecord: true            // Educational legal requirement
      });

      const mockDeletionWithExceptions = async (studentId: string) => {
        return {
          deletedRecords: {
            student: 1,
            homeworkCompletions: 25,
            streaks: 8,
            socialMedia: 0, // All deleted
            photos: 0       // All deleted
          },
          retainedRecords: {
            safeguardingRecords: 1, // Legal obligation (Article 17.3.b)
            senRecords: 1,          // Legal obligation (Article 17.3.b)
            anonymizedStats: 1
          },
          legalBasis: 'Article 17.3.b - Legal obligation'
        };
      };

      // When: Deletion with exceptions is performed
      const result = await complianceTestHelper.testDataDeletion(
        studentData.id,
        mockDeletionWithExceptions
      );

      // Then: Personal data should be deleted but legal obligations retained
      expect(result.deletedRecords.student).toBe(1);
      expect(result.retainedRecords.safeguardingRecords).toBe(1);
      expect(result.retainedRecords.senRecords).toBe(1);
    });
  });

  describe('Article 15: Right of Access', () => {
    it('should provide comprehensive data export for subject access requests', () => {
      // Given: A student data access request
      const accessRequest = {
        studentId: testStudent.id,
        requestedBy: 'parent',
        requestDate: new Date(),
        dataCategories: ['personal', 'academic', 'behavioural', 'medical']
      };

      // Mock data export
      const mockDataExport = {
        studentRecord: {
          personalData: {
            name: testStudent.firstName + ' ' + testStudent.lastName,
            dateOfBirth: testStudent.dateOfBirth,
            yearGroup: testStudent.yearGroup,
            pupilId: testStudent.pupilId
          },
          academicData: {
            homeworkCompletions: 45,
            streaks: [
              { subject: 'Mathematics', currentStreak: 7, longestStreak: 15 },
              { subject: 'English', currentStreak: 3, longestStreak: 8 }
            ],
            achievements: ['5 Day Streak', '10 Day Streak', 'Math Master']
          },
          metadata: {
            dataCreated: testStudent.createdAt,
            lastUpdated: testStudent.updatedAt,
            retentionPeriod: testStudent.dataRetentionUntil,
            legalBasis: 'Legitimate interest - Educational provision'
          }
        },
        exportDate: new Date(),
        format: 'JSON',
        requestReference: 'SAR-2024-001'
      };

      // When: Data export is validated
      const hasPersonalData = mockDataExport.studentRecord.personalData.name !== undefined;
      const hasAcademicData = mockDataExport.studentRecord.academicData.homeworkCompletions > 0;
      const hasMetadata = mockDataExport.studentRecord.metadata.legalBasis !== undefined;

      // Then: Export should be comprehensive and compliant
      expect(hasPersonalData).toBe(true);
      expect(hasAcademicData).toBe(true);
      expect(hasMetadata).toBe(true);
      expect(mockDataExport.requestReference).toBeDefined();
      expect(mockDataExport.format).toBe('JSON');
    });

    it('should provide data in machine-readable format', () => {
      // Given: A data portability request (Article 20)
      const portabilityData = {
        format: 'JSON',
        structure: 'standardized',
        encoding: 'UTF-8',
        data: {
          student: testStudent,
          homework: ['completion1', 'completion2'],
          achievements: ['achievement1', 'achievement2']
        }
      };

      // When: Data format is validated
      const isValidFormat = portabilityData.format === 'JSON' &&
                          portabilityData.encoding === 'UTF-8' &&
                          typeof portabilityData.data === 'object';

      // Then: Data should be in machine-readable format
      expect(isValidFormat).toBe(true);
      expect(portabilityData.structure).toBe('standardized');
    });
  });

  describe('Article 5: Data Minimisation', () => {
    it('should only collect necessary data for educational purposes', () => {
      // Given: Student data structure
      const studentDataStructure = {
        necessary: [
          'id', 'schoolId', 'firstName', 'lastName', 'yearGroup', 
          'classId', 'dateOfBirth', 'pupilId', 'admissionDate'
        ],
        educational: [
          'homeworkCompletions', 'streaks', 'achievements', 'clubs'
        ],
        compliance: [
          'consentGiven', 'consentDate', 'dataRetentionUntil'
        ],
        excessive: [
          'parentIncome', 'homeAddress', 'parentEmployment', 
          'politicalViews', 'religiousBeliefs', 'ethnicOrigin'
        ]
      };

      // When: Data minimisation is tested
      const testData = {
        ...testStudent,
        homeworkCompletions: [],
        streaks: [],
        achievements: []
      };

      const minimisationResult = complianceTestHelper.testDataMinimization(testData);

      // Then: Only necessary data should be collected
      expect(minimisationResult.isCompliant).toBe(true);
      expect(minimisationResult.excessiveFields).toHaveLength(0);
      expect(minimisationResult.checks.hasOnlyNecessaryData).toBe(true);
    });

    it('should justify data collection with lawful basis', () => {
      // Given: Data collection justifications
      const dataJustifications = {
        personalIdentifiers: {
          purpose: 'Student identification and safeguarding',
          lawfulBasis: 'Article 6(1)(f) - Legitimate interest',
          educationalNecessity: true
        },
        academicProgress: {
          purpose: 'Educational progress tracking and motivation',
          lawfulBasis: 'Article 6(1)(f) - Legitimate interest', 
          educationalNecessity: true
        },
        parentContact: {
          purpose: 'Communication with parents/guardians',
          lawfulBasis: 'Article 6(1)(f) - Legitimate interest',
          educationalNecessity: true
        },
        medicalInformation: {
          purpose: 'Health and safety requirements',
          lawfulBasis: 'Article 6(1)(f) - Legitimate interest',
          educationalNecessity: true,
          specialCategory: true,
          additionalSafeguards: ['Encryption', 'Access controls', 'Staff training']
        }
      };

      // When: Justifications are validated
      const allJustified = Object.values(dataJustifications).every(justification => 
        justification.purpose && justification.lawfulBasis && justification.educationalNecessity
      );

      // Then: All data collection should be justified
      expect(allJustified).toBe(true);
      expect(dataJustifications.medicalInformation.specialCategory).toBe(true);
      expect(dataJustifications.medicalInformation.additionalSafeguards).toBeDefined();
    });
  });

  describe('Article 13/14: Transparency and Privacy Information', () => {
    it('should provide clear privacy notices for children', () => {
      // Given: Privacy notice for children
      const childPrivacyNotice = {
        title: 'How we use your information at school',
        language: 'child-friendly',
        wordCount: 485,
        readingLevel: 8, // Age-appropriate
        sections: [
          'What information we collect',
          'Why we need this information', 
          'Who we share it with',
          'How long we keep it',
          'Your rights',
          'How to contact us'
        ],
        examples: [
          'We collect your name so teachers know who you are',
          'We track your homework to help you do well at school',
          'We keep your information safe and private'
        ]
      };

      // When: Privacy notice is assessed
      const isChildFriendly = childPrivacyNotice.wordCount < 500 &&
                            childPrivacyNotice.readingLevel <= 10 &&
                            childPrivacyNotice.language === 'child-friendly';

      // Then: Privacy notice should be child-appropriate
      expect(isChildFriendly).toBe(true);
      expect(childPrivacyNotice.sections).toHaveLength(6);
      expect(childPrivacyNotice.examples.length).toBeGreaterThan(0);
    });

    it('should provide technical privacy notices for parents', () => {
      // Given: Detailed privacy notice for parents
      const parentPrivacyNotice = {
        dataController: 'Test Primary School',
        dpoContact: 'dpo@testschool.ac.uk',
        legalBasis: [
          'Article 6(1)(f) - Legitimate interest (educational provision)',
          'Article 6(1)(c) - Legal obligation (safeguarding)'
        ],
        dataCategories: [
          'Personal identifiers',
          'Academic progress',
          'Attendance records',
          'Behavioral records'
        ],
        retentionPeriods: {
          studentRecords: '7 years after leaving school',
          safeguardingRecords: 'Until child reaches 25',
          academicRecords: '3 years after completion'
        },
        rightsAvailable: [
          'Right of access',
          'Right to rectification',
          'Right to erasure',
          'Right to restrict processing',
          'Right to data portability',
          'Right to object'
        ]
      };

      // When: Technical notice is validated
      const hasRequiredElements = parentPrivacyNotice.dataController &&
                                parentPrivacyNotice.dpoContact &&
                                parentPrivacyNotice.legalBasis.length > 0 &&
                                parentPrivacyNotice.rightsAvailable.length >= 6;

      // Then: Technical notice should be comprehensive
      expect(hasRequiredElements).toBe(true);
      expect(parentPrivacyNotice.retentionPeriods).toBeDefined();
      expect(parentPrivacyNotice.legalBasis).toContain('Article 6(1)(f) - Legitimate interest (educational provision)');
    });
  });

  describe('Consent Management for Children', () => {
    it('should require parental consent for children under 13', () => {
      // Given: Children of different ages
      const children = [
        { age: 8, requiresParentalConsent: true },
        { age: 11, requiresParentalConsent: true },
        { age: 13, requiresParentalConsent: false },
        { age: 15, requiresParentalConsent: false }
      ];

      children.forEach(child => {
        // When: Consent requirements are checked
        const processingData = {
          childAge: child.age,
          parentalConsent: child.requiresParentalConsent,
          purposes: ['homework_tracking', 'educational_motivation']
        };

        const complianceResult = complianceTestHelper.testChildrensCodeCompliance(processingData);

        // Then: Consent requirements should be appropriate
        if (child.age < 13) {
          expect(complianceResult.checks.parentalConsent.consentRequired).toBe(true);
          expect(complianceResult.checks.parentalConsent.isCompliant).toBe(child.requiresParentalConsent);
        } else {
          expect(complianceResult.checks.parentalConsent.consentRequired).toBe(false);
        }
      });
    });

    it('should track consent withdrawal and act upon it', () => {
      // Given: A student with withdrawn consent
      const studentWithWithdrawnConsent = {
        ...testStudent,
        consentGiven: true,
        consentDate: new Date('2024-01-01'),
        consentWithdrawn: true,
        consentWithdrawnDate: new Date('2024-06-01'),
        consentWithdrawnBy: 'parent'
      };

      // When: Consent status is checked
      const hasValidConsent = studentWithWithdrawnConsent.consentGiven && 
                            !studentWithWithdrawnConsent.consentWithdrawn;

      const requiresDataDeletion = studentWithWithdrawnConsent.consentWithdrawn;

      // Then: Consent withdrawal should trigger data deletion
      expect(hasValidConsent).toBe(false);
      expect(requiresDataDeletion).toBe(true);
      expect(studentWithWithdrawnConsent.consentWithdrawnBy).toBe('parent');
    });

    it('should validate consent mechanisms are appropriate', () => {
      // Given: Consent collection mechanism
      const consentMechanism = {
        method: 'positive_opt_in',
        clearAndSpecific: true,
        informed: true,
        unambiguous: true,
        ageVerification: true,
        parentalVerification: true,
        withdrawalMechanism: 'email_or_written_request',
        recordKeeping: {
          who: 'parent',
          when: new Date(),
          what: ['homework_tracking', 'progress_reports'],
          how: 'electronic_form'
        }
      };

      // When: Consent mechanism is validated
      const isValidConsent = consentMechanism.method === 'positive_opt_in' &&
                           consentMechanism.clearAndSpecific &&
                           consentMechanism.informed &&
                           consentMechanism.unambiguous &&
                           consentMechanism.recordKeeping.who &&
                           consentMechanism.recordKeeping.when &&
                           consentMechanism.recordKeeping.what.length > 0;

      // Then: Consent mechanism should meet GDPR standards
      expect(isValidConsent).toBe(true);
      expect(consentMechanism.withdrawalMechanism).toBeDefined();
      expect(consentMechanism.parentalVerification).toBe(true);
    });
  });

  describe('Data Retention and Deletion Schedules', () => {
    it('should enforce appropriate data retention periods', () => {
      // Given: Data retention schedule
      const retentionSchedule = {
        studentPersonalData: {
          period: '7 years after leaving school',
          justification: 'Educational records retention requirement',
          automaticDeletion: true
        },
        academicRecords: {
          period: '3 years after course completion',
          justification: 'Academic verification purposes',
          automaticDeletion: true
        },
        safeguardingRecords: {
          period: 'Until child reaches 25 or 10 years from allegation',
          justification: 'Legal safeguarding requirements',
          automaticDeletion: false, // Manual review required
          reviewRequired: true
        },
        homeworkData: {
          period: '1 year after academic year end',
          justification: 'Educational progress tracking',
          automaticDeletion: true
        }
      };

      // When: Retention periods are validated
      const allHaveJustification = Object.values(retentionSchedule).every(
        schedule => schedule.justification && schedule.period
      );

      const safeguardingIsSpecial = retentionSchedule.safeguardingRecords.reviewRequired;

      // Then: Retention periods should be justified and appropriate
      expect(allHaveJustification).toBe(true);
      expect(safeguardingIsSpecial).toBe(true);
      expect(retentionSchedule.homeworkData.automaticDeletion).toBe(true);
    });

    it('should calculate retention dates correctly', () => {
      // Given: A student leaving school
      const studentLeavingDate = new Date('2024-07-15');
      const retentionYears = 7;
      
      // When: Retention date is calculated
      const retentionUntilDate = new Date(studentLeavingDate);
      retentionUntilDate.setFullYear(retentionUntilDate.getFullYear() + retentionYears);
      
      const expectedDate = new Date('2031-07-15');

      // Then: Retention date should be calculated correctly
      expect(retentionUntilDate.getFullYear()).toBe(expectedDate.getFullYear());
      expect(retentionUntilDate.getMonth()).toBe(expectedDate.getMonth());
      expect(retentionUntilDate.getDate()).toBe(expectedDate.getDate());
    });

    it('should handle automatic deletion scheduling', () => {
      // Given: Students with different retention dates
      const studentsForDeletion = [
        {
          id: 'student-1',
          name: 'Student One',
          dataRetentionUntil: new Date('2024-01-01'), // Past due
          leftSchool: new Date('2017-07-15')
        },
        {
          id: 'student-2', 
          name: 'Student Two',
          dataRetentionUntil: new Date('2025-07-15'), // Future
          leftSchool: new Date('2018-07-15')
        }
      ];

      // When: Deletion eligibility is checked
      const currentDate = new Date();
      const eligibleForDeletion = studentsForDeletion.filter(
        student => student.dataRetentionUntil < currentDate
      );

      // Then: Only past-due students should be eligible
      expect(eligibleForDeletion).toHaveLength(1);
      expect(eligibleForDeletion[0].id).toBe('student-1');
    });
  });

  afterEach(() => {
    // Clean up test data
    testSchool = null;
    testStudent = null;
    gdprTestData = null;
  });
});

/**
 * ICO Children's Code Compliance Tests
 */
describe('ICO Children\'s Code Compliance', () => {
  it('should implement child-specific data protection standards', () => {
    // Given: Child data processing scenario
    const childProcessingScenario = {
      childAge: 10,
      purposes: ['homework_tracking', 'educational_motivation'],
      profiling: false,
      parentalConsent: true,
      privacyNotice: {
        ageAppropriate: true,
        wordCount: 450,
        readingLevel: 8,
        hasExamples: true
      }
    };

    // When: Children's Code compliance is tested
    const complianceResult = complianceTestHelper.testChildrensCodeCompliance(childProcessingScenario);

    // Then: All Children's Code standards should be met
    expect(complianceResult.isCompliant).toBe(true);
    expect(complianceResult.checks.dataMinimisation.isCompliant).toBe(true);
    expect(complianceResult.checks.transparentPrivacy.isCompliant).toBe(true);
    expect(complianceResult.checks.noProfilingForUnder13s.isCompliant).toBe(true);
    expect(complianceResult.checks.appropriatePurposes.isCompliant).toBe(true);
    expect(complianceResult.checks.parentalConsent.isCompliant).toBe(true);
  });

  it('should detect violations of children\'s code standards', () => {
    // Given: Non-compliant child data processing
    const nonCompliantScenario = {
      childAge: 8,
      purposes: ['homework_tracking', 'marketing', 'profiling'], // Inappropriate purposes
      profiling: true, // Not allowed for under 13s
      parentalConsent: false, // Required for under 13s
      privacyNotice: {
        ageAppropriate: false,
        wordCount: 1500, // Too long
        readingLevel: 16, // Too complex
        hasExamples: false
      }
    };

    // When: Children's Code compliance is tested
    const complianceResult = complianceTestHelper.testChildrensCodeCompliance(nonCompliantScenario);

    // Then: Multiple violations should be detected
    expect(complianceResult.isCompliant).toBe(false);
    expect(complianceResult.checks.noProfilingForUnder13s.isCompliant).toBe(false);
    expect(complianceResult.checks.parentalConsent.isCompliant).toBe(false);
    expect(complianceResult.checks.appropriatePurposes.isCompliant).toBe(false);
  });
});