import { RefreshCw } from 'lucide-react';
import { Button } from '../../components/button';

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
  onCancelBulkDelete,
  onStartBulkDelete,
  teamsCount
}: HeaderProps) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1>Teams Management</h1>
        <p className="text-muted-foreground">
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
          className="gap-2"
        >
          <RefreshCw
            className={`h-4 w-4 ${
              isLoadingTeams ? 'animate-spin' : ''
            }`}
          />
          Refresh
        </Button>

        {bulkTeamDeleteMode ? (
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                aria-label="Select all visible teams"
                checked={
                  filteredTeamsCount > 0 &&
                  allVisibleTeamsSelected
                }
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
              variant="destructive"
              size="sm"
              disabled={
                selectedTeamsCount === 0 ||
                deletingTeam
              }
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
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onStartBulkDelete}
            disabled={teamsCount === 0}
          >
            Bulk Delete Teams
          </Button>
        )}
      </div>
    </div>
  );
}