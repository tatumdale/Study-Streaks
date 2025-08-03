"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function StudentDashboard() {
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
            Student Dashboard
          </h1>
          <p className="text-gray-600 mt-2">
            Welcome back, {session.user.name}!
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <h2 className="text-xl font-semibold mb-4">Coming Soon</h2>
          <p className="text-gray-600 mb-6">
            Student dashboard features are under development.
          </p>
          <button
            onClick={() => router.push("/")}
            className="bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition duration-200"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}