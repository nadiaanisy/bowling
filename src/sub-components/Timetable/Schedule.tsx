import { Row } from './Row';
import { useMemo } from 'react';
import type { MatchData, MatchesByBlock } from '../../utils/interfaces';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../components/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../../components/tabs';
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../components/alert-dialog';
import { Trash2 } from 'lucide-react';
import { Badge } from '../../components/badge';
import { Button } from '../../components/button';
import { handleBulkDeleteMatches } from '../../utils/functions/timetable';

type BlockData = {
  id: string | number;
  number: number;
};

interface ScheduleProps {
  blocksData: BlockData[];
  blockNumber: number | null;
  setBlockNumber: (value: number | null) => void;
  matches: MatchesByBlock;
  filterWeek: string;
  filterTeam: string;
  filterStatus: string;
  selectedMatchIds: Array<string | number>;
  setSelectedMatchIds: (
    value:
      | Array<string | number>
      | ((current: Array<string | number>) => Array<string | number>),
  ) => void;
  deletingMatch: boolean;
  setDeletingMatch: (value: boolean) => void;
  retryTimetable: () => Promise<void>;
  bulkDeleteDialogOpen: boolean;
  setBulkDeleteDialogOpen: (value: boolean) => void;
}

export function Schedule({
  blocksData,
  blockNumber,
  setBlockNumber,
  matches,
  filterWeek,
  filterTeam,
  filterStatus,
  selectedMatchIds,
  setSelectedMatchIds,
  deletingMatch,
  setDeletingMatch,
  retryTimetable,
  bulkDeleteDialogOpen,
  setBulkDeleteDialogOpen,
}: ScheduleProps) {
  const getFilteredMatches = (blockId: string | number): MatchData[] => {
    const blockKey = `block${blockId}`;

    const blockMatches = matches?.[blockKey] || [];

    return blockMatches
      .filter((match) => {
        /*
         * WEEK
         */
        if (
          filterWeek !== 'all' &&
          match.week_number !== parseInt(filterWeek)
        ) {
          return false;
        }

        /*
         * TEAM
         */
        if (
          filterTeam !== 'all' &&
          match.team1?.id?.toString() !== filterTeam &&
          match.team2?.id?.toString() !== filterTeam
        ) {
          return false;
        }

        /*
         * STATUS
         */
        const isCompleted = match.status === 'completed';

        if (filterStatus === 'completed' && !isCompleted) {
          return false;
        }

        if (filterStatus === 'pending' && isCompleted) {
          return false;
        }

        return true;
      })
      .sort((a, b) => a.week_number - b.week_number);
  };

  const toggleMatchSelection = (matchId: string | number) => {
    setSelectedMatchIds((current) => {
      const id = String(matchId);

      const alreadySelected = current.some(
        (selectedId) => String(selectedId) === id,
      );

      if (alreadySelected) {
        return current.filter((selectedId) => String(selectedId) !== id);
      }

      return [...current, matchId];
    });
  };

  const toggleSelectAllMatches = (
    visibleMatches: MatchData[],
    checked: boolean,
  ) => {
    if (!checked) {
      setSelectedMatchIds((current) => {
        const visibleIds = new Set(
          visibleMatches.map((match) => String(match.match_id)),
        );

        return current.filter((id) => !visibleIds.has(String(id)));
      });

      return;
    }

    setSelectedMatchIds((current) => {
      const merged = [
        ...current,
        ...visibleMatches.map((match) => match.match_id),
      ];

      return Array.from(new Map(merged.map((id) => [String(id), id])).values());
    });
  };

  const confirmBulkDelete = async () => {
    if (selectedMatchIds.length === 0) {
      return;
    }

    await handleBulkDeleteMatches(
      deletingMatch,
      setDeletingMatch,
      selectedMatchIds,
      async () => {
        setSelectedMatchIds([]);

        setBulkDeleteDialogOpen(false);

        await retryTimetable();
      },
    );
  };

  return (
    <>
      <Tabs
        value={`block${blockNumber}`}
        onValueChange={(value) =>
          setBlockNumber(parseInt(value.replace('block', '')))
        }
      >
        {/* BLOCK TABS */}
        <TabsList>
          {blocksData.map((block) => (
            <TabsTrigger key={block.id} value={`block${block.id}`}>
              Block {block.number}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* EACH BLOCK */}
        {blocksData.map((block) => (
          <TabsContent
            key={block.id}
            value={`block${block.id}`}
            className="space-y-4"
          >
            <BlockSchedule
              block={block}
              filteredMatches={getFilteredMatches(block.id)}
              totalMatches={matches?.[`block${block.id}`]?.length ?? 0}
              selectedMatchIds={selectedMatchIds}
              deletingMatch={deletingMatch}
              toggleMatchSelection={toggleMatchSelection}
              toggleSelectAllMatches={toggleSelectAllMatches}
              setDeletingMatch={setDeletingMatch}
              retryTimetable={retryTimetable}
              setBulkDeleteDialogOpen={setBulkDeleteDialogOpen}
            />
          </TabsContent>
        ))}
      </Tabs>

      {/* BULK DELETE DIALOG */}
      <AlertDialog
        open={bulkDeleteDialogOpen}
        onOpenChange={(open) => {
          if (!deletingMatch) {
            setBulkDeleteDialogOpen(open);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete selected matches?</AlertDialogTitle>

            <AlertDialogDescription>
              This will permanently delete{' '}
              <strong>{selectedMatchIds.length}</strong> selected match
              {selectedMatchIds.length === 1 ? '' : 'es'} from the schedule.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={deletingMatch}>
              Cancel
            </AlertDialogCancel>

            <AlertDialogAction
              variant="destructive"
              disabled={deletingMatch}
              onClick={async (event) => {
                event.preventDefault();

                await confirmBulkDelete();
              }}
            >
              {deletingMatch
                ? 'Deleting...'
                : `Delete ${selectedMatchIds.length} Match${
                    selectedMatchIds.length === 1 ? '' : 'es'
                  }`}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

/*
 * ============================================================
 * BLOCK SCHEDULE
 * ============================================================
 */

interface BlockScheduleProps {
  block: BlockData;

  filteredMatches: MatchData[];

  totalMatches: number;

  selectedMatchIds: Array<string | number>;

  deletingMatch: boolean;

  toggleMatchSelection: (matchId: string | number) => void;

  toggleSelectAllMatches: (matches: MatchData[], checked: boolean) => void;

  setDeletingMatch: (value: boolean) => void;

  retryTimetable: () => Promise<void>;

  setBulkDeleteDialogOpen: (value: boolean) => void;
}

function BlockSchedule({
  block,

  filteredMatches,
  totalMatches,

  selectedMatchIds,
  deletingMatch,

  toggleMatchSelection,
  toggleSelectAllMatches,

  setDeletingMatch,
  retryTimetable,

  setBulkDeleteDialogOpen,
}: BlockScheduleProps) {
  const allVisibleSelected =
    filteredMatches.length > 0 &&
    filteredMatches.every((match) =>
      selectedMatchIds.some((id) => String(id) === String(match.match_id)),
    );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Block {block.number} Schedule</CardTitle>

        <CardDescription>All weeks for this block</CardDescription>

        {/* BULK ACTIONS */}
        {selectedMatchIds.length > 0 && (
          <div className="flex items-center justify-end gap-2 mb-4">
            <Badge variant="secondary">
              {selectedMatchIds.length} selected
            </Badge>

            <Button
              variant="destructive"
              size="sm"
              disabled={deletingMatch}
              onClick={() => setBulkDeleteDialogOpen(true)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Selected
            </Button>
          </div>
        )}
      </CardHeader>

      <CardContent>
        {filteredMatches.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            {totalMatches > 0
              ? 'No matches found for current filters'
              : 'No matches scheduled for this block'}
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                {/* SELECT ALL */}
                <TableHead className="w-10">
                  <input
                    type="checkbox"
                    checked={allVisibleSelected}
                    onChange={(event) =>
                      toggleSelectAllMatches(
                        filteredMatches,
                        event.target.checked,
                      )
                    }
                    disabled={deletingMatch}
                    aria-label="Select all matches"
                  />
                </TableHead>

                <TableHead>Week</TableHead>

                <TableHead>Lane</TableHead>

                <TableHead>Team 1</TableHead>

                <TableHead>Team 2</TableHead>

                <TableHead>Status</TableHead>

                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filteredMatches.map((match) => (
                <Row
                  key={match.match_id}
                  match={match}
                  selected={selectedMatchIds.some(
                    (id) => String(id) === String(match.match_id),
                  )}
                  onToggleSelect={toggleMatchSelection}
                  deletingMatch={deletingMatch}
                  setDeletingMatch={setDeletingMatch}
                  retryTimetable={retryTimetable}
                />
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
