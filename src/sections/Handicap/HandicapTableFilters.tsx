import { Input } from '../../components/input';
import { Label } from '../../components/label';
import { Button } from '../../components/button';
import type {
  RangeFilters,
  SortDirection,
  SortField,
} from '../../utils/constants/handicap';

interface HandicapTableFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  sortField: SortField;
  onSortFieldChange: (value: SortField) => void;
  sortDirection: SortDirection;
  onSortDirectionChange: (value: SortDirection) => void;
  ranges: RangeFilters;
  onRangeChange: (key: keyof RangeFilters, value: string) => void;
  onReset: () => void;
  disabled: boolean;
  invalidRange: boolean;
  visibleCount: number;
  totalCount: number;
}

/** Displays table search, sorting, inclusive range filters, validation, and row count. */
export function HandicapTableFilters(props: HandicapTableFiltersProps) {
  const groups = [
    { title: 'Average', minKey: 'averageMin', maxKey: 'averageMax' },
    { title: "Men's handicap", minKey: 'menMin', maxKey: 'menMax' },
    { title: "Women's handicap", minKey: 'womenMin', maxKey: 'womenMax' },
  ] as const;

  return (
    <div className="mb-5 shrink-0 space-y-4">
      <div className="grid gap-3 md:grid-cols-[minmax(220px,1fr)_180px_150px_auto] md:items-end">
        <div className="space-y-1.5">
          <Label htmlFor="handicap-search">Search rules</Label>
          <Input
            id="handicap-search"
            value={props.search}
            onChange={(event) => props.onSearchChange(event.target.value)}
            placeholder="Search average or handicap value"
            disabled={props.disabled}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="handicap-sort-field">Sort by</Label>
          <select
            id="handicap-sort-field"
            value={props.sortField}
            onChange={(event) =>
              props.onSortFieldChange(event.target.value as SortField)
            }
            disabled={props.disabled}
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
            value={props.sortDirection}
            onChange={(event) =>
              props.onSortDirectionChange(event.target.value as SortDirection)
            }
            disabled={props.disabled}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </select>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={props.onReset}
          disabled={props.disabled}
        >
          <span className="mr-2">↺</span>Reset
        </Button>
      </div>
      <div>
        <p className="mb-2 text-sm font-medium">Range filters (inclusive)</p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {groups.map(({ title, minKey, maxKey }) => (
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
                    value={props.ranges[minKey]}
                    onChange={(event) =>
                      props.onRangeChange(minKey, event.target.value)
                    }
                    placeholder="No min"
                    disabled={props.disabled}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor={`handicap-${maxKey}`}>Max</Label>
                  <Input
                    id={`handicap-${maxKey}`}
                    type="number"
                    min="0"
                    step="any"
                    value={props.ranges[maxKey]}
                    onChange={(event) =>
                      props.onRangeChange(maxKey, event.target.value)
                    }
                    placeholder="No max"
                    disabled={props.disabled}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
        {props.invalidRange && (
          <p className="mt-2 text-sm text-destructive" role="alert">
            A minimum cannot be greater than its maximum. Correct the range to
            see results.
          </p>
        )}
        <p className="mt-2 text-sm text-muted-foreground" aria-live="polite">
          Showing {props.visibleCount} of {props.totalCount} handicap rules.
          {!props.invalidRange && props.visibleCount === 0
            ? ' Adjust your search or filters to see rules.'
            : ''}
        </p>
      </div>
    </div>
  );
}
