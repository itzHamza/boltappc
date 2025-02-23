import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { BookOpen, Video, FileText, ChevronRight } from 'lucide-react';
import { cn } from '../lib/utils';

// Mock data for modules
const MODULE_DATA = {
  "anatomy": {
    title: "Anatomie",
    description: "Étude de la structure du corps humain",
    courses: [
      {
        id: "anatomy-renal",
        title: "Anatomie rénale",
        description: "Introduction à l'anatomie rénale",
        videoCount: 2,
        pdfCount: 2
      },
      {
        id: "anatomy-cardiac",
        title: "Anatomie cardiaque",
        description: "Structure du cœur et vaisseaux",
        videoCount: 3,
        pdfCount: 2
      },
      {
        id: "anatomy-digestive",
        title: "Système digestif",
        description: "Anatomie du système digestif",
        videoCount: 4,
        pdfCount: 3
      }
    ]
  },
  "physiology": {
    title: "Physiologie",
    description: "Étude des fonctions du corps humain",
    courses: [
      {
        id: "physiology-renal",
        title: "Physiologie rénale",
        description: "Fonction rénale et filtration",
        videoCount: 3,
        pdfCount: 2
      },
      {
        id: "physiology-cardiac",
        title: "Physiologie cardiaque",
        description: "Fonction cardiaque et circulation",
        videoCount: 4,
        pdfCount: 3
      }
    ]
  }
};

export function ModulePage() {
  const { moduleId } = useParams();
  const moduleData = MODULE_DATA[moduleId];

  if (!moduleData) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-gray-900">Module not found</h1>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">{moduleData.title}</h1>
      <p className="text-gray-600 mb-8">{moduleData.description}</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {moduleData.courses.map((course) => (
          <Link
            key={course.id}
            to={`/course/${course.id}`}
            className="group block p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-all"
          >
            <div className="flex items-start space-x-4">
              <div className="p-3 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors">
                <BookOpen className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">{course.title}</h3>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
                </div>
                <p className="mt-1 text-sm text-gray-600">{course.description}</p>
                <div className="mt-4 flex items-center space-x-4">
                  <div className="flex items-center text-sm text-gray-500">
                    <Video className="w-4 h-4 mr-1" />
                    <span>{course.videoCount} videos</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <FileText className="w-4 h-4 mr-1" />
                    <span>{course.pdfCount} PDFs</span>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}