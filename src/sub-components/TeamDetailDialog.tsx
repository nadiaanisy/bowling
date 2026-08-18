import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '../components/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '../components/dialog';
import { Badge } from '../components/badge';
import { Button } from '../components/button';
import type { LeagueTeamWithMembers } from '../utils/interfaces';

interface TeamDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  team: LeagueTeamWithMembers | null;
  onManage: () => void;
}

export function TeamDetailDialog({ open, onOpenChange, team, onManage }: TeamDetailDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{team?.name}</DialogTitle>
          <DialogDescription>
            {team?.members.length ?? 0} {team?.members.length === 1 ? 'player' : 'players'}
          </DialogDescription>
        </DialogHeader>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Player</TableHead>
              <TableHead className="w-[100px]">Type</TableHead>
              <TableHead className="w-[100px]">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(team?.members.length ?? 0) === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="py-6 text-center text-sm text-muted-foreground">
                  No players on this team yet.
                </TableCell>
              </TableRow>
            ) : (
              team?.members.map((player) => (
                <TableRow key={player.id}>
                  <TableCell>{player.name}</TableCell>
                  <TableCell className="capitalize">{player.type ?? 'regular'}</TableCell>
                  <TableCell>
                    <Badge variant={(player.status ?? 'active') === 'active' ? 'default' : 'secondary'}>
                      {player.status ?? 'active'}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <DialogFooter>
          <Button
           type="button"
            variant="secondary"
            onClick={onManage}>
            Manage team
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
