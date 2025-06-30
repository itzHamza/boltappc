import React, { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, AlertTriangle, Printer, RefreshCw } from "lucide-react";
import { cn } from "../../../../lib/utils";
import { Helmet } from "react-helmet-async";

type Unit = {
  name: string;
  coefficient: number;
  grade?: number;
};

const UNITS: Unit[] = [
  { name: "Cardiorespiratoire", coefficient: 4 },
  { name: "Digestive", coefficient: 4 },
  { name: "Urinaire", coefficient: 4 },
  { name: "Endocrinologie", coefficient: 4 },
  { name: "Neurologie", coefficient: 4 },
  { name: "Génétique", coefficient: 2 },
  { name: "Immunologie", coefficient: 2 },
];

const HOSPITALS = [
  { name: "Mostafa", minGrade: 14 },
  { name: "Beni Messous", minGrade: 13.8 },
  { name: "Birtraria", minGrade: 13.2 },
  { name: "Kouba", minGrade: 12.3 },
  { name: "Bab El-Oued", minGrade: 12.1 },
  { name: "HCA", minGrade: 11.5 },
  { name: "Zmirli", minGrade: 11.3 },
  { name: "Bainem", minGrade: 10.8 },
  { name: "Rouiba", minGrade: 10.5 },
  { name: "Thénia", minGrade: 10 },
  { name: "Ein Taya", minGrade: 10 },
];

type StoredData = {
  grades: Record<string, number>;
  result: {
    average: number;
    warnings: string[];
    status: string;
    eligibleHospitals?: string[];
  } | null;
};

