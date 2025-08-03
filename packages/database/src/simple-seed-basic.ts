import { PrismaClient } from "./generated";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 12);
}

async function main() {
  console.log("🌱 Starting basic database seed...");

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
      schoolId: demoSchool.id,
      passwordHash: adminPassword,
      isActive: true,
    },
  });

  console.log("✅ Created admin user:", adminUser.email);

  // Create SchoolAdmin profile for the admin user
  await prisma.schoolAdmin.upsert({
    where: { userId: adminUser.id },
    update: {},
    create: {
      userId: adminUser.id,
      schoolId: demoSchool.id,
      firstName: "Sarah",
      lastName: "Wilson",
      jobTitle: "Head Teacher",
      adminLevel: "SUPER_ADMIN",
      canManageUsers: true,
      canManageClasses: true,
      canManageClubs: true,
      canViewAnalytics: true,
      canManageSettings: true,
      canExportData: true,
    },
  });

  console.log("✅ Created admin profile");

  // Create teacher user
  const teacherPassword = await hashPassword("Teacher123!");
  const teacherUser = await prisma.user.upsert({
    where: { email: "j.smith@oakwood-primary.co.uk" },
    update: {},
    create: {
      email: "j.smith@oakwood-primary.co.uk",
      schoolId: demoSchool.id,
      passwordHash: teacherPassword,
      isActive: true,
    },
  });

  console.log("✅ Created teacher user:", teacherUser.email);

  // Create Teacher profile for the teacher user
  await prisma.teacher.upsert({
    where: { userId: teacherUser.id },
    update: {},
    create: {
      userId: teacherUser.id,
      schoolId: demoSchool.id,
      title: "Mr",
      firstName: "John",
      lastName: "Smith",
      displayName: "Mr. Smith",
      teacherType: "CLASS_TEACHER",
      subjects: ["Mathematics", "Science", "English"],
      yearGroups: [5],
      startDate: new Date("2020-09-01"),
      contractType: "PERMANENT",
      schoolEmail: "j.smith@oakwood-primary.co.uk",
    },
  });

  console.log("✅ Created teacher profile");

  console.log("🎉 Basic database seeding completed successfully!");
  console.log("\n📊 Summary:");
  console.log(`- 1 school created: ${demoSchool.name}`);
  console.log(`- 1 admin user: ${adminUser.email}`);
  console.log(`- 1 teacher: ${teacherUser.email}`);
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