'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Trophy } from 'lucide-react';

interface Tile {
  id: number;
  content: string;
  factor: number;
  isFlipped: boolean;
  isMatched: boolean;
  type: 'equation' | 'factor';
}

export default function Home() {
  const [tiles, setTiles] = useState<Tile[]>([]);
  const [flipped, setFlipped] = useState<Tile[]>([]);
  const [matches, setMatches] = useState<number>(0);
  const [isLocked, setIsLocked] = useState<boolean>(false);

  // Generate a quadratic equation and its factors
  const generateEquation = (): { equation: string; factor1: number; factor2: number } => {
    let factor1 = Math.floor(Math.random() * 7) - 3;
    let factor2 = Math.floor(Math.random() * 7) - 3;

    // Avoid 0 and duplicate factors
    while (factor1 === 0 || factor2 === 0 || factor1 === factor2) {
      factor1 = Math.floor(Math.random() * 7) - 3;
      factor2 = Math.floor(Math.random() * 7) - 3;
    }

    const b = factor1 + factor2;
    const c = factor1 * factor2;
    const equation = `x² ${b >= 0 ? '+' : ''}${b}x ${c >= 0 ? '+' : ''}${c}`;

    return { equation, factor1, factor2 };
  };

  // Initialize the game with shuffled tiles
  const initializeGame = () => {
    const pairs: Tile[] = [];
    const numPairs = 6;

    for (let i = 0; i < numPairs; i++) {
      const { equation, factor1, factor2 } = generateEquation();

      pairs.push(
        {
          id: i * 4,
          content: equation,
          factor: factor1,
          isFlipped: false,
          isMatched: false,
          type: 'equation',
        },
        {
          id: i * 4 + 1,
          content: `x = ${factor1}`,
          factor: factor1,
          isFlipped: false,
          isMatched: false,
          type: 'factor',
        },
        {
          id: i * 4 + 2,
          content: equation,
          factor: factor2,
          isFlipped: false,
          isMatched: false,
          type: 'equation',
        },
        {
          id: i * 4 + 3,
          content: `x = ${factor2}`,
          factor: factor2,
          isFlipped: false,
          isMatched: false,
          type: 'factor',
        }
      );
    }

    // Shuffle the tiles
    const shuffled = pairs.sort(() => Math.random() - 0.5);

    setTiles(shuffled);
    setFlipped([]);
    setMatches(0);
    setIsLocked(false);
  };

  useEffect(() => {
    initializeGame();
  }, []);

  // Handle tile click logic
  const handleClick = (tile: Tile) => {
    if (isLocked || tile.isMatched || flipped.some((t) => t.id === tile.id)) return;

    const newFlipped = [...flipped, tile];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      setIsLocked(true);
      const [first, second] = newFlipped;

      if (first.factor === second.factor && first.type !== second.type) {
        setTimeout(() => {
          setTiles((prev) =>
            prev.map((t) =>
              t.id === first.id || t.id === second.id
                ? { ...t, isMatched: true }
                : t
            )
          );
          setMatches((prev) => prev + 1);
          setFlipped([]);
          setIsLocked(false);
        }, 800);
      } else {
        setTimeout(() => {
          setFlipped([]);
          setIsLocked(false);
        }, 800);
      }
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-secondary/5 to-muted p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h1 className="text-3xl font-bold text-primary">
        Quadratic Equation Matching
        </h1>
        <div className="flex items-center gap-3">
        <Badge variant="secondary" className="text-base px-3 py-1.5">
          <Trophy className="w-4 h-4 mr-1 inline" />
          {matches}/6 Matches
        </Badge>
        <Button
          variant="outline"
          size="icon"
          onClick={initializeGame}
          aria-label="Restart Game"
        >
          <RefreshCw className="w-5 h-5" />
        </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {tiles.map((tile) => {
        const isShowing = flipped.some((t) => t.id === tile.id) || tile.isMatched;
        return (
          <Card
          key={tile.id}
          onClick={() => handleClick(tile)}
          className={`aspect-square flex items-center justify-center cursor-pointer transition-all duration-300
          ${tile.isMatched ? 'opacity-50 pointer-events-none' : 'hover:scale-105'}
          ${isShowing ? 'bg-primary/10' : 'bg-card'}
          `}
          >
          <span className={`text-center font-semibold ${isShowing ? 'text-primary' : 'text-muted-foreground'}`}>
            {isShowing ? tile.content : '?'}
          </span>
          </Card>
        );
        })}
      </div>

      {matches === 6 && (
        <div className="text-center bg-primary/10 rounded-xl py-6 px-4">
        <h2 className="text-xl font-bold text-primary mb-2">🎉 Congratulations!</h2>
        <p className="text-muted-foreground mb-4">
          You've matched all equations with their correct factors!
        </p>
        <Button onClick={initializeGame} className="bg-primary text-white hover:bg-primary/90">
          Play Again
        </Button>
        </div>
      )}
      </div>
    </main>
  );
}
