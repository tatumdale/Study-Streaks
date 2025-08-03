import NextAuth from "next-auth";
import { authOptions } from "@study-streaks/auth";

/**
 * NextAuth.js API route handler for StudyStreaks authentication
 * Handles all authentication routes: /api/auth/*
 */

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };