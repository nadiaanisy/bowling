import { Button } from '../../components/button';
import {
  RefreshCw,
  Trash2,
  Archive
} from 'lucide-react';

interface HeaderProps {
  isLoadingTeams: boolean;
  retryTeams: () => void;
  bulkTeamDeleteMode: boolean;
  filteredTeamsCount: number;
  selectedTeamsCount: number;
  deletingTeam: boolean;
  allVisibleTeamsSelected: boolean;
  onToggleSelectAll: (checked: boolean) => void;
  onDeleteSelected: () => void;
  onArchiveSelected: () => void;
  onCancelBulkDelete: () => void;
  onStartBulkDelete: () => void;
  teamsCount: number;
}

export default function Header({
  isLoadingTeams,
  retryTeams,
  bulkTeamDeleteMode,
  filteredTeamsCount,
  selectedTeamsCount,
  deletingTeam,
  allVisibleTeamsSelected,
  onToggleSelectAll,
  onDeleteSelected,
  onArchiveSelected,
  onCancelBulkDelete,
  onStartBulkDelete,
  teamsCount,
}: HeaderProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 pb-1">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
          Teams Management
        </h1>
        <p className="mt-1 text-sm text-slate-400 sm:text-base">
          Manage teams and their players
        </p>
      </div>

      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={retryTeams}
          disabled={isLoadingTeams}
          className="gap-2 border-2 border-gray-500 hover:border-gray-400 bg-gray-950/70 text-gray-300 hover:bg-gray-950/70 hover:text-gray-200"
        >
          <RefreshCw
            className={`h-4 w-4 ${isLoadingTeams ? 'animate-spin' : ''}`}
          />
          Refresh
        </Button>

        {bulkTeamDeleteMode ? (
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                aria-label="Select all visible teams"
                checked={filteredTeamsCount > 0 && allVisibleTeamsSelected}
                onChange={(event) => {
                  onToggleSelectAll(event.target.checked);
                }}
              />
              Select all
            </label>

            <span className="text-sm font-medium">
              {selectedTeamsCount} selected
            </span>

            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={selectedTeamsCount === 0 || deletingTeam}
              onClick={onArchiveSelected}
              className="gap-1 border-amber-600 text-amber-300 hover:bg-amber-950/40"
            >
              <Archive className="h-4 w-4" />
              Archive selected
            </Button>

            <Button
              type="button"
              variant="destructive"
              size="sm"
              disabled={selectedTeamsCount === 0 || deletingTeam}
              onClick={onDeleteSelected}
            >
              Delete selected
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onCancelBulkDelete}
            >
              Cancel
            </Button>
          </div>
        ) : (
          <>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onStartBulkDelete}
              disabled={teamsCount === 0}
              className="gap-2 border-2 border-amber-600 bg-amber-950/50 text-amber-300 hover:bg-amber-950/70 hover:text-amber-200"
            >
              <Archive className="h-4 w-4" />
              Bulk Archive Teams
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onStartBulkDelete}
              disabled={teamsCount === 0}
              className="gap-2 border-2 border-red-500 bg-red-950/70 text-rose-400 hover:bg-red-950/70 hover:text-rose-300"
            >
              <Trash2 className="h-4 w-4" />
              Bulk Delete Teams
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
