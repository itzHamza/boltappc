import React, { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "../lib/supabaseClient";
import jsPDF from "jspdf";
import "./Flashcards.css";

interface Flashcard {
  id: number;
  question: string;
  answer: string;
  lesson_id: number;
}

export default function Flashcards({ lessonId }) {
  const [originalFlashcards, setOriginalFlashcards] = useState<Flashcard[]>([]);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [inputValue, setInputValue] = useState("1");
  const [shuffleMode, setShuffleMode] = useState(false);
  const [difficultCards, setDifficultCards] = useState<number[]>([]);
  const [reviewingDifficultCards, setReviewingDifficultCards] = useState(false);
  const speechSynthesisRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Fetch Flashcards
  useEffect(() => {
    async function fetchFlashcards() {
      const { data, error } = await supabase
        .from("flashcards")
        .select("*")
        .eq("lesson_id", lessonId);

      if (error) {
        console.error("Error fetching flashcards:", error);
      } else {
        setOriginalFlashcards(data);
        setFlashcards(data);

        // Load difficult cards from localStorage
        const savedDifficultCards = JSON.parse(
          localStorage.getItem(`difficultCards_${lessonId}`) || "[]"
        );
        setDifficultCards(savedDifficultCards);
      }
    }

    if (lessonId) {
      fetchFlashcards();
    }
  }, [lessonId]);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowRight":
          goToNextCard();
          break;
        case "ArrowLeft":
          goToPreviousCard();
          break;
        case " ":
          e.preventDefault();
          setFlipped(!flipped);
          break;
        case "d":
          markAsDifficult();
          break;
        case "s":
          toggleShuffleMode();
          break;
        case "r":
          if (e.ctrlKey) {
            resetFlashcards();
          }
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [flashcards, currentIndex, flipped, shuffleMode]);

  // Shuffle Functionality
  const shuffleCards = useCallback((cards: Flashcard[]) => {
    const shuffled = [...cards].sort(() => 0.5 - Math.random());
    return shuffled;
  }, []);

  const toggleShuffleMode = () => {
    if (shuffleMode) {
      // Return to original order
      setFlashcards(originalFlashcards);
      setCurrentIndex(0);
    } else {
      // Shuffle cards
      const shuffledCards = shuffleCards(flashcards);
      setFlashcards(shuffledCards);
      setCurrentIndex(0);
    }
    setShuffleMode(!shuffleMode);
  };

  // Difficult Cards Management
  const markAsDifficult = () => {
    const currentCardId = flashcards[currentIndex].id;
    const newDifficultCards = difficultCards.includes(currentCardId)
      ? difficultCards.filter((id) => id !== currentCardId)
      : [...difficultCards, currentCardId];

    setDifficultCards(newDifficultCards);
    localStorage.setItem(
      `difficultCards_${lessonId}`,
      JSON.stringify(newDifficultCards)
    );
  };

  const toggleDifficultCardsReview = () => {
    if (reviewingDifficultCards) {
      // Return to all cards
      setFlashcards(originalFlashcards);
      setCurrentIndex(0);
    } else {
      // Filter and show only difficult cards
      const difficultCardsToReview = originalFlashcards.filter((card) =>
        difficultCards.includes(card.id)
      );
      setFlashcards(difficultCardsToReview);
      setCurrentIndex(0);
    }
    setReviewingDifficultCards(!reviewingDifficultCards);
  };

  // PDF Export
  const exportToPDF = () => {
    const doc = new jsPDF();
    const cardsToExport = reviewingDifficultCards
      ? flashcards
      : originalFlashcards;

    doc.setFontSize(16);
    doc.text("Flashcards", 10, 10);

    cardsToExport.forEach((card, index) => {
      doc.setFontSize(12);
      doc.text(`Card ${index + 1}:`, 10, 20 + index * 50);
      doc.text(`Question: ${card.question}`, 10, 30 + index * 50);
      doc.text(`Answer: ${card.answer}`, 10, 40 + index * 50);
    });

    doc.save("flashcards.pdf");
  };

  // Text-to-Speech
  const speakFlashcard = () => {
    const currentCard = flashcards[currentIndex];
    const text = flipped ? currentCard.answer : currentCard.question;

    // Cancel any ongoing speech
    if (speechSynthesisRef.current) {
      window.speechSynthesis.cancel();
    }

    const utterance = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(utterance);
    speechSynthesisRef.current = utterance;
  };

  // Navigation Methods
  const goToNextCard = () => {
    setFlipped(false);
    setCurrentIndex((i) => (i < flashcards.length - 1 ? i + 1 : i));
  };

  const goToPreviousCard = () => {
    setFlipped(false);
    setCurrentIndex((i) => (i > 0 ? i - 1 : i));
  };

  const resetFlashcards = () => {
    setCurrentIndex(0);
    setFlipped(false);
    // If shuffle mode is on, re-shuffle
    if (shuffleMode) {
      const shuffledCards = shuffleCards(originalFlashcards);
      setFlashcards(shuffledCards);
    } else {
      setFlashcards(originalFlashcards);
    }
  };

  // Existing Input Navigation Logic...
  const handleInputChange = (e) => {
    const value = e.target.value;
    if (value === "" || /^\d+$/.test(value)) {
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
      <div className="flex gap-2 mb-4">
        <button className="prev-next-button" onClick={toggleShuffleMode}>
          {shuffleMode ? "Unshuffle" : "Shuffle"}
        </button>
        <button
          className="prev-next-button"
          onClick={toggleDifficultCardsReview}
        >
          {reviewingDifficultCards
            ? "All Cards"
            : `Review Difficult (${difficultCards.length})`}
        </button>
        <button className="prev-next-button" onClick={exportToPDF}>
          Export PDF
        </button>
      </div>

      <div className="flashcard-container" onClick={() => setFlipped(!flipped)}>
        <div className={`flashcard ${flipped ? "flip" : ""}`}>
          <div className="side front">
            {flashcards[currentIndex]?.question}
            <button
              className="absolute top-2 right-2 text-white"
              onClick={(e) => {
                e.stopPropagation();
                speakFlashcard();
              }}
            >
              🔊
            </button>
            <button
              className={`absolute top-2 left-2 ${
                difficultCards.includes(flashcards[currentIndex].id)
                  ? "text-red-500"
                  : "text-white"
              }`}
              onClick={(e) => {
                e.stopPropagation();
                markAsDifficult();
              }}
            >
              ⭐
            </button>
          </div>
          <div className="side back">
            {flashcards[currentIndex]?.answer}
            <button
              className="absolute top-2 right-2 text-white"
              onClick={(e) => {
                e.stopPropagation();
                speakFlashcard();
              }}
            >
              🔊
            </button>
          </div>
        </div>
      </div>

      <div className="buttons">
        <button className="prev-next-button" onClick={goToPreviousCard}>
          Previous
        </button>
        <button className="prev-next-button" onClick={resetFlashcards}>
          Reset
        </button>
        <button className="prev-next-button" onClick={goToNextCard}>
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
          className="w-[52px] text-center border border-gray-300 rounded-md py-1 px-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <span className="text-lg font-semibold text-gray-700">
          / {flashcards.length}
        </span>
      </div>
    </div>
  );
}
