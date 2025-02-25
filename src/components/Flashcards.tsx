import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import "./Flashcards.css";

export default function Flashcards({ lessonId }) {
  const [flashcards, setFlashcards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  useEffect(() => {
    async function fetchFlashcards() {
      const { data, error } = await supabase
        .from("flashcards")
        .select("*")
        .eq("lesson_id", lessonId);

      if (error) {
        console.error("Error fetching flashcards:", error);
      } else {
        setFlashcards(data);
      }
    }

    if (lessonId) {
      fetchFlashcards();
    }
  }, [lessonId]);

  if (flashcards.length === 0) {
    return (
      <div className="bg-white shadow-sm p-4 lg:mx-0 rounded-lg mb-3">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          No Flashcards For This Lesson :(
        </h3>
      </div>
    );
  }

  return (
    <div className="flashcards-container">
      <div className="flashcard-container" onClick={() => setFlipped(!flipped)}>
        <div className={`flashcard ${flipped ? "flip" : ""}`}>
          <div className="side front">{flashcards[currentIndex]?.question}</div>
          <div className="side back">{flashcards[currentIndex]?.answer}</div>
        </div>
      </div>

      {/* ✅ تحسين أزرار التنقل */}
      <div className="buttons">
        <button
          className="prev-next-button"
          onClick={() => {
            setFlipped(false); // ✅ إعادة ضبط الحالة عند تغيير الكارد
            setCurrentIndex((i) => (i > 0 ? i - 1 : i));
          }}
        >
          السابق
        </button>
        <button
          className="prev-next-button"
          onClick={() => {
            setFlipped(false); // ✅ إعادة ضبط الحالة عند تغيير الكارد
            setCurrentIndex((i) => (i < flashcards.length - 1 ? i + 1 : i));
          }}
        >
          التالي
        </button>
      </div>

      {/* ✅ تحسين شريط التقدم */}
      <div className="progress-container">
        <div
          className="progress-bar"
          style={{
            width: `${((currentIndex + 1) / flashcards.length) * 100}%`,
          }}
        ></div>
      </div>

      {/* ✅ تحسين مؤشر عدد الكاردز */}
      <p className="mt-3 text-lg font-semibold text-gray-700">
        {currentIndex + 1} / {flashcards.length}
      </p>
    </div>
  );
}
