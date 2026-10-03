import { Loader2, Plus, Layers } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../../components/dialog';
import { Input } from '../../components/input';
import { Label } from '../../components/label';
import { Button } from '../../components/button';
import { handleCreateLeague } from '../../utils/functions/league';

interface CreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  newLeagueName: string;
  setNewLeagueName: (value: string) => void;
  creatingLeague: boolean;
  setCreatingLeague: (value: boolean) => void;
  userId?: string | number;
  setListOfLeaguesByUser: React.Dispatch<React.SetStateAction<any[]>>;
}

export default function CreateDialog({
  open,
  onOpenChange,
  newLeagueName,
  setNewLeagueName,
  creatingLeague,
  setCreatingLeague,
  userId,
  setListOfLeaguesByUser,
}: CreateDialogProps) {
  const createLeague = () => {
    return handleCreateLeague(
      creatingLeague,
      setCreatingLeague,
      newLeagueName,
      userId,
      setListOfLeaguesByUser,
      setNewLeagueName,
      onOpenChange,
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="glass border-border/50"
        onPointerDownOutside={(event) => event.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-primary" />

            <span className="gradient-text">Create a New League</span>
          </DialogTitle>

          <DialogDescription>
            Give your league a name. You will configure the league setup next.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="leagueName">League Name</Label>

            <Input
              id="leagueName"
              value={newLeagueName}
              onChange={(event) => setNewLeagueName(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  void createLeague();
                }
              }}
              placeholder="e.g. Sunray League"
              className="bg-input border-border/50"
              autoFocus
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              onOpenChange(false);
              setNewLeagueName('');
            }}
          >
            Cancel
          </Button>

          <Button
            onClick={() => void createLeague()}
            disabled={creatingLeague || !newLeagueName.trim()}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0 shadow-md shadow-purple-500/30"
          >
            {creatingLeague ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" />
                Create League
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
