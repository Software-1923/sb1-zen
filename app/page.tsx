"use client";

import { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Trophy } from 'lucide-react';
import * as pf from 'primes-and-factors';

interface Tile {
  id: number;
  equation: string;
  factor: number;
  isFlipped: boolean;
  isMatched: boolean;
  type: 'equation' | 'factor';
}

export default function Home() {
  const [tiles, setTiles] = useState<Tile[]>([]);
  const [flippedTiles, setFlippedTiles] = useState<number[]>([]);
  const [matches, setMatches] = useState<number>(0);
  const [isLocked, setIsLocked] = useState<boolean>(false);

  const generateEquation = () => {
    // Generate coefficients that will result in integer factors
    const factor1 = Math.floor(Math.random() * 6) - 3; // Between -3 and 3
    const factor2 = Math.floor(Math.random() * 6) - 3; // Between -3 and 3
    
    // Create equation from factors: (x + p)(x + q) = x² + (p+q)x + pq
    const b = factor1 + factor2;
    const c = factor1 * factor2;
    
    return {
      equation: `x² ${b >= 0 ? '+' : ''}${b}x ${c >= 0 ? '+' : ''}${c}`,
      factor1,
      factor2
    };
  };

  const initializeGame = () => {
    const newTiles: Tile[] = [];
    const numPairs = 6;
    
    for (let i = 0; i < numPairs; i++) {
      const eq = generateEquation();
      const factor = eq.factor1;
      
      // Add equation tile
      newTiles.push({
        id: i * 2,
        equation: eq.equation,
        factor: factor,
        isFlipped: false,
        isMatched: false,
        type: 'equation'
      });
      
      // Add factor tile
      newTiles.push({
        id: i * 2 + 1,
        equation: `x = ${factor}`,
        factor: factor,
        isFlipped: false,
        isMatched: false,
        type: 'factor'
      });
    }

    // Fisher-Yates shuffle
    for (let i = newTiles.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newTiles[i], newTiles[j]] = [newTiles[j], newTiles[i]];
    }

    setTiles(newTiles);
    setFlippedTiles([]);
    setMatches(0);
  };

  useEffect(() => {
    initializeGame();
  }, []);

  const handleTileClick = (id: number) => {
    if (isLocked || tiles[id].isMatched || flippedTiles.includes(id)) return;

    const newFlippedTiles = [...flippedTiles, id];
    setFlippedTiles(newFlippedTiles);

    if (newFlippedTiles.length === 2) {
      setIsLocked(true);
      const [firstId, secondId] = newFlippedTiles;
      const firstTile = tiles[firstId];
      const secondTile = tiles[secondId];

      if (firstTile.factor === secondTile.factor && firstTile.type !== secondTile.type) {
        setTimeout(() => {
          setTiles(tiles.map((tile, index) => 
            index === firstId || index === secondId
              ? { ...tile, isMatched: true }
              : tile
          ));
          setFlippedTiles([]);
          setMatches(matches + 1);
          setIsLocked(false);
        }, 1000);
      } else {
        setTimeout(() => {
          setFlippedTiles([]);
          setIsLocked(false);
        }, 1000);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
          <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 text-transparent bg-clip-text">
            Quadratic Equation Matching
          </h1>
          <div className="flex items-center gap-4">
            <Badge variant="secondary" className="text-lg px-4 py-2">
              <Trophy className="w-5 h-5 mr-2 inline" />
              {matches}/6 Matches
            </Badge>
            <Button
              onClick={initializeGame}
              variant="outline"
              size="icon"
              className="rounded-full hover:bg-primary/10"
            >
              <RefreshCw className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {tiles.map((tile, index) => (
            <Card
              key={index}
              className={`
                relative aspect-square cursor-pointer transition-all duration-500 transform
                ${flippedTiles.includes(index) || tile.isMatched ? 'rotate-y-180' : ''}
                hover:shadow-lg hover:scale-105
              `}
              onClick={() => handleTileClick(index)}
            >
              <div className={`
                absolute inset-0 flex items-center justify-center p-4
                ${flippedTiles.includes(index) || tile.isMatched ? 'bg-primary/10' : 'bg-card'}
                rounded-lg border-2 ${tile.isMatched ? 'border-primary/50' : 'border-border'}
                ${tile.isMatched ? 'opacity-50' : ''}
              `}>
                <span className={`
                  text-lg md:text-xl font-bold text-center
                  ${flippedTiles.includes(index) || tile.isMatched ? 'text-primary rotate-y-180' : 'text-muted-foreground'}
                  ${tile.type === 'factor' ? 'text-2xl' : 'text-lg'}
                `}>
                  {flippedTiles.includes(index) || tile.isMatched ? tile.equation : '?'}
                </span>
              </div>
            </Card>
          ))}
        </div>

        {matches === 6 && (
          <div className="mt-8 text-center bg-primary/5 rounded-xl p-8 animate-in fade-in duration-500">
            <h2 className="text-2xl font-bold text-primary mb-4">
              Congratulations! 🎉
            </h2>
            <p className="text-muted-foreground mb-6">
              You've matched all the equations with their factors!
            </p>
            <Button 
              onClick={initializeGame}
              size="lg"
              className="bg-primary hover:bg-primary/90"
            >
              Play Again
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}