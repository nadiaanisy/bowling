import {
  Loader2,
  Plus
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
import { handleBlockSetup } from '../../utils/functions';

interface BlockSetupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedLeagueName: string;
  selectedLeagueId: string | number | null;
  blockCount: string;
  setBlockCount: (value: string) => void;
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
  creatingBlocks,
  setCreatingBlocks,
  setLeagueBlockStatus,
  setListOfLeaguesByUser
}: BlockSetupDialogProps) {
  const parsedBlockCount = parseInt(
    blockCount,
    10
  );

  const isValidBlockCount =
    Boolean(blockCount) &&
    parsedBlockCount >= 1 &&
    parsedBlockCount <= 10;

  const createBlocks = () => {
    return handleBlockSetup(
      creatingBlocks,
      setCreatingBlocks,
      selectedLeagueId,
      blockCount,
      setLeagueBlockStatus,
      onOpenChange,
      (updatedAt) => {
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
          <DialogTitle className="gradient-text">
            Set Up Blocks
          </DialogTitle>

          <DialogDescription>
            <span className="font-medium text-foreground">
              {selectedLeagueName}
            </span>{' '}
            has no block data yet.
            How many blocks would you like to create?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
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
                setBlockCount(event.target.value)
              }
              placeholder="Enter number of blocks (1–10)"
              className="bg-input border-border/50"
            />

            <p className="text-sm text-muted-foreground">
              Typical leagues use 2 blocks.
              You can create up to 10 blocks.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            onClick={() => void createBlocks()}
            disabled={
              creatingBlocks ||
              !isValidBlockCount
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
                Create Blocks
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}