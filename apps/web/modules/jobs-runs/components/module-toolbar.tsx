import { Search } from "lucide-react";

export function ModuleToolbar({
  search,
  status,
  statuses,
}: {
  search?: string;
  status?: string;
  statuses: readonly string[];
}) {
  return (
    <div className="module-toolbar">
      <label className="search-field">
        <Search size={16} aria-hidden="true" />
        <input name="search" defaultValue={search} placeholder="Search references, titles, customers" />
      </label>
      <select name="status" defaultValue={status ?? "all"} aria-label="Filter status">
        <option value="all">All statuses</option>
        {statuses.map((item) => (
          <option key={item} value={item}>
            {item.replaceAll("_", " ")}
          </option>
        ))}
      </select>
      <button className="primary-button" type="submit">
        Apply filters
      </button>
    </div>
  );
}
