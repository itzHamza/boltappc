import React, { useState, useEffect } from "react";
import { supabase } from "../../lib/supabaseClient";
import { v4 as uuidv4 } from "uuid"; // استيراد مكتبة UUID

export default function FlashcardsManager() {
  const [years, setYears] = useState([]); // قائمة السنوات
  const [unites, setUnites] = useState([]); // قائمة الوحدات
  const [modules, setModules] = useState([]); // قائمة المقاييس
  const [lessons, setLessons] = useState([]); // قائمة الدروس
  const [selectedYear, setSelectedYear] = useState(""); // السنة المختارة
  const [selectedUniteId, setSelectedUniteId] = useState(""); // الوحدة المختارة
  const [selectedModuleId, setSelectedModuleId] = useState(""); // المقياس المختار
  const [selectedLesson, setSelectedLesson] = useState(""); // الدرس المختار
  const [flashcards, setFlashcards] = useState([]); // قائمة الفلاش كاردز

  useEffect(() => {
    fetchYears();
  }, []);

  // ✅ جلب السنوات الدراسية من Supabase
  async function fetchYears() {
    const { data, error } = await supabase.from("years").select("id, title");
    if (error) console.error("Error fetching years:", error);
    else setYears(data);
  }

  // ✅ جلب الوحدات والمقاييس عند تغيير السنة المختارة
  async function fetchUnitesAndModules(yearId) {
    setSelectedYear(yearId);
    setSelectedUniteId("");
    setSelectedModuleId("");
    setSelectedLesson("");
    setUnites([]);
    setModules([]);
    setLessons([]);

    if (!yearId) return;

    // جلب الوحدات الخاصة بالسنة
    const { data: unites, error: uniteError } = await supabase
      .from("unites")
      .select("id, title")
      .eq("year_id", yearId);

    if (uniteError) console.error("Error fetching unites:", uniteError);
    else setUnites(unites);

    // جلب المقاييس المرتبطة مباشرة بالسنة (بدون وحدة)
    const { data: modules, error: moduleError } = await supabase
      .from("modules")
      .select("id, title")
      .eq("year_id", yearId)
      .is("unite_id", null);

    if (moduleError) console.error("Error fetching modules:", moduleError);
    else setModules(modules);
  }

  // ✅ جلب المقاييس المرتبطة بالوحدة المختارة
  async function fetchModulesByUnite(uniteId) {
    setSelectedUniteId(uniteId);
    setSelectedModuleId("");
    setSelectedLesson("");
    setModules([]);
    setLessons([]);

    const { data, error } = await supabase
      .from("modules")
      .select("id, title")
      .eq("unite_id", uniteId);

    if (error) console.error("Error fetching modules:", error);
    else setModules(data);
  }

  // ✅ جلب الدروس المرتبطة بالمقياس المختار
  async function fetchLessonsByModule(moduleId) {
    setSelectedModuleId(moduleId);
    setSelectedLesson("");
    setLessons([]);

    const { data, error } = await supabase
      .from("courses")
      .select("id, title")
      .eq("module_id", moduleId);

    if (error) console.error("Error fetching lessons:", error);
    else setLessons(data);
  }

  // ✅ إضافة سؤال جديد للفلاش كاردز
  function addFlashcard() {
    setFlashcards([...flashcards, { question: "", answer: "" }]);
  }

  // ✅ حذف سؤال من الفلاش كاردز
  function removeFlashcard(index) {
    const updatedFlashcards = flashcards.filter((_, i) => i !== index);
    setFlashcards(updatedFlashcards);
  }

  // ✅ إرسال جميع الفلاش كاردز إلى Supabase
  async function saveFlashcards() {
    if (!selectedLesson) return alert("يجب اختيار درس!");
    if (flashcards.length === 0) return alert("أضف على الأقل بطاقة واحدة!");

    // التحقق من أن جميع الأسئلة والأجوبة تحتوي على بيانات
    const hasEmptyFields = flashcards.some(
      (fc) => !fc.question.trim() || !fc.answer.trim()
    );

    if (hasEmptyFields) {
      return alert("يرجى ملء جميع حقول الأسئلة والأجوبة!");
    }

    const flashcardData = flashcards.map((fc) => ({
      id: uuidv4(), // استخدام UUID لتوليد معرف فريد لكل بطاقة
      lesson_id: selectedLesson,
      question: fc.question,
      answer: fc.answer,
      created_at: new Date().toISOString(),
    }));

    const { error } = await supabase.from("flashcards").insert(flashcardData);

    if (error) {
      console.error("Error saving flashcards:", error.message);
      alert(`Error saving flashcards: ${error.message}`);
    } else {
      alert("تم حفظ الفلاش كاردز بنجاح!");
      setFlashcards([]);
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">إدارة الفلاش كاردز</h1>

      {/* اختيار السنة */}
      <select
        value={selectedYear}
        onChange={(e) => fetchUnitesAndModules(e.target.value)}
        className="p-2 border w-full mb-4"
      >
        <option value="">اختر السنة</option>
        {years.map((year) => (
          <option key={year.id} value={year.id}>
            {year.title}
          </option>
        ))}
      </select>

      {/* اختيار الوحدة إن وجدت */}
      {unites.length > 0 && (
        <select
          value={selectedUniteId}
          onChange={(e) => fetchModulesByUnite(e.target.value)}
          className="p-2 border w-full mb-4"
        >
          <option value="">اختر الوحدة</option>
          {unites.map((unite) => (
            <option key={unite.id} value={unite.id}>
              {unite.title}
            </option>
          ))}
        </select>
      )}

      {/* اختيار المقياس */}
      {(selectedUniteId || modules.length > 0) && (
        <select
          value={selectedModuleId}
          onChange={(e) => fetchLessonsByModule(e.target.value)}
          className="p-2 border w-full mb-4"
        >
          <option value="">اختر المقياس</option>
          {modules.map((module) => (
            <option key={module.id} value={module.id}>
              {module.title}
            </option>
          ))}
        </select>
      )}

      {/* اختيار الدرس */}
      {selectedModuleId && (
        <select
          value={selectedLesson}
          onChange={(e) => setSelectedLesson(e.target.value)}
          className="p-2 border w-full mb-4"
        >
          <option value="">اختر درسًا</option>
          {lessons.map((lesson) => (
            <option key={lesson.id} value={lesson.id}>
              {lesson.title}
            </option>
          ))}
        </select>
      )}

      {/* إضافة أسئلة وأجوبة */}
      <h3 className="text-xl font-semibold mt-4 mb-2">الفلاش كاردز</h3>
      {flashcards.map((fc, index) => (
        <div key={index} className="flex flex-col mb-2">
          <input
            type="text"
            placeholder="السؤال"
            value={fc.question}
            onChange={(e) => {
              const updatedFlashcards = [...flashcards];
              updatedFlashcards[index].question = e.target.value;
              setFlashcards(updatedFlashcards);
            }}
            className="p-2 border mb-2"
          />
          <input
            type="text"
            placeholder="الإجابة"
            value={fc.answer}
            onChange={(e) => {
              const updatedFlashcards = [...flashcards];
              updatedFlashcards[index].answer = e.target.value;
              setFlashcards(updatedFlashcards);
            }}
            className="p-2 border mb-2"
          />
          <button
            onClick={() => removeFlashcard(index)}
            className="px-4 py-2 bg-red-500 text-white rounded-lg"
          >
            حذف
          </button>
        </div>
      ))}

      {/* زر لإضافة سؤال جديد */}
      <button
        onClick={addFlashcard}
        className="px-4 py-2 bg-blue-500 text-white rounded-lg m-4"
      >
        + أضف فلاش كارد
      </button>

      {/* زر حفظ الفلاش كاردز */}
      <button
        onClick={saveFlashcards}
        className="px-4 py-2 bg-green-600 text-white rounded-lg m-4"
      >
        حفظ الفلاش كاردز
      </button>
    </div>
  );
}
