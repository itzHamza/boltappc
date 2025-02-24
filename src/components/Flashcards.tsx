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
    return <p>لا توجد فلاش كارد لهذا الدرس</p>;
  }

  return (
    <div className="flashcards-container">
      <h2>Flash Cards</h2>
      <div className="flashcard-container" onClick={() => setFlipped(!flipped)}>
        <div className={`flashcard ${flipped ? "flip" : ""}`}>
          <div className="side front">{flashcards[currentIndex]?.question}</div>
          <div className="side back">{flashcards[currentIndex]?.answer}</div>
        </div>
      </div>
      <div className="buttons">
        <button onClick={() => setCurrentIndex((i) => (i > 0 ? i - 1 : i))}>
          السابق
        </button>
        <button
          onClick={() =>
            setCurrentIndex((i) => (i < flashcards.length - 1 ? i + 1 : i))
          }
        >
          التالي
        </button>
      </div>
      <div className="progress-container">
        <div
          className="progress-bar"
          style={{
            width: `${((currentIndex + 1) / flashcards.length) * 100}%`,
          }}
        ></div>
      </div>
      <p>
        {currentIndex + 1} / {flashcards.length}
      </p>
    </div>
  );
}
