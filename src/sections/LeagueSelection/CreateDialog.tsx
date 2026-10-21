import { Input } from '../../components/input';
import { Label } from '../../components/label';
import { handleCreateLeague } from '../../functions/league';
import { updateLeagueName } from '../../utils/api/update';
import type { League } from '../../utils/interfaces';
import { Button } from '../../components/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../../components/dialog';
import {
  errorToastStyle,
  successToastStyle,
} from '../../functions/toast-styles';
import { toast } from 'sonner';
import {
  Loader2,
  Plus,
  Layers
} from 'lucide-react';

interface CreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  newLeagueName: string;
  setNewLeagueName: (value: string) => void;
  creatingLeague: boolean;
  setCreatingLeague: (value: boolean) => void;
  userId?: string | number;
  setListOfLeaguesByUser: React.Dispatch<React.SetStateAction<any[]>>;
  editingLeague?: League | null;
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
  editingLeague = null,
}: CreateDialogProps) {
  const createLeague = async () => {
    if (creatingLeague) return;

    if (editingLeague) {
      if (userId === null || userId === undefined) {
        toast.error('Unable to identify the current user.', errorToastStyle);
        return;
      }

      setCreatingLeague(true);

      try {
        const updatedLeague = await updateLeagueName(
          editingLeague.id,
          userId,
          newLeagueName,
        );

        if (!updatedLeague) return;

        setListOfLeaguesByUser((currentLeagues) =>
          currentLeagues.map((league) =>
            league.id === updatedLeague.id ? updatedLeague : league,
          ),
        );

        setNewLeagueName(updatedLeague.name);
        onOpenChange(false);

        toast.success('League name updated successfully.', successToastStyle);
      } catch (err) {
        console.error('Error updating league name:', err);
      } finally {
        setCreatingLeague(false);
      }

      return;
    }

    await handleCreateLeague(
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
        className="glass border-border/50 top-[30%] md:top-[30%] left-[4%] md:left-[36.6%]"
        onPointerDownOutside={(event) => event.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-primary" />
            <span className="gradient-text">
              {editingLeague ? 'Edit League' : 'Create a New League'}
            </span>
          </DialogTitle>

          <DialogDescription>
            {editingLeague
              ? 'Update the name of your league.'
              : 'Give your league a name. You will configure the league setup next.'}
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
                {editingLeague ? 'Saving...' : 'Creating...'}
              </>
            ) : editingLeague ? (
              <>
                <Layers className="h-4 w-4" />
                Save Changes
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
