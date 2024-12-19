import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const slides = [
  {
    id: 1,
    title: "Welcome",
    content: "NIS Battlesnake Tournament 2024",
  },
  {
    id: 2,
    title: "Agenda",
    content: "Tournament Rules and Schedule",
  },
  {
    id: 3,
    title: "Tournament 1",
    content: "Single Elimination Tournament",
  },
  {
    id: 4,
    title: "Tournament 2",
    content: "Double Elimination Tournament",
  },
  {
    id: 5,
    title: "Begin!",
    content: "Let the Games Begin",
  },
];

export default function Presentation() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const previousSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "ArrowLeft") {
        previousSlide();
      } else if (event.key === "ArrowRight") {
        nextSlide();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    // Cleanup listener on unmount
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [currentSlide]); // Add currentSlide as dependency so the handlers have access to current state

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 to-indigo-900 p-8">
      {/* Navigation Bar */}
      <div className="fixed top-0 left-0 right-0 bg-gradient-to-r from-purple-900 to-indigo-900 p-4 shadow-lg z-10">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="text-pink-500 font-mono">
            Slide {currentSlide + 1} / {slides.length}
          </div>
          <div className="flex space-x-4">
            <button
              onClick={previousSlide}
              disabled={currentSlide === 0}
              className="flex items-center px-4 py-2 border-2 border-pink-500 text-pink-500 hover:bg-pink-500/20 disabled:opacity-50 font-mono rounded-lg"
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous
            </button>
            <button
              onClick={nextSlide}
              disabled={currentSlide === slides.length - 1}
              className="flex items-center px-4 py-2 border-2 border-pink-500 text-pink-500 hover:bg-pink-500/20 disabled:opacity-50 font-mono rounded-lg"
            >
              Next
              <ChevronRight className="h-4 w-4 ml-2" />
            </button>
          </div>
        </div>
      </div>

      {/* Slide Content */}
      <div className="mt-24 max-w-7xl mx-auto">
        <div className="border-2 border-pink-500 rounded-lg bg-purple-900/80 backdrop-blur p-16 shadow-lg shadow-cyan-500/30 min-h-[60vh] flex flex-col items-center justify-center">
          <h1 className="text-6xl font-bold text-cyan-300 font-mono mb-8 text-center">
            {slides[currentSlide].title}
          </h1>
          <div className="text-3xl text-pink-500 font-mono text-center">
            {slides[currentSlide].content}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-8 flex justify-center space-x-2">
          {slides.map((_, index) => (
            <div
              key={index}
              className={`h-2 w-16 rounded-full transition-colors ${
                index === currentSlide ? "bg-pink-500" : "bg-pink-500/20"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Keyboard Navigation Info */}
      <div className="fixed bottom-4 right-4 text-pink-500/50 font-mono text-sm">
        Use ← → arrow keys to navigate
      </div>
    </div>
  );
}
