import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, ArrowUpDown } from 'lucide-react';

interface PoolCardProps {
  pair: string;
  volume24h: string;
  apr: string;
  tvl: string;
  stable?: boolean;
  version?: string;
  delay?: number;
}

const PoolCard = ({ pair, volume24h, apr, tvl, stable = false, version = "0.5", delay = 0 }: PoolCardProps) => {
  return (
    <Card 
      className="pool-card animate-fade-in"
      style={{ animationDelay: `${delay}ms` }}
    >
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <div className="flex items-center space-x-1">
                <div className="token-icon bg-gradient-primary"></div>
                <div className="token-icon bg-gradient-secondary"></div>
              </div>
              <div>
                <h3 className="font-semibold text-foreground">{pair}</h3>
                <div className="flex items-center space-x-2 mt-1">
                  {stable && (
                    <Badge variant="secondary" className="text-xs">
                      Stable
                    </Badge>
                  )}
                  <span className="text-xs text-muted-foreground">Ver. {version}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="text-right space-y-1">
            <div>
              <span className="text-sm text-muted-foreground">Volume 24H</span>
              <p className="font-semibold">{volume24h}</p>
            </div>
          </div>
          
          <div className="text-right space-y-1">
            <div>
              <span className="text-sm text-muted-foreground">APR</span>
              <p className="font-semibold text-success">{apr}</p>
            </div>
          </div>
          
          <div className="text-right space-y-1">
            <div>
              <span className="text-sm text-muted-foreground">TVL</span>
              <p className="font-semibold">{tvl}</p>
            </div>
          </div>
          
          <div className="flex space-x-2">
            <Button size="sm" variant="hero">
              <Plus className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="outline">
              <ArrowUpDown className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PoolCard;