export function AlgerSecondYearCalculator() {
  const [grades, setGrades] = useState<Record<string, number>>({});
  const [showModal, setShowModal] = useState(false);
  const [result, setResult] = useState<{
    average: number;
    warnings: string[];
    status: string;
    eligibleHospitals?: string[];
  } | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  useEffect(() => {
    try {
      const savedData = localStorage.getItem("secondYearMedicalGradesData");
      if (savedData) {
        const parsedData: StoredData = JSON.parse(savedData);
        if (typeof parsedData === "object" && parsedData !== null) {
          setGrades(parsedData.grades);
          setResult(parsedData.result);
          setShowResults(!!parsedData.result);
        }
      }
    } catch (e) {
      console.error("Failed to load saved data:", e);
    }
  }, []);

  useEffect(() => {
    try {
      const dataToSave: StoredData = {
        grades,
        result,
      };
      localStorage.setItem(
        "secondYearMedicalGradesData",
        JSON.stringify(dataToSave)
      );
    } catch (e) {
      console.error("Failed to save data:", e);
    }
  }, [grades, result]);

  const handleGradeChange = useCallback((unitName: string, value: string) => {
    const numValue = value === "" ? undefined : parseFloat(value);
    setGrades((prev) => ({
      ...prev,
      [unitName]: numValue as number,
    }));
    setValidationErrors([]);
  }, []);

  const validateInputs = useCallback(() => {
    const errors: string[] = [];

    UNITS.forEach((unit) => {
      if (grades[unit.name] === undefined) {
        errors.push(`${unit.name} est requis`);
      }
    });

    setValidationErrors(errors);
    return errors.length === 0;
  }, [grades]);

  const validateGrade = useCallback((value: number | undefined) => {
    if (value === undefined) return undefined;
    if (isNaN(value)) return undefined;
    return Math.max(0, Math.min(20, value));
  }, []);

  const handleBlur = useCallback(
    (unitName: string) => {
      setGrades((prev) => {
        const currentValue = prev[unitName];
        const validatedValue = validateGrade(currentValue);

        if (currentValue === validatedValue) return prev;

        return {
          ...prev,
          [unitName]: validatedValue as number,
        };
      });
    },
    [validateGrade]
  );

  const resetGrades = useCallback(() => {
    setGrades({});
    setResult(null);
    setShowResults(false);
    setValidationErrors([]);
    localStorage.removeItem("secondYearMedicalGradesData");
  }, []);

  const calculateAverage = useCallback(() => {
    let totalWeightedGrade = 0;
    let totalCoefficients = 0;
    const warnings: string[] = [];
    const subjectsBelowFive: string[] = [];
    const subjectsBetweenFiveAndTen: string[] = [];

    UNITS.forEach((unit) => {
      const grade = grades[unit.name];

      if (grade !== undefined) {
        totalWeightedGrade += grade * unit.coefficient;
        totalCoefficients += unit.coefficient;

        if (grade < 5) {
          subjectsBelowFive.push(unit.name);
        } else if (grade < 10) {
          subjectsBetweenFiveAndTen.push(unit.name);
        }
      }
    });

    const average =
      totalCoefficients > 0 ? totalWeightedGrade / totalCoefficients : 0;

    let status: string;
    let eligibleHospitals: string[] = [];

    if (average >= 10) {
      if (subjectsBelowFive.length > 0) {
        status = "Rattrapage";
        subjectsBelowFive.forEach((subject) => {
          warnings.push(`Rattrapage obligatoire pour ${subject}`);
        });
        if (subjectsBetweenFiveAndTen.length > 0) {
          subjectsBetweenFiveAndTen.forEach((subject) => {
            warnings.push(`Rattrapage facultatif pour ${subject}`);
          });
        }
      } else {
        status = "✅ Pass to the 3rd year";
        // Check eligible hospitals
        HOSPITALS.forEach((hospital) => {
          if (average >= hospital.minGrade) {
            eligibleHospitals.push(hospital.name);
          }
        });
      }
    } else {
      status = "Rattrapage";
      subjectsBelowFive.forEach((subject) => {
        warnings.push(`Rattrapage obligatoire pour ${subject}`);
      });
      subjectsBetweenFiveAndTen.forEach((subject) => {
        warnings.push(`Rattrapage facultatif pour ${subject}`);
      });
    }

    return { average, warnings, status, eligibleHospitals };
  }, [grades]);

  const handleCalculate = useCallback(() => {
    if (!validateInputs()) {
      return;
    }

    const calculationResult = calculateAverage();
    setResult(calculationResult);
    setShowResults(true);
    setShowModal(true);
  }, [calculateAverage, validateInputs]);

  const getEmojiForScore = useCallback((score: number) => {
    if (score >= 15) return "😁";
    if (score >= 13) return "😊";
    if (score >= 10) return "😐";
    return "😔";
  }, []);

  const handlePrint = useCallback(() => {
    const printWindow = window.open("", "_blank");
    if (!printWindow || !result) return;

    const formatDate = (date: Date) => {
      return date.toLocaleDateString("fr-FR", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    };

    const getGradeColor = (grade: number) => {
      if (grade < 5) return "#dc2626"; // Red for grades below 5
      if (grade < 10) return "#333333"; // Normal color for grades between 5-10
      return "#16a34a"; // Green for grades above 10
    };

    const getGradeRemark = (grade: number) => {
      if (grade < 5) return "Rattrapage";
      if (grade < 10) return "Doit améliorer";
      return "Validé";
    };

    const today = new Date();
    const academicYear = `${today.getFullYear() - 1}-${today.getFullYear()}`;
    const studentName = "Étudiant(e)"; // Placeholder

    const content = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Relevé de Notes - ${studentName}</title>
      <link href="https://fonts.googleapis.com/css2?family=Lexend+Deca:wght@300;400;700&family=Serif:wght@400;700&display=swap" rel="stylesheet">
      <style>
        @page { margin: 2cm; }
        *{font-family: "Lexend Deca", serif;}  
        body { 
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
          border-bottom: 2px solid #1e40af;
          padding-bottom: 20px;
        }
        .logo-placeholder {
          font-size: 24px;
          font-weight: bold;
          margin-bottom: 10px;
        }
        h1 {
          font-size: 24px;
          color: #1e40af;
          margin: 10px 0;
        }
        .student-info {
          margin: 20px 0;
          padding: 15px;
          background-color: #f1f5f9;
          border-radius: 5px;
        }
        .student-info p {
          margin: 5px 0;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 20px 0;
        }
        th, td {
          padding: 12px 15px;
          border: 1px solid #ddd;
          text-align: left;
        }
        th {
          background-color: #1e40af;
          color: white;
          font-weight: bold;
        }
        tr:nth-child(even) {
          background-color: #f8fafc;
        }
        .results-summary {
          margin: 30px 0;
          padding: 15px;
          background-color: #f1f5f9;
          border-radius: 5px;
          text-align: center;
        }
        .average {
          font-size: 24px;
          font-weight: bold;
          margin: 10px 0;
        }
        .status {
          font-size: 18px;
          font-weight: bold;
          padding: 8px 15px;
          border-radius: 5px;
          display: inline-block;
          margin: 10px 0;
        }
        .footer {
          margin-top: 40px;
          text-align: center;
          font-size: 12px;
          color: #666;
        }
        .warning {
          color: #dc2626;
          font-weight: bold;
        }
        .hospitals {
          margin: 20px 0;
          padding: 15px;
          background-color: #dcfce7;
          border-radius: 5px;
        }
        .hospitals h3 {
          color: #16a34a;
          margin-top: 0;
        }
        .hospitals ul {                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  

        
          margin: 10px 0;
          padding-left: 20px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo-placeholder"><img src="https://tbib.space/loogo.png" alt="LOGO" style="width: 120px;"></div>
          <h1>RELEVÉ DE NOTES - DEUXIÈME ANNÉE MÉDECINE</h1>
          <p>Année universitaire ${academicYear}</p>
        </div>
        
        <div class="student-info">
          <p><strong>Nom et prénom:</strong> ${studentName}</p>
          <p><strong>Spécialisation:</strong> Médecine - 2ème Année</p>
          <p><strong>Date d'édition:</strong> ${formatDate(today)}</p>
        </div>
        
        <table>
          <thead>
            <tr>
              <th>Unité / Module</th>
              <th>Coefficient</th>
              <th>Note</th>
              <th>Observation</th>
            </tr>
          </thead>
          <tbody>
            ${UNITS.map((unit) => {
              const grade = grades[unit.name] || 0;
              return `
              <tr>
                <td>${unit.name}</td>
                <td>${unit.coefficient}</td>
                <td style="color: ${getGradeColor(grade)}; font-weight: bold;">
                  ${grade.toFixed(2)}/20
                </td>
                <td style="color: ${getGradeColor(grade)};">
                  ${getGradeRemark(grade)}
                </td>
              </tr>
            `;
            }).join("")}
          </tbody>
        </table>
        
        <div class="results-summary">
          <h2>Résultats Finaux</h2>
          <div class="average">Moyenne générale: ${result.average.toFixed(
            2
          )}/20</div>
          <div class="status" style="background-color: ${
            result.status.includes("Pass")
              ? "#dcfce7; color: #16a34a;"
              : "#fee2e2; color: #dc2626;"
          }">
            ${result.status}
          </div>
        </div>
        
        ${
          result.eligibleHospitals && result.eligibleHospitals.length > 0
            ? `
            <div class="hospitals">
              <h3>Hôpitaux Disponibles</h3>
              <p>Selon votre moyenne, vous êtes éligible pour les hôpitaux suivants:</p>
              <ul>
                ${result.eligibleHospitals
                  .map(
                    (hospital) => `
                  <li>${hospital}</li>
                `
                  )
                  .join("")}
              </ul>
            </div>
          `
            : ""
        }
        
        ${
          result.warnings.length > 0
            ? `
          <div class="warnings">
            <h3>Observations importantes:</h3>
            <ul>
              ${result.warnings
                .map(
                  (warning) => `
                <li class="warning">${warning}</li>
              `
                )
                .join("")}
            </ul>
          </div>
        `
            : ""
        }
        
        <div class="footer">
          <p>Ce document est un relevé de notes non officiel</p>
          <p>Généré le ${formatDate(today)} à ${today.toLocaleTimeString(
      "fr-FR"
    )}</p>
        </div>
      </div>
    </body>
    </html>
  `;

    printWindow.document.write(content);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => printWindow.print(), 500);
  }, [result, grades, UNITS]);

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <Helmet>
        <title>TBiB - Calculateur 2ème Année</title>
        <meta
          name="description"
          content="Calculez facilement votre moyenne de 2ème année médecine avec la calculatrice de TBiB. Un outil simple, rapide et précis."
        />
        <meta
          name="keywords"
          content="calculatrice médicale, calculatrice deuxième année, médecine 2ème année, calculatrice médicale tbib, calculatrice médicale tbib cours, tbib cours calculatrice médicale, tbib calculatrice médicale, calculatrice tbib, calculatrice tbib cours, tbib cours calculatrice, tbib calculatrice, calcul médical, outil médical en ligne, médecine, étudiants en médecine, TBiB, TBiB Cours, TBiB Academy, tbib calculator, tbib calculatrice, calculatrice santé, formules médicales, formules physiologiques, convertisseur médical, calculs cliniques, médecine Algérie, études médicales, tbib space, study with tbib, outils étudiants médecine"
        />
      </Helmet>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        Calculateur de Notes - 2ème Année
      </h1>

      {validationErrors.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg"
        >
          <h4 className="text-red-800 font-medium mb-2 flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2" />
            Veuillez corriger les erreurs suivantes:
          </h4>
          <ul className="list-disc list-inside text-sm text-red-700">
            {validationErrors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </motion.div>
      )}

      <div className="flex justify-end mb-8">
        <button
          onClick={resetGrades}
          className="px-4 py-2 rounded-lg font-medium transition-colors bg-red-100 text-red-600 hover:bg-red-200 flex justify-center items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Réinitialiser
        </button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-lg shadow-sm p-6 mb-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {UNITS.map((unit) => (
            <motion.div
              key={unit.name}
              className="space-y-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <label className="block text-sm font-medium text-gray-700">
                {unit.name} (Coefficient: {unit.coefficient})
              </label>
              <div className="flex space-x-4">
                <input
                  type="number"
                  min="0"
                  max="20"
                  step="0.25"
                  placeholder="Note"
                  value={grades[unit.name] ?? ""}
                  onChange={(e) => handleGradeChange(unit.name, e.target.value)}
                  onBlur={() => handleBlur(unit.name)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-8 flex justify-center">
          <button
            onClick={handleCalculate}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Calculer la Moyenne
          </button>
        </div>
      </motion.div>

      <AnimatePresence>
        {showResults && result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-lg shadow-sm p-6 mb-8"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">Résultats</h3>
              <div className="flex space-x-2">
                <button
                  onClick={handlePrint}
                  className="p-2 rounded-lg text-gray-600 hover:bg-gray-100"
                  title="Imprimer les résultats"
                >
                  <Printer className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="text-center mb-4">
              <div className="text-4xl mb-2">
                {getEmojiForScore(result.average)}
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {result.average.toFixed(2)}/20
              </div>
              {result.status && (
                <div
                  className={cn(
                    "mt-2 text-lg font-medium",
                    result.status.includes("Pass")
                      ? "text-green-600"
                      : "text-red-600"
                  )}
                >
                  {result.status}
                </div>
              )}
            </div>

            {result.eligibleHospitals &&
              result.eligibleHospitals.length > 0 && (
                <div className="mt-4 p-4 bg-green-50 rounded-lg">
                  <h4 className="font-medium text-green-800 mb-2">
                    Hôpitaux Disponibles:
                  </h4>
                  <p className="text-sm text-green-700 mb-2">
                    Selon votre moyenne, vous êtes éligible pour les hôpitaux
                    suivants:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {result.eligibleHospitals.map((hospital, index) => (
                      <div
                        key={index}
                        className="p-2 bg-green-100 rounded text-green-800 font-medium text-center"
                      >
                        {hospital}
                      </div>
                    ))}
                  </div>
                </div>
              )}

            {result.warnings.length > 0 && (
              <div className="mt-4 p-3 bg-red-50 rounded-lg">
                <h4 className="font-medium text-red-800 mb-2 flex items-center">
                  <AlertTriangle className="w-5 h-5 mr-1" />
                  Avertissements:
                </h4>
                <ul className="list-disc list-inside text-sm text-red-700">
                  {result.warnings.map((warning, index) => (
                    <li key={index}>{warning}</li>
                  ))}
                </ul>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showModal && result && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6 relative"
            >
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>

              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Résultats
              </h3>

              <div className="text-center mb-4">
                <div className="text-4xl mb-2">
                  {getEmojiForScore(result.average)}
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {result.average.toFixed(2)}/20
                </div>
                {result.status && (
                  <div
                    className={cn(
                      "mt-2 text-lg font-medium",
                      result.status.includes("Pass")
                        ? "text-green-600"
                        : "text-red-600"
                    )}
                  >
                    {result.status}
                  </div>
                )}
              </div>

              {result.eligibleHospitals &&
                result.eligibleHospitals.length > 0 && (
                  <div className="mt-4 p-3 bg-green-50 rounded-lg">
                    <h4 className="font-medium text-green-800 mb-2">
                      Hôpitaux Disponibles:
                    </h4>
                    <p className="text-sm text-green-700 mb-2">
                      (according to last year) Selon votre moyenne, vous êtes éligible pour: 
                    </p>
                    <ul className="list-disc list-inside text-sm text-green-700">
                      {result.eligibleHospitals.map((hospital, index) => (
                        <li key={index}>{hospital}</li>
                      ))}
                    </ul>
                  </div>
                )}

              {result.warnings.length > 0 && (
                <div className="mt-4 p-3 bg-red-50 rounded-lg">
                  <h4 className="font-medium text-red-800 mb-2 flex items-center">
                    <AlertTriangle className="w-5 h-5 mr-1" />
                    Avertissements:
                  </h4>
                  <ul className="list-disc list-inside text-sm text-red-700">
                    {result.warnings.map((warning, index) => (
                      <li key={index}>{warning}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={handlePrint}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center"
                >
                  <Printer className="w-4 h-4 mr-2" />
                  Imprimer
                </button>
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Fermer
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
