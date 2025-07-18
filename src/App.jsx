import React, { useState } from 'react'

function App() {
  const [streakCount, setStreakCount] = useState(7)
  const [isCompleted, setIsCompleted] = useState(false)

  const incrementStreak = () => {
    setStreakCount(prev => prev + 1)
    setIsCompleted(true)
    setTimeout(() => setIsCompleted(false), 1000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">SS</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Study Streaks</h1>
            </div>
            <nav className="hidden md:flex space-x-6">
              <a href="#" className="text-gray-600 hover:text-blue-600 transition-colors">Dashboard</a>
              <a href="#" className="text-gray-600 hover:text-blue-600 transition-colors">Progress</a>
              <a href="#" className="text-gray-600 hover:text-blue-600 transition-colors">Rewards</a>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            🎉 Tailwind CSS is Working! 🎉
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            This is a test page showing various Tailwind CSS components and utilities working correctly.
          </p>
        </div>

        {/* Streak Counter Card */}
        <div className="max-w-md mx-auto mb-12">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-4">
              <h3 className="text-white text-lg font-semibold">Current Streak</h3>
            </div>
            <div className="p-6 text-center">
              <div className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-600 mb-4">
                {streakCount}
              </div>
              <p className="text-gray-600 mb-6">Days in a row! Keep it up! 🔥</p>
              <button
                onClick={incrementStreak}
                className={`w-full py-3 px-6 rounded-xl font-semibold transition-all duration-300 transform ${
                  isCompleted
                    ? 'bg-green-500 text-white scale-105'
                    : 'bg-blue-500 hover:bg-blue-600 text-white hover:scale-105'
                }`}
              >
                {isCompleted ? '✅ Homework Complete!' : 'Complete Today\'s Homework'}
              </button>
            </div>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {/* Card 1 */}
          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl">📚</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Track Progress</h3>
            <p className="text-gray-600">Monitor your daily study habits and build lasting learning streaks.</p>
          </div>

          {/* Card 2 */}
          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl">🏆</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Earn Rewards</h3>
            <p className="text-gray-600">Unlock achievements and rewards as you maintain your study streaks.</p>
          </div>

          {/* Card 3 */}
          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl">📊</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">View Analytics</h3>
            <p className="text-gray-600">See detailed insights about your learning patterns and progress.</p>
          </div>
        </div>

        {/* Tailwind Feature Demo */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Tailwind CSS Features Demo</h3>
          
          <div className="grid md:grid-cols-2 gap-8">
            {/* Colors & Spacing */}
            <div>
              <h4 className="text-lg font-semibold text-gray-800 mb-4">Colors & Spacing</h4>
              <div className="space-y-3">
                <div className="p-3 bg-red-100 text-red-800 rounded-lg">Red background</div>
                <div className="p-3 bg-green-100 text-green-800 rounded-lg">Green background</div>
                <div className="p-3 bg-blue-100 text-blue-800 rounded-lg">Blue background</div>
                <div className="p-3 bg-purple-100 text-purple-800 rounded-lg">Purple background</div>
              </div>
            </div>

            {/* Typography */}
            <div>
              <h4 className="text-lg font-semibold text-gray-800 mb-4">Typography</h4>
              <div className="space-y-2">
                <p className="text-xs text-gray-600">Extra small text</p>
                <p className="text-sm text-gray-600">Small text</p>
                <p className="text-base text-gray-900">Base text</p>
                <p className="text-lg font-medium text-gray-900">Large medium text</p>
                <p className="text-xl font-semibold text-gray-900">Extra large semibold</p>
                <p className="text-2xl font-bold text-gray-900">2XL bold text</p>
              </div>
            </div>
          </div>

          {/* Responsive Demo */}
          <div className="mt-8 p-6 bg-gray-50 rounded-xl">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">Responsive Design</h4>
            <div className="bg-blue-500 md:bg-green-500 lg:bg-purple-500 text-white p-4 rounded-lg text-center">
              <p className="block md:hidden">📱 Mobile (Blue)</p>
              <p className="hidden md:block lg:hidden">💻 Tablet (Green)</p>
              <p className="hidden lg:block">🖥️ Desktop (Purple)</p>
            </div>
            <p className="text-sm text-gray-600 mt-2 text-center">
              Resize your browser window to see the color change!
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-400">
            Study Streaks - Gamifying Education with Tailwind CSS ✨
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Built with React, Vite, and Tailwind CSS
          </p>
        </div>
      </footer>
    </div>
  )
}

export default App 