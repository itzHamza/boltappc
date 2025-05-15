// CourseForm.tsx
import React from "react";

interface CourseFormProps {
  years: Array<{
    id: string | number;
    title: string;
  }>;
  unites: Array<{
    id: string;
    title: string;
  }>;
  modules: Array<{
    id: string;
    title: string;
  }>;
  selectedYear: string | number;
  selectedUniteId: string;
  newCourse: {
    title: string;
    description: string;
    module_id: string;
  };
  onYearChange: (yearId: string) => void;
  onUniteChange: (uniteId: string) => void;
  onModuleChange: (moduleId: string) => void;
  onTitleChange: (title: string) => void;
  onDescriptionChange: (description: string) => void;
}

export function CourseForm({
  years,
  unites,
  modules,
  selectedYear,
  selectedUniteId,
  newCourse,
  onYearChange,
  onUniteChange,
  onModuleChange,
  onTitleChange,
  onDescriptionChange,
}: CourseFormProps) {
  return (
    <div className="space-y-2 mb-6">
      {/* Year selection */}
      <select
        value={selectedYear as string}
        onChange={(e) => onYearChange(e.target.value)}
        className="p-2 border w-full mb-2"
      >
        <option value="">اختر السنة</option>
        {years.map((year) => (
          <option key={year.id} value={year.id}>
            {year.title}
          </option>
        ))}
      </select>

      {/* Unit selection (if available) */}
      {unites.length > 0 && (
        <select
          value={selectedUniteId}
          onChange={(e) => onUniteChange(e.target.value)}
          className="p-2 border w-full mb-2"
        >
          <option value="">اختر الوحدة</option>
          {unites.map((unite) => (
            <option key={unite.id} value={unite.id}>
              {unite.title}
            </option>
          ))}
        </select>
      )}

      {/* Module selection */}
      {(selectedUniteId || modules.length > 0) && (
        <select
          value={newCourse.module_id}
          onChange={(e) => onModuleChange(e.target.value)}
          className="p-2 border w-full mb-2"
        >
          <option value="">اختر المقياس</option>
          {modules.map((module) => (
            <option key={module.id} value={module.id}>
              {module.title}
            </option>
          ))}
        </select>
      )}

      {/* Course title input */}
      <input
        type="text"
        placeholder="عنوان الدرس"
        value={newCourse.title}
        onChange={(e) => onTitleChange(e.target.value)}
        className="p-2 border w-full mb-2"
      />

      {/* Description input */}
      <textarea
        placeholder="وصف الدرس (اختياري)"
        value={newCourse.description}
        onChange={(e) => onDescriptionChange(e.target.value)}
        className="p-2 border w-full mb-2"
      />
    </div>
  );
}

export default CourseForm;
