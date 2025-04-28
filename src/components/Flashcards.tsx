import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabaseClient";
import {
  Star,
  Volume2,
  ArrowBigRight,
  ArrowBigLeft,
  RotateCcw,
  Shuffle,
  Printer,
} from "lucide-react";
import "./Flashcards.css";

interface Flashcard {
  id: number;
  question: string;
  answer: string;
  lesson_id: number;
}

export default function Flashcards({ lessonId, courseName }) {
  const [originalFlashcards, setOriginalFlashcards] = useState<Flashcard[]>([]);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [inputValue, setInputValue] = useState("1");
  const [shuffleMode, setShuffleMode] = useState(false);
  const [favoriteCards, setFavoriteCards] = useState<number[]>([]);
  const [reviewingFavoriteCards, setReviewingFavoriteCards] = useState(false);
  const [browserSupport, setBrowserSupport] = useState({
    speech: false,
    storage: false,
  });

  // Check browser support on init
  useEffect(() => {
    // Check speech synthesis support
    const speechSupported =
      typeof window !== "undefined" && "speechSynthesis" in window;

    // Check localStorage support
    let storageSupported = false;
    try {
      localStorage.setItem("test", "test");
      localStorage.removeItem("test");
      storageSupported = true;
    } catch (e) {
      storageSupported = false;
    }

    setBrowserSupport({
      speech: speechSupported,
      storage: storageSupported,
    });
  }, []);

  // Fetch Flashcards
  useEffect(() => {
    async function fetchFlashcards() {
      try {
        const { data, error } = await supabase
          .from("flashcards")
          .select("*")
          .eq("lesson_id", lessonId);

        if (error) {
          console.error("Error fetching flashcards:", error);
        } else {
          setOriginalFlashcards(data || []);
          setFlashcards(data || []);

          // Load favorite cards from localStorage only if supported
          if (browserSupport.storage) {
            try {
              const savedFavoriteCards = JSON.parse(
                localStorage.getItem(`favoriteCards_${lessonId}`) || "[]"
              );
              setFavoriteCards(savedFavoriteCards);
            } catch (e) {
              console.warn("Failed to load favorites from localStorage", e);
            }
          }
        }
      } catch (err) {
        console.error("Failed to fetch flashcards:", err);
      }
    }

    if (lessonId) {
      fetchFlashcards();
    }
  }, [lessonId, browserSupport.storage]);

  // Keyboard Shortcuts - with error handling
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      try {
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
      } catch (err) {
        console.error("Keyboard navigation error:", err);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [flashcards, currentIndex, flipped, shuffleMode]);

  // Shuffle Functionality
  const shuffleCards = useCallback((cards: Flashcard[]) => {
    return [...cards].sort(() => 0.5 - Math.random());
  }, []);

  const toggleShuffleMode = () => {
    try {
      if (shuffleMode) {
        // Return to original order - consider favorite mode
        setFlashcards(
          reviewingFavoriteCards
            ? originalFlashcards.filter((card) =>
                favoriteCards.includes(card.id)
              )
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
    } catch (err) {
      console.error("Error toggling shuffle mode:", err);
    }
  };

  // Favorite Cards Management - with fallbacks for missing storage
  const toggleFavorite = () => {
    try {
      if (flashcards.length === 0 || currentIndex >= flashcards.length) return;

      const currentCardId = flashcards[currentIndex].id;
      const newFavoriteCards = favoriteCards.includes(currentCardId)
        ? favoriteCards.filter((id) => id !== currentCardId)
        : [...favoriteCards, currentCardId];

      setFavoriteCards(newFavoriteCards);

      // Only try to use localStorage if it's supported
      if (browserSupport.storage) {
        try {
          localStorage.setItem(
            `favoriteCards_${lessonId}`,
            JSON.stringify(newFavoriteCards)
          );
        } catch (e) {
          console.warn("Failed to save favorites to localStorage", e);
        }
      }
    } catch (err) {
      console.error("Error toggling favorite:", err);
    }
  };

  const toggleFavoriteCardsReview = () => {
    try {
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
    } catch (err) {
      console.error("Error toggling favorite cards review:", err);
    }
  };

  // Simplified Text-to-Speech with better error handling
  const speakFlashcard = () => {
    try {
      if (!browserSupport.speech) {
        console.warn("Text-to-speech is not supported in this browser");
        return;
      }

      const currentCard = flashcards[currentIndex];
      if (!currentCard) return;

      const text = flipped ? currentCard.answer : currentCard.question;

      // Cancel any ongoing speech
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "fr-FR";

      // Set speech parameters for better French pronunciation
      utterance.rate = 1.0; // Normal speed
      utterance.pitch = 1.0; // Normal pitch

      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.error("Speech synthesis error:", err);
    }
  };

  // Navigation Methods - with bounds checking
  const goToNextCard = () => {
    try {
      if (flashcards.length === 0) return;

      if (!flipped) {
        // If already not flipped, directly update the index
        setCurrentIndex((i) => {
          const newIndex = i < flashcards.length - 1 ? i + 1 : i;
          setInputValue(String(newIndex + 1)); // Update inputValue
          return newIndex;
        });
      } else {
        // If flipped, turn it false and wait 200ms
        setFlipped(false);
        setTimeout(() => {
          setCurrentIndex((i) => {
            const newIndex = i < flashcards.length - 1 ? i + 1 : i;
            setInputValue(String(newIndex + 1)); // Update inputValue
            return newIndex;
          });
        }, 200);
      }
    } catch (err) {
      console.error("Navigation error:", err);
    }
  };

  const goToPreviousCard = () => {
    try {
      if (flashcards.length === 0) return;

      if (!flipped) {
        // If already not flipped, directly update the index
        setCurrentIndex((i) => {
          const newIndex = i > 0 ? i - 1 : i;
          setInputValue(String(newIndex + 1)); // Update inputValue
          return newIndex;
        });
      } else {
        // If flipped, turn it false and wait 200ms
        setFlipped(false);
        setTimeout(() => {
          setCurrentIndex((i) => {
            const newIndex = i > 0 ? i - 1 : i;
            setInputValue(String(newIndex + 1)); // Update inputValue
            return newIndex;
          });
        }, 200);
      }
    } catch (err) {
      console.error("Navigation error:", err);
    }
  };

  const resetFlashcards = () => {
    try {
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
            ? originalFlashcards.filter((card) =>
                favoriteCards.includes(card.id)
              )
            : originalFlashcards
        );
      }
    } catch (err) {
      console.error("Reset flashcards error:", err);
    }
  };

  // Input Navigation Logic
  const handleInputChange = (e) => {
    try {
      const value = e.target.value;
      if (value === "" || /^\d+$/.test(value)) {
        setInputValue(value);
      }
    } catch (err) {
      console.error("Input change error:", err);
    }
  };

  const handleInputBlur = () => {
    try {
      if (!inputValue) {
        setInputValue(String(currentIndex + 1));
        return;
      }
      updateCurrentIndex();
    } catch (err) {
      console.error("Input blur error:", err);
    }
  };

  const handleKeyDown = (e) => {
    try {
      if (e.key === "Enter") {
        updateCurrentIndex();
      }
    } catch (err) {
      console.error("Key down error:", err);
    }
  };

  const updateCurrentIndex = () => {
    try {
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
    } catch (err) {
      console.error("Update index error:", err);
    }
  };

  // Simplified printing function that avoids jsPDF dependency
  const PrintCards = () => {
    try {
      const flashcardsToPrint = reviewingFavoriteCards
        ? originalFlashcards.filter((card) => favoriteCards.includes(card.id))
        : originalFlashcards;

      if (flashcardsToPrint.length === 0) {
        alert("لا توجد بطاقات لطبعها!");
        return;
      }

      const exportDate = new Date().toLocaleDateString("fr-FR");
      const totalCards = flashcardsToPrint.length;
      const flashcardType = reviewingFavoriteCards ? "Favorite" : "All";

      const printWindow = window.open("", "_blank");
      if (!printWindow) {
        alert("Popup blocked! Please allow popups for this site.");
        return;
      }

      printWindow.document.write(`
      <html>
      <head>
        <title>Flashcards</title>
        <style>
          @page { margin: 1cm; }
          * { font-family: Arial, sans-serif; }  
          body { text-align: center; color: #333; margin: 0; padding: 0; }
          .container { width: 100%; margin: auto; padding: 10px; }
          .header { text-align: center; margin-bottom: 5px; }
          .header h1 { font-size: 20px; color: #1e40af; margin: 5px 0; }
          .info { font-size: 14px; margin-bottom: 10px; }
          .cards-container { 
            display: grid; 
            grid-template-columns: repeat(2, 1fr); 
            gap: 10px; 
            width: 90%; 
            margin: auto; 
            justify-content: center;
          }
          .card {
            border: 1px solid #ddd;
            padding: 10px;
            border-radius: 5px;
            background-color: #f8fafc;
            text-align: center;
            min-height: 80px;
            width: 100%;
            box-sizing: border-box;
            break-inside: avoid;
          }
          h2 { color: #1e40af; font-size: 14px; margin-bottom: 5px; }
          p { font-size: 12px; }
          .footer { margin-top: 15px; font-size: 10px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>FLASHCARDS</h1>
          </div>

          <div class="info">
            <p><strong>${flashcardType} Flashcards</strong></p>
            <p><strong>Cour :</strong> ${courseName}</p>
            <p><strong>Export Date:</strong> ${exportDate}</p>
            <p><strong>Total Cards:</strong> ${totalCards}</p>
          </div>

          <div class="cards-container">
            ${flashcardsToPrint
              .map(
                (card) => `
              <div class="card">
                <h2>${card.question}</h2>
                <p>${card.answer}</p>
              </div>
            `
              )
              .join("")}
          </div>

          <div class="footer">
            Generated by <strong>TBiB Flashcards System</strong><br>
            © 2025 @TBiB COURS - All rights reserved
          </div>
        </div>

        <script>
          window.onload = function() { window.print(); setTimeout(() => window.close(), 1000); }
        </script>
      </body>
      </html>
    `);

      printWindow.document.close();
    } catch (err) {
      console.error("Printing error:", err);
      alert("Failed to print flashcards. Please try again later.");
    }
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
            {browserSupport.speech && (
              <button
                className="absolute top-3 right-2 text-black pr-2"
                onClick={(e) => {
                  e.stopPropagation();
                  speakFlashcard();
                }}
              >
                <Volume2 />
              </button>
            )}
            <button
              className="absolute top-2 left-2 pr-2 rounded-full p-1"
              onClick={(e) => {
                e.stopPropagation();
                toggleFavorite();
              }}
            >
              {favoriteCards.includes(flashcards[currentIndex]?.id) ? (
                <Star fill="yellow" strokeWidth={0} />
              ) : (
                <Star className="text-grey-300" fill="none" strokeWidth={2} />
              )}
            </button>
          </div>
          <div className="side back">
            {flashcards[currentIndex]?.answer}
            {browserSupport.speech && (
              <button
                className="absolute top-3 right-2 text-black pr-2"
                onClick={(e) => {
                  e.stopPropagation();
                  speakFlashcard();
                }}
              >
                <Volume2 />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="buttons">
        <button className="prev-next-button" onClick={goToPreviousCard}>
          <ArrowBigLeft />
        </button>
        <button className="prev-next-button" onClick={resetFlashcards}>
          <RotateCcw />
        </button>
        <button className="prev-next-button" onClick={goToNextCard}>
          <ArrowBigRight />
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
      <div className="pt-4">
        <button
          className="prev-next-button flex items-center gap-2"
          onClick={PrintCards}
        >
          Imprimer <Printer />
        </button>
      </div>
    </div>
  );
}
