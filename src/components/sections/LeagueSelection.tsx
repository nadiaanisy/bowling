import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../ui/dialog";
import { toast } from "sonner";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { Trophy } from "lucide-react";
import { useCustomHook } from "../misc";
import { Skeleton } from "../ui/skeleton";
import { getLeaguesByUser } from "../api/get";
import { addBlockForLeague } from "../api/add";
import { successToastStyle } from "../functions";

export default function LeagueSelection() {
  const {
    setIsLoadingSkeleton,
    setLeagues,
    setShowInsertBlockDialog,
    setBlockCount,
    isLoadingSkeleton,
    leagues,
    userId,
    selectLeague,
    showInsertBlockDialog,
    blockCount,
    selectedLeagueName,
    selectedLeague,
    setSelectedLeague,
  } = useCustomHook();

  const [initialSelectedLeague, setInitialSelectedLeague] = useState<
    string | null
  >(null);

  useEffect(() => {
    const loadLeagues = async () => {
      setIsLoadingSkeleton(true);
      const data = await getLeaguesByUser(userId);
      setLeagues(data);
      setIsLoadingSkeleton(false);
    };

    loadLeagues();
  }, [userId, setIsLoadingSkeleton, setLeagues]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary/30">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 bg-primary rounded-full flex items-center justify-center">
              <Trophy className="h-8 w-8 text-primary-foreground" />
            </div>
          </div>
          <CardTitle className="font-bold">Select a League</CardTitle>
          <CardDescription>
            Choose which bowling league you want to manage
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {isLoadingSkeleton ? (
              Array.from({ length: 1 }).map((_, index) => (
                <div
                  key={index}
                  className="w-full h-auto py-4 flex items-center gap-3 border border-black/10 rounded-md"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-secondary rounded-full flex items-center justify-center">
                      <Skeleton className="h-5 w-32" />
                    </div>
                    <div className="text-left">
                      <Skeleton className="h-5 w-32" />
                    </div>
                  </div>
                </div>
              ))
            ) : leagues.length === 0 ? (
              <div className="text-center text-muted-foreground">
                No leagues available
              </div>
            ) : (
              leagues.map((league) => (
                <div
                  key={league.id}
                  className="border border-black/10 rounded-md"
                >
                  <Button
                    variant="outline"
                    className="w-full h-auto py-4 justify-start"
                    onClick={async () => {
                      const hasBlockResult: any = await selectLeague(league);
                      if (hasBlockResult === false) {
                        setShowInsertBlockDialog(true);
                        setInitialSelectedLeague(league.id);
                      }
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-secondary rounded-full flex items-center justify-center">
                        <Trophy className="h-5 w-5" />
                      </div>
                      <div className="text-left whitespace-normal break-words">
                        <div className="text-sm font-medium leading-tight">
                          {league.name}
                        </div>
                      </div>
                    </div>
                  </Button>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Block Setup Dialog */}
      <Dialog
        open={showInsertBlockDialog}
        onOpenChange={setShowInsertBlockDialog}
      >
        <DialogContent
          onInteractOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>Set Up Blocks</DialogTitle>
            <DialogDescription>
              This league has no block data yet. How many blocks would you like
              to create for <b>{selectedLeagueName}</b>?
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <Label htmlFor="blockCount">Number of Blocks</Label>
            <Input
              id="blockCount"
              type="number"
              min="1"
              max="10"
              value={blockCount}
              onChange={(e) => setBlockCount(e.target.value)}
              placeholder="Enter number of blocks (1-10)"
            />
            <p className="text-sm text-muted-foreground">
              Typical leagues use 2 blocks (weeks each depends on no. of teams)
            </p>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowInsertBlockDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={async () => {
                // ✅ Call insert
                const result = await addBlockForLeague(
                  initialSelectedLeague,
                  parseInt(blockCount)
                );
                if (result && initialSelectedLeague) {
                  setSelectedLeague(initialSelectedLeague);
                  sessionStorage.setItem(
                    "bowling-selected-league",
                    initialSelectedLeague
                  );
                  localStorage.setItem(
                    "bowling-selected-league",
                    initialSelectedLeague
                  );

                  // ✅ Close dialog
                  setShowInsertBlockDialog(false);

                  // ✅ Optional: show success toast
                  toast.success(
                    `Successfully created ${blockCount} block(s) for ${selectedLeagueName}`,
                    successToastStyle
                  );
                }
              }}
              disabled={
                !blockCount ||
                parseInt(blockCount) < 1 ||
                parseInt(blockCount) > 10
              }
            >
              Create Blocks
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
