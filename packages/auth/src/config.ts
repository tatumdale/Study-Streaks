import { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@study-streaks/database";
import { env } from "@study-streaks/config";
import bcrypt from "bcryptjs";

/**
 * NextAuth.js configuration for StudyStreaks multi-tenant platform
 * Supports school-based isolation and UK educational user types
 */
export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  
  providers: [
    CredentialsProvider({
      name: "StudyStreaks Login",
      credentials: {
        email: { 
          label: "Email", 
          type: "email", 
          placeholder: "your.email@school.co.uk" 
        },
        password: { 
          label: "Password", 
          type: "password" 
        },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }

        try {
          // Find user by email
          const user = await prisma.user.findUnique({
            where: { 
              email: credentials.email.toLowerCase().trim() 
            },
            include: {
              school: true,
              teacher: true,
              student: true,
              parent: true,
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

          if (!user) {
            throw new Error("No account found with this email address");
          }

          // Check if user is active
          if (!user.isActive) {
            throw new Error("Your account has been deactivated. Please contact your school administrator.");
          }

          // Check if account is locked
          if (user.lockedUntil && user.lockedUntil > new Date()) {
            const minutesLeft = Math.ceil((user.lockedUntil.getTime() - Date.now()) / (1000 * 60));
            throw new Error(`Account is locked. Try again in ${minutesLeft} minutes.`);
          }

          // Verify password
          if (!user.passwordHash) {
            throw new Error("Password not set. Please contact your school administrator.");
          }

          const isValidPassword = await bcrypt.compare(credentials.password, user.passwordHash);
          
          if (!isValidPassword) {
            // Increment login attempts
            const newAttempts = user.loginAttempts + 1;
            const shouldLock = newAttempts >= 5;
            
            await prisma.user.update({
              where: { id: user.id },
              data: {
                loginAttempts: newAttempts,
                lockedUntil: shouldLock ? new Date(Date.now() + 15 * 60 * 1000) : null // 15 minutes
              }
            });

            if (shouldLock) {
              throw new Error("Too many failed attempts. Account locked for 15 minutes.");
            }
            
            throw new Error(`Invalid password. ${5 - newAttempts} attempts remaining.`);
          }

          // Reset login attempts on successful login
          await prisma.user.update({
            where: { id: user.id },
            data: {
              loginAttempts: 0,
              lockedUntil: null,
              lastLoginAt: new Date()
            }
          });

          // Determine user type and get profile
          let userType: string;
          let profile: any = null;
          let displayName: string;

          if (user.teacher) {
            userType = "teacher";
            profile = user.teacher;
            displayName = user.teacher.displayName || `${user.teacher.title} ${user.teacher.lastName}`;
          } else if (user.student) {
            userType = "student";
            profile = user.student;
            displayName = user.student.preferredName || user.student.firstName;
          } else if (user.parent) {
            userType = "parent";
            profile = user.parent;
            displayName = `${user.parent.title || ""} ${user.parent.firstName} ${user.parent.lastName}`.trim();
          } else if (user.schoolAdmin) {
            userType = "schoolAdmin";
            profile = user.schoolAdmin;
            displayName = `${user.schoolAdmin.firstName} ${user.schoolAdmin.lastName}`;
          } else {
            throw new Error("User profile not found. Please contact your school administrator.");
          }

          // Extract permissions
          const permissions = user.userRoles.flatMap(userRole => 
            userRole.role.permissions.map(rp => ({
              name: rp.permission.name,
              resource: rp.permission.resource,
              action: rp.permission.action,
              scope: rp.permission.scope,
              category: rp.permission.category,
              riskLevel: rp.permission.riskLevel,
              conditions: rp.conditions,
              limitations: rp.limitations
            }))
          );

          return {
            id: user.id,
            email: user.email,
            name: displayName,
            image: profile?.avatar || null,
            
            // Custom fields for StudyStreaks
            schoolId: user.schoolId,
            schoolName: user.school.name,
            userType,
            profile,
            permissions,
            
            // Include roles for middleware
            roles: user.userRoles.map(ur => ({
              id: ur.role.id,
              name: ur.role.name,
              scope: ur.role.scope,
              classIds: ur.classIds,
              yearGroups: ur.yearGroups,
              subjects: ur.subjects,
              studentIds: ur.studentIds
            }))
          };

        } catch (error) {
          console.error("Authentication error:", error);
          throw error;
        }
      },
    }),
  ],

  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours
    updateAge: 60 * 60, // Update every hour
  },

  jwt: {
    secret: env.NEXTAUTH_SECRET,
    maxAge: 24 * 60 * 60, // 24 hours
  },

  callbacks: {
    async jwt({ token, user, account }) {
      // Initial sign in
      if (account && user) {
        return {
          ...token,
          ...user,
        };
      }

      // Return previous token if the access token has not expired
      return token;
    },

    async session({ session, token }) {
      // Send properties to the client
      return {
        ...session,
        user: {
          ...session.user,
          id: token.id,
          schoolId: token.schoolId,
          schoolName: token.schoolName,
          userType: token.userType,
          profile: token.profile,
          permissions: token.permissions,
          roles: token.roles,
        },
      };
    },

    async redirect({ url, baseUrl }) {
      // Handle post-login redirects based on user type
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },

  pages: {
    signIn: "/auth/signin",
    signOut: "/auth/signout",
    error: "/auth/error",
    verifyRequest: "/auth/verify-request",
  },

  events: {
    async signIn({ user, account, profile, isNewUser }) {
      console.log(`User signed in: ${user.email} (${user.userType})`);
      
      // Log successful login for audit
      if (user.id) {
        await prisma.$executeRaw`
          INSERT INTO audit_logs (event, "userId", details, timestamp)
          VALUES ('USER_LOGIN', ${user.id}, ${JSON.stringify({ 
            userType: user.userType, 
            schoolId: user.schoolId 
          })}, NOW())
        `.catch(console.error);
      }
    },

    async signOut({ session, token }) {
      console.log(`User signed out: ${session?.user?.email}`);
      
      // Log sign out for audit
      if (token?.id) {
        await prisma.$executeRaw`
          INSERT INTO audit_logs (event, "userId", details, timestamp)
          VALUES ('USER_LOGOUT', ${token.id}, ${JSON.stringify({ 
            userType: token.userType,
            schoolId: token.schoolId 
          })}, NOW())
        `.catch(console.error);
      }
    },
  },

  debug: env.NODE_ENV === "development",
};