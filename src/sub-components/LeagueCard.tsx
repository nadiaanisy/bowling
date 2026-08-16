import {
  ArrowRight,
  Database,
  DatabaseZap,
  Layers,
  Sparkles,
  Trash2,
  Users
} from 'lucide-react';
import {
  Card,
  CardContent
} from '../components/card';
import { motion } from 'motion/react';
import { Badge } from '../components/badge';
import { Button } from '../components/button';
import type { League } from '../utils/interfaces';

interface LeagueCardProps {
  league: League;
  hasBlocks: boolean;
  teamCount: number;
  index: number;
  onOpen: () => void;
  onSetupBlocks: () => void;
  onDelete: () => void;
}

export function LeagueCard({
  league,
  hasBlocks,
  teamCount,
  index,
  onOpen,
  onSetupBlocks,
  onDelete
}: LeagueCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 + 0.2 }}
    >
      <Card className="glass border-border/50 hover:border-primary/40 transition-all duration-200 hover:shadow-lg hover:shadow-primary/10 group">
        <CardContent className="p-5">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 min-w-0">
              <div className={`flex-shrink-0 p-3 rounded-xl ${hasBlocks ? 'bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/20' : 'bg-muted/50 border border-border/50'}`}>
                {hasBlocks
                  ? <Database className="h-6 w-6 text-primary" />
                  : <DatabaseZap className="h-6 w-6 text-muted-foreground" />}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold truncate">{league.name}</span>
                  {hasBlocks ? (
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs flex-shrink-0">
                      <Sparkles className="h-2.5 w-2.5 mr-1" />
                      Active
                    </Badge>
                  ) : (
                    <Badge className="bg-muted/50 text-muted-foreground border-border/50 text-xs flex-shrink-0">
                      No data
                    </Badge>
                  )}
                </div>
                {hasBlocks ? (
                  <div className="flex items-center gap-1 mt-0.5 text-xs text-muted-foreground">
                    <Users className="h-3 w-3" />
                    {teamCount} {teamCount === 1 ? 'team' : 'teams'} · Click to continue
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    No blocks set up yet — create to get started
                  </p>
                )}
                {(league.created_at || league.updated_at) && (
                  <p className="text-[11px] text-muted-foreground/80 mt-1">
                    {league.updated_at
                      ? `Last Updated on ${new Date(league.updated_at).toLocaleDateString()}`
                      : `Created on ${new Date(league.created_at as string).toLocaleDateString()}`}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              {hasBlocks ? (
                <Button
                  size="sm"
                  onClick={onOpen}
                  className="gap-1.5 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0 shadow-md shadow-purple-500/30"
                >
                  Open
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              ) : (
                <Button
                  type="button"
                  size="icon"
                  onClick={onSetupBlocks}
                  title={`Set up blocks for ${league.name}`}
                  aria-label={`Set up blocks for ${league.name}`}
                  variant="outline"
                  className="gap-1.5 border-primary/40 text-primary hover:bg-primary/10 hover:border-primary"
                >
                  <Layers className="h-4 w-4" />
                </Button>
              )}
              <Button
                type="button"
                size="icon"
                variant="ghost"
                title={`Delete ${league.name}`}
                aria-label={`Delete ${league.name}`}
                onClick={(event) => {
                  event.stopPropagation();
                  onDelete();
                }}
                className="text-destructive hover:bg-destructive/10 hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
