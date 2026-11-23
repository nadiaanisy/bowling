import { HandicapChangeHistory } from '../../utils/interfaces';
import { Button } from '../../components/button';
import { formatHistoryValue } from '../../functions/handicap';
import { HISTORY_LABELS } from '../../utils/constants/handicap';
import { RotateCcw } from 'lucide-react';

export default function HistoryEntry({
  entry,
  onRestore,
  restoring,
  restoreDisabled,
}: {
  entry: HandicapChangeHistory;
  onRestore: (entry: HandicapChangeHistory) => void;
  restoring: boolean;
  restoreDisabled: boolean;
}) {
  const before = entry.before_values ?? {};
  const after = entry.after_values ?? {};
  const changedKeys = Array.from(
    new Set([...Object.keys(before), ...Object.keys(after)]),
  ).filter((key) => {
    if (['id', 'league_id', 'created_at', 'updated_at'].includes(key)) {
      return false;
    }
    return formatHistoryValue(before[key]) !== formatHistoryValue(after[key]);
  });
  const entityLabel =
    entry.entity_type === 'handicap_rule'
      ? `Handicap rule${entry.entity_id !== null ? ` #${entry.entity_id}` : ''}`
      : 'League Handicap settings';
  const actionLabel =
    entry.action.charAt(0).toUpperCase() + entry.action.slice(1);

  return (
    <details className="rounded-md border p-3">
      <summary className="flex cursor-pointer flex-wrap items-center justify-between gap-2">
        <span className="flex flex-wrap items-center gap-2">
          <span className="font-medium">{entityLabel}</span>
          <span className="rounded-full border px-2 py-0.5 text-xs">
            {actionLabel}
          </span>
        </span>
        <time
          className="text-xs text-muted-foreground"
          dateTime={entry.changed_at}
        >
          {new Date(entry.changed_at).toLocaleString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true,
          })}
        </time>
      </summary>
      <div className="mt-3 space-y-2 text-sm">
        {changedKeys.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[320px] text-left">
              <thead>
                <tr className="border-b text-muted-foreground">
                  <th className="py-2 pr-3 font-medium">Field</th>
                  <th className="py-2 pr-3 font-medium">Before</th>
                  <th className="py-2 font-medium">After</th>
                </tr>
              </thead>
              <tbody>
                {changedKeys.map((key) => (
                  <tr key={key} className="border-b last:border-0">
                    <td className="py-2 pr-3">
                      {HISTORY_LABELS[key] ?? key.replace(/_/g, ' ')}
                    </td>
                    <td className="py-2 pr-3 break-all">
                      {formatHistoryValue(before[key])}
                    </td>
                    <td className="py-2 break-all">
                      {formatHistoryValue(after[key])}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-muted-foreground">
            No field-level differences available.
          </p>
        )}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            Changed by: {entry.actor_id ? entry.actor_id : 'Unknown user'} ·
            History ID: {entry.id}
          </p>
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={restoreDisabled || restoring}
            onClick={() => onRestore(entry)}
          >
            <RotateCcw
              className={`mr-2 h-3.5 w-3.5 ${restoring ? 'animate-spin' : ''}`}
            />
            {restoring
              ? 'Restoring...'
              : entry.action === 'created'
                ? 'Undo add'
                : entry.action === 'deleted'
                  ? 'Restore rule'
                  : 'Restore previous values'}
          </Button>
        </div>
      </div>
    </details>
  );
}
