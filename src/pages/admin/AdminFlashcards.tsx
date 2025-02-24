import React, { useState, useEffect } from "react";
import { supabase } from "../../lib/supabaseClient";

export default function FlashcardsManager() {
  const [lessons, setLessons] = useState([]); // قائمة الدروس
  const [selectedLesson, setSelectedLesson] = useState(""); // الدرس المختار
  const [flashcards, setFlashcards] = useState([]); // قائمة الفلاش كاردز

  useEffect(() => {
    fetchLessons();
  }, []);

  // ✅ جلب جميع الدروس من Supabase
  async function fetchLessons() {
    const { data, error } = await supabase.from("courses").select("id, title");
    if (error) console.error("Error fetching lessons:", error);
    else setLessons(data);
  }

  // ✅ إضافة سؤال جديد للفلاش كاردز
  function addFlashcard() {
    setFlashcards([...flashcards, { question: "", answer: "" }]);
  }

  // ✅ إرسال جميع الفلاش كاردز إلى Supabase
  async function saveFlashcards() {
    if (!selectedLesson) return alert("يجب اختيار درس!");
    if (flashcards.length === 0) return alert("أضف على الأقل بطاقة واحدة!");

    const flashcardData = flashcards.map((fc) => ({
      id: crypto.randomUUID(), // ✅ توليد ID فريد لكل بطاقة
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

      {/* اختيار الدرس */}
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
