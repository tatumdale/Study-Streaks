import { PrismaClient } from "./generated";
import { hashPassword } from "@study-streaks/utils";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seed...");

  // Create a demo school
  const demoSchool = await prisma.school.upsert({
    where: { email: "admin@oakwood-primary.co.uk" },
    update: {},
    create: {
      name: "Oakwood Primary School",
      address: "123 Oak Street, Oakwood",
      postcode: "OW1 2AB",
      phone: "01234 567890",
      email: "admin@oakwood-primary.co.uk",
      website: "https://oakwood-primary.co.uk",
      settings: {
        allowParentAccess: true,
        enableGamification: true,
        requireHomeworkApproval: false,
        maxHomeworksPerDay: 3,
      },
    },
  });

  console.log("✅ Created demo school:", demoSchool.name);

  // Create admin user
  const adminPassword = await hashPassword("Admin123!");
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@oakwood-primary.co.uk" },
    update: {},
    create: {
      email: "admin@oakwood-primary.co.uk",
      firstName: "Sarah",
      lastName: "Wilson",
      role: "SCHOOL_ADMIN",
      schoolId: demoSchool.id,
      passwordHash: adminPassword,
      consentGiven: true,
      preferences: {
        notifications: true,
        emailDigest: true,
        darkMode: false,
        language: "en",
      },
    },
  });

  console.log("✅ Created admin user:", adminUser.email);

  // Create teacher
  const teacherPassword = await hashPassword("Teacher123!");
  const teacher = await prisma.user.upsert({
    where: { email: "j.smith@oakwood-primary.co.uk" },
    update: {},
    create: {
      email: "j.smith@oakwood-primary.co.uk",
      firstName: "John",
      lastName: "Smith",
      role: "TEACHER",
      schoolId: demoSchool.id,
      passwordHash: teacherPassword,
      consentGiven: true,
      bio: "Year 5 class teacher with 10 years of experience in primary education.",
      preferences: {
        notifications: true,
        emailDigest: true,
        darkMode: false,
        language: "en",
      },
    },
  });

  console.log("✅ Created teacher:", teacher.email);

  // Create Year 5 class
  const year5Class = await prisma.class.upsert({
    where: { id: "demo-year5-class" },
    update: {},
    create: {
      id: "demo-year5-class",
      name: "Year 5 Dolphins",
      yearGroup: "YEAR_5",
      description: "Year 5 class with focus on preparing for Year 6 SATs",
      maxStudents: 30,
      schoolId: demoSchool.id,
      teacherId: teacher.id,
      settings: {
        allowStudentCommunication: true,
        enableBuddySystem: true,
        requireParentNotifications: true,
      },
    },
  });

  console.log("✅ Created class:", year5Class.name);

  // Create demo students
  const students = [
    {
      firstName: "Emma",
      lastName: "Johnson",
      email: "emma.johnson@student.oakwood-primary.co.uk",
      dateOfBirth: new Date("2013-03-15"),
      parentEmail: "parent.johnson@gmail.com",
    },
    {
      firstName: "Oliver",
      lastName: "Brown",
      email: "oliver.brown@student.oakwood-primary.co.uk",
      dateOfBirth: new Date("2013-07-22"),
      parentEmail: "parent.brown@gmail.com",
    },
    {
      firstName: "Sophie",
      lastName: "Davis",
      email: "sophie.davis@student.oakwood-primary.co.uk",
      dateOfBirth: new Date("2013-01-08"),
      parentEmail: "parent.davis@gmail.com",
    },
    {
      firstName: "Harry",
      lastName: "Wilson",
      email: "harry.wilson@student.oakwood-primary.co.uk",
      dateOfBirth: new Date("2013-05-30"),
      parentEmail: "parent.wilson@gmail.com",
    },
    {
      firstName: "Lily",
      lastName: "Taylor",
      email: "lily.taylor@student.oakwood-primary.co.uk",
      dateOfBirth: new Date("2013-09-12"),
      parentEmail: "parent.taylor@gmail.com",
    },
  ];

  const createdStudents = [];
  for (const studentData of students) {
    const student = await prisma.user.upsert({
      where: { email: studentData.email },
      update: {},
      create: {
        ...studentData,
        role: "STUDENT",
        yearGroup: "YEAR_5",
        schoolId: demoSchool.id,
        consentGiven: true,
        parentalConsent: true, // All students are under 16
        preferences: {
          notifications: true,
          emailDigest: false, // Parents manage email preferences
          darkMode: false,
          language: "en",
        },
      },
    });

    // Add student to class
    await prisma.classStudent.upsert({
      where: {
        classId_studentId: {
          classId: year5Class.id,
          studentId: student.id,
        },
      },
      update: {},
      create: {
        classId: year5Class.id,
        studentId: student.id,
        isActive: true,
      },
    });

    createdStudents.push(student);
  }

  console.log(`✅ Created ${createdStudents.length} students and enrolled them in class`);

  // Create sample homework
  const homework = await prisma.homework.create({
    data: {
      title: "Weekly Spelling Practice",
      description: "Practice your weekly spelling words using the look, cover, write, check method.",
      type: "SPELLING",
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Due in 7 days
      estimatedMinutes: 20,
      instructions: "1. Look at each word carefully\n2. Cover the word\n3. Write it from memory\n4. Check your spelling\n5. Repeat for each word 3 times",
      maxPoints: 10,
      isOptional: false,
      allowLateSubmission: true,
      schoolId: demoSchool.id,
      classId: year5Class.id,
      teacherId: teacher.id,
    },
  });

  console.log("✅ Created sample homework:", homework.title);

  // Create sample homework submission
  await prisma.homeworkSubmission.create({
    data: {
      content: "I have practiced all my spelling words using the look, cover, write, check method. I found 'necessary' and 'environment' challenging but got them right after practice.",
      timeSpentMinutes: 25,
      isLate: false,
      status: "SUBMITTED",
      homeworkId: homework.id,
      studentId: createdStudents[0].id, // Emma's submission
    },
  });

  console.log("✅ Created sample homework submission");

  // Create initial streaks for students
  for (const student of createdStudents.slice(0, 3)) {
    await prisma.streak.create({
      data: {
        type: "HOMEWORK",
        currentStreak: Math.floor(Math.random() * 10) + 1,
        longestStreak: Math.floor(Math.random() * 15) + 5,
        lastActivityDate: new Date(),
        streakStartDate: new Date(Date.now() - Math.random() * 10 * 24 * 60 * 60 * 1000),
        status: "ACTIVE",
        studentId: student.id,
      },
    });
  }

  console.log("✅ Created sample streaks for students");

  // Create school badges
  const badges = [
    {
      name: "First Steps",
      description: "Complete your first homework assignment",
      iconUrl: "/badges/first-steps.svg",
      criteria: {
        type: "homework_count",
        threshold: 1,
      },
      rarity: "COMMON",
      points: 10,
    },
    {
      name: "Week Warrior",
      description: "Maintain a 7-day homework streak",
      iconUrl: "/badges/week-warrior.svg",
      criteria: {
        type: "streak",
        threshold: 7,
        timeframe: "week",
      },
      rarity: "UNCOMMON",
      points: 25,
    },
    {
      name: "Speed Reader",
      description: "Complete 10 reading assignments",
      iconUrl: "/badges/speed-reader.svg",
      criteria: {
        type: "homework_count",
        threshold: 10,
      },
      rarity: "RARE",
      points: 50,
    },
  ] as const;

  for (const badgeData of badges) {
    await prisma.badge.upsert({
      where: { 
        schoolId_name: {
          schoolId: demoSchool.id,
          name: badgeData.name,
        },
      },
      update: {},
      create: {
        ...badgeData,
        schoolId: demoSchool.id,
        criteria: badgeData.criteria as any,
      },
    });
  }

  console.log("✅ Created school badges");

  // Create sample announcement
  await prisma.announcement.create({
    data: {
      title: "Welcome to StudyStreaks!",
      content: "We're excited to introduce our new homework tracking system. Students can now track their progress, earn badges, and maintain study streaks!",
      priority: "MEDIUM",
      publishedAt: new Date(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Expires in 30 days
      schoolId: demoSchool.id,
      classId: year5Class.id,
      authorId: teacher.id,
    },
  });

  console.log("✅ Created sample announcement");

  // Create sample analytics events
  const events = [
    "homework_submitted",
    "homework_viewed",
    "streak_updated",
    "badge_earned",
    "login",
  ];

  for (let i = 0; i < 50; i++) {
    await prisma.analyticsEvent.create({
      data: {
        event: events[Math.floor(Math.random() * events.length)],
        userId: createdStudents[Math.floor(Math.random() * createdStudents.length)].id,
        properties: {
          homework_type: Math.random() > 0.5 ? "SPELLING" : "READING",
          streak_length: Math.floor(Math.random() * 20),
        } as any,
        timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
      },
    });
  }

  console.log("✅ Created sample analytics events");

  console.log("🎉 Database seeding completed successfully!");
  console.log("\n📊 Summary:");
  console.log(`- 1 school created: ${demoSchool.name}`);
  console.log(`- 1 admin user: ${adminUser.email}`);
  console.log(`- 1 teacher: ${teacher.email}`);
  console.log(`- ${createdStudents.length} students enrolled`);
  console.log(`- 1 class: ${year5Class.name}`);
  console.log(`- 1 homework assignment with 1 submission`);
  console.log(`- 3 badges available`);
  console.log(`- Sample streaks and analytics data`);
  console.log("\n🔐 Login Credentials:");
  console.log("Admin: admin@oakwood-primary.co.uk / Admin123!");
  console.log("Teacher: j.smith@oakwood-primary.co.uk / Teacher123!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });