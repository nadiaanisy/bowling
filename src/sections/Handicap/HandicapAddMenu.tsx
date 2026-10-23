import {
  useEffect,
  useRef,
  useState
} from 'react';
import { Button } from '../../components/button';
import {
  ChevronDown,
  ListPlus,
  Plus
} from 'lucide-react';

interface HandicapAddMenuProps {
  disabled: boolean;
  onAddSingle: () => void;
  onBulkAdd: () => void;
}

/** Shows the actions for adding one handicap rule or importing many rules. */
export function HandicapAddMenu({
  disabled,
  onAddSingle,
  onBulkAdd,
}: HandicapAddMenuProps) {
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

  return (
    <div className="relative" ref={menuRef}>
      <Button
        type="button"
        variant="outline"
        onClick={() => setOpen((value) => !value)}
        disabled={disabled}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        Add Handicap <ChevronDown className="ml-2 h-4 w-4" />
      </Button>
      {open && (
        <div
          role="menu"
          aria-label="Add handicap options"
          className="absolute right-0 top-full z-50 mt-2 w-64 rounded-md border bg-popover p-1 text-popover-foreground shadow-md"
        >
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              onAddSingle();
            }}
            className="flex w-full items-start gap-3 rounded-sm px-3 py-2 text-left text-sm hover:bg-accent"
          >
            <Plus className="mt-0.5 h-4 w-4 shrink-0" />
            <span>
              <span className="block font-medium">Add single handicap</span>
              <span className="block text-xs text-muted-foreground">
                Enter one average and its values
              </span>
            </span>
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              onBulkAdd();
            }}
            className="flex w-full items-start gap-3 rounded-sm px-3 py-2 text-left text-sm hover:bg-accent"
          >
            <ListPlus className="mt-0.5 h-4 w-4 shrink-0" />
            <span>
              <span className="block font-medium">Bulk add / import</span>
              <span className="block text-xs text-muted-foreground">
                Add multiple rules from pasted data or a file
              </span>
            </span>
          </button>
        </div>
      )}
    </div>
  );
}
