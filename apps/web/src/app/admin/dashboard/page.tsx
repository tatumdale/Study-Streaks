"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Admin Dashboard
          </h1>
          <p className="text-gray-600 mt-2">
            Welcome back, {session.user.name}!
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">School Overview</h2>
            <p className="text-gray-600">
              Manage your school's settings and view analytics.
            </p>
            <div className="mt-4">
              <span className="text-sm text-gray-500">School: {session.user.schoolName}</span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">User Management</h2>
            <p className="text-gray-600">
              Add, edit, and manage teachers, students, and parents.
            </p>
            <button className="mt-4 text-indigo-600 hover:text-indigo-700 font-medium">
              Manage Users →
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Classes & Groups</h2>
            <p className="text-gray-600">
              Organize students into classes and manage year groups.
            </p>
            <button className="mt-4 text-indigo-600 hover:text-indigo-700 font-medium">
              Manage Classes →
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Homework Tracking</h2>
            <p className="text-gray-600">
              Monitor homework completion across all classes.
            </p>
            <button className="mt-4 text-indigo-600 hover:text-indigo-700 font-medium">
              View Reports →
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Analytics</h2>
            <p className="text-gray-600">
              View detailed analytics and performance metrics.
            </p>
            <button className="mt-4 text-indigo-600 hover:text-indigo-700 font-medium">
              View Analytics →
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Settings</h2>
            <p className="text-gray-600">
              Configure school settings and preferences.
            </p>
            <button className="mt-4 text-indigo-600 hover:text-indigo-700 font-medium">
              School Settings →
            </button>
          </div>
        </div>

        <div className="mt-8">
          <button
            onClick={() => router.push("/")}
            className="bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600 transition duration-200"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}