import { PrismaClient } from "./generated";

const prisma = new PrismaClient();

// Simple password hashing (for demo only - use proper hashing in production)
function hashPassword(password: string): string {
  // This is just for demo - replace with proper bcrypt when utils package is available
  return `hashed_${password}`;
}

async function simpleSeed() {
  console.log("🌱 Starting simple database seed...");

  try {
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
    const adminUser = await prisma.user.upsert({
      where: { email: "admin@oakwood-primary.co.uk" },
      update: {},
      create: {
        email: "admin@oakwood-primary.co.uk",
        firstName: "Sarah",
        lastName: "Wilson",
        role: "SCHOOL_ADMIN",
        schoolId: demoSchool.id,
        passwordHash: hashPassword("Admin123!"),
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
    const teacher = await prisma.user.upsert({
      where: { email: "j.smith@oakwood-primary.co.uk" },
      update: {},
      create: {
        email: "j.smith@oakwood-primary.co.uk",
        firstName: "John",
        lastName: "Smith",
        role: "TEACHER",
        schoolId: demoSchool.id,
        passwordHash: hashPassword("Teacher123!"),
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

    // Create sample student
    const student = await prisma.user.upsert({
      where: { email: "emma.johnson@student.oakwood-primary.co.uk" },
      update: {},
      create: {
        email: "emma.johnson@student.oakwood-primary.co.uk",
        firstName: "Emma",
        lastName: "Johnson",
        role: "STUDENT",
        yearGroup: "YEAR_5",
        schoolId: demoSchool.id,
        dateOfBirth: new Date("2013-03-15"),
        parentEmail: "parent.johnson@gmail.com",
        consentGiven: true,
        parentalConsent: true,
        preferences: {
          notifications: true,
          emailDigest: false,
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

    console.log("✅ Created student and enrolled in class:", student.email);

    // Create sample homework
    const homework = await prisma.homework.create({
      data: {
        title: "Weekly Spelling Practice",
        description: "Practice your weekly spelling words using the look, cover, write, check method.",
        type: "SPELLING",
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Due in 7 days
        estimatedMinutes: 20,
        instructions: "1. Look at each word carefully\\n2. Cover the word\\n3. Write it from memory\\n4. Check your spelling\\n5. Repeat for each word 3 times",
        maxPoints: 10,
        isOptional: false,
        allowLateSubmission: true,
        schoolId: demoSchool.id,
        classId: year5Class.id,
        teacherId: teacher.id,
      },
    });

    console.log("✅ Created sample homework:", homework.title);

    console.log("🎉 Simple database seeding completed successfully!");
    console.log("\\n📊 Summary:");
    console.log(`- 1 school: ${demoSchool.name}`);
    console.log(`- 1 admin: ${adminUser.email}`);
    console.log(`- 1 teacher: ${teacher.email}`);
    console.log(`- 1 student: ${student.email}`);
    console.log(`- 1 class: ${year5Class.name}`);
    console.log(`- 1 homework assignment`);
    console.log("\\n🔐 Demo Credentials:");
    console.log("Admin: admin@oakwood-primary.co.uk / Admin123!");
    console.log("Teacher: j.smith@oakwood-primary.co.uk / Teacher123!");

  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run if executed directly
if (require.main === module) {
  simpleSeed();
}

export { simpleSeed };