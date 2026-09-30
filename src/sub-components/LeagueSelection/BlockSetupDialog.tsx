import {
  Loader2,
  Plus,
  Layers
} from 'lucide-react';
import type React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '../../components/dialog';
import { Input } from '../../components/input';
import { Label } from '../../components/label';
import { Button } from '../../components/button';
import { handleBlockSetup } from '../../utils/functions/league';

interface BlockSetupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedLeagueName: string;
  selectedLeagueId: string | number | null;
  blockCount: string;
  setBlockCount: (value: string) => void;
  gamesPerWeek: string;
  setGamesPerWeek: (value: string) => void;
  startingLane: string;
  setStartingLane: (value: string) => void;
  creatingBlocks: boolean;
  setCreatingBlocks: (value: boolean) => void;
  setLeagueBlockStatus: React.Dispatch<React.SetStateAction<Record<string | number, boolean>>>;
  setListOfLeaguesByUser: React.Dispatch<React.SetStateAction<any[]>>;
}

export default function BlockSetupDialog({
  open,
  onOpenChange,
  selectedLeagueName,
  selectedLeagueId,
  blockCount,
  setBlockCount,
  gamesPerWeek,
  setGamesPerWeek,
  startingLane,
  setStartingLane,
  creatingBlocks,
  setCreatingBlocks,
  setLeagueBlockStatus,
  setListOfLeaguesByUser
}: BlockSetupDialogProps) {
  const parsedBlockCount = Number.parseInt(
    blockCount,
    10
  );

  const parsedGamesPerWeek = Number.parseInt(
    gamesPerWeek,
    10
  );

  const parsedStartingLane = Number.parseInt(
    startingLane,
    10
  );

  const isValidBlockCount =
    Number.isInteger(
      parsedBlockCount
    ) &&
    parsedBlockCount >= 1 &&
    parsedBlockCount <= 10;

  const isValidGamesPerWeek =
    Number.isInteger(
      parsedGamesPerWeek
    ) &&
    parsedGamesPerWeek >= 1;

  const isValidStartingLane =
    Number.isInteger(
      parsedStartingLane
    ) &&
    parsedStartingLane >= 1;

  const isValid =
    isValidBlockCount &&
    isValidGamesPerWeek &&
    isValidStartingLane;

  const createSetup = () => {
    return handleBlockSetup(
      creatingBlocks,
      setCreatingBlocks,
      selectedLeagueId,
      blockCount,
      gamesPerWeek,
      startingLane,
      setLeagueBlockStatus,
      onOpenChange,
      (
        updatedAt,
        savedGamesPerWeek,
        savedStartingLane
      ) => {
        if (
          !updatedAt ||
          selectedLeagueId === null
        ) {
          return;
        }

        setListOfLeaguesByUser(
          (currentLeagues) =>
            currentLeagues.map((league) =>
              league.id === selectedLeagueId
                ? {
                    ...league,
                    games_per_week: savedGamesPerWeek,
                    starting_lane: savedStartingLane,
                    updated_at: updatedAt
                  }
                : league
            )
        );
      }
    );
  };

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent
        className="glass border-border/50"
        onPointerDownOutside={(event) =>
          event.preventDefault()
        }
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-primary" />

            <span className="gradient-text">
              League Setup
            </span>
          </DialogTitle>

          <DialogDescription>
            Configure the basic settings for{' '}
            <span className="font-medium text-foreground">
              {selectedLeagueName}
            </span>
            .
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">

          {/* Blocks */}
          <div className="space-y-2">
            <Label htmlFor="blockCount">
              Number of Blocks
            </Label>

            <Input
              id="blockCount"
              type="number"
              min="1"
              max="10"
              value={blockCount}
              onChange={(event) =>
                setBlockCount(
                  event.target.value
                )
              }
              placeholder="e.g. 2"
              className="bg-input border-border/50"
            />

            <p className="text-sm text-muted-foreground">
              Number of blocks in this league.
              Maximum 10.
            </p>
          </div>

          {/* Games Per Week */}
          <div className="space-y-2">
            <Label htmlFor="gamesPerWeek">
              Games per Week
            </Label>

            <Input
              id="gamesPerWeek"
              type="number"
              min="1"
              value={gamesPerWeek}
              onChange={(event) =>
                setGamesPerWeek(
                  event.target.value
                )
              }
              placeholder="e.g. 3"
              className="bg-input border-border/50"
            />

            <p className="text-sm text-muted-foreground">
              How many games each team plays
              every week.
            </p>
          </div>

          {/* Starting Lane */}
          <div className="space-y-2">
            <Label htmlFor="startingLane">
              Starting Lane
            </Label>

            <Input
              id="startingLane"
              type="number"
              min="1"
              value={startingLane}
              onChange={(event) =>
                setStartingLane(
                  event.target.value
                )
              }
              placeholder="e.g. 1"
              className="bg-input border-border/50"
            />

            <p className="text-sm text-muted-foreground">
              The first lane number used by this league.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() =>
              onOpenChange(false)
            }
            disabled={creatingBlocks}
          >
            Cancel
          </Button>
          <Button
            onClick={() => void createSetup()}
            disabled={
              creatingBlocks ||
              !isValid
            }
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0 shadow-md shadow-purple-500/30"
          >
            {creatingBlocks ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" />
                Create League Setup
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}