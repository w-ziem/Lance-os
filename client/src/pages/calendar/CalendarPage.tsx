/**
 * Calendar Page for FreelanceOS
 * 
 * Calendar view for scheduling and time management.
 */

import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export default function CalendarPage() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="text-2xl font-bold text-blue-600">FreelanceOS</Link>
              <div className="hidden sm:ml-8 sm:flex sm:space-x-4">
                <Link to="/" className="text-gray-500 hover:text-blue-600 px-3 py-2 text-sm font-medium">Dashboard</Link>
                <Link to="/clients" className="text-gray-500 hover:text-blue-600 px-3 py-2 text-sm font-medium">Clients</Link>
                <Link to="/projects" className="text-gray-500 hover:text-blue-600 px-3 py-2 text-sm font-medium">Projects</Link>
                <Link to="/tasks" className="text-gray-500 hover:text-blue-600 px-3 py-2 text-sm font-medium">Tasks</Link>
                <Link to="/calendar" className="text-gray-900 hover:text-blue-600 px-3 py-2 text-sm font-medium">Calendar</Link>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">{user?.firstName || user?.email}</span>
              <button onClick={logout} className="text-sm text-gray-500 hover:text-gray-700">Sign out</button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Calendar</h1>
          <div className="flex gap-4">
            <div className="flex rounded-lg overflow-hidden border">
              <button className="px-4 py-2 bg-white text-gray-700">Month</button>
              <button className="px-4 py-2 bg-blue-600 text-white">Week</button>
              <button className="px-4 py-2 bg-white text-gray-700">Day</button>
            </div>
            <button className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
              Auto-Schedule Tasks
            </button>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <p className="text-gray-500">Calendar features coming soon...</p>
          <p className="text-sm text-gray-400 mt-2">
            This page will display a full calendar with task scheduling, drag & drop, and auto-scheduling.
          </p>
          <p className="text-sm text-gray-400 mt-1">
            Install @fullcalendar/react for the full calendar implementation.
          </p>
        </div>
      </main>
    </div>
  );
}
