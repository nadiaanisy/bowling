interface SearchSortProps {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  sortOrder: 'asc' | 'desc';
  setSortOrder: (value: 'asc' | 'desc') => void;
}

export default function SearchSort({
  searchQuery,
  setSearchQuery,
  sortOrder,
  setSortOrder,
}: SearchSortProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row pb-6">
      <input
        type="search"
        value={searchQuery}
        onChange={(event) => setSearchQuery(event.target.value)}
        placeholder="Search leagues..."
        aria-label="Search leagues"
        className="min-w-0 flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm"
      />

      <select
        value={sortOrder}
        onChange={(event) => setSortOrder(event.target.value as 'asc' | 'desc')}
        aria-label="Sort leagues"
        className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
      >
        <option value="asc">Name: A–Z</option>
        <option value="desc">Name: Z–A</option>
      </select>
    </div>
  );
}
