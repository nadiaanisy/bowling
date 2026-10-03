import { Filter } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../components/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/select';
import { Badge } from '../../components/badge';
import { Label } from '../../components/label';
import { Button } from '../../components/button';
import type { LeagueTeam } from '../../utils/interfaces';

interface FiltersProps {
  allWeeks: number[];
  timetableTeams: LeagueTeam[];
  filterWeek: string;
  setFilterWeek: (value: string) => void;
  filterTeam: string;
  setFilterTeam: (value: string) => void;
  filterStatus: string;
  setFilterStatus: (value: string) => void;
  activeFiltersCount: number;
  resetFilters: () => void;
}

export function Filters({
  allWeeks,
  timetableTeams,
  filterWeek,
  setFilterWeek,
  filterTeam,
  setFilterTeam,
  filterStatus,
  setFilterStatus,
  activeFiltersCount,
  resetFilters,
}: FiltersProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filter Matches
            </CardTitle>

            <CardDescription>
              Filter matches by week, team, or status
            </CardDescription>
          </div>

          {activeFiltersCount > 0 && (
            <div className="flex items-center gap-2">
              <Badge variant="secondary">
                {activeFiltersCount} filter
                {activeFiltersCount > 1 ? 's' : ''} active
              </Badge>

              <Button variant="outline" size="sm" onClick={resetFilters}>
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <div className="grid gap-4 md:grid-cols-3">
          {/* WEEK */}
          <div className="space-y-2">
            <Label htmlFor="filterWeek">Week</Label>

            <Select value={filterWeek} onValueChange={setFilterWeek}>
              <SelectTrigger id="filterWeek">
                <SelectValue />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="all">All Weeks</SelectItem>

                {allWeeks.map((weekNumber) => (
                  <SelectItem key={weekNumber} value={weekNumber.toString()}>
                    Week {weekNumber}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* TEAM */}
          <div className="space-y-2">
            <Label htmlFor="filterTeam">Team</Label>

            <Select value={filterTeam} onValueChange={setFilterTeam}>
              <SelectTrigger id="filterTeam">
                <SelectValue />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="all">All Teams</SelectItem>

                {timetableTeams.map((team) => (
                  <SelectItem key={team.id} value={team.id.toString()}>
                    {team.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* STATUS */}
          <div className="space-y-2">
            <Label htmlFor="filterStatus">Status</Label>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger id="filterStatus">
                <SelectValue />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>

                <SelectItem value="completed">Completed</SelectItem>

                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
