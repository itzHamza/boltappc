import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import "./Flashcards.css";

export default function Flashcards({ lessonId }) {
  const [flashcards, setFlashcards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [inputValue, setInputValue] = useState("1");

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

  useEffect(() => {
    setInputValue(String(currentIndex + 1));
  }, [currentIndex]);

  const handleInputChange = (e) => {
    const value = e.target.value;
    if (value === "" || /^\d+$/.test(value)) {
      // يسمح بإدخال الأرقام فقط
      setInputValue(value);
    }
  };

  const handleInputBlur = () => {
    if (!inputValue) {
      setInputValue(String(currentIndex + 1));
      return;
    }

    updateCurrentIndex();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      updateCurrentIndex();
    }
  };

  const updateCurrentIndex = () => {
    let newIndex = parseInt(inputValue) - 1;

    if (isNaN(newIndex)) {
      newIndex = currentIndex;
    } else if (newIndex < 0) {
      newIndex = 0;
    } else if (newIndex >= flashcards.length) {
      newIndex = flashcards.length - 1;
    }

    setCurrentIndex(newIndex);
    setFlipped(false);
    setInputValue(String(newIndex + 1));
  };

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

      <div className="buttons">
        <button
          className="prev-next-button"
          onClick={() => {
            setFlipped(false);
            setTimeout(() => setCurrentIndex((i) => (i > 0 ? i - 1 : i)), 200);
          }}
        >
          Previous
        </button>
        <button
          className="prev-next-button"
          onClick={() => {
            setFlipped(false);
            setTimeout(
              () =>
                setCurrentIndex((i) => (i < flashcards.length - 1 ? i + 1 : i)),
              200
            );
          }}
        >
          Next
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

      <div className="mt-3 flex items-center justify-center gap-2">
        <input
          type="number"
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          onKeyDown={handleKeyDown}
          className="w-12 text-center border border-gray-300 rounded-md py-1 px-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <span className="text-lg font-semibold text-gray-700">
          / {flashcards.length}
        </span>
      </div>
    </div>
  );
}
