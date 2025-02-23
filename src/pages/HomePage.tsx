import React from 'react';
import { YearCard } from '../components/YearCard';

const MEDICAL_YEARS = [
  {
    year: 1,
    title: "First Year Medicine",
    description: "Foundation courses in anatomy, physiology, and biochemistry",
    subjects: "8 Modules"
  },
  {
    year: 2,
    title: "Second Year Medicine",
    description: "Advanced studies in pathology, pharmacology, and microbiology",
    subjects: "06 Units + 2 Modules"
  },
  {
    year: 3,
    title: "Third Year Medicine",
    description: "Clinical medicine introduction and specialized systems",
    subjects: "Coming Soon ..."
  },
  {
    year: 4,
    title: "Fourth Year Medicine",
    description: "Advanced clinical rotations and specialized medical fields",
    subjects: "Coming Soon ..."
  },
  {
    year: 5,
    title: "Fifth Year Medicine",
    description: "Clinical practice and specialized medical disciplines",
    subjects: "Coming Soon ..."
  },
  {
    year: 6,
    title: "Sixth Year Medicine",
    description: "Internship year with hospital rotations",
    subjects: "Coming Soon ..."
  }
];

export function HomePage() {
  return (
    <div>
      <div className="max-w-3xl mx-auto text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Your Medical Education Journey Starts With TBIB
        </h1>
        <p className="text-lg text-gray-600">
          Comprehensive study materials, video lectures, and interactive resources
          for medical students.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {MEDICAL_YEARS.map((year) => (
          <YearCard
            key={year.year}
            year={year.year}
            title={year.title}
            description={year.description}
            subjects={year.subjects}
          />
        ))}
      </div>
    </div>
  );
}