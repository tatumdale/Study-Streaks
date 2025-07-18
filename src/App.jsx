import React, { useState } from 'react'

function App() {
  const [streak, setStreak] = useState(7)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🎯 Study Streaks
          </h1>
          <p className="text-xl text-gray-600">
            Simple, clean, and working! 🎉
          </p>
        </header>

        {/* Main Content */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Streak Card */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                Current Streak
              </h2>
              <div className="text-6xl font-bold text-blue-600 mb-4">
                {streak}
              </div>
              <p className="text-gray-600 mb-6">Days in a row! 🔥</p>
              <button 
                onClick={() => setStreak(streak + 1)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Complete Today's Work
              </button>
            </div>
          </div>

          {/* Status Card */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">
              ✅ What's Working
            </h2>
            <ul className="space-y-3">
              <li className="flex items-center text-green-600">
                <span className="text-2xl mr-3">✓</span>
                React is running
              </li>
              <li className="flex items-center text-green-600">
                <span className="text-2xl mr-3">✓</span>
                Tailwind CSS is working
              </li>
              <li className="flex items-center text-green-600">
                <span className="text-2xl mr-3">✓</span>
                Hot reload is active
              </li>
              <li className="flex items-center text-green-600">
                <span className="text-2xl mr-3">✓</span>
                State management works
              </li>
            </ul>
          </div>
        </div>

        {/* Test Section */}
        <div className="mt-12 bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
            🎨 Tailwind Test
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-red-100 text-red-800 p-4 rounded-lg text-center">
              Red
            </div>
            <div className="bg-green-100 text-green-800 p-4 rounded-lg text-center">
              Green
            </div>
            <div className="bg-blue-100 text-blue-800 p-4 rounded-lg text-center">
              Blue
            </div>
            <div className="bg-purple-100 text-purple-800 p-4 rounded-lg text-center">
              Purple
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App 