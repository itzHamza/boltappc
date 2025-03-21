import React from 'react';
import { YearCard } from '../components/YearCard';
import {
  Briefcase,
  HeartPulse,
  Dna,
  Stethoscope,
} from "lucide-react";

const MEDICAL_YEARS = [
  {
    year: 1,
    title: "Première Année med",
    description: "Introduction aux concepts fondamentaux de la médecine",
    subjects: "8 Modules",
    icon: Dna,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
  },
  {
    year: 2,
    title: "Deuxième Année med",
    description: "Étude des systèmes du corps humain : cardiovasculaire...",
    subjects: "06 Units + 2 Modules",
    icon: HeartPulse,
    color: "text-red-600",
    bgColor: "bg-red-50",
  },
  {
    year: 3,
    title: "Troisième Année med",
    description: "Approfondissement des systèmes avec leurs pathologies",
    subjects: "Coming Soon ...",
    icon: Stethoscope,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
  },
  {
    year: 4,
    title: "Quatrième Année med",
    description: "Début de l’apprentissage clinique avec sémiologie",
    subjects: "Coming Soon ...",
    icon: Briefcase,
    color: "text-green-600",
    bgColor: "bg-green-50",
  },
  // {
  //   year: 5,
  //   title: "Fifth Year Medicine",
  //   description: "Clinical practice and specialized medical disciplines",
  //   subjects: "Coming Soon ...",
  // },
  // {
  //   year: 6,
  //   title: "Sixth Year Medicine",
  //   description: "Internship year with hospital rotations",
  //   subjects: "Coming Soon ...",
  // },
];

export function HomePage() {
  return (
    <div>
      <div className="max-w-3xl mx-auto text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Votre Parcours Médical Commence avec TBiB
        </h1>
        <p className="text-lg text-gray-600">
          Cours détaillés, vidéos pédagogiques et ressources interactives pour
          les étudiants en médecine.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 marginleftandright">
        {MEDICAL_YEARS.map((year) => (
          <YearCard
            key={year.year}
            year={year.year}
            title={year.title}
            description={year.description}
            subjects={year.subjects}
            icon={year.icon}
            color={year.color}
            bgColor={year.bgColor}
          />
        ))}
      </div>
    </div>
  );
}