import { useState, useEffect } from "react";
import axios from "axios";
import "./Flashcards.css";

export default function Flashcards({ lessonId }) {
  const [flashcards, setFlashcards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  useEffect(() => {
    axios
      .get(`http://localhost:5000/flashcards?lesson_id=${lessonId}`)
      .then((res) => setFlashcards(res.data))
      .catch((err) => console.error("Error fetching flashcards:", err));
  }, [lessonId]);

  if (flashcards.length === 0) {
    return <p>لا توجد فلاش كارد لهذا الدرس</p>;
  }

  const nextCard = () => {
    setCurrentIndex((i) => (i < flashcards.length - 1 ? i + 1 : i));
  };

  const prevCard = () => {
    setCurrentIndex((i) => (i > 0 ? i - 1 : i));
  };

  const flipCard = () => {
    setFlipped((f) => !f);
  };

  return (
    <div className="flashcards-container">
      <h2>Flash Cards</h2>
      <div className="flashcard-container" onClick={flipCard}>
        <div className={`flashcard ${flipped ? "flip" : ""}`}>
          <div className="side front">{flashcards[currentIndex]?.question}</div>
          <div className="side back">{flashcards[currentIndex]?.answer}</div>
        </div>
      </div>
      <div className="buttons">
        <button
          className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
          onClick={prevCard}
        >
          السابق
        </button>
        <button
          className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
          onClick={nextCard}
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
