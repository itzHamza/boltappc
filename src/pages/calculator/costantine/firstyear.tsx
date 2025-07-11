import React, { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, AlertTriangle, Printer, RefreshCw } from "lucide-react";
import { Helmet } from "react-helmet-async";

type Subject = {
  name: string;
  coefficient: number;
  type: "annuel" | "semestriel";
};

const SUBJECTS: Subject[] = [
  // Annuel modules (coefficient 2)
  { name: "Anatomie", coefficient: 2, type: "annuel" },
  { name: "Biochimie", coefficient: 2, type: "annuel" },
  { name: "Cytologie", coefficient: 2, type: "annuel" },
  { name: "Biostatistique", coefficient: 2, type: "annuel" },
  { name: "Biophysique", coefficient: 2, type: "annuel" },
  { name: "Chimie", coefficient: 2, type: "annuel" },
  // Semestriel modules (coefficient 1)
  { name: "Embryologie", coefficient: 1, type: "semestriel" },
  { name: "Physiologie", coefficient: 1, type: "semestriel" },
  { name: "SSH", coefficient: 1, type: "semestriel" },
  { name: "Histologie", coefficient: 1, type: "semestriel" },
];

type StoredData = {
  grades: Record<string, { sem1?: number; sem2?: number; single?: number }>;
  result: {
    average: number;
    warnings: string[];
    status: string;
    subjectAverages?: Record<string, number>;
  } | null;
};

