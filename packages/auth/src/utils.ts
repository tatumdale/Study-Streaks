import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth/next";
import { authOptions } from "./config";
import { prisma } from "@study-streaks/database";

/**
 * Utility functions for authentication and authorization
 */

/**
 * Hash a password for storage
 */
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
}

/**
 * Verify a password against a hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Get the current authenticated session
 */
export async function getAuthSession() {
  return await getServerSession(authOptions);
}

/**
 * Get the current user with full profile information
 */
export async function getCurrentUser() {
  const session = await getAuthSession();
  
  if (!session?.user?.id) {
    return null;
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        school: true,
        teacher: {
          include: {
            teacherClasses: {
              include: {
                class: true
              }
            }
          }
        },
        student: {
          include: {
            class: true,
            parentStudents: {
              include: {
                parent: true
              }
            }
          }
        },
        parent: {
          include: {
            parentStudents: {
              include: {
                student: {
                  include: {
                    class: true
                  }
                }
              }
            }
          }
        },
        schoolAdmin: true,
        userRoles: {
          include: {
            role: {
              include: {
                permissions: {
                  include: {
                    permission: true
                  }
                }
              }
            }
          }
        }
      }
    });

    return user;
  } catch (error) {
    console.error("Error fetching current user:", error);
    return null;
  }
}

/**
 * Check if user has a specific permission
 */
export function hasPermission(
  userPermissions: any[],
  resource: string,
  action: string,
  scope?: string
): boolean {
  return userPermissions.some(permission => 
    permission.resource === resource &&
    permission.action === action &&
    (!scope || permission.scope === scope || permission.scope === "all")
  );
}

/**
 * Check if user can access a specific school resource
 */
export function canAccessSchool(userSchoolId: string, resourceSchoolId: string): boolean {
  return userSchoolId === resourceSchoolId;
}

/**
 * Check if user can access a specific class
 */
export function canAccessClass(
  userRoles: any[],
  classId: string,
  userType: string
): boolean {
  // Super admins can access everything
  if (userRoles.some(role => role.scope === "PLATFORM")) {
    return true;
  }

  // School-wide access
  if (userRoles.some(role => role.scope === "SCHOOL")) {
    return true;
  }

  // Class-specific access
  return userRoles.some(role => 
    role.scope === "CLASS" && 
    (role.classIds.length === 0 || role.classIds.includes(classId))
  );
}

/**
 * Check if user can access a specific student
 */
export function canAccessStudent(
  userRoles: any[],
  studentId: string,
  userType: string
): boolean {
  // Super admins can access everything
  if (userRoles.some(role => role.scope === "PLATFORM")) {
    return true;
  }

  // School-wide access
  if (userRoles.some(role => role.scope === "SCHOOL")) {
    return true;
  }

  // Parent accessing their own children
  if (userType === "parent") {
    return userRoles.some(role => 
      role.studentIds.includes(studentId)
    );
  }

  // Teachers accessing students in their classes
  if (userType === "teacher") {
    // This would need to be enhanced with actual class-student relationships
    return true; // Simplified for now
  }

  return false;
}

/**
 * Create a new user account with proper hashing
 */
export async function createUserAccount(
  email: string,
  password: string,
  schoolId: string,
  userType: "teacher" | "parent" | "schoolAdmin",
  profileData: any
) {
  const hashedPassword = await hashPassword(password);
  
  return await prisma.$transaction(async (tx) => {
    // Create base user
    const user = await tx.user.create({
      data: {
        email: email.toLowerCase().trim(),
        passwordHash: hashedPassword,
        schoolId,
        isActive: true,
      }
    });

    // Create specific profile
    switch (userType) {
      case "teacher":
        await tx.teacher.create({
          data: {
            ...profileData,
            userId: user.id,
            schoolId,
          }
        });
        break;
        
      case "parent":
        await tx.parent.create({
          data: {
            ...profileData,
            userId: user.id,
            schoolId,
            email: email.toLowerCase().trim(),
          }
        });
        break;
        
      case "schoolAdmin":
        await tx.schoolAdmin.create({
          data: {
            ...profileData,
            userId: user.id,
            schoolId,
          }
        });
        break;
    }

    return user;
  });
}

/**
 * Generate a secure random password
 */
export function generateSecurePassword(length: number = 12): string {
  const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lowercase = "abcdefghijklmnopqrstuvwxyz";
  const numbers = "0123456789";
  const symbols = "!@#$%^&*";
  
  const allChars = uppercase + lowercase + numbers + symbols;
  
  let password = "";
  
  // Ensure at least one character from each category
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += symbols[Math.floor(Math.random() * symbols.length)];
  
  // Fill the rest randomly
  for (let i = 4; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }
  
  // Shuffle the password
  return password.split('').sort(() => Math.random() - 0.5).join('');
}

/**
 * Validate password strength
 */
export function validatePasswordStrength(password: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push("Password must be at least 8 characters long");
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter");
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push("Password must contain at least one number");
  }
  
  if (!/[!@#$%^&*]/.test(password)) {
    errors.push("Password must contain at least one special character (!@#$%^&*)");
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}