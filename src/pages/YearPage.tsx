import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { BookOpen, ChevronRight } from 'lucide-react';
import { cn } from '../lib/utils';

// Mock data for modules
const YEAR_DATA = {
  1: {
    title: "First Year Medicine",
    modules: [
      { 
        id: "anatomy",
        title: "Anatomie",
        description: "Étude de la structure du corps humain",
        courseCount: 8
      },
      { 
        id: "physiology",
        title: "Physiologie",
        description: "Étude des fonctions du corps humain",
        courseCount: 6
      },
      { 
        id: "histology",
        title: "Histologie",
        description: "Étude des tissus biologiques",
        courseCount: 4
      },
      { 
        id: "biochemistry",
        title: "Biochimie",
        description: "Étude des processus chimiques dans les organismes vivants",
        courseCount: 5
      }
    ]
  },
  2: {
    title: "Second Year Medicine",
    modules: [
      { 
        id: "pathology",
        title: "Pathologie",
        description: "Étude des maladies",
        courseCount: 10
      },
      { 
        id: "pharmacology",
        title: "Pharmacologie",
        description: "Étude des médicaments",
        courseCount: 7
      },
      { 
        id: "microbiology",
        title: "Microbiologie",
        description: "Étude des micro-organismes",
        courseCount: 6
      }
    ]
  }
};

export function YearPage() {
  const { yearId } = useParams();
  const yearData = YEAR_DATA[Number(yearId)];

  if (!yearData) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-gray-900">Year not found</h1>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">{yearData.title}</h1>
      <p className="text-gray-600 mb-8">Select a module to view its courses</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {yearData.modules.map((module) => (
          <Link
            key={module.id}
            to={`/module/${module.id}`}
            className="group block p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-all"
          >
            <div className="flex items-start space-x-4">
              <div className="p-3 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors">
                <BookOpen className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">{module.title}</h3>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
                </div>
                <p className="mt-1 text-sm text-gray-600">{module.description}</p>
                <div className="mt-4 text-sm font-medium text-blue-600">
                  {module.courseCount} {module.courseCount === 1 ? 'course' : 'courses'}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}