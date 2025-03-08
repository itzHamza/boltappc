import React, { useState, useEffect } from "react";
import { supabase } from "../../lib/supabaseClient";
import Loader from "../../components/Loader";

export default function EditDeleteFlashcards() {
  const [years, setYears] = useState([]); // قائمة السنوات
  const [unites, setUnites] = useState([]); // قائمة الوحدات
  const [modules, setModules] = useState([]); // قائمة المقاييس
  const [lessons, setLessons] = useState([]); // قائمة الدروس
  const [selectedYear, setSelectedYear] = useState(""); // السنة المختارة
  const [selectedUniteId, setSelectedUniteId] = useState(""); // الوحدة المختارة
  const [selectedModuleId, setSelectedModuleId] = useState(""); // المقياس المختار
  const [selectedLesson, setSelectedLesson] = useState(""); // الدرس المختار
  const [flashcards, setFlashcards] = useState([]); // الفلاش كاردز الخاصة بالدرس
  const [loading, setLoading] = useState(false); // حالة التحميل

  useEffect(() => {
    fetchYears();
  }, []);

  useEffect(() => {
    if (selectedLesson) {
      fetchFlashcards();
    }
  }, [selectedLesson]); // ✅ تحديث الفلاش كاردز عند تغيير الدرس مباشرة

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

  // ✅ جلب الفلاش كاردز الخاصة بالدرس المختار
  async function fetchFlashcards() {
    setLoading(true);
    const { data, error } = await supabase
      .from("flashcards")
      .select("*")
      .eq("lesson_id", selectedLesson)
      .order("created_at", { ascending: false }); // الأحدث أولًا

    if (error) console.error("Error fetching flashcards:", error);
    else setFlashcards(data);
    setLoading(false);
  }

  // ✅ تحديث فلاش كارد واحدة
  async function updateFlashcard(id, question, answer) {
    if (!question.trim() || !answer.trim()) {
      return alert("يرجى ملء جميع حقول السؤال والإجابة!");
    }

    const { error } = await supabase
      .from("flashcards")
      .update({ question, answer })
      .eq("id", id);

    if (error) {
      console.error("Error updating flashcard:", error);
      alert("حدث خطأ أثناء التحديث");
    } else {
      alert("تم تحديث الفلاش كارد بنجاح!");
    }
  }

  // ✅ حذف فلاش كارد واحدة
  async function deleteFlashcard(id) {
    const { error } = await supabase.from("flashcards").delete().eq("id", id);

    if (error) {
      console.error("Error deleting flashcard:", error);
      alert("حدث خطأ أثناء الحذف");
    } else {
      setFlashcards(flashcards.filter((fc) => fc.id !== id));
      alert("تم حذف الفلاش كارد!");
    }
  }

  // ✅ حذف جميع الفلاش كاردز لدرس معين
  async function deleteAllFlashcards() {
    if (!selectedLesson) return alert("يرجى اختيار درس!");

    const confirmDelete = window.confirm(
      "هل أنت متأكد من حذف جميع الفلاش كاردز لهذا الدرس؟"
    );
    if (!confirmDelete) return;

    const { error } = await supabase
      .from("flashcards")
      .delete()
      .eq("lesson_id", selectedLesson);

    if (error) {
      console.error("Error deleting all flashcards:", error);
      alert("حدث خطأ أثناء حذف جميع الفلاش كاردز");
    } else {
      setFlashcards([]);
      alert("تم حذف جميع الفلاش كاردز بنجاح!");
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">تعديل/حذف الفلاش كاردز</h1>

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

      {/* زر حذف جميع الفلاش كاردز */}
      {flashcards.length > 0 && (
        <button
          onClick={deleteAllFlashcards}
          className="px-4 py-2 bg-red-500 text-white rounded-lg mb-4"
        >
          حذف جميع الفلاش كاردز
        </button>
      )}

      {/* قائمة الفلاش كاردز */}
      {loading ? (
        <div className="text-center py-12 h-80 flex items-center justify-center">
          <Loader />
        </div>
      ) : flashcards.length === 0 ? (
        <p className="text-gray-600">لا توجد فلاش كاردز لهذا الدرس</p>
      ) : (
        flashcards.map((fc, index) => (
          <div key={fc.id} className="p-4 border rounded-lg mb-4">
            <h3 className="text-lg font-semibold mb-2">
              فلاش كارد {index + 1}
            </h3>
            <input
              type="text"
              value={fc.question}
              onChange={(e) => {
                const updatedFlashcards = [...flashcards];
                updatedFlashcards[index].question = e.target.value;
                setFlashcards(updatedFlashcards);
              }}
              className="p-2 border w-full mb-2"
            />
            <input
              type="text"
              value={fc.answer}
              onChange={(e) => {
                const updatedFlashcards = [...flashcards];
                updatedFlashcards[index].answer = e.target.value;
                setFlashcards(updatedFlashcards);
              }}
              className="p-2 border w-full mb-2"
            />
            <div className="flex justify-between">
              <button
                onClick={() => updateFlashcard(fc.id, fc.question, fc.answer)}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg"
              >
                تحديث
              </button>
              <button
                onClick={() => deleteFlashcard(fc.id)}
                className="px-4 py-2 bg-red-500 text-white rounded-lg"
              >
                حذف
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
