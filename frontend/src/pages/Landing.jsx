import React from "react";
import { Link } from "react-router-dom";

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-lg font-bold">BRC</span>
              </div>
              <span className="text-xl font-bold text-gray-900">BRC</span>
            </div>
            <Link
              to="/register"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="flex flex-col justify-center items-center px-6 py-20">
        <div className="text-center max-w-4xl">
          <h1 className="text-5xl md:text-6xl font-bold mb-8 text-gray-900">
            Project Management
          </h1>
          
          <p className="text-lg md:text-xl mb-12 text-gray-600 leading-relaxed max-w-3xl mx-auto">
            Streamline your project workflows, track progress in real-time, and manage your clients efficiently with our comprehensive BRC Dashboard solution.
          </p>

          {/* CTA Button */}
          <div className="flex justify-center items-center mb-16">
            <Link
              to="/login"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2"
            >
              <span>Sign In</span>
              <span>→</span>
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl w-full">
          <div className="bg-white rounded-lg shadow-sm p-8 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-6">
              <span className="text-white text-xl">📊</span>
            </div>
            <h3 className="text-xl font-semibold mb-4 text-gray-900">Progress Tracking</h3>
            <p className="text-gray-600">Monitor project progress with intuitive dashboards and real-time updates to keep your team aligned.</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-8 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center mb-6">
              <span className="text-white text-xl">👥</span>
            </div>
            <h3 className="text-xl font-semibold mb-4 text-gray-900">Team Collaboration</h3>
            <p className="text-gray-600">Coordinate seamlessly with your team through integrated communication tools and shared workspaces.</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-8 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mb-6">
              <span className="text-white text-xl">📅</span>
            </div>
            <h3 className="text-xl font-semibold mb-4 text-gray-900">Smart Scheduling</h3>
            <p className="text-gray-600">Schedule meetings, set deadlines, and manage timelines efficiently with our smart scheduling system.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
