import React, { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, AlertTriangle, Save, Printer, RefreshCw } from "lucide-react";
import { cn } from "../../../../lib/utils";
import { Helmet } from "react-helmet-async";

type Subject = {
  name: string;
  coefficient: number;
  semester1Grade?: number;
  semester2Grade?: number;
};

const SUBJECTS: Subject[] = [
  { name: "Anatomie", coefficient: 2 },
  { name: "Biochimie", coefficient: 2 },
  { name: "Biophysique", coefficient: 2 },
  { name: "Biostatistique", coefficient: 2 },
  { name: "Chimie", coefficient: 2 },
  { name: "Cytologie", coefficient: 2 },
  { name: "Embryologie", coefficient: 1 },
  { name: "SSH", coefficient: 1 },
  { name: "Physiologie", coefficient: 1 },
  { name: "Histologie", coefficient: 1 },
];

const SEMESTER1_SUBJECTS = SUBJECTS.filter(
  (s) => s.name !== "Physiologie" && s.name !== "Histologie"
);
const SEMESTER2_SUBJECTS = SUBJECTS.filter(
  (s) => s.name !== "Embryologie" && s.name !== "SSH"
);

type CalculationType = "semester1" | "semester2" | "annual";

type StoredData = {
  grades: Record<string, { sem1?: number; sem2?: number }>;
  result: {
    average: number;
    warnings: string[];
    status: string;
    subjectAverages?: Record<string, number>;
  } | null;
  calculationType: CalculationType;
};

