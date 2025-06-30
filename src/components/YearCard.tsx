import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';

interface YearCardProps {
  year: number;
  title: string;
  description: string;
  subjects: string;
  icon: React.ElementType; // أيقونة قابلة للتغيير
  color: string; // لون الأيقونة
  bgColor: string; // لون الخلفية للأيقونة
  className?: string;
}

export function YearCard({
  year,
  title,
  description,
  subjects,
  icon: Icon,
  color,
  bgColor,
  className,
}: YearCardProps) {
  return (
    <Link
      to={`/year/${year}`}
      className={cn(
        "block p-6 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow",
        className
      )}
    >
      <div className="flex items-start space-x-4">
        <div className={`p-3 rounded-lg ${bgColor}`}>
          <Icon className={`w-6 h-6 ${color}`} />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900">{title}</h3>
          <p className="mt-1 text-sm font-semibold text-gray-600">
            {description}
          </p>
          <p className="mt-2 text-sm font-medium text-blue-600">{subjects}</p>
        </div>
      </div>
    </Link>
  );
}