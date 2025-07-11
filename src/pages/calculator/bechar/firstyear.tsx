import React, { useState, useCallback, useEffect } from "react";
import { X, AlertTriangle, Printer, RefreshCw } from "lucide-react";
import { Helmet } from "react-helmet-async";

type SubjectType = "annuelle" | "semestrielle";
type ComponentType = "TP" | null;

type Subject = {
  name: string;
  type: SubjectType;
  coefficient: number;
  component?: ComponentType;
};

type GradeData = {
  s1?: number;
  s2?: number;
  tp?: number;
  note?: number; // For semestrielle subjects
};

const SUBJECTS: Subject[] = [
  // Annual modules (Coefficient 2, with TP)
  { name: "Anatomie", type: "annuelle", coefficient: 2, component: "TP" },
  { name: "Biochimie", type: "annuelle", coefficient: 2, component: "TP" },
  { name: "Cytologie", type: "annuelle", coefficient: 2, component: "TP" },
  { name: "Biostatistique", type: "annuelle", coefficient: 2, component: "TP" },
  { name: "Biophysique", type: "annuelle", coefficient: 2, component: "TP" },
  { name: "Chimie", type: "annuelle", coefficient: 2, component: "TP" },
  // Semestrial modules (Coefficient 1)
  {
    name: "Embryologie",
    type: "semestrielle",
    coefficient: 1,
    component: "TP",
  },
  { name: "Histologie", type: "semestrielle", coefficient: 1, component: "TP" },
  { name: "Physiologie", type: "semestrielle", coefficient: 1 },
  { name: "SSH", type: "semestrielle", coefficient: 1 },
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

export default function BecharFirstYearCalculator() {
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

  // Store data in state (localStorage not supported in Claude artifacts)
  const saveData = useCallback((data: StoredData) => {
    // In a real implementation, this would save to localStorage
    // For now, we'll just keep it in memory
    console.log("Data would be saved to localStorage:", data);
  }, []);

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
      if (subject.type === "annuelle") {
        // For annual modules with TP: Average = ([(S1 + S2)/2] × 4 + TP) / 5
        const { s1, s2, tp } = gradeData;
        if (s1 !== undefined && s2 !== undefined && tp !== undefined) {
          return (((s1 + s2) / 2) * 4 + tp) / 5;
        }
      } else {
        // semestrielle
        if (subject.component === "TP") {
          // For semestrial modules with TP: Average = (Note × 4 + TP) / 5
          const { note, tp } = gradeData;
          if (note !== undefined && tp !== undefined) {
            return (note * 4 + tp) / 5;
          }
        } else {
          // For semestrial modules without TP: Average = the same note provided
          const { note } = gradeData;
          if (note !== undefined) {
            return note;
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

      if (subject.type === "annuelle") {
        if (gradeData.s1 === undefined) {
          errors.push(`${subject.name} - Semestre 1 requis`);
        }
        if (gradeData.s2 === undefined) {
          errors.push(`${subject.name} - Semestre 2 requis`);
        }
        if (subject.component === "TP" && gradeData.tp === undefined) {
          errors.push(`${subject.name} - Note TP requise`);
        }
      } else {
        // semestrielle
        if (gradeData.note === undefined) {
          errors.push(`${subject.name} - Note requise`);
        }
        if (subject.component === "TP" && gradeData.tp === undefined) {
          errors.push(`${subject.name} - Note TP requise`);
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

    // Calculate final average: sum of (each module's average × its coefficient) / 16
    const finalAverage = totalWeightedGrades / 16;

    // Determine status and warnings
    let status = "";
    const modulesBelow5: string[] = [];
    const modulesBetween5And10: string[] = [];

    Object.entries(moduleAverages).forEach(([subjectName, average]) => {
      if (average < 5) {
        modulesBelow5.push(subjectName);
      } else if (average < 10) {
        modulesBetween5And10.push(subjectName);
      }
    });

    if (finalAverage >= 10) {
      if (modulesBelow5.length === 0) {
        status = "✅ Passage en 2ème année";
      } else {
        status = "Rattrapage nécessaire";
        modulesBelow5.forEach((subject) => {
          warnings.push(`Rattrapage obligatoire pour ${subject}`);
        });
      }
    } else {
      status = "Rattrapage";
      modulesBelow5.forEach((subject) => {
        warnings.push(`Rattrapage obligatoire pour ${subject}`);
      });
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

    // Save data
    saveData({ grades, result: calculationResult });
  }, [grades, validateInputs, calculateModuleAverage, saveData]);

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
          <div class="logo-placeholder">UNIVERSITÉ DE BÉCHAR</div>
          <h1>RELEVÉ DE NOTES</h1>
          <p>Première Année Médecine - Année universitaire ${academicYear}</p>
        </div>
        
        <div class="student-info">
          <p><strong>Nom et prénom:</strong> ${studentName}</p>
          <p><strong>Spécialisation:</strong> Médecine</p>
          <p><strong>Niveau:</strong> Première Année</p>
          <p><strong>Date d'édition:</strong> ${formatDate(today)}</p>
        </div>
        
        <table>
          <thead>
            <tr>
              <th>Module</th>
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
                  <td>${subject.type}</td>
                  <td>${subject.coefficient}</td>
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
            }).join("")}
          </tbody>
        </table>
        
        <div class="results-summary">
          <h2>Résultats Finaux</h2>
          <div class="average">Moyenne générale: ${result.finalAverage.toFixed(
            2
          )}/20</div>
          <div class="status" style="background-color: ${
            result.status.includes("✅")
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
    <div className="max-w-6xl px-4 py-8 mx-auto">
            <Helmet>
              <title>Calculateur de Notes - 1ère Année Médecine Bechar</title>
              <meta
                name="description"
                content="Calculez facilement votre moyenne avec la calculatrice de TBiB. Un outil simple, rapide et précis."
              />
              <meta
                name="keywords"
                content="calculatrice médicale, calculatrice médicale tbib, calculatrice médicale tbib cours, tbib cours calculatrice médicale, tbib calculatrice médicale, calculatrice tbib, calculatrice tbib cours, tbib cours calculatrice, tbib calculatrice, calcul médical, outil médical en ligne, médecine, étudiants en médecine, TBiB, TBiB Cours, TBiB Academy, tbib calculator, tbib calculatrice, calculatrice santé, formules médicales, formules physiologiques, convertisseur médical, calculs cliniques, médecine Algérie, études médicales, tbib space, study with tbib, outils étudiants médecine"
              />
            </Helmet>
      <h1 className="mb-8 text-3xl font-bold text-gray-900">
        Calculateur de Notes - 1ère Année Médecine
      </h1>
      <p className="mb-8 text-gray-600">Université de Béchar</p>

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
                {subject.name} ({subject.type}, Coefficient:{" "}
                {subject.coefficient}
              </h3>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                {subject.type === "annuelle" ? (
                  <>
                    <div>
                      <label className="block mb-1 text-sm font-medium text-gray-700">
                        Semestre 1
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="20"
                        step="0.25"
                        placeholder="Note S1"
                        value={grades[subject.name]?.s1 ?? ""}
                        onChange={(e) =>
                          handleGradeChange(subject.name, "s1", e.target.value)
                        }
                        onBlur={() => handleBlur(subject.name, "s1")}
                        className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block mb-1 text-sm font-medium text-gray-700">
                        Semestre 2
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="20"
                        step="0.25"
                        placeholder="Note S2"
                        value={grades[subject.name]?.s2 ?? ""}
                        onChange={(e) =>
                          handleGradeChange(subject.name, "s2", e.target.value)
                        }
                        onBlur={() => handleBlur(subject.name, "s2")}
                        className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block mb-1 text-sm font-medium text-gray-700">
                        Note TP
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="20"
                        step="0.25"
                        placeholder="Note TP"
                        value={grades[subject.name]?.tp ?? ""}
                        onChange={(e) =>
                          handleGradeChange(subject.name, "tp", e.target.value)
                        }
                        onBlur={() => handleBlur(subject.name, "tp")}
                        className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="block mb-1 text-sm font-medium text-gray-700">
                        Note
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="20"
                        step="0.25"
                        placeholder="Note"
                        value={grades[subject.name]?.note ?? ""}
                        onChange={(e) =>
                          handleGradeChange(
                            subject.name,
                            "note",
                            e.target.value
                          )
                        }
                        onBlur={() => handleBlur(subject.name, "note")}
                        className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    {subject.component === "TP" && (
                      <div>
                        <label className="block mb-1 text-sm font-medium text-gray-700">
                          Note TP
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="20"
                          step="0.25"
                          placeholder="Note TP"
                          value={grades[subject.name]?.tp ?? ""}
                          onChange={(e) =>
                            handleGradeChange(
                              subject.name,
                              "tp",
                              e.target.value
                            )
                          }
                          onBlur={() => handleBlur(subject.name, "tp")}
                          className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>
                    )}
                  </>
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
              Moyennes par module:
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
                result.status.includes("✅") ? "text-green-600" : "text-red-600"
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
                Moyennes par module:
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
                  result.status.includes("✅")
                    ? "text-green-600"
                    : "text-red-600"
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
