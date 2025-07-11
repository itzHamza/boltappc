import React, { useState, useCallback, useEffect } from "react";
import { X, AlertTriangle, Printer, RefreshCw } from "lucide-react";

type SubjectType = "unit" | "module";
type ComponentType = "TP" | "TD" | null;

type Subject = {
  name: string;
  type: SubjectType;
  coefficient: number;
  components?: ComponentType[];
};

type GradeData = {
  exam?: number;
  tpAnatomy?: number;
  tpHistology?: number;
  tdPhysiology?: number;
  td?: number;
};

const SUBJECTS: Subject[] = [
  { name: "Cardio", type: "unit", coefficient: 4, components: ["TP", "TD"] },
  { name: "Digestive", type: "unit", coefficient: 4, components: ["TP", "TD"] },
  { name: "Urinary", type: "unit", coefficient: 4, components: ["TP", "TD"] },
  { name: "Endocrinology", type: "unit", coefficient: 4, components: ["TP", "TD"] },
  { name: "Neurology", type: "unit", coefficient: 4, components: ["TP", "TD"] },
  { name: "Genetics", type: "module", coefficient: 2, components: ["TD"] },
  { name: "Immunology", type: "module", coefficient: 2, components: [] },
];

type StoredData = {
  grades: Record<string, GradeData>;
  result: {
    moduleAverages: Record<string, number>;
    finalAverage: number;
    status: string;
    warnings: string[];
  } | null;
};