export function AlgerFirstYearCalculator() {
  const [calculationType, setCalculationType] =
    useState<CalculationType>("semester1");
  const [grades, setGrades] = useState<
    Record<string, { sem1?: number; sem2?: number }>
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
      const savedData = localStorage.getItem("medicalGradesData");
      if (savedData) {
        const parsedData: StoredData = JSON.parse(savedData);
        if (typeof parsedData === "object" && parsedData !== null) {
          setGrades(parsedData.grades);
          setResult(parsedData.result);
          setCalculationType(parsedData.calculationType);
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
        calculationType,
      };
      localStorage.setItem("medicalGradesData", JSON.stringify(dataToSave));
    } catch (e) {
      console.error("Failed to save data:", e);
    }
  }, [grades, result, calculationType]);

  useEffect(() => {
    setResult(null);
    setShowResults(false);
    setShowModal(false);
  }, [calculationType]);

  const handleGradeChange = useCallback(
    (subject: string, semester: "sem1" | "sem2", value: string) => {
      const numValue = value === "" ? undefined : parseFloat(value);
      setGrades((prev) => ({
        ...prev,
        [subject]: {
          ...prev[subject],
          [semester]: numValue,
        },
      }));
      setValidationErrors([]);
    },
    []
  );

  const validateInputs = useCallback(() => {
    const errors: string[] = [];
    const currentSubjects =
      calculationType === "semester1"
        ? SEMESTER1_SUBJECTS
        : calculationType === "semester2"
        ? SEMESTER2_SUBJECTS
        : SUBJECTS;

    currentSubjects.forEach((subject) => {
      if (calculationType === "annual") {
        if (
          subject.name !== "Embryologie" &&
          subject.name !== "SSH" &&
          subject.name !== "Physiologie" &&
          subject.name !== "Histologie"
        ) {
          if (!grades[subject.name]?.sem1 && grades[subject.name]?.sem1 !== 0) {
            errors.push(`${subject.name} Semestre 1 est requis`);
          }
          if (!grades[subject.name]?.sem2 && grades[subject.name]?.sem2 !== 0) {
            errors.push(`${subject.name} Semestre 2 est requis`);
          }
        } else if (subject.name === "Embryologie" || subject.name === "SSH") {
          if (!grades[subject.name]?.sem1 && grades[subject.name]?.sem1 !== 0) {
            errors.push(`${subject.name} est requis`);
          }
        } else if (
          subject.name === "Physiologie" ||
          subject.name === "Histologie"
        ) {
          if (!grades[subject.name]?.sem2 && grades[subject.name]?.sem2 !== 0) {
            errors.push(`${subject.name} est requis`);
          }
        }
      } else {
        const semester = calculationType === "semester1" ? "sem1" : "sem2";
        if (
          !grades[subject.name]?.[semester] &&
          grades[subject.name]?.[semester] !== 0
        ) {
          errors.push(`${subject.name} est requis`);
        }
      }
    });

    setValidationErrors(errors);
    return errors.length === 0;
  }, [calculationType, grades]);

  const validateGrade = useCallback((value: number | undefined) => {
    if (value === undefined) return undefined;
    if (isNaN(value)) return undefined;
    return Math.max(0, Math.min(20, value));
  }, []);

  const handleBlur = useCallback(
    (subject: string, semester: "sem1" | "sem2") => {
      setGrades((prev) => {
        const currentValue = prev[subject]?.[semester];
        const validatedValue = validateGrade(currentValue);

        if (currentValue === validatedValue) return prev;

        return {
          ...prev,
          [subject]: {
            ...prev[subject],
            [semester]: validatedValue,
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
    localStorage.removeItem("medicalGradesData");
  }, []);

  const calculateSemesterAverage = useCallback(
    (semesterSubjects: Subject[], semesterKey: "sem1" | "sem2") => {
      let totalWeightedGrade = 0;
      let totalCoefficients = 0;
      const warnings: string[] = [];
      let hasDirectRattrapage = false;
      let hasCompensationNeeded = false;

      semesterSubjects.forEach((subject) => {
        const grade = grades[subject.name]?.[semesterKey];
        if (grade !== undefined) {
          totalWeightedGrade += grade * subject.coefficient;
          totalCoefficients += subject.coefficient;

          if (grade < 5) {
            if (
              (semesterKey === "sem1" &&
                (subject.name === "Embryologie" || subject.name === "SSH")) ||
              (semesterKey === "sem2" &&
                (subject.name === "Physiologie" ||
                  subject.name === "Histologie"))
            ) {
              hasDirectRattrapage = true;
              warnings.push(`Rattrapage direct requis pour ${subject.name}`);
            } else {
              hasCompensationNeeded = true;
              warnings.push(
                `⚠️ Danger Rattrapage pour ${
                  subject.name
                }, compensation requise en Semestre ${
                  semesterKey === "sem1" ? "2" : "1"
                }`
              );
            }
          }
        }
      });

      const average =
        totalCoefficients > 0 ? totalWeightedGrade / totalCoefficients : 0;
      const status = hasDirectRattrapage
        ? "Rattrapage"
        : hasCompensationNeeded
        ? `⚠️ Danger Rattrapage, compensation requise en Semestre ${
            semesterKey === "sem1" ? "2" : "1"
          }`
        : average >= 10
        ? "Réussite"
        : "Note insuffisante";

      return { average, warnings, status };
    },
    [grades]
  );

  const calculateAnnualAverage = useCallback(() => {
    const subjectAverages: Record<string, number> = {};
    let totalWeightedGrade = 0;
    let totalCoefficients = 0;
    const warnings: string[] = [];
    const subjectsBelowFive: string[] = [];
    const subjectsBetweenFiveAndTen: string[] = [];

    SUBJECTS.forEach((subject) => {
      const sem1Grade = grades[subject.name]?.sem1;
      const sem2Grade = grades[subject.name]?.sem2;

      let average: number | undefined;

      if (subject.name === "Embryologie" || subject.name === "SSH") {
        average = sem1Grade;
      } else if (
        subject.name === "Physiologie" ||
        subject.name === "Histologie"
      ) {
        average = sem2Grade;
      } else if (sem1Grade !== undefined && sem2Grade !== undefined) {
        average = (sem1Grade + sem2Grade) / 2;
      }

      if (average !== undefined) {
        subjectAverages[subject.name] = average;
        totalWeightedGrade += average * subject.coefficient;
        totalCoefficients += subject.coefficient;

        if (average < 5) {
          subjectsBelowFive.push(subject.name);
        } else if (average < 10) {
          subjectsBetweenFiveAndTen.push(subject.name);
        }
      }
    });

    const average =
      totalCoefficients > 0 ? totalWeightedGrade / totalCoefficients : 0;

    let status: string;
    if (average >= 10) {
      if (subjectsBelowFive.length > 0) {
        status = "Rattrapage";
        subjectsBelowFive.forEach((subject) => {
          warnings.push(`Rattrapage obligatoire pour ${subject}`);
        });
      } else {
        status = "✅ Pass to the next year";
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

    return { average, warnings, status, subjectAverages };
  }, [grades]);

  const handleCalculate = useCallback(() => {
    if (!validateInputs()) {
      return;
    }

    let calculationResult;
    if (calculationType === "semester1") {
      calculationResult = calculateSemesterAverage(SEMESTER1_SUBJECTS, "sem1");
    } else if (calculationType === "semester2") {
      calculationResult = calculateSemesterAverage(SEMESTER2_SUBJECTS, "sem2");
    } else {
      calculationResult = calculateAnnualAverage();
    }
    setResult(calculationResult);
    setShowResults(true);
    setShowModal(true);
  }, [
    calculationType,
    calculateSemesterAverage,
    calculateAnnualAverage,
    validateInputs,
  ]);

  const getEmojiForScore = useCallback((score: number) => {
    if (score >= 15) return "😁";
    if (score >= 13) return "😊";
    if (score >= 10) return "😐";
    return "😔";
  }, []);

  const handlePrint = useCallback(() => {
    const printWindow = window.open("", "_blank");
    if (!printWindow || !result) return;

    const formatDate = (date) => {
      return date.toLocaleDateString("fr-FR", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    };

    const getGradeColor = (grade) => {
      if (grade < 5) return "#dc2626"; // Red for grades below 5
      if (grade < 10) return "#333333"; // Normal color for grades between 5-10
      return "#16a34a"; // Green for grades above 10
    };

    const getGradeRemark = (grade) => {
      if (grade < 5) return "Rattrapage";
      if (grade < 10) return "Doit améliorer";
      return "Validé";
    };

    const today = new Date();
    const academicYear = `${today.getFullYear() - 1}-${today.getFullYear()}`;
    const studentName = "Étudiant(e)"; // Placeholder

    // Get subjects and grades based on calculation type
    const subjectsToDisplay =
      calculationType === "annual"
        ? Object.entries(result.subjectAverages || {})
        : (calculationType === "semester1"
            ? SEMESTER1_SUBJECTS
            : SEMESTER2_SUBJECTS
          ).map((subj) => {
            const grade =
              grades[subj.name]?.[
                calculationType === "semester1" ? "sem1" : "sem2"
              ];
            return [subj.name, grade];
          });

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
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo-placeholder"><img src="https://tbib.space/loogo.png" alt="LOGO" style="width: 120px;"></div>
          <h1>RELEVÉ DE NOTES</h1>
          <p>Année universitaire ${academicYear}</p>
        </div>
        
        <div class="student-info">
          <p><strong>Nom et prénom:</strong> ${studentName}</p>
          <p><strong>Spécialisation:</strong> Médecine</p>
          <p><strong>Période:</strong> ${
            calculationType === "semester1"
              ? "Premier Semestre"
              : calculationType === "semester2"
              ? "Deuxième Semestre"
              : "Année Complète"
          }</p>
          <p><strong>Date d'édition:</strong> ${formatDate(today)}</p>
        </div>
        
        <table>
          <thead>
            <tr>
              <th>Matière</th>
              <th>Coefficient</th>
              <th>Note</th>
              <th>Observation</th>
            </tr>
          </thead>
          <tbody>
            ${subjectsToDisplay
              .map(([subject, grade]) => {
                const displayGrade =
                  calculationType === "annual" ? grade : grade || 0;
                const coefficient =
                  SUBJECTS.find((s) => s.name === subject)?.coefficient || 1;
                return `
                <tr>
                  <td>${subject}</td>
                  <td>${coefficient}</td>
                  <td style="color: ${getGradeColor(
                    displayGrade
                  )}; font-weight: bold;">
                    ${
                      typeof displayGrade === "number"
                        ? displayGrade.toFixed(2)
                        : "-"
                    }/20
                  </td>
                  <td style="color: ${getGradeColor(displayGrade)};">
                    ${
                      typeof displayGrade === "number"
                        ? getGradeRemark(displayGrade)
                        : "-"
                    }
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
            result.status.includes("Réussite") || result.status.includes("Pass")
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
  }, [
    result,
    calculationType,
    grades,
    SEMESTER1_SUBJECTS,
    SEMESTER2_SUBJECTS,
    SUBJECTS,
  ]);

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <Helmet>
        <title>TBiB - Calculator</title>
        <meta
          name="description"
          content="Calculez facilement votre moyenne avec la calculatrice de TBiB. Un outil simple, rapide et précis."
        />
        <meta
          name="keywords"
          content="calculatrice médicale, calculatrice médicale tbib, calculatrice médicale tbib cours, tbib cours calculatrice médicale, tbib calculatrice médicale, calculatrice tbib, calculatrice tbib cours, tbib cours calculatrice, tbib calculatrice, calcul médical, outil médical en ligne, médecine, étudiants en médecine, TBiB, TBiB Cours, TBiB Academy, tbib calculator, tbib calculatrice, calculatrice santé, formules médicales, formules physiologiques, convertisseur médical, calculs cliniques, médecine Algérie, études médicales, tbib space, study with tbib, outils étudiants médecine"
        />
      </Helmet>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        Calculateur de Notes - 1ère Année
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

      <div className="flex flex-wrap justify-center gap-4 mb-8">
        {(["semester1", "semester2", "annual"] as const).map((type) => (
          <button
            key={type}
            onClick={() => setCalculationType(type)}
            className={cn(
              "px-4 py-2 rounded-lg font-medium transition-colors",
              calculationType === type
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            )}
          >
            {type === "semester1"
              ? "Semestre 1"
              : type === "semester2"
              ? "Semestre 2"
              : "Moyenne Annuelle"}
          </button>
        ))}

        <button
          onClick={resetGrades}
          className="px-4 py-2 rounded-lg font-medium transition-colors bg-red-100 text-red-600 hover:bg-red-200 ml-auto flex justify-center items-center gap-2"
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
          {(calculationType === "semester1"
            ? SEMESTER1_SUBJECTS
            : calculationType === "semester2"
            ? SEMESTER2_SUBJECTS
            : SUBJECTS
          ).map((subject) => (
            <motion.div
              key={subject.name}
              className="space-y-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <label className="block text-sm font-medium text-gray-700">
                {subject.name} (Coefficient: {subject.coefficient})
                {calculationType === "annual" &&
                  (subject.name === "Embryologie" || subject.name === "SSH"
                    ? " (Sem 1)"
                    : subject.name === "Physiologie" ||
                      subject.name === "Histologie"
                    ? " (Sem 2)"
                    : "")}
              </label>
              <div className="flex space-x-4">
                {calculationType === "annual" &&
                subject.name !== "Embryologie" &&
                subject.name !== "SSH" &&
                subject.name !== "Physiologie" &&
                subject.name !== "Histologie" ? (
                  <>
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
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
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
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    />
                  </>
                ) : calculationType === "annual" &&
                  (subject.name === "Embryologie" || subject.name === "SSH") ? (
                  <input
                    type="number"
                    min="0"
                    max="20"
                    step="0.25"
                    placeholder="Note Semestre 1"
                    value={grades[subject.name]?.sem1 ?? ""}
                    onChange={(e) =>
                      handleGradeChange(subject.name, "sem1", e.target.value)
                    }
                    onBlur={() => handleBlur(subject.name, "sem1")}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                ) : calculationType === "annual" &&
                  (subject.name === "Physiologie" ||
                    subject.name === "Histologie") ? (
                  <input
                    type="number"
                    min="0"
                    max="20"
                    step="0.25"
                    placeholder="Note Semestre 2"
                    value={grades[subject.name]?.sem2 ?? ""}
                    onChange={(e) =>
                      handleGradeChange(subject.name, "sem2", e.target.value)
                    }
                    onBlur={() => handleBlur(subject.name, "sem2")}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                ) : (
                  <input
                    type="number"
                    min="0"
                    max="20"
                    step="0.25"
                    placeholder="Note"
                    value={
                      grades[subject.name]?.[
                        calculationType === "semester1" ? "sem1" : "sem2"
                      ] ?? ""
                    }
                    onChange={(e) =>
                      handleGradeChange(
                        subject.name,
                        calculationType === "semester1" ? "sem1" : "sem2",
                        e.target.value
                      )
                    }
                    onBlur={() =>
                      handleBlur(
                        subject.name,
                        calculationType === "semester1" ? "sem1" : "sem2"
                      )
                    }
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                )}
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

            {result.subjectAverages && (
              <div className="mb-4 space-y-2">
                <h4 className="font-medium text-gray-700">
                  Moyennes par matière:
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {Object.entries(result.subjectAverages).map(
                    ([subject, average]) => (
                      <div
                        key={subject}
                        className={cn(
                          "flex justify-between text-sm p-2 rounded-md",
                          average < 5 ? "bg-red-50" : "bg-gray-50"
                        )}
                      >
                        <span>
                          {subject}
                          {calculationType === "annual" &&
                            (subject === "Embryologie" || subject === "SSH"
                              ? " (Sem 1)"
                              : subject === "Physiologie" ||
                                subject === "Histologie"
                              ? " (Sem 2)"
                              : "")}
                          :
                        </span>
                        <span
                          className={cn(
                            "font-medium",
                            average < 5 ? "text-red-600" : "text-gray-800"
                          )}
                        >
                          {average.toFixed(2)}/20{" "}
                          {average < 5 && "(Rattrapage)"}
                        </span>
                      </div>
                    )
                  )}
                </div>
                <hr className="my-2" />
              </div>
            )}

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
                    result.status === "Passage en deuxième année" ||
                      result.status === "Réussite"
                      ? "text-green-600"
                      : "text-red-600"
                  )}
                >
                  {result.status}
                </div>
              )}
            </div>

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

              {result.subjectAverages && (
                <div className="mb-4 space-y-2">
                  <h4 className="font-medium text-gray-700">
                    Moyennes par matière:
                  </h4>
                  {Object.entries(result.subjectAverages).map(
                    ([subject, average]) => (
                      <div
                        key={subject}
                        className={cn(
                          "flex justify-between text-sm",
                          average < 5 ? "text-red-600" : ""
                        )}
                      >
                        <span>
                          {subject}
                          {calculationType === "annual" &&
                            (subject === "Embryologie" || subject === "SSH"
                              ? " (Sem 1)"
                              : subject === "Physiologie" ||
                                subject === "Histologie"
                              ? " (Sem 2)"
                              : "")}
                          :
                        </span>
                        <span className="font-medium">
                          {average.toFixed(2)}/20{" "}
                          {average < 5 && "(Rattrapage)"}
                        </span>
                      </div>
                    )
                  )}
                  <hr className="my-2" />
                </div>
              )}

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
                      result.status === "Passage en deuxième année" ||
                        result.status === "Réussite"
                        ? "text-green-600"
                        : "text-red-600"
                    )}
                  >
                    {result.status}
                  </div>
                )}
              </div>

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
