import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface TrendingPairProps {
  pair: string;
  volume: string;
  delay?: number;
}

const TrendingPair = ({ pair, volume, delay = 0 }: TrendingPairProps) => (
  <Card 
    className="glass-morphism animate-scale-in hover:scale-105 transition-all duration-300 cursor-pointer"
    style={{ animationDelay: `${delay}ms` }}
  >
    <CardContent className="p-4">
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-1">
          <div className="token-icon bg-gradient-primary"></div>
          <div className="token-icon bg-gradient-secondary -ml-2"></div>
        </div>
        <div>
          <h3 className="font-semibold text-sm">{pair}</h3>
          <p className="text-xs text-muted-foreground">Volume 24H</p>
          <p className="text-sm font-medium text-success">{volume}</p>
        </div>
      </div>
    </CardContent>
  </Card>
);

const TrendingPairs = () => {
  const pairs = [
    { pair: 'USDC/APT', volume: '$13,856.87' },
    { pair: 'amAPT/APT', volume: '$67,496.43' },
    { pair: 'doodoo/APT', volume: '$2,113.1' },
    { pair: 'UPTOS/APT', volume: '$2.16' },
    { pair: 'USDC/USDT', volume: '$3,578.5' }
  ];

  return (
    <div className="mb-8">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-center mb-4 animate-fade-in">TRENDING PAIRS</h3>
      </div>
      <div className="flex space-x-4 overflow-x-auto pb-4">
        {pairs.map((pair, index) => (
          <TrendingPair
            key={pair.pair}
            pair={pair.pair}
            volume={pair.volume}
            delay={index * 100}
          />
        ))}
      </div>
    </div>
  );
};

export default TrendingPairs;