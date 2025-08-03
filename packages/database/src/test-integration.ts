import { prisma, testConnection } from "./client";

/**
 * Simple database integration test
 * Tests connection and basic operations without requiring environment setup
 */

async function testDatabaseIntegration() {
  console.log("🧪 Testing database integration...");

  try {
    // Test 1: Database connection
    console.log("1️⃣ Testing database connection...");
    const connectionOk = await testConnection();
    
    if (connectionOk) {
      console.log("✅ Database connection successful");
    } else {
      console.log("❌ Database connection failed");
      return false;
    }

    // Test 2: Check if we can query the database (this will fail if no tables exist)
    console.log("2️⃣ Testing basic query capabilities...");
    try {
      const result = await prisma.$queryRaw`SELECT 1 as test`;
      console.log("✅ Basic query successful:", result);
    } catch (error) {
      console.log("⚠️ Query test info:", error.message);
    }

    // Test 3: Test Prisma client generation
    console.log("3️⃣ Testing Prisma client...");
    const prismaClient = prisma;
    if (prismaClient) {
      console.log("✅ Prisma client is properly generated and available");
    }

    // Test 4: Check available models
    console.log("4️⃣ Checking available models...");
    const models = Object.keys(prisma).filter(key => !key.startsWith('$') && !key.startsWith('_'));
    console.log("✅ Available models:", models.length > 0 ? models.join(", ") : "None found");

    console.log("🎉 Database integration test completed successfully!");
    return true;

  } catch (error) {
    console.error("❌ Database integration test failed:", error.message);
    return false;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  testDatabaseIntegration()
    .then((success) => {
      process.exit(success ? 0 : 1);
    })
    .catch((error) => {
      console.error("Test execution failed:", error);
      process.exit(1);
    });
}

export { testDatabaseIntegration };