"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Brain, Trophy, Timer, FunctionSquare as Function } from "lucide-react";
import { cn } from "@/lib/utils";
import { generateEquations, type QuadraticEquation } from "@/lib/gemini";

type MemoryCard = {
  id: number;
  content: string;
  type: "equation" | "factors";
  matchId: number;
  isFlipped: boolean;
  isMatched: boolean;
};

export default function Home() {
  const [cards, setCards] = useState<MemoryCard[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [timer, setTimer] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [loading, setLoading] = useState(false);

  const initializeGame = async () => {
    setLoading(true);
    try {
      const equations = await generateEquations(6);
      const cardPairs = equations.flatMap((eq, index) => [
        {
          id: index * 2,
          content: eq.equation,
          type: "equation" as const,
          matchId: index,
          isFlipped: false,
          isMatched: false,
        },
        {
          id: index * 2 + 1,
          content: eq.factors,
          type: "factors" as const,
          matchId: index,
          isFlipped: false,
          isMatched: false,
        },
      ]);
      
      const shuffledCards = cardPairs.sort(() => Math.random() - 0.5);
      setCards(shuffledCards);
      setFlippedCards([]);
      setScore(0);
      setTimer(0);
      setGameStarted(true);
    } catch (error) {
      console.error("Failed to initialize game:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (gameStarted && !loading) {
      interval = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [gameStarted, loading]);

  const handleCardClick = (id: number) => {
    if (flippedCards.length === 2) return;
    if (cards.find((card) => card.id === id)?.isMatched) return;
    if (flippedCards.includes(id)) return;

    const newCards = cards.map((card) =>
      card.id === id ? { ...card, isFlipped: true } : card
    );
    setCards(newCards);
    setFlippedCards([...flippedCards, id]);

    if (flippedCards.length === 1) {
      const firstCard = cards.find((card) => card.id === flippedCards[0])!;
      const secondCard = cards.find((card) => card.id === id)!;

      if (firstCard.matchId === secondCard.matchId) {
        setTimeout(() => {
          setCards(
            cards.map((card) =>
              card.id === firstCard.id || card.id === secondCard.id
                ? { ...card, isMatched: true }
                : card
            )
          );
          setScore((prev) => {
            const newScore = prev + 1;
            if (newScore > bestScore) setBestScore(newScore);
            return newScore;
          });
        }, 500);
      }

      setTimeout(() => {
        setCards(
          newCards.map((card) =>
            !card.isMatched ? { ...card, isFlipped: false } : card
          )
        );
        setFlippedCards([]);
      }, 1500);
    }
  };

  if (!cards.length) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary flex items-center justify-center">
        <div className="text-center">
          <Function className="w-16 h-16 text-primary mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-primary mb-4">Zenarith Memory Game</h1>
          <Button onClick={initializeGame} disabled={loading} size="lg">
            {loading ? "Loading..." : "Start Game"}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <Function className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold text-primary">Zenarith Memory Game</h1>
          </div>
          <Button onClick={initializeGame} disabled={loading}>
            {loading ? "Loading..." : gameStarted ? "New Game" : "Start Game"}
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8 sm:grid-cols-3">
          <Card className="p-4 flex items-center gap-2">
            <Trophy className="w-6 h-6 text-chart-1" />
            <div>
              <p className="text-sm text-muted-foreground">Best Score</p>
              <p className="text-2xl font-bold">{bestScore}</p>
            </div>
          </Card>
          <Card className="p-4 flex items-center gap-2">
            <Trophy className="w-6 h-6 text-chart-2" />
            <div>
              <p className="text-sm text-muted-foreground">Current Score</p>
              <p className="text-2xl font-bold">{score}</p>
            </div>
          </Card>
          <Card className="p-4 flex items-center gap-2">
            <Timer className="w-6 h-6 text-chart-3" />
            <div>
              <p className="text-sm text-muted-foreground">Time</p>
              <p className="text-2xl font-bold">{timer}s</p>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-3 gap-4 md:grid-cols-4">
          {cards.map((card) => (
            <Card
              key={card.id}
              className={cn(
                "aspect-[4/3] flex items-center justify-center p-4 text-lg font-bold cursor-pointer transition-all duration-300 hover:scale-105",
                card.isFlipped || card.isMatched
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary"
              )}
              onClick={() => handleCardClick(card.id)}
            >
              {(card.isFlipped || card.isMatched) && (
                <span className="text-center">{card.content}</span>
              )}
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}