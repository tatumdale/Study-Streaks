import { PrismaClient } from "./generated";

const prisma = new PrismaClient();

/**
 * Test basic CRUD operations on the database
 */
async function testCrudOperations() {
  console.log("🧪 Testing CRUD operations...");

  try {
    // Test 1: Create a school
    console.log("1️⃣ Testing CREATE operation...");
    const testSchool = await prisma.school.create({
      data: {
        name: "Test Primary School",
        address: "123 Test Street",
        postcode: "TS1 2AB",
        phone: "01234 567890",
        email: "test@school.co.uk",
        settings: {
          allowParentAccess: true,
          enableGamification: true,
        },
      },
    });
    console.log("✅ Created school:", testSchool.name);

    // Test 2: Read the school
    console.log("2️⃣ Testing READ operation...");
    const foundSchool = await prisma.school.findUnique({
      where: { id: testSchool.id },
    });
    console.log("✅ Found school:", foundSchool?.name);

    // Test 3: Update the school
    console.log("3️⃣ Testing UPDATE operation...");
    const updatedSchool = await prisma.school.update({
      where: { id: testSchool.id },
      data: {
        website: "https://test-school.co.uk",
      },
    });
    console.log("✅ Updated school website:", updatedSchool.website);

    // Test 4: Create a user for the school
    console.log("4️⃣ Testing relational CREATE...");
    const testUser = await prisma.user.create({
      data: {
        email: "test@teacher.co.uk",
        firstName: "Test",
        lastName: "Teacher",
        role: "TEACHER",
        schoolId: testSchool.id,
        consentGiven: true,
      },
    });
    console.log("✅ Created user:", testUser.email);

    // Test 5: Query with relationships
    console.log("5️⃣ Testing relational READ...");
    const schoolWithUsers = await prisma.school.findUnique({
      where: { id: testSchool.id },
      include: {
        users: true,
      },
    });
    console.log("✅ School with users:", {
      school: schoolWithUsers?.name,
      userCount: schoolWithUsers?.users.length,
    });

    // Test 6: Delete operations
    console.log("6️⃣ Testing DELETE operations...");
    await prisma.user.delete({
      where: { id: testUser.id },
    });
    console.log("✅ Deleted user");

    await prisma.school.delete({
      where: { id: testSchool.id },
    });
    console.log("✅ Deleted school");

    console.log("🎉 All CRUD operations completed successfully!");
    return true;

  } catch (error) {
    console.error("❌ CRUD test failed:", error.message);
    return false;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  testCrudOperations()
    .then((success) => {
      process.exit(success ? 0 : 1);
    })
    .catch((error) => {
      console.error("Test execution failed:", error);
      process.exit(1);
    });
}

export { testCrudOperations };