export default function ConstantineMedicineCalculator() {
  const [grades, setGrades] = useState<
    Record<string, { sem1?: number; sem2?: number; single?: number }>
  >({});
  const [showModal, setShowModal] = useState(false);
  const [result, setResult] = useState<{
    average: number;
    warnings: string[];
    status: string;
    subjectAverages?: Record<string, number>;
  } | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  useEffect(() => {
    try {
      const savedData = localStorage.getItem("constantineMedicineGrades");
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
        "constantineMedicineGrades",
        JSON.stringify(dataToSave)
      );
    } catch (e) {
      console.error("Failed to save data:", e);
    }
  }, [grades, result]);

  const handleGradeChange = useCallback(
    (subject: string, field: "sem1" | "sem2" | "single", value: string) => {
      const numValue = value === "" ? undefined : parseFloat(value);
      setGrades((prev) => ({
        ...prev,
        [subject]: {
          ...prev[subject],
          [field]: numValue,
        },
      }));
      setValidationErrors([]);
    },
    []
  );

  const validateInputs = useCallback(() => {
    const errors: string[] = [];

    SUBJECTS.forEach((subject) => {
      if (subject.type === "annuel") {
        if (!grades[subject.name]?.sem1 && grades[subject.name]?.sem1 !== 0) {
          errors.push(`${subject.name} Semestre 1 est requis`);
        }
        if (!grades[subject.name]?.sem2 && grades[subject.name]?.sem2 !== 0) {
          errors.push(`${subject.name} Semestre 2 est requis`);
        }
      } else {
        if (
          !grades[subject.name]?.single &&
          grades[subject.name]?.single !== 0
        ) {
          errors.push(`${subject.name} est requis`);
        }
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
    (subject: string, field: "sem1" | "sem2" | "single") => {
      setGrades((prev) => {
        const currentValue = prev[subject]?.[field];
        const validatedValue = validateGrade(currentValue);

        if (currentValue === validatedValue) return prev;

        return {
          ...prev,
          [subject]: {
            ...prev[subject],
            [field]: validatedValue,
          },
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
    localStorage.removeItem("constantineMedicineGrades");
  }, []);

  const calculateAverage = useCallback(() => {
    const subjectAverages: Record<string, number> = {};
    let totalWeightedGrade = 0;
    let totalCoefficients = 0;
    const warnings: string[] = [];
    const modulesBelowFive: string[] = [];
    const modulesBetweenFiveAndTen: string[] = [];

    SUBJECTS.forEach((subject) => {
      let average: number | undefined;

      if (subject.type === "annuel") {
        const sem1 = grades[subject.name]?.sem1;
        const sem2 = grades[subject.name]?.sem2;
        if (sem1 !== undefined && sem2 !== undefined) {
          average = (sem1 + sem2) / 2;
        }
      } else {
        average = grades[subject.name]?.single;
      }

      if (average !== undefined) {
        subjectAverages[subject.name] = average;
        totalWeightedGrade += average * subject.coefficient;
        totalCoefficients += subject.coefficient;

        if (average < 5) {
          modulesBelowFive.push(subject.name);
        } else if (average < 10) {
          modulesBetweenFiveAndTen.push(subject.name);
        }
      }
    });

    const finalAverage =
      totalCoefficients > 0 ? totalWeightedGrade / totalCoefficients : 0;

    let status: string;
    if (finalAverage >= 10) {
      if (modulesBelowFive.length > 0) {
        status = "Rattrapage obligatoire";
        modulesBelowFive.forEach((module) => {
          warnings.push(`Rattrapage obligatoire pour ${module}`);
        });
      } else {
        status = "✅ Passage en 2ème année";
      }
    } else {
      status = "Rattrapage";
      modulesBelowFive.forEach((module) => {
        warnings.push(`Rattrapage obligatoire pour ${module}`);
      });
      modulesBetweenFiveAndTen.forEach((module) => {
        warnings.push(`Rattrapage facultatif pour ${module}`);
      });
    }

    return { average: finalAverage, warnings, status, subjectAverages };
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
      if (grade < 5) return "#dc2626";
      if (grade < 10) return "#333333";
      return "#16a34a";
    };

    const getGradeRemark = (grade: number) => {
      if (grade < 5) return "Rattrapage obligatoire";
      if (grade < 10) return "Rattrapage facultatif";
      return "Validé";
    };

    const today = new Date();
    const academicYear = `${today.getFullYear() - 1}-${today.getFullYear()}`;
    const studentName = "Étudiant(e)";

    const content = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Relevé de Notes - ${studentName}</title>
      <link href="https://fonts.googleapis.com/css2?family=Lexend+Deca:wght@300;400;700&display=swap" rel="stylesheet">
      <style>
        @page { margin: 2cm; }
        *{font-family: "Lexend Deca", serif;}  
        body { 
          font-family: "Lexend Deca", serif;
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
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo-placeholder"><img src="https://tbib.space/loogo.png" alt="LOGO" style="width: 120px;"></div>
          <div class="logo-placeholder">Université Constantine 3</div>
          <h1>RELEVÉ DE NOTES</h1>
          <p>Première Année Médecine</p>
          <p>Année universitaire ${academicYear}</p>
        </div>
        
        <div class="student-info">
          <p><strong>Nom et prénom:</strong> ${studentName}</p>
          <p><strong>Spécialité:</strong> Médecine</p>
          <p><strong>Niveau:</strong> 1ère Année</p>
          <p><strong>Date d'édition:</strong> ${formatDate(today)}</p>
        </div>
        
        <table>
          <thead>
            <tr>
              <th>Matière</th>
              <th>Type</th>
              <th>Coefficient</th>
              <th>Moyenne</th>
              <th>Observation</th>
            </tr>
          </thead>
          <tbody>
            ${Object.entries(result.subjectAverages || {})
              .map(([subject, average]) => {
                const subjectInfo = SUBJECTS.find((s) => s.name === subject);
                return `
                <tr>
                  <td>${subject}</td>
                  <td>${
                    subjectInfo?.type === "annuel" ? "Annuel" : "Semestriel"
                  }</td>
                  <td>${subjectInfo?.coefficient || 1}</td>
                  <td style="color: ${getGradeColor(
                    average
                  )}; font-weight: bold;">
                    ${average.toFixed(2)}/20
                  </td>
                  <td style="color: ${getGradeColor(average)};">
                    ${getGradeRemark(average)}
                  </td>
                </tr>
              `;
              })
              .join("")}
          </tbody>
        </table>
        
        <div class="results-summary">
          <h2>Résultats Finaux</h2>
          <div class="average">Moyenne générale: ${result.average.toFixed(
            2
          )}/20</div>
          <div class="status" style="background-color: ${
            result.status.includes("Passage")
              ? "#dcfce7; color: #16a34a;"
              : "#fee2e2; color: #dc2626;"
          }">
            ${result.status}
          </div>
        </div>
        
        ${
          result.warnings.length > 0
            ? `
          <div class="warnings">
            <h3>Observations importantes:</h3>
            <ul>
              ${result.warnings
                .map((warning) => `<li class="warning">${warning}</li>`)
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
  }, [result]);

  return (
    <div className="max-w-4xl px-4 py-8 mx-auto">
            <Helmet>
              <title>Calculateur de Notes - 1ère Année Médecine Costantine</title>
              <meta
                name="description"
                content="Calculez facilement votre moyenne avec la calculatrice de TBiB. Un outil simple, rapide et précis."
              />
              <meta
                name="keywords"
                content="calculatrice médicale, calculatrice médicale tbib, calculatrice médicale tbib cours, tbib cours calculatrice médicale, tbib calculatrice médicale, calculatrice tbib, calculatrice tbib cours, tbib cours calculatrice, tbib calculatrice, calcul médical, outil médical en ligne, médecine, étudiants en médecine, TBiB, TBiB Cours, TBiB Academy, tbib calculator, tbib calculatrice, calculatrice santé, formules médicales, formules physiologiques, convertisseur médical, calculs cliniques, médecine Algérie, études médicales, tbib space, study with tbib, outils étudiants médecine"
              />
            </Helmet>
      <h1 className="mb-4 text-3xl font-bold text-gray-900">
        Calculateur de Notes - 1ère Année Médecine
      </h1>
      <p className="mb-8 text-gray-600">Université Constantine 3</p>

      {validationErrors.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 mb-6 border border-red-200 rounded-lg bg-red-50"
        >
          <h4 className="flex items-center mb-2 font-medium text-red-800">
            <AlertTriangle className="w-5 h-5 mr-2" />
            Veuillez corriger les erreurs suivantes:
          </h4>
          <ul className="text-sm text-red-700 list-disc list-inside">
            {validationErrors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </motion.div>
      )}

      <div className="flex justify-end mb-8">
        <button
          onClick={resetGrades}
          className="flex items-center gap-2 px-4 py-2 font-medium text-red-600 transition-colors bg-red-100 rounded-lg hover:bg-red-200"
        >
          <RefreshCw className="w-4 h-4" />
          Réinitialiser
        </button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 mb-6 bg-white rounded-lg shadow-sm"
      >
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {SUBJECTS.map((subject) => (
            <motion.div
              key={subject.name}
              className="space-y-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <label className="block text-sm font-medium text-gray-700">
                {subject.name}
                <span className="ml-1 text-xs text-gray-500">
                  ({subject.type === "annuel" ? "Annuel" : "Semestriel"}, Coeff:{" "}
                  {subject.coefficient})
                </span>
              </label>

              {subject.type === "annuel" ? (
                <div className="flex space-x-2">
                  <input
                    type="number"
                    min="0"
                    max="20"
                    step="0.25"
                    placeholder="Semestre 1"
                    value={grades[subject.name]?.sem1 ?? ""}
                    onChange={(e) =>
                      handleGradeChange(subject.name, "sem1", e.target.value)
                    }
                    onBlur={() => handleBlur(subject.name, "sem1")}
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                  <input
                    type="number"
                    min="0"
                    max="20"
                    step="0.25"
                    placeholder="Semestre 2"
                    value={grades[subject.name]?.sem2 ?? ""}
                    onChange={(e) =>
                      handleGradeChange(subject.name, "sem2", e.target.value)
                    }
                    onBlur={() => handleBlur(subject.name, "sem2")}
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>
              ) : (
                <input
                  type="number"
                  min="0"
                  max="20"
                  step="0.25"
                  placeholder="Note"
                  value={grades[subject.name]?.single ?? ""}
                  onChange={(e) =>
                    handleGradeChange(subject.name, "single", e.target.value)
                  }
                  onBlur={() => handleBlur(subject.name, "single")}
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              )}
            </motion.div>
          ))}
        </div>

        <div className="flex justify-center mt-8">
          <button
            onClick={handleCalculate}
            className="px-6 py-3 font-medium text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
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
            className="p-6 mb-8 bg-white rounded-lg shadow-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">Résultats</h3>
              <button
                onClick={handlePrint}
                className="p-2 text-gray-600 rounded-lg hover:bg-gray-100"
                title="Imprimer les résultats"
              >
                <Printer className="w-5 h-5" />
              </button>
            </div>

            {result.subjectAverages && (
              <div className="mb-4 space-y-2">
                <h4 className="font-medium text-gray-700">
                  Moyennes par matière:
                </h4>
                <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                  {Object.entries(result.subjectAverages).map(
                    ([subject, average]) => {
                      const subjectInfo = SUBJECTS.find(
                        (s) => s.name === subject
                      );
                      return (
                        <div
                          key={subject}
                          className={`flex justify-between text-sm p-2 rounded-md ${
                            average < 5
                              ? "bg-red-50"
                              : average < 10
                              ? "bg-yellow-50"
                              : "bg-green-50"
                          }`}
                        >
                          <span>
                            {subject} (
                            {subjectInfo?.type === "annuel"
                              ? "Annuel"
                              : "Semestriel"}
                            ):
                          </span>
                          <span
                            className={`font-medium ${
                              average < 5
                                ? "text-red-600"
                                : average < 10
                                ? "text-yellow-600"
                                : "text-green-600"
                            }`}
                          >
                            {average.toFixed(2)}/20
                          </span>
                        </div>
                      );
                    }
                  )}
                </div>
                <hr className="my-2" />
              </div>
            )}

            <div className="mb-4 text-center">
              <div className="mb-2 text-4xl">
                {getEmojiForScore(result.average)}
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {result.average.toFixed(2)}/20
              </div>
              <div
                className={`mt-2 text-lg font-medium ${
                  result.status.includes("Passage")
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {result.status}
              </div>
            </div>

            {result.warnings.length > 0 && (
              <div className="p-3 mt-4 rounded-lg bg-red-50">
                <h4 className="flex items-center mb-2 font-medium text-red-800">
                  <AlertTriangle className="w-5 h-5 mr-1" />
                  Avertissements:
                </h4>
                <ul className="text-sm text-red-700 list-disc list-inside">
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
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-lg p-6 bg-white rounded-lg shadow-xl"
            >
              <button
                onClick={() => setShowModal(false)}
                className="absolute text-gray-400 top-4 right-4 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>

              <h3 className="mb-4 text-xl font-bold text-gray-900">
                Résultats
              </h3>

              <div className="mb-4 text-center">
                <div className="mb-2 text-4xl">
                  {getEmojiForScore(result.average)}
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {result.average.toFixed(2)}/20
                </div>
                <div
                  className={`mt-2 text-lg font-medium ${
                    result.status.includes("Passage")
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {result.status}
                </div>
              </div>

              {result.warnings.length > 0 && (
                <div className="p-3 mt-4 rounded-lg bg-red-50">
                  <h4 className="flex items-center mb-2 font-medium text-red-800">
                    <AlertTriangle className="w-5 h-5 mr-1" />
                    Avertissements:
                  </h4>
                  <ul className="text-sm text-red-700 list-disc list-inside">
                    {result.warnings.map((warning, index) => (
                      <li key={index}>{warning}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex justify-end mt-6 space-x-3">
                <button
                  onClick={handlePrint}
                  className="flex items-center px-4 py-2 font-medium text-gray-700 transition-colors bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  <Printer className="w-4 h-4 mr-2" />
                  Imprimer
                </button>
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 font-medium text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
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
