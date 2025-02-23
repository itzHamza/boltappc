import React from 'react';
import { GraduationCap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';

interface YearCardProps {
  year: number;
  title: string;
  description: string;
  subjects: number;
  className?: string;
}

export function YearCard({ year, title, description, subjects, className }: YearCardProps) {
  return (
    <Link
      to={`/year/${year}`}
      className={cn(
        "block p-6 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow",
        className
      )}
    >
      <div className="flex items-start space-x-4">
        <div className="p-3 bg-blue-50 rounded-lg">
          <GraduationCap className="w-6 h-6 text-red-600" />
        </div>
        <div>
          <h3 className="text-lg  text-gray-900 font-bold">{title}</h3>
          <p className="mt-1 text-sm text-gray-600 font-semibold">{description}</p>
          <p className="mt-2 text-sm font-medium text-blue-600">{subjects}</p>
        </div>
      </div>
    </Link>
  );
}