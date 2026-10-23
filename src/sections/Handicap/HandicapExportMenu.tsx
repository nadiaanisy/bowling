import {
  useEffect,
  useRef,
  useState
} from 'react';
import { Button } from '../../components/button';
import {
  ChevronDown,
  Download,
  FileJson,
  History
} from 'lucide-react';

interface HandicapExportMenuProps {
  disabled: boolean;
  rulesLoading: boolean;
  historyLoading: boolean;
  onExportRules: () => void;
  onExportHistory: () => void;
  onExportBackup: () => void;
}

/** Groups CSV exports and JSON backup actions in one dropdown menu. */
export function HandicapExportMenu(props: HandicapExportMenuProps) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutside = (event: PointerEvent) => {
      if (
        event.target instanceof Node &&
        menuRef.current &&
        !menuRef.current.contains(event.target)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener('pointerdown', handleOutside, true);
    return () =>
      document.removeEventListener('pointerdown', handleOutside, true);
  }, []);

  const run = (action: () => void) => {
    setOpen(false);
    action();
  };
  const itemClass =
    'flex w-full items-start gap-3 rounded-sm px-3 py-2 text-left text-sm hover:bg-accent disabled:pointer-events-none disabled:opacity-50';

  return (
    <div className="relative" ref={menuRef}>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setOpen((value) => !value)}
        disabled={props.disabled}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        Export / Backup <ChevronDown className="ml-2 h-4 w-4" />
      </Button>
      {open && (
        <div
          role="menu"
          aria-label="Export and backup options"
          className="absolute right-0 top-full z-50 mt-2 w-64 rounded-md border bg-popover p-1 text-popover-foreground shadow-md"
        >
          <button
            type="button"
            role="menuitem"
            onClick={() => run(props.onExportRules)}
            disabled={props.rulesLoading}
            className={itemClass}
          >
            <Download className="mt-0.5 h-4 w-4 shrink-0" />
            <span>
              <span className="block font-medium">Export rules (CSV)</span>
              <span className="block text-xs text-muted-foreground">
                Handicap averages and values
              </span>
            </span>
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() => run(props.onExportHistory)}
            disabled={props.historyLoading}
            className={itemClass}
          >
            <History className="mt-0.5 h-4 w-4 shrink-0" />
            <span>
              <span className="block font-medium">Export history (CSV)</span>
              <span className="block text-xs text-muted-foreground">
                Recorded changes and timestamps
              </span>
            </span>
          </button>
          <div className="my-1 border-t" />
          <button
            type="button"
            role="menuitem"
            onClick={() => run(props.onExportBackup)}
            disabled={props.rulesLoading || props.historyLoading}
            className={itemClass}
          >
            <FileJson className="mt-0.5 h-4 w-4 shrink-0" />
            <span>
              <span className="block font-medium">Download JSON backup</span>
              <span className="block text-xs text-muted-foreground">
                Rules, maximum settings, and history
              </span>
            </span>
          </button>
        </div>
      )}
    </div>
  );
}
