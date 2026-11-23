import { useState } from 'react';
import type { FormEvent } from 'react';
import { PlayerProfileInput } from '../../utils/type';
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
import { parseAverageInput } from '../../functions/players';
import { Textarea } from '../../components/textarea';
import { toast } from 'sonner';
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
  allowSubstitutes: boolean;
  addMode: 'single' | 'multiple';
  setAddMode: (mode: 'single' | 'multiple') => void;
  newPlayerName: string;
  setNewPlayerName: (name: string) => void;
  multiplePlayerNames: string;
  setMultiplePlayerNames: (names: string) => void;
  creatingPlayer: boolean;
  onSubmitSingle: (event: FormEvent, profile: PlayerProfileInput) => void;
  onSubmitMultiple: (event: FormEvent) => void;
}

export function AddPlayerDialog({
  teamName,
  open,
  onOpenChange,
  playerType,
  setPlayerType,
  allowSubstitutes,
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
  const [average, setAverage] = useState('');
  const [gender, setGender] = useState('');

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
              Bulk Add
            </TabsTrigger>
          </TabsList>

          <div className="my-4 space-y-2">
            <Label htmlFor="player-type">Player Type</Label>
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
                <SelectItem value="substitute" disabled={!allowSubstitutes}>
                  Substitute
                  {allowSubstitutes ? '' : ' (disabled in League Setup)'}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <TabsContent value="single">
            <form
              onSubmit={(event) => {
                let parsedAverage: number | null;
                try {
                  parsedAverage = parseAverageInput(average);
                } catch (error) {
                  event.preventDefault();
                  toast.error(
                    error instanceof Error
                      ? error.message
                      : 'Enter a valid average.',
                  );
                  return;
                }
                onSubmitSingle(event, {
                  average: parsedAverage,
                  gender: gender || null,
                });
              }}
            >
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
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="team-player-average">Bowling average</Label>
                    <Input
                      id="team-player-average"
                      type="number"
                      min="0"
                      step="1"
                      value={average}
                      onChange={(event) => setAverage(event.target.value)}
                      placeholder="e.g. 185"
                    />
                    <p className="text-xs text-muted-foreground">
                      Optional. Add it later when game results provide an
                      average.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="team-player-gender">Gender</Label>
                    <Select
                      value={gender || 'unspecified'}
                      onValueChange={(value) =>
                        setGender(value === 'unspecified' ? '' : value)
                      }
                    >
                      <SelectTrigger id="team-player-gender">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="unspecified">Not set</SelectItem>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
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
                    placeholder={
                      'John Doe | 185 | Female\nJane Smith | 210 | Male'
                    }
                    value={multiplePlayerNames}
                    onChange={(e) => setMultiplePlayerNames(e.target.value)}
                    rows={6}
                    className="max-h-[200px] resize-none overflow-y-auto"
                  />
                  <p className="text-sm text-muted-foreground">
                    One player per line: Name | Average | Gender. Average and
                    gender are optional until known.
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
