"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";

export default function Index() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            StudyStreaks
          </h1>
          <p className="text-xl text-gray-600">
            UK Educational Platform for Primary Schools
          </p>
        </div>

        {session ? (
          <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold mb-4">
              Welcome, {session.user.name}!
            </h2>
            <div className="space-y-2 text-sm text-gray-600">
              <p><strong>School:</strong> {session.user.schoolName}</p>
              <p><strong>Role:</strong> {session.user.userType}</p>
              <p><strong>Email:</strong> {session.user.email}</p>
            </div>
            
            <div className="mt-6">
              <Link
                href={
                  session.user.userType === "teacher"
                    ? "/teacher/dashboard"
                    : session.user.userType === "schoolAdmin"
                    ? "/admin/dashboard"
                    : session.user.userType === "parent"
                    ? "/parent/dashboard"
                    : "/student/dashboard"
                }
                className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition duration-200 inline-block text-center"
              >
                Go to Dashboard
              </Link>
            </div>
          </div>
        ) : (
          <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6 text-center">
            <h2 className="text-2xl font-semibold mb-4">
              Sign in to get started
            </h2>
            <p className="text-gray-600 mb-6">
              Access your school&apos;s homework tracking system
            </p>
            <Link
              href="/auth/signin"
              className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition duration-200 inline-block"
            >
              Sign In
            </Link>
          </div>
        )}

        <div className="mt-12 grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-2">For Teachers</h3>
            <p className="text-gray-600">
              Manage classes, assign homework, and track student progress
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-2">For Parents</h3>
            <p className="text-gray-600">
              Monitor your child&apos;s homework and celebrate their achievements
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-2">For Students</h3>
            <p className="text-gray-600">
              Complete homework tasks and build learning streaks
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}