import {
  useEffect,
  useMemo,
  useState
} from 'react';
import { HandicapTable } from './HandicapTable';
import { useCustomHook } from '../../utils/hooks';
import { HandicapFormDialog } from './HandicapFormDialog';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../components/card';
import { Input } from '../../components/input';
import { Label } from '../../components/label';
import { HandicapDeleteDialog } from './HandicapDeleteDialog';
import { Button } from '../../components/button';
import { HandicapBulkAddDialog } from './HandicapBulkAddDialog';
import {
  emptyRanges,
  RangeFilters,
  SortDirection,
  SortField,
  useHandicap,
} from '../../functions/handicap';
import {
  Plus,
  Save,
  Trash2,
  Upload,
  RotateCcw
} from 'lucide-react';

interface HandicapProps {
  leagueId: string | number | null;
}

export default function Handicap({ leagueId }: HandicapProps) {
  const handicap = useHandicap(leagueId);

  const {
    search,
    setSearch,
    sortField,
    setSortField,
    sortDirection,
    setSortDirection,
    ranges,
    setRanges,
  } = useCustomHook();

  useEffect(() => {
    setSearch('');
    setSortField('average');
    setSortDirection('asc');
    setRanges(emptyRanges);
  }, [leagueId]);

  const invalidRange = (min: string, max: string) =>
    min !== '' && max !== '' && Number(min) > Number(max);
  const hasInvalidRange =
    invalidRange(ranges.averageMin, ranges.averageMax) ||
    invalidRange(ranges.menMin, ranges.menMax) ||
    invalidRange(ranges.womenMin, ranges.womenMax);

  const visibleRules = useMemo(() => {
    if (hasInvalidRange) return [];
    const query = search.trim().toLowerCase();
    const numberInRange = (value: number | null, min: string, max: string) => {
      if (value === null) return min === '' && max === '';
      return (
        (min === '' || value >= Number(min)) &&
        (max === '' || value <= Number(max))
      );
    };
    return handicap.rules
      .filter((rule) => {
        const matchesSearch =
          !query ||
          [rule.average, rule.men_handicap, rule.women_handicap].some(
            (value) =>
              value !== null && String(value).toLowerCase().includes(query),
          );
        return (
          matchesSearch &&
          numberInRange(rule.average, ranges.averageMin, ranges.averageMax) &&
          numberInRange(rule.men_handicap, ranges.menMin, ranges.menMax) &&
          numberInRange(rule.women_handicap, ranges.womenMin, ranges.womenMax)
        );
      })
      .sort((a, b) => {
        const aValue = a[sortField];
        const bValue = b[sortField];
        if (aValue === null) return bValue === null ? 0 : 1;
        if (bValue === null) return -1;
        const comparison = aValue - bValue;
        return sortDirection === 'asc' ? comparison : -comparison;
      });
  }, [
    handicap.rules,
    search,
    sortField,
    sortDirection,
    ranges,
    hasInvalidRange,
  ]);

  const updateSearch = (value: string) => {
    setSearch(value);
    handicap.clearRuleSelection();
  };
  const updateRange = (key: keyof RangeFilters, value: string) => {
    setRanges((current) => ({ ...current, [key]: value }));
    handicap.clearRuleSelection();
  };
  const updateSortField = (value: SortField) => {
    setSortField(value);
    handicap.clearRuleSelection();
  };
  const updateSortDirection = (value: SortDirection) => {
    setSortDirection(value);
    handicap.clearRuleSelection();
  };
  const resetTableControls = () => {
    setSearch('');
    setSortField('average');
    setSortDirection('asc');
    setRanges(emptyRanges);
    handicap.clearRuleSelection();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1>Handicap Setup</h1>
          <p className="text-muted-foreground">
            Configure average-based handicap values separately for men and
            women.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {handicap.selectedRuleIds.length > 0 && (
            <Button
              variant="outline"
              onClick={() => handicap.setBulkDeleteDialogOpen(true)}
              disabled={handicap.isSaving}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Bulk Delete ({handicap.selectedRuleIds.length})
            </Button>
          )}
          <Button
            variant="outline"
            onClick={handicap.openBulkDialog}
            disabled={leagueId === null}
          >
            <Upload className="mr-2 h-4 w-4" />
            Bulk Add
          </Button>
          <Button onClick={handicap.openAddDialog} disabled={leagueId === null}>
            <Plus className="mr-2 h-4 w-4" />
            Add Handicap
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Maximum Handicap</CardTitle>
          <CardDescription>
            Set the maximum handicap applied to each gender in this league.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handicap.handleSaveConfig} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="men-max-handicap">Men's maximum handicap</Label>
                <Input
                  id="men-max-handicap"
                  type="number"
                  min="0"
                  step="1"
                  value={handicap.menMaxHandicap}
                  onChange={(event) =>
                    handicap.setMenMaxHandicap(event.target.value)
                  }
                  disabled={handicap.isSavingConfig || leagueId === null}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="women-max-handicap">
                  Women's maximum handicap
                </Label>
                <Input
                  id="women-max-handicap"
                  type="number"
                  min="0"
                  step="1"
                  value={handicap.womenMaxHandicap}
                  onChange={(event) =>
                    handicap.setWomenMaxHandicap(event.target.value)
                  }
                  disabled={handicap.isSavingConfig || leagueId === null}
                  required
                />
              </div>
            </div>
            <div>
              <Button
                type="submit"
                disabled={handicap.isSavingConfig || leagueId === null}
              >
                <Save className="mr-2 h-4 w-4" />
                {handicap.isSavingConfig ? 'Saving...' : 'Save Maximums'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Handicap Table</CardTitle>
          <CardDescription>
            Each average has a separate men's and women's handicap value.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-5 space-y-4">
            <div className="grid gap-3 md:grid-cols-[minmax(220px,1fr)_180px_150px_auto] md:items-end">
              <div className="space-y-1.5">
                <Label htmlFor="handicap-search">Search rules</Label>
                <Input
                  id="handicap-search"
                  value={search}
                  onChange={(event) => updateSearch(event.target.value)}
                  placeholder="Search average or handicap value"
                  disabled={handicap.isLoading || leagueId === null}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="handicap-sort-field">Sort by</Label>
                <select
                  id="handicap-sort-field"
                  value={sortField}
                  onChange={(event) =>
                    updateSortField(event.target.value as SortField)
                  }
                  disabled={handicap.isLoading || leagueId === null}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="average">Average</option>
                  <option value="men_handicap">Men HDC</option>
                  <option value="women_handicap">Women HDC</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="handicap-sort-direction">Direction</Label>
                <select
                  id="handicap-sort-direction"
                  value={sortDirection}
                  onChange={(event) =>
                    updateSortDirection(event.target.value as SortDirection)
                  }
                  disabled={handicap.isLoading || leagueId === null}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="asc">Ascending</option>
                  <option value="desc">Descending</option>
                </select>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={resetTableControls}
                disabled={handicap.isLoading || leagueId === null}
              >
                <RotateCcw className="mr-2 h-4 w-4" /> Reset
              </Button>
            </div>
            <div>
              <p className="mb-2 text-sm font-medium">
                Range filters (inclusive)
              </p>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {(
                  [
                    {
                      title: 'Average',
                      minKey: 'averageMin',
                      maxKey: 'averageMax',
                    },
                    {
                      title: "Men's handicap",
                      minKey: 'menMin',
                      maxKey: 'menMax',
                    },
                    {
                      title: "Women's handicap",
                      minKey: 'womenMin',
                      maxKey: 'womenMax',
                    },
                  ] as const
                ).map(({ title, minKey, maxKey }) => (
                  <div key={title} className="space-y-2 rounded-md border p-3">
                    <p className="text-sm font-medium">{title}</p>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <Label htmlFor={`handicap-${minKey}`}>Min</Label>
                        <Input
                          id={`handicap-${minKey}`}
                          type="number"
                          min="0"
                          step="any"
                          value={ranges[minKey]}
                          onChange={(event) =>
                            updateRange(minKey, event.target.value)
                          }
                          placeholder="No min"
                          disabled={handicap.isLoading || leagueId === null}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor={`handicap-${maxKey}`}>Max</Label>
                        <Input
                          id={`handicap-${maxKey}`}
                          type="number"
                          min="0"
                          step="any"
                          value={ranges[maxKey]}
                          onChange={(event) =>
                            updateRange(maxKey, event.target.value)
                          }
                          placeholder="No max"
                          disabled={handicap.isLoading || leagueId === null}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {hasInvalidRange && (
                <p className="mt-2 text-sm text-destructive" role="alert">
                  A minimum cannot be greater than its maximum. Correct the
                  range to see results.
                </p>
              )}
              <p
                className="mt-2 text-sm text-muted-foreground"
                aria-live="polite"
              >
                Showing {visibleRules.length} of {handicap.rules.length}{' '}
                handicap rules.
                {!hasInvalidRange && visibleRules.length === 0
                  ? ' Adjust your search or filters to see rules.'
                  : ''}
              </p>
            </div>
          </div>
          {handicap.loadError ? (
            <div className="rounded-md border border-destructive/30 p-4 text-sm text-destructive">
              <div>{handicap.loadError}</div>
              <Button
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={() => void handicap.loadRules()}
              >
                Retry
              </Button>
            </div>
          ) : (
            <HandicapTable
              rules={visibleRules}
              selectedRuleIds={handicap.selectedRuleIds}
              isLoading={handicap.isLoading}
              isSaving={handicap.isSaving}
              onToggleRule={handicap.toggleRuleSelection}
              onToggleAll={() =>
                handicap.toggleSelectAll(visibleRules.map((rule) => rule.id))
              }
              onEdit={handicap.openEditDialog}
              onDelete={handicap.openDeleteDialog}
            />
          )}
        </CardContent>
      </Card>

      <HandicapBulkAddDialog
        open={handicap.bulkDialogOpen}
        onOpenChange={handicap.setBulkDialogOpen}
        input={handicap.bulkInput}
        onInputChange={(value) => {
          handicap.setBulkInput(value);
          handicap.setBulkFileName('');
        }}
        fileName={handicap.bulkFileName}
        onFileSelect={handicap.handleBulkFileSelect}
        preview={handicap.bulkPreview}
        importDisabled={
          handicap.bulkPreview.dataRowCount === 0 ||
          handicap.bulkPreview.invalidCount > 0 ||
          handicap.bulkPreview.errors.length > 0 ||
          handicap.bulkPreview.validCount === 0
        }
        error={handicap.bulkError}
        onErrorChange={handicap.setBulkError}
        isSaving={handicap.isSaving}
        onSubmit={handicap.handleBulkAdd}
      />

      <HandicapFormDialog
        open={handicap.dialogOpen}
        onOpenChange={handicap.setDialogOpen}
        editingRule={handicap.editingRule}
        average={handicap.average}
        onAverageChange={handicap.setAverage}
        menHandicap={handicap.menHandicap}
        onMenHandicapChange={handicap.setMenHandicap}
        womenHandicap={handicap.womenHandicap}
        onWomenHandicapChange={handicap.setWomenHandicap}
        isSaving={handicap.isSaving}
        onSubmit={handicap.handleSave}
      />

      <HandicapDeleteDialog
        singleOpen={handicap.deleteDialogOpen}
        onSingleOpenChange={handicap.setDeleteDialogOpen}
        bulkOpen={handicap.bulkDeleteDialogOpen}
        onBulkOpenChange={handicap.setBulkDeleteDialogOpen}
        ruleToDelete={handicap.ruleToDelete}
        selectedCount={handicap.selectedRuleIds.length}
        isSaving={handicap.isSaving}
        onConfirmSingle={() => void handicap.confirmDelete()}
        onConfirmBulk={() =>
          void handicap.confirmBulkDelete(visibleRules.map((rule) => rule.id))
        }
      />
    </div>
  );
}
