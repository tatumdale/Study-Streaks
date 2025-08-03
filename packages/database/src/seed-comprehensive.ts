import { PrismaClient } from "./generated";

const prisma = new PrismaClient();

// Simple password hashing (for demo only - use proper hashing when utils package is available)
function hashPassword(password: string): string {
  // This is just for demo - replace with proper bcrypt when utils package is available
  return `hashed_${password}`;
}

async function comprehensiveSeed() {
  console.log("🌱 Starting comprehensive UK educational system seed...");

  try {
    // Create demo UK school with proper identifiers
    const demoSchool = await prisma.school.upsert({
      where: { email: "admin@weobley-primary.co.uk" },
      update: {},
      create: {
        name: "Weobley CE Primary School",
        urn: "116843", // Real URN format
        dfeNumber: "8843216", // Real DfE number format
        address: "Bell Square, Weobley",
        postcode: "HR4 8SN",
        phone: "01544 318409",
        email: "admin@weobley-primary.co.uk",
        website: "https://weobley-primary.co.uk",
        schoolType: "PRIMARY",
        minYearGroup: 0, // Reception
        maxYearGroup: 6, // Year 6
        settings: {
          allowParentAccess: true,
          enableGamification: true,
          requireHomeworkApproval: false,
          maxHomeworksPerDay: 3,
          academeicYear: "2024-2025",
          houseSystem: {
            enabled: true,
            houses: ["Red Dragons", "Blue Dolphins", "Green Eagles", "Yellow Lions"]
          }
        },
      },
    });

    console.log("✅ Created demo school:", demoSchool.name);

    // Create Head Teacher (School Admin)
    const headTeacherUser = await prisma.user.create({
      data: {
        email: "head@weobley-primary.co.uk",
        passwordHash: hashPassword("Head123!"),
        schoolId: demoSchool.id,
        isActive: true,
      },
    });

    const headTeacher = await prisma.teacher.create({
      data: {
        userId: headTeacherUser.id,
        schoolId: demoSchool.id,
        employeeId: "T001",
        title: "Mrs",
        firstName: "Sarah",
        lastName: "Johnson",
        displayName: "Mrs. Johnson",
        teacherType: "HEAD_TEACHER",
        isHeadTeacher: true,
        isDSL: true, // Head teachers are often DSL
        subjects: ["Leadership", "Mathematics"],
        yearGroups: [0, 1, 2, 3, 4, 5, 6], // All year groups
        startDate: new Date("2020-09-01"),
        contractType: "PERMANENT",
        schoolEmail: "head@weobley-primary.co.uk",
        phoneExtension: "101",
        dbsCheckDate: new Date("2024-01-15"),
        dbsCheckNumber: "001234567890",
        safeguardingTraining: new Date("2024-09-01"),
      },
    });

    console.log("✅ Created head teacher:", headTeacher.displayName);

    // Create Class Teacher
    const classTeacherUser = await prisma.user.create({
      data: {
        email: "m.williams@weobley-primary.co.uk",
        passwordHash: hashPassword("Teacher123!"),
        schoolId: demoSchool.id,
        isActive: true,
      },
    });

    const classTeacher = await prisma.teacher.create({
      data: {
        userId: classTeacherUser.id,
        schoolId: demoSchool.id,
        employeeId: "T002",
        title: "Miss",
        firstName: "Emma",
        lastName: "Williams",
        displayName: "Miss Williams",
        teacherType: "CLASS_TEACHER",
        subjects: ["English", "Science", "Art"],
        yearGroups: [4, 5], // Year 4 and 5
        startDate: new Date("2022-09-01"),
        contractType: "PERMANENT",
        schoolEmail: "m.williams@weobley-primary.co.uk",
        phoneExtension: "104",
        dbsCheckDate: new Date("2024-02-20"),
        dbsCheckNumber: "001234567891",
        safeguardingTraining: new Date("2024-09-01"),
      },
    });

    console.log("✅ Created class teacher:", classTeacher.displayName);

    // Create School Admin (Non-teaching)
    const adminUser = await prisma.user.create({
      data: {
        email: "admin@weobley-primary.co.uk",
        passwordHash: hashPassword("Admin123!"),
        schoolId: demoSchool.id,
        isActive: true,
      },
    });

    const schoolAdmin = await prisma.schoolAdmin.create({
      data: {
        userId: adminUser.id,
        schoolId: demoSchool.id,
        firstName: "Janet",
        lastName: "Smith",
        jobTitle: "School Business Manager",
        adminLevel: "OFFICE_ADMIN",
        canManageUsers: false,
        canManageClasses: false,
        canManageClubs: false,
        canViewAnalytics: true,
        canManageSettings: false,
        canExportData: false,
      },
    });

    console.log("✅ Created school admin:", schoolAdmin.firstName, schoolAdmin.lastName);

    // Create Year 5 class
    const year5Class = await prisma.class.create({
      data: {
        schoolId: demoSchool.id,
        name: "5W",
        displayName: "Year 5 Wizards",
        yearGroups: [5],
        keyStages: ["KS2"],
        classType: "FORM",
        academicYear: "2024-2025",
        houseGroup: "Blue Dolphins",
        houseColor: "#3B82F6",
        capacity: 30,
        classroom: "Classroom 5",
        clubsEnabled: true,
        leaderboardEnabled: true,
      },
    });

    console.log("✅ Created class:", year5Class.displayName);

    // Assign teacher to class
    await prisma.teacherClass.create({
      data: {
        schoolId: demoSchool.id,
        teacherId: classTeacher.id,
        classId: year5Class.id,
        role: "CLASS_TEACHER",
        isPrimaryTeacher: true,
        subjects: ["English", "Science", "Art"],
        timeAllocation: 80, // 80% of time
        canMarkHomework: true,
        canAssignClubs: true,
        canViewProgress: true,
        canContactParents: true,
      },
    });

    console.log("✅ Assigned teacher to class");

    // Create Year 4 class
    const year4Class = await prisma.class.create({
      data: {
        schoolId: demoSchool.id,
        name: "4J",
        displayName: "Year 4 Jaguars",
        yearGroups: [4],
        keyStages: ["KS2"],
        classType: "FORM",
        academicYear: "2024-2025",
        houseGroup: "Red Dragons",
        houseColor: "#EF4444",
        capacity: 28,
        classroom: "Classroom 4",
        clubsEnabled: true,
        leaderboardEnabled: true,
      },
    });

    // Create students with realistic UK data
    const students = [
      {
        firstName: "Oliver",
        lastName: "Thompson",
        preferredName: "Olly",
        dateOfBirth: new Date("2014-03-15"),
        pupilId: "S001",
        admissionNumber: "2014001",
        yearGroup: 5,
        classId: year5Class.id,
        houseGroup: "Blue Dolphins",
        upn: "H801200014001", // Real UPN format
        parentData: {
          motherFirstName: "Sarah",
          motherLastName: "Thompson",
          motherEmail: "sarah.thompson@gmail.com",
          fatherFirstName: "David",
          fatherLastName: "Thompson",
          fatherEmail: "david.thompson@outlook.com",
        },
      },
      {
        firstName: "Amelia",
        lastName: "Johnson",
        preferredName: "Amy",
        dateOfBirth: new Date("2014-07-22"),
        pupilId: "S002",
        admissionNumber: "2014002",
        yearGroup: 5,
        classId: year5Class.id,
        houseGroup: "Blue Dolphins",
        upn: "H801200014002",
        parentData: {
          motherFirstName: "Emma",
          motherLastName: "Johnson",
          motherEmail: "emma.johnson@hotmail.co.uk",
          fatherFirstName: "Michael",
          fatherLastName: "Johnson",
          fatherEmail: "mike.johnson@company.com",
        },
      },
      {
        firstName: "George",
        lastName: "Davies",
        dateOfBirth: new Date("2015-01-08"),
        pupilId: "S003",
        admissionNumber: "2015001",
        yearGroup: 4,
        classId: year4Class.id,
        houseGroup: "Red Dragons",
        upn: "H801200015001",
        sen: true,
        senCategory: "Dyslexia",
        parentData: {
          motherFirstName: "Lisa",
          motherLastName: "Davies",
          motherEmail: "lisa.davies@gmail.com",
        },
      },
      {
        firstName: "Isabella",
        lastName: "Wilson",
        preferredName: "Izzy",
        dateOfBirth: new Date("2014-05-30"),
        pupilId: "S004",
        admissionNumber: "2014003",
        yearGroup: 5,
        classId: year5Class.id,
        houseGroup: "Blue Dolphins",
        upn: "H801200014003",
        pupilPremium: true,
        parentData: {
          motherFirstName: "Rachel",
          motherLastName: "Wilson",
          motherEmail: "rachel.wilson@gmail.com",
          stepFatherFirstName: "James",
          stepFatherLastName: "Brown",
          stepFatherEmail: "james.brown@email.com",
        },
      },
      {
        firstName: "Freddie",
        lastName: "Taylor",
        dateOfBirth: new Date("2015-09-12"),
        pupilId: "S005",
        admissionNumber: "2015002",
        yearGroup: 4,
        classId: year4Class.id,
        houseGroup: "Red Dragons",
        upn: "H801200015002",
        englishAsAdditional: true,
        parentData: {
          motherFirstName: "Maria",
          motherLastName: "Taylor",
          motherEmail: "maria.taylor@gmail.com",
          fatherFirstName: "Antonio",
          fatherLastName: "Garcia",
          fatherEmail: "antonio.garcia@gmail.com",
        },
      },
    ];

    const createdStudents = [];
    for (const studentData of students) {
      // Calculate GDPR retention date (7 years after leaving)
      const anticipatedLeavingDate = new Date("2032-07-31"); // End of Year 6
      const dataRetentionDate = new Date(anticipatedLeavingDate);
      dataRetentionDate.setFullYear(dataRetentionDate.getFullYear() + 7);

      // Create student user account (optional for primary age)
      const studentUser = studentData.yearGroup >= 5 ? await prisma.user.create({
        data: {
          email: `${studentData.firstName.toLowerCase()}.${studentData.lastName.toLowerCase()}@student.weobley-primary.co.uk`,
          schoolId: demoSchool.id,
          isActive: true,
        },
      }) : null;

      const student = await prisma.student.create({
        data: {
          schoolId: demoSchool.id,
          userId: studentUser?.id,
          firstName: studentData.firstName,
          lastName: studentData.lastName,
          preferredName: studentData.preferredName,
          dateOfBirth: studentData.dateOfBirth,
          pupilId: studentData.pupilId,
          admissionNumber: studentData.admissionNumber,
          yearGroup: studentData.yearGroup,
          classId: studentData.classId,
          admissionDate: new Date("2021-09-01"), // Most started in Reception
          upn: studentData.upn,
          sen: studentData.sen || false,
          senCategory: studentData.senCategory,
          pupilPremium: studentData.pupilPremium || false,
          englishAsAdditional: studentData.englishAsAdditional || false,
          houseGroup: studentData.houseGroup,
          dataRetentionUntil: dataRetentionDate,
          consentGiven: true,
          consentGivenBy: "mother",
          consentDate: new Date("2021-08-15"),
        },
      });

      createdStudents.push(student);

      // Create parent accounts and relationships
      const { parentData } = studentData;

      // Create mother
      if (parentData.motherFirstName) {
        const motherUser = await prisma.user.create({
          data: {
            email: parentData.motherEmail!,
            passwordHash: hashPassword("Parent123!"),
            schoolId: demoSchool.id,
            isActive: true,
          },
        });

        const mother = await prisma.parent.create({
          data: {
            schoolId: demoSchool.id,
            userId: motherUser.id,
            title: "Mrs",
            firstName: parentData.motherFirstName,
            lastName: parentData.motherLastName || studentData.lastName,
            email: parentData.motherEmail!,
            mobilePhone: "07700 900123",
            addressLine1: "123 Example Street",
            town: "Weobley",
            county: "Herefordshire",
            postcode: "HR4 8SN",
            preferredContact: "EMAIL",
            canCollectChild: true,
            canConsentToTrips: true,
            canAccessOnlineInfo: true,
          },
        });

        await prisma.parentStudent.create({
          data: {
            schoolId: demoSchool.id,
            parentId: mother.id,
            studentId: student.id,
            relationshipType: "MOTHER",
            isPrimaryContact: true,
            hasParentalResponsibility: true,
            canGiveConsent: true,
            receivesReports: true,
            receivesNotifications: true,
          },
        });
      }

      // Create father or step-father
      if (parentData.fatherFirstName || parentData.stepFatherFirstName) {
        const fatherFirstName = parentData.fatherFirstName || parentData.stepFatherFirstName!;
        const fatherLastName = parentData.fatherLastName || parentData.stepFatherLastName || studentData.lastName;
        const fatherEmail = parentData.fatherEmail || parentData.stepFatherEmail!;
        const relationshipType = parentData.fatherFirstName ? "FATHER" : "STEP_FATHER";

        const fatherUser = await prisma.user.create({
          data: {
            email: fatherEmail,
            passwordHash: hashPassword("Parent123!"),
            schoolId: demoSchool.id,
            isActive: true,
          },
        });

        const father = await prisma.parent.create({
          data: {
            schoolId: demoSchool.id,
            userId: fatherUser.id,
            title: "Mr",
            firstName: fatherFirstName,
            lastName: fatherLastName,
            email: fatherEmail,
            mobilePhone: "07700 900124",
            addressLine1: "123 Example Street",
            town: "Weobley",
            county: "Herefordshire",
            postcode: "HR4 8SN",
            preferredContact: "SMS",
            canCollectChild: true,
            canConsentToTrips: parentData.fatherFirstName ? true : false, // Step-fathers may have limited rights
            canAccessOnlineInfo: true,
          },
        });

        await prisma.parentStudent.create({
          data: {
            schoolId: demoSchool.id,
            parentId: father.id,
            studentId: student.id,
            relationshipType: relationshipType as any,
            isPrimaryContact: false,
            hasParentalResponsibility: parentData.fatherFirstName ? true : false,
            canGiveConsent: parentData.fatherFirstName ? true : false,
            receivesReports: true,
            receivesNotifications: true,
          },
        });
      }
    }

    console.log(`✅ Created ${createdStudents.length} students with family relationships`);

    // Create UK subject-based clubs
    const clubs = [
      {
        name: "Number Club",
        description: "Daily mathematics practice with progressive difficulty levels",
        clubType: "NUMBER",
        subject: "Mathematics",
        ageGroups: [3, 4, 5, 6],
        keyStages: ["KS2"],
        evidenceType: "PHOTO",
        color: "#10B981",
        iconUrl: "/icons/calculator.svg",
      },
      {
        name: "Reading Club",
        description: "Daily reading to build fluency and foster love of books",
        clubType: "READING",
        subject: "English",
        ageGroups: [0, 1, 2, 3, 4, 5, 6],
        keyStages: ["EYFS", "KS1", "KS2"],
        evidenceType: "READING_LOG",
        parentInvolvement: true,
        color: "#3B82F6",
        iconUrl: "/icons/book.svg",
      },
      {
        name: "Spelling Club",
        description: "Weekly spelling practice with look, cover, write, check method",
        clubType: "SPELLING",
        subject: "English",
        ageGroups: [2, 3, 4, 5, 6],
        keyStages: ["KS1", "KS2"],
        evidenceType: "WRITTEN_WORK",
        color: "#8B5CF6",
        iconUrl: "/icons/pencil.svg",
      },
      {
        name: "Science Investigation Club",
        description: "Hands-on science experiments and investigations",
        clubType: "SCIENCE",
        subject: "Science",
        ageGroups: [3, 4, 5, 6],
        keyStages: ["KS2"],
        evidenceType: "PHOTO",
        color: "#F59E0B",
        iconUrl: "/icons/beaker.svg",
      },
    ];

    for (const clubData of clubs) {
      await prisma.club.create({
        data: {
          ...clubData,
          schoolId: demoSchool.id,
          createdBy: headTeacher.id,
          isActive: true,
          hasLevels: true,
          levelNaming: `${clubData.name} Level {level}`,
          logbookRequired: clubData.evidenceType === "READING_LOG",
          maxBuddyMembers: 4,
          buddyGroupsEnabled: true,
          xpPerCompletion: 10,
          streakEnabled: true,
        },
      });
    }

    console.log(`✅ Created ${clubs.length} UK subject-based clubs`);

    // Create some sample homework completions
    const numberClub = await prisma.club.findFirst({
      where: { name: "Number Club", schoolId: demoSchool.id },
    });

    const readingClub = await prisma.club.findFirst({
      where: { name: "Reading Club", schoolId: demoSchool.id },
    });

    if (numberClub && readingClub) {
      // Create homework completions for the last week
      for (let i = 0; i < 7; i++) {
        const completionDate = new Date();
        completionDate.setDate(completionDate.getDate() - i);

        // Oliver does number club daily
        await prisma.homeworkCompletion.create({
          data: {
            schoolId: demoSchool.id,
            studentId: createdStudents[0].id, // Oliver
            clubId: numberClub.id,
            completionDate,
            evidenceType: "PHOTO",
            evidenceUrl: `/uploads/math_${i}.jpg`,
            notes: "Completed 10 multiplication questions correctly",
            timeSpentMinutes: 15,
            isVerified: i < 3, // Teacher verified recent ones
            verifiedBy: i < 3 ? classTeacher.id : undefined,
            verifiedAt: i < 3 ? new Date() : undefined,
          },
        });

        // Amelia does reading club most days
        if (i < 5) {
          await prisma.homeworkCompletion.create({
            data: {
              schoolId: demoSchool.id,
              studentId: createdStudents[1].id, // Amelia
              clubId: readingClub.id,
              completionDate,
              evidenceType: "READING_LOG",
              notes: `Read "${i === 0 ? 'Charlotte\'s Web' : 'The Magic Faraway Tree'}" for 20 minutes`,
              parentNotes: "Enjoyed the story and asked good questions",
              timeSpentMinutes: 20,
              isVerified: true,
              verifiedBy: classTeacher.id,
              verifiedAt: new Date(),
            },
          });
        }
      }
    }

    console.log("✅ Created sample homework completions");

    console.log("🎉 Comprehensive UK educational system seeding completed!");
    console.log("\\n📊 Summary:");
    console.log(`- 1 UK primary school: ${demoSchool.name}`);
    console.log(`- 1 head teacher: ${headTeacher.displayName}`);
    console.log(`- 1 class teacher: ${classTeacher.displayName}`);
    console.log(`- 1 school admin: ${schoolAdmin.firstName} ${schoolAdmin.lastName}`);
    console.log(`- ${createdStudents.length} students with realistic family structures`);
    console.log(`- 2 classes: Year 4 and Year 5`);
    console.log(`- ${clubs.length} UK curriculum-based clubs`);
    console.log(`- Sample homework completions with evidence`);
    console.log("\\n🔐 Demo Login Credentials:");
    console.log("Head Teacher: head@weobley-primary.co.uk / Head123!");
    console.log("Class Teacher: m.williams@weobley-primary.co.uk / Teacher123!");
    console.log("School Admin: admin@weobley-primary.co.uk / Admin123!");
    console.log("Parent (Oliver's mum): sarah.thompson@gmail.com / Parent123!");
    console.log("\\n🇬🇧 UK Educational Features:");
    console.log("- Proper URN and DfE numbers");
    console.log("- Key Stage alignment (EYFS, KS1, KS2)");
    console.log("- House system (Dragons, Dolphins, Eagles, Lions)");
    console.log("- GDPR-compliant data retention (7 years post-leaving)");
    console.log("- Complex family relationships (step-parents, custody)");
    console.log("- SEN and Pupil Premium tracking");
    console.log("- UK curriculum subjects and evidence types");

  } catch (error) {
    console.error("❌ Comprehensive seeding failed:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run if executed directly
if (require.main === module) {
  comprehensiveSeed();
}

export { comprehensiveSeed };