"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function TeacherDashboard() {
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
            Teacher Dashboard
          </h1>
          <p className="text-gray-600 mt-2">
            Welcome back, {session.user.name}!
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">My Classes</h2>
            <p className="text-gray-600">
              View and manage your assigned classes.
            </p>
            <div className="mt-4">
              <span className="text-sm text-gray-500">School: {session.user.schoolName}</span>
            </div>
            <button className="mt-4 text-indigo-600 hover:text-indigo-700 font-medium">
              View Classes →
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Homework</h2>
            <p className="text-gray-600">
              Set homework tasks and track student progress.
            </p>
            <button className="mt-4 text-indigo-600 hover:text-indigo-700 font-medium">
              Manage Homework →
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Student Progress</h2>
            <p className="text-gray-600">
              Monitor individual student performance and streaks.
            </p>
            <button className="mt-4 text-indigo-600 hover:text-indigo-700 font-medium">
              View Progress →
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Badges & Rewards</h2>
            <p className="text-gray-600">
              Award badges and celebrate student achievements.
            </p>
            <button className="mt-4 text-indigo-600 hover:text-indigo-700 font-medium">
              Manage Badges →
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Messages</h2>
            <p className="text-gray-600">
              Communicate with students and parents.
            </p>
            <button className="mt-4 text-indigo-600 hover:text-indigo-700 font-medium">
              View Messages →
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Reports</h2>
            <p className="text-gray-600">
              Generate reports on class performance.
            </p>
            <button className="mt-4 text-indigo-600 hover:text-indigo-700 font-medium">
              View Reports →
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