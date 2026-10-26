import type { FormEvent } from 'react';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../../components/tabs';
import { Input } from '../../components/input';
import { Label } from '../../components/label';
import { Button } from '../../components/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/select';
import { Textarea } from '../../components/textarea';
import {
  UserPlus,
  Users
} from 'lucide-react';

interface AddPlayerDialogProps {
  teamName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  playerType: 'regular' | 'substitute';
  setPlayerType: (type: 'regular' | 'substitute') => void;
  addMode: 'single' | 'multiple';
  setAddMode: (mode: 'single' | 'multiple') => void;
  newPlayerName: string;
  setNewPlayerName: (name: string) => void;
  multiplePlayerNames: string;
  setMultiplePlayerNames: (names: string) => void;
  creatingPlayer: boolean;
  onSubmitSingle: (event: FormEvent) => void;
  onSubmitMultiple: (event: FormEvent) => void;
}

export function AddPlayerDialog({
  teamName,
  open,
  onOpenChange,
  playerType,
  setPlayerType,
  addMode,
  setAddMode,
  newPlayerName,
  setNewPlayerName,
  multiplePlayerNames,
  setMultiplePlayerNames,
  creatingPlayer,
  onSubmitSingle,
  onSubmitMultiple,
}: AddPlayerDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-auto max-h-[90vh] overflow-hidden rounded-md border top-[25%] md:top-[20%] left-auto md:left-[35%]"
        onPointerDownOutside={(event) => event.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Add Player(s) to {teamName}</DialogTitle>
          <DialogDescription>
            Choose to add a single player or multiple players at once
          </DialogDescription>
        </DialogHeader>

        <div className="mb-4 space-y-2">
          <Label htmlFor="player-type">Player type</Label>
          <Select
            value={playerType}
            onValueChange={(value) =>
              setPlayerType(value as 'regular' | 'substitute')
            }
          >
            <SelectTrigger id="player-type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="regular">Regular</SelectItem>
              <SelectItem value="substitute">Substitute</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Tabs
          value={addMode}
          onValueChange={(v) => setAddMode(v as 'single' | 'multiple')}
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="single">
              <UserPlus className="h-4 w-4 mr-2" />
              Single Player
            </TabsTrigger>
            <TabsTrigger value="multiple">
              <Users className="h-4 w-4 mr-2" />
              Multiple Players
            </TabsTrigger>
          </TabsList>

          <TabsContent value="single">
            <form onSubmit={onSubmitSingle}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="playerName">Player Name</Label>
                  <Input
                    id="playerName"
                    placeholder="Enter player name"
                    value={newPlayerName}
                    onChange={(e) => setNewPlayerName(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter className="mt-4">
                <Button
                  type="submit"
                  disabled={creatingPlayer || !newPlayerName.trim()}
                >
                  {creatingPlayer ? 'Adding...' : 'Add Player'}
                </Button>
              </DialogFooter>
            </form>
          </TabsContent>

          <TabsContent value="multiple">
            <form onSubmit={onSubmitMultiple}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="multiplePlayerNames">
                    Player Names (one per line)
                  </Label>
                  <Textarea
                    id="multiplePlayerNames"
                    placeholder={'John Doe\nJane Smith\nMike Johnson'}
                    value={multiplePlayerNames}
                    onChange={(e) => setMultiplePlayerNames(e.target.value)}
                    rows={6}
                    className="max-h-[200px] resize-none overflow-y-auto"
                  />
                  <p className="text-sm text-muted-foreground">
                    Enter each player name on a new line
                  </p>
                </div>
              </div>
              <DialogFooter className="mt-4">
                <Button
                  type="submit"
                  disabled={creatingPlayer || !multiplePlayerNames.trim()}
                >
                  {creatingPlayer ? 'Adding...' : 'Add Players'}
                </Button>
              </DialogFooter>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
