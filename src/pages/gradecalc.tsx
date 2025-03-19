import React, { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, AlertTriangle, Save, Printer, RefreshCw } from "lucide-react";
import { cn } from "../lib/utils";

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

export function GradeCalculatorPage() {
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
      let hasGradeBelow5 = false;

      semesterSubjects.forEach((subject) => {
        const grade = grades[subject.name]?.[semesterKey];
        if (grade !== undefined) {
          totalWeightedGrade += grade * subject.coefficient;
          totalCoefficients += subject.coefficient;

          if (grade < 5) {
            hasGradeBelow5 = true;
            warnings.push(`Rattrapage requis pour ${subject.name}`);
          }
        }
      });

      const average =
        totalCoefficients > 0 ? totalWeightedGrade / totalCoefficients : 0;
      const status = hasGradeBelow5
        ? "Rattrapage"
        : average >= 10
        ? "Réussite"
        : "Rattrapage";

      return { average, warnings, status };
    },
    [grades]
  );

  const calculateAnnualAverage = useCallback(() => {
    const subjectAverages: Record<string, number> = {};
    let totalWeightedGrade = 0;
    let totalCoefficients = 0;
    const warnings: string[] = [];
    let hasGradeBelow5 = false;

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
          hasGradeBelow5 = true;
          warnings.push(`Rattrapage requis pour ${subject.name}`);
        }
      }
    });

    const average =
      totalCoefficients > 0 ? totalWeightedGrade / totalCoefficients : 0;
    const status = hasGradeBelow5
      ? "Rattrapage"
      : average >= 10
      ? "Passage en deuxième année"
      : "Rattrapage";

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

    const content = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Résultats - Calculateur de Notes</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h1 { color: #333; }
          .result { font-size: 24px; font-weight: bold; margin: 20px 0; }
          .warning { color: #c53030; margin-top: 10px; }
          .subject { margin: 5px 0; }
          .status { font-size: 18px; font-weight: bold; margin-top: 15px; }
          .average { font-size: 32px; text-align: center; margin: 30px 0; }
        </style>
      </head>
      <body>
        <h1>Résultats - ${
          calculationType === "semester1"
            ? "Semestre 1"
            : calculationType === "semester2"
            ? "Semestre 2"
            : "Moyenne Annuelle"
        }</h1>
        <div class="average">${result.average.toFixed(2)}/20 ${getEmojiForScore(
      result.average
    )}</div>
        <div class="status" style="color: ${
          result.status === "Passage en deuxième année" ||
          result.status === "Réussite"
            ? "green"
            : "red"
        }">
          ${result.status}
        </div>
        ${
          result.subjectAverages
            ? `<h2>Moyennes par matière:</h2>
              ${Object.entries(result.subjectAverages)
                .map(
                  ([subject, average]) => `
                <div class="subject">
                  ${subject}: ${average.toFixed(2)}/20 ${
                    average < 5 ? "(Rattrapage)" : ""
                  }
                </div>
              `
                )
                .join("")}`
            : ""
        }
        ${
          result.warnings.length > 0
            ? `<h2>Avertissements:</h2>
              ${result.warnings
                .map(
                  (warning) => `
                <div class="warning">⚠️ ${warning}</div>
              `
                )
                .join("")}`
            : ""
        }
        <div style="margin-top: 50px; font-size: 12px; color: #666;">
          Généré le ${new Date().toLocaleDateString(
            "fr-FR"
          )} à ${new Date().toLocaleTimeString("fr-FR")}
        </div>
      </body>
      </html>
    `;

    printWindow.document.write(content);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => printWindow.print(), 500);
  }, [result, calculationType, getEmojiForScore]);

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        Calculateur de Notes
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

      <div className="flex flex-wrap gap-4 mb-8">
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
          className="px-4 py-2 rounded-lg font-medium transition-colors bg-red-100 text-red-600 hover:bg-red-200 ml-auto flex items-center gap-2"
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
