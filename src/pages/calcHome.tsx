import React, { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ChevronRight, Compass, School, GraduationCap } from "lucide-react";
import { Helmet } from "react-helmet-async";

type Wilaya = {
  id: string;
  name: string;
  years: {
    id: string;
    name: string;
    path: string;
  }[];
};

const WILAYAS: Wilaya[] = [
  {
    id: "alger",
    name: "Alger",
    years: [
      { id: "first", name: "Première Année", path: "/calc/alger/firstyear" },
      { id: "second", name: "Deuxième Année", path: "/calc/alger/secondyear" },
    ],
  },
  // {
  //   id: "batna",
  //   name: "Batna",
  //   years: [
  //     { id: "first", name: "Première Année", path: "/calc/batna/firstyear" },
  //     { id: "second", name: "Deuxième Année", path: "/calc/batna/secondyear" },
  //   ],
  // },
  // {
  //   id: "oran",
  //   name: "Oran",
  //   years: [
  //     { id: "first", name: "Première Année", path: "/calc/oran/firstyear" },
  //     { id: "second", name: "Deuxième Année", path: "/calc/oran/secondyear" },
  //   ],
  // },
];

export function CalcHomePage() {
  const [selectedWilaya, setSelectedWilaya] = useState<Wilaya | null>(null);

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <Helmet>
        <title>TBiB - Calculateur de Notes</title>
        <meta
          name="description"
          content="Calculez facilement vos moyennes universitaires avec la calculatrice de TBiB. Sélectionnez votre université et votre année d'études."
        />
        <meta
          name="keywords"
          content="calculatrice médicale, tbib calculatrice, médecine Algérie, calculateur de notes"
        />
      </Helmet>

      <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
        Calculateur de Notes Universitaires
      </h1>

      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
          <Compass className="w-5 h-5 mr-2 text-blue-600" />
          Sélectionnez votre université
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {WILAYAS.map((wilaya) => (
            <motion.div
              key={wilaya.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`p-4 rounded-lg cursor-pointer transition-colors ${
                selectedWilaya?.id === wilaya.id
                  ? "bg-blue-50 border-2 border-blue-200"
                  : "bg-gray-50 hover:bg-gray-100 border-2 border-transparent"
              }`}
              onClick={() => setSelectedWilaya(wilaya)}
            >
              <div className="font-medium text-lg">{wilaya.name}</div>
            </motion.div>
          ))}
        </div>

        {selectedWilaya && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8"
          >
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
              <School className="w-5 h-5 mr-2 text-blue-600" />
              Sélectionnez votre année d'études pour {selectedWilaya.name}
            </h3>

            <div className="space-y-3">
              {selectedWilaya.years.map((year) => (
                <Link
                  key={year.id}
                  to={year.path}
                  className="block w-full p-4 bg-white border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-200 transition-colors flex justify-between items-center"
                >
                  <span className="flex items-center">
                    <GraduationCap className="w-5 h-5 mr-3 text-blue-600" />
                    <span className="font-medium">{year.name}</span>
                  </span>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      <div className="text-center text-sm text-gray-500 mt-8">
        <p>
          Cette calculatrice est adaptée aux spécificités de chaque université.
          Veuillez sélectionner l'option correspondante à votre établissement.
        </p>
      </div>
    </div>
  );
}
