import type React from 'react';
import { Loader2, Users } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/dialog';
import { Button } from '../../components/button';
import { Textarea } from '../../components/textarea';

interface AddTeamsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teamNames: string;
  setTeamNames: (value: string) => void;
  creatingTeams: boolean;
  existingTeams: Array<{ name: string }>;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}

export function AddTeamsDialog({
  open,
  onOpenChange,
  teamNames,
  setTeamNames,
  creatingTeams,
  existingTeams,
  onSubmit,
}: AddTeamsDialogProps) {
  const inputNames = teamNames
    .split(/\r?\n/)
    .map((name) => name.trim())
    .filter(Boolean);

  const parsedNames = Array.from(new Set(inputNames));

  const inputNameCounts = inputNames.reduce<Map<string, number>>(
    (counts, name) => {
      const normalizedName = name.toLowerCase();
      counts.set(normalizedName, (counts.get(normalizedName) ?? 0) + 1);
      return counts;
    },
    new Map(),
  );

  const duplicateInputNames = Array.from(
    new Set(
      inputNames.filter(
        (name) => (inputNameCounts.get(name.toLowerCase()) ?? 0) > 1,
      ),
    ),
  );

  const existingNames = new Set(
    existingTeams.map((team) => team.name.trim().toLowerCase()),
  );

  const duplicateExistingNames = parsedNames.filter((name) =>
    existingNames.has(name.toLowerCase()),
  );

  const canSubmit =
    parsedNames.length > 0 &&
    duplicateInputNames.length === 0 &&
    duplicateExistingNames.length === 0 &&
    !creatingTeams;

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (creatingTeams) return;

        onOpenChange(nextOpen);

        if (!nextOpen) {
          setTeamNames('');
        }
      }}
    >
      <DialogContent className="flex max-h-[50vh] w-[calc(100%-2rem)] max-w-xl flex-col overflow-hidden">
        <DialogHeader className="shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Add Teams
          </DialogTitle>

          <DialogDescription>
            Enter one team name per line. Blank lines will be ignored. Team
            names must be unique and cannot match teams that already exist.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="flex min-h-0 flex-col gap-4">
          <Textarea
            value={teamNames}
            onChange={(event) => setTeamNames(event.target.value)}
            placeholder={`Team A
Team B
Team C
Team D`}
            rows={8}
            className="min-h-[180px] max-h-[45vh] resize-y overflow-y-auto"
            disabled={creatingTeams}
            autoFocus
          />

          <div className="max-h-[18vh] shrink-0 space-y-2 overflow-y-auto text-sm">
            <p className="text-muted-foreground">
              {parsedNames.length} {parsedNames.length === 1 ? 'team' : 'teams'}{' '}
              ready to add.
            </p>

            {duplicateInputNames.length > 0 && (
              <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
                <p className="font-medium">Duplicate names in this list:</p>
                <p className="mt-1">{duplicateInputNames.join(', ')}</p>
              </div>
            )}

            {duplicateExistingNames.length > 0 && (
              <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
                <p className="font-medium">These teams already exist:</p>
                <p className="mt-1">{duplicateExistingNames.join(', ')}</p>
              </div>
            )}
          </div>

          <DialogFooter className="shrink-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={creatingTeams}
            >
              Cancel
            </Button>

            <Button type="submit" disabled={!canSubmit} className="gap-2">
              {creatingTeams && <Loader2 className="h-4 w-4 animate-spin" />}

              {creatingTeams
                ? 'Adding Teams...'
                : `Add ${parsedNames.length || ''} ${
                    parsedNames.length === 1 ? 'Team' : 'Teams'
                  }`}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
