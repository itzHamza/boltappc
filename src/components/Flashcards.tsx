import React, { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "../lib/supabaseClient";
import { Star, Volume2 } from "lucide-react";
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
  const [favoriteCards, setFavoriteCards] = useState<number[]>([]);
  const [reviewingFavoriteCards, setReviewingFavoriteCards] = useState(false);
  const speechSynthesisRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    // Load voices when they become available
    const handleVoicesChanged = () => {
      // This ensures voices are loaded before speaking
    };

    window.speechSynthesis.onvoiceschanged = handleVoicesChanged;

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

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

        // Load favorite cards from localStorage
        const savedFavoriteCards = JSON.parse(
          localStorage.getItem(`favoriteCards_${lessonId}`) || "[]"
        );
        setFavoriteCards(savedFavoriteCards);
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
        case "f":
          toggleFavorite();
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
      // Return to original order - consider favorite mode
      setFlashcards(
        reviewingFavoriteCards
          ? originalFlashcards.filter((card) => favoriteCards.includes(card.id))
          : originalFlashcards
      );
    } else {
      // Shuffle cards - consider favorite mode
      const cardsToShuffle = reviewingFavoriteCards
        ? originalFlashcards.filter((card) => favoriteCards.includes(card.id))
        : [...flashcards];
      const shuffledCards = shuffleCards(cardsToShuffle);
      setFlashcards(shuffledCards);
    }
    setCurrentIndex(0);
    setInputValue("1");
    setShuffleMode(!shuffleMode);
  };

  // Favorite Cards Management
  const toggleFavorite = () => {
    const currentCardId = flashcards[currentIndex].id;
    const newFavoriteCards = favoriteCards.includes(currentCardId)
      ? favoriteCards.filter((id) => id !== currentCardId)
      : [...favoriteCards, currentCardId];

    setFavoriteCards(newFavoriteCards);
    localStorage.setItem(
      `favoriteCards_${lessonId}`,
      JSON.stringify(newFavoriteCards)
    );
  };

  const toggleFavoriteCardsReview = () => {
    if (reviewingFavoriteCards) {
      // Return to all cards and reset to first card
      setFlashcards(originalFlashcards);
      setCurrentIndex(0);
      setInputValue("1"); // Reset input display to 1
    } else {
      // Filter and show only favorite cards
      const favoriteCardsToReview = originalFlashcards.filter((card) =>
        favoriteCards.includes(card.id)
      );

      if (favoriteCardsToReview.length > 0) {
        setFlashcards(favoriteCardsToReview);
        setCurrentIndex(0); // Start from first favorite card
        setInputValue("1"); // Reset input display to 1
      }
    }
    setReviewingFavoriteCards(!reviewingFavoriteCards);
  };

  // Text-to-Speech with French preference
  // Text-to-Speech with French language enforced
  const speakFlashcard = () => {
    const currentCard = flashcards[currentIndex];
    const text = flipped ? currentCard.answer : currentCard.question;

    // Cancel any ongoing speech
    if (speechSynthesisRef.current) {
      window.speechSynthesis.cancel();
    }

    const utterance = new SpeechSynthesisUtterance(text);

    // Set language to French explicitly
    utterance.lang = "fr-FR";

    // Try to find a French voice
    const voices = window.speechSynthesis.getVoices();
    const frenchVoice = voices.find(
      (voice) =>
        voice.lang === "fr-FR" ||
        voice.lang.startsWith("fr-") ||
        voice.name.includes("French")
    );

    if (frenchVoice) {
      utterance.voice = frenchVoice;
    } else {
      console.warn(
        "No French voice found. Using default voice with French language setting."
      );
    }

    // Set other speech parameters for better French pronunciation
    utterance.rate = 1.0; // Normal speed
    utterance.pitch = 1.0; // Normal pitch

    window.speechSynthesis.speak(utterance);
    speechSynthesisRef.current = utterance;
  };

  // Navigation Methods
  const goToNextCard = () => {
    setFlipped(false);
    setCurrentIndex((i) => {
      const newIndex = i < flashcards.length - 1 ? i + 1 : i;
      setInputValue(String(newIndex + 1)); // Update inputValue
      return newIndex;
    });
  };

  const goToPreviousCard = () => {
    setFlipped(false);
    setCurrentIndex((i) => {
      const newIndex = i > 0 ? i - 1 : i;
      setInputValue(String(newIndex + 1)); // Update inputValue
      return newIndex;
    });
  };

  const resetFlashcards = () => {
    setCurrentIndex(0);
    setFlipped(false);
    setInputValue("1");

    if (shuffleMode) {
      const cardsToShuffle = reviewingFavoriteCards
        ? originalFlashcards.filter((card) => favoriteCards.includes(card.id))
        : originalFlashcards;
      const shuffledCards = shuffleCards(cardsToShuffle);
      setFlashcards(shuffledCards);
    } else {
      setFlashcards(
        reviewingFavoriteCards
          ? originalFlashcards.filter((card) => favoriteCards.includes(card.id))
          : originalFlashcards
      );
    }
  };

  // Input Navigation Logic
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

        {favoriteCards.length > 0 && (
          <button
            className="prev-next-button"
            onClick={toggleFavoriteCardsReview}
          >
            {reviewingFavoriteCards
              ? "All Cards"
              : `Review Favorites (${favoriteCards.length})`}
          </button>
        )}
      </div>

      <div className="flashcard-container" onClick={() => setFlipped(!flipped)}>
        <div className={`flashcard ${flipped ? "flip" : ""}`}>
          <div className="side front">
            {flashcards[currentIndex]?.question}
            <button
              className="absolute top-2 right-2 pr-2 p-1 text-black"
              onClick={(e) => {
                e.stopPropagation();
                speakFlashcard();
              }}
            >
              <Volume2 />
            </button>
            <button
              className="absolute top-2 left-2 pr-2 rounded-full p-1"
              onClick={(e) => {
                e.stopPropagation();
                toggleFavorite();
              }}
            >
              {favoriteCards.includes(flashcards[currentIndex].id) ? (
                <Star fill="yellow" strokeWidth={0} />
              ) : (
                <Star className="text-grey-300" fill="none" strokeWidth={2} />
              )}
            </button>
          </div>
          <div className="side back">
            {flashcards[currentIndex]?.answer}
            <button
              className="absolute top-3 right-2 text-black pr-2"
              onClick={(e) => {
                e.stopPropagation();
                speakFlashcard();
              }}
            >
              <Volume2 />
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
