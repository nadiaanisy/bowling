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
  const parsedNames = Array.from(
    new Set(
      teamNames
        .split(/\r?\n/)
        .map((name) => name.trim())
        .filter(Boolean),
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
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Add Teams
          </DialogTitle>

          <DialogDescription>
            Enter one team name per line. Blank lines will be ignored and
            duplicate names will be removed.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4">
          <Textarea
            value={teamNames}
            onChange={(event) => setTeamNames(event.target.value)}
            placeholder={`Team A
Team B
Team C
Team D`}
            rows={10}
            disabled={creatingTeams}
            autoFocus
          />

          <div className="space-y-2 text-sm">
            <p className="text-muted-foreground">
              {parsedNames.length} {parsedNames.length === 1 ? 'team' : 'teams'}{' '}
              ready to add.
            </p>

            {duplicateExistingNames.length > 0 && (
              <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
                <p className="font-medium">These teams already exist:</p>

                <p className="mt-1">{duplicateExistingNames.join(', ')}</p>
              </div>
            )}
          </div>

          <DialogFooter>
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