export default function BatnaSecondYearCalculator() {
  const [grades, setGrades] = useState<Record<string, GradeData>>({});
  const [result, setResult] = useState<{
    moduleAverages: Record<string, number>;
    finalAverage: number;
    status: string;
    warnings: string[];
  } | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Load data from memory on component mount
  useEffect(() => {
    // In Claude.ai artifacts, we can't use localStorage, so we'll use component state
    // This data will persist during the session
  }, []);

  // Save data to memory whenever grades or result change
  useEffect(() => {
    // In a real environment, this would save to localStorage
    // For Claude.ai, we'll keep data in memory during the session
  }, [grades, result]);

  const handleGradeChange = useCallback(
    (subject: string, field: string, value: string) => {
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

  const validateGrade = useCallback((value: number | undefined) => {
    if (value === undefined) return undefined;
    if (isNaN(value)) return undefined;
    return Math.max(0, Math.min(20, value));
  }, []);

  const handleBlur = useCallback(
    (subject: string, field: string) => {
      setGrades((prev) => {
        const currentValue = prev[subject]?.[field as keyof GradeData];
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

  const calculateModuleAverage = useCallback(
    (subject: Subject, gradeData: GradeData): number | null => {
      if (subject.type === "unit") {
        // Unit Average Formula: {(Exam Note × 4) + [(TP Anatomy + TP Histology + TD Physiology) / 3]} ÷ 5
        const { exam, tpAnatomy, tpHistology, tdPhysiology } = gradeData;
        if (exam !== undefined && tpAnatomy !== undefined && tpHistology !== undefined && tdPhysiology !== undefined) {
          const practicalAverage = (tpAnatomy + tpHistology + tdPhysiology) / 3;
          return (exam * 4 + practicalAverage) / 5;
        }
      } else if (subject.type === "module") {
        if (subject.name === "Genetics") {
          // Genetics: Average = ((Exam × 2) + TD) / 3
          const { exam, td } = gradeData;
          if (exam !== undefined && td !== undefined) {
            return (exam * 2 + td) / 3;
          }
        } else if (subject.name === "Immunology") {
          // Immunology: Average = Exam only
          const { exam } = gradeData;
          if (exam !== undefined) {
            return exam;
          }
        }
      }
      return null;
    },
    []
  );

  const validateInputs = useCallback(() => {
    const errors: string[] = [];

    SUBJECTS.forEach((subject) => {
      const gradeData = grades[subject.name] || {};

      if (subject.type === "unit") {
        if (gradeData.exam === undefined) {
          errors.push(`${subject.name} - Note d'examen requise`);
        }
        if (gradeData.tpAnatomy === undefined) {
          errors.push(`${subject.name} - Note TP Anatomie requise`);
        }
        if (gradeData.tpHistology === undefined) {
          errors.push(`${subject.name} - Note TP Histologie requise`);
        }
        if (gradeData.tdPhysiology === undefined) {
          errors.push(`${subject.name} - Note TD Physiologie requise`);
        }
      } else if (subject.type === "module") {
        if (gradeData.exam === undefined) {
          errors.push(`${subject.name} - Note d'examen requise`);
        }
        if (subject.name === "Genetics" && gradeData.td === undefined) {
          errors.push(`${subject.name} - Note TD requise`);
        }
      }
    });

    setValidationErrors(errors);
    return errors.length === 0;
  }, [grades]);

  const calculateResults = useCallback(() => {
    if (!validateInputs()) return;

    const moduleAverages: Record<string, number> = {};
    let totalWeightedGrades = 0;
    let totalCoefficients = 0;
    const warnings: string[] = [];

    // Calculate module averages
    SUBJECTS.forEach((subject) => {
      const gradeData = grades[subject.name] || {};
      const average = calculateModuleAverage(subject, gradeData);

      if (average !== null) {
        moduleAverages[subject.name] = average;
        totalWeightedGrades += average * subject.coefficient;
        totalCoefficients += subject.coefficient;
      }
    });

    // Calculate final average (total coefficient should be 24)
    const finalAverage = totalCoefficients > 0 ? totalWeightedGrades / totalCoefficients : 0;

    // Determine status and warnings
    let status = "";
    const modulesBelow5: string[] = [];
    const modulesBetween5And10: string[] = [];
    let allModulesAbove5 = true;

    Object.entries(moduleAverages).forEach(([subjectName, average]) => {
      if (average < 5) {
        modulesBelow5.push(subjectName);
        allModulesAbove5 = false;
      } else if (average < 10) {
        modulesBetween5And10.push(subjectName);
      }
    });

    if (finalAverage >= 10) {
      if (allModulesAbove5) {
        status = "✅ Passage en 3ème année";
      } else {
        status = "❌ Rattrapage obligatoire";
        modulesBelow5.forEach((subject) => {
          warnings.push(`Rattrapage obligatoire pour ${subject}`);
        });
      }
    } else {
      if (modulesBelow5.length > 0) {
        status = "❌ Rattrapage obligatoire";
        modulesBelow5.forEach((subject) => {
          warnings.push(`Rattrapage obligatoire pour ${subject}`);
        });
      } else {
        status = "📌 Rattrapage facultatif";
      }
      
      modulesBetween5And10.forEach((subject) => {
        warnings.push(`Rattrapage facultatif pour ${subject}`);
      });
    }

    const calculationResult = {
      moduleAverages,
      finalAverage,
      status,
      warnings,
    };

    setResult(calculationResult);
    setShowResults(true);
    setShowModal(true);
  }, [grades, validateInputs, calculateModuleAverage]);

  const resetGrades = useCallback(() => {
    setGrades({});
    setResult(null);
    setShowResults(false);
    setValidationErrors([]);
  }, []);

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
      if (grade < 5) return "Rattrapage Obligatoire";
      if (grade < 10) return "Rattrapage Facultatif";
      return "Validé";
    };

    const today = new Date();
    const academicYear = `${today.getFullYear() - 1}-${today.getFullYear()}`;
    const studentName = "Étudiant(e)";

    const content = `
    <!DOCTYPE html>
    <html>
    <head>
      <link href="https://fonts.googleapis.com/css2?family=Lexend+Deca:wght@300;400;700&family=Serif:wght@400;700&display=swap" rel="stylesheet">
      <title>Relevé de Notes - ${studentName}</title>
      <style>
        @page { margin: 2cm; }
        * { font-family: "Lexend Deca", serif; }
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
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo-placeholder">UNIVERSITÉ DE BATNA</div>
          <h1>RELEVÉ DE NOTES</h1>
          <p>Deuxième Année Médecine - Année universitaire ${academicYear}</p>
        </div>
        
        <div class="student-info">
          <p><strong>Nom et prénom:</strong> ${studentName}</p>
          <p><strong>Spécialisation:</strong> Médecine</p>
          <p><strong>Niveau:</strong> Deuxième Année</p>
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
            ${SUBJECTS.map((subject) => {
              const average = result.moduleAverages[subject.name] || 0;
              return `
                <tr>
                  <td>${subject.name}</td>
                  <td>${subject.type === "unit" ? "Unité" : "Module"}</td>
                  <td>${subject.coefficient}</td>
                  <td style="color: ${getGradeColor(average)}; font-weight: bold;">
                    ${average.toFixed(2)}/20
                  </td>
                  <td style="color: ${getGradeColor(average)};">
                    ${getGradeRemark(average)}
                  </td>
                </tr>
              `;
            }).join("")}
          </tbody>
        </table>
        
        <div class="results-summary">
          <h2>Résultats Finaux</h2>
          <div class="average">Moyenne générale: ${result.finalAverage.toFixed(2)}/20</div>
          <div class="status" style="background-color: ${
            result.status.includes("✅") ? "#dcfce7; color: #16a34a;" : 
            result.status.includes("📌") ? "#fef3c7; color: #d97706;" : 
            "#fee2e2; color: #dc2626;"
          }">
            ${result.status}
          </div>
        </div>
        
        ${result.warnings.length > 0 ? `
          <div class="warnings">
            <h3>Observations importantes:</h3>
            <ul>
              ${result.warnings.map((warning) => `<li class="warning">${warning}</li>`).join("")}
            </ul>
          </div>
        ` : ""}
        
        <div class="footer">
          <p>Ce document est un relevé de notes non officiel</p>
          <p>Généré le ${formatDate(today)} à ${today.toLocaleTimeString("fr-FR")}</p>
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
    <div className="max-w-6xl px-4 py-8 mx-auto">
      <h1 className="mb-8 text-3xl font-bold text-gray-900">
        Calculateur de Notes - 2ème Année Médecine
      </h1>
      <p className="mb-8 text-gray-600">Université de Batna</p>

      {validationErrors.length > 0 && (
        <div className="p-4 mb-6 border border-red-200 rounded-lg bg-red-50">
          <h4 className="flex items-center mb-2 font-medium text-red-800">
            <AlertTriangle className="w-5 h-5 mr-2" />
            Veuillez corriger les erreurs suivantes:
          </h4>
          <ul className="text-sm text-red-700 list-disc list-inside">
            {validationErrors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex justify-end mb-4">
        <button
          onClick={resetGrades}
          className="flex items-center gap-2 px-4 py-2 font-medium text-red-600 transition-colors bg-red-100 rounded-lg hover:bg-red-200"
        >
          <RefreshCw className="w-4 h-4" />
          Réinitialiser
        </button>
      </div>

      <div className="p-6 mb-6 bg-white rounded-lg shadow-sm">
        <div className="space-y-8">
          {SUBJECTS.map((subject) => (
            <div
              key={subject.name}
              className="pb-6 border-b border-gray-200 last:border-b-0"
            >
              <h3 className="mb-4 text-lg font-semibold text-gray-900">
                {subject.name} ({subject.type === "unit" ? "Unité" : "Module"}, Coefficient: {subject.coefficient})
              </h3>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    Note d'Examen
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="20"
                    step="0.25"
                    placeholder="Note Examen"
                    value={grades[subject.name]?.exam ?? ""}
                    onChange={(e) =>
                      handleGradeChange(subject.name, "exam", e.target.value)
                    }
                    onBlur={() => handleBlur(subject.name, "exam")}
                    className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                {subject.type === "unit" && (
                  <>
                    <div>
                      <label className="block mb-1 text-sm font-medium text-gray-700">
                        TP Anatomie
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="20"
                        step="0.25"
                        placeholder="Note TP Anatomie"
                        value={grades[subject.name]?.tpAnatomy ?? ""}
                        onChange={(e) =>
                          handleGradeChange(subject.name, "tpAnatomy", e.target.value)
                        }
                        onBlur={() => handleBlur(subject.name, "tpAnatomy")}
                        className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block mb-1 text-sm font-medium text-gray-700">
                        TP Histologie
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="20"
                        step="0.25"
                        placeholder="Note TP Histologie"
                        value={grades[subject.name]?.tpHistology ?? ""}
                        onChange={(e) =>
                          handleGradeChange(subject.name, "tpHistology", e.target.value)
                        }
                        onBlur={() => handleBlur(subject.name, "tpHistology")}
                        className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block mb-1 text-sm font-medium text-gray-700">
                        TD Physiologie
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="20"
                        step="0.25"
                        placeholder="Note TD Physiologie"
                        value={grades[subject.name]?.tdPhysiology ?? ""}
                        onChange={(e) =>
                          handleGradeChange(subject.name, "tdPhysiology", e.target.value)
                        }
                        onBlur={() => handleBlur(subject.name, "tdPhysiology")}
                        className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                  </>
                )}

                {subject.name === "Genetics" && (
                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">
                      Note TD
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="20"
                      step="0.25"
                      placeholder="Note TD"
                      value={grades[subject.name]?.td ?? ""}
                      onChange={(e) =>
                        handleGradeChange(subject.name, "td", e.target.value)
                      }
                      onBlur={() => handleBlur(subject.name, "td")}
                      className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-center mt-8">
          <button
            onClick={calculateResults}
            className="px-6 py-3 font-medium text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            Calculer les Résultats
          </button>
        </div>
      </div>

      {showResults && result && (
        <div className="p-6 mb-8 bg-white rounded-lg shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">Résultats</h3>
            <button
              onClick={handlePrint}
              className="p-2 text-gray-600 rounded-lg hover:bg-gray-100"
              title="Imprimer les résultats"
            >
              <Printer className="w-5 h-5" />
            </button>
          </div>

          <div className="mb-6">
            <h4 className="mb-4 font-medium text-gray-700">
              Moyennes par matière:
            </h4>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {Object.entries(result.moduleAverages).map(
                ([subject, average]) => (
                  <div
                    key={subject}
                    className={`flex justify-between items-center p-3 rounded-md ${
                      average < 5
                        ? "bg-red-50 border border-red-200"
                        : average < 10
                        ? "bg-yellow-50 border border-yellow-200"
                        : "bg-green-50 border border-green-200"
                    }`}
                  >
                    <span className="font-medium">{subject}:</span>
                    <span
                      className={`font-bold ${
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
                )
              )}
            </div>
          </div>

          <div className="mb-6 text-center">
            <div className="mb-2 text-4xl">
              {getEmojiForScore(result.finalAverage)}
            </div>
            <div className="mb-2 text-3xl font-bold text-gray-900">
              {result.finalAverage.toFixed(2)}/20
            </div>
            <div
              className={`text-lg font-medium ${
                result.status.includes("✅") ? "text-green-600" : 
                result.status.includes("📌") ? "text-yellow-600" : 
                "text-red-600"
              }`}
            >
              {result.status}
            </div>
          </div>

          {result.warnings.length > 0 && (
            <div className="p-4 mt-6 border border-red-200 rounded-lg bg-red-50">
              <h4 className="flex items-center mb-3 font-medium text-red-800">
                <AlertTriangle className="w-5 h-5 mr-2" />
                Observations importantes:
              </h4>
              <ul className="space-y-1 text-sm text-red-700 list-disc list-inside">
                {result.warnings.map((warning, index) => (
                  <li key={index}>{warning}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      {showModal && result && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute text-gray-400 top-4 right-4 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>

            <h3 className="mb-6 text-xl font-bold text-gray-900">
              Résultats Finaux
            </h3>

            <div className="mb-6">
              <h4 className="mb-4 font-medium text-gray-700">
                Moyennes par matière:
              </h4>
              <div className="space-y-2">
                {Object.entries(result.moduleAverages).map(
                  ([subject, average]) => (
                    <div
                      key={subject}
                      className="flex items-center justify-between"
                    >
                      <span>{subject}:</span>
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
                  )
                )}
              </div>
            </div>

            <div className="mb-6 text-center">
              <div className="mb-2 text-4xl">
                {getEmojiForScore(result.finalAverage)}
              </div>
              <div className="mb-2 text-3xl font-bold text-gray-900">
                {result.finalAverage.toFixed(2)}/20
              </div>
              <div
                className={`text-lg font-medium ${
                  result.status.includes("✅") ? "text-green-600" : 
                  result.status.includes("📌") ? "text-yellow-600" : 
                  "text-red-600"
                }`}
              >
                {result.status}
              </div>
            </div>

            {result.warnings.length > 0 && (
              <div className="p-4 mb-6 border border-red-200 rounded-lg bg-red-50">
                <h4 className="flex items-center mb-3 font-medium text-red-800">
                  <AlertTriangle className="w-5 h-5 mr-2" />
                  Observations importantes:
                </h4>
                <ul className="space-y-1 text-sm text-red-700 list-disc list-inside">
                  {result.warnings.map((warning, index) => (
                    <li key={index}>{warning}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex justify-end space-x-3">
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
            </div>
          </div>
      )}
    </div>
  );
}
