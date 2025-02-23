import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, FileText, Video, Brain } from 'lucide-react';

export function AdminDashboard() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Dashboard Overview</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start space-x-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <BookOpen className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Total Lessons</h3>
              <p className="mt-1 text-sm text-gray-600">
                0 lessons available
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start space-x-4">
            <div className="p-3 bg-purple-50 rounded-lg">
              <Video className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Video Content</h3>
              <p className="mt-1 text-sm text-gray-600">
                0 videos uploaded
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start space-x-4">
            <div className="p-3 bg-red-50 rounded-lg">
              <FileText className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">PDF Resources</h3>
              <p className="mt-1 text-sm text-gray-600">
                0 documents available
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start space-x-4">
            <div className="p-3 bg-green-50 rounded-lg">
              <Brain className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Flashcard Sets</h3>
              <p className="mt-1 text-sm text-gray-600">
                0 sets created
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}