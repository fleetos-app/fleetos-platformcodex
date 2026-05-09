import { formatStatus } from "../status";
import type { StatusHistoryEntry } from "../types";

export function StatusTimeline({ entries }: { entries: StatusHistoryEntry[] }) {
  if (entries.length === 0) {
    return (
      <section className="timeline-card">
        <h2>Status history</h2>
        <p>No status changes have been recorded yet.</p>
      </section>
    );
  }

  return (
    <section className="timeline-card">
      <h2>Status history</h2>
      <ol className="timeline-list">
        {entries.map((entry) => (
          <li key={entry.id}>
            <strong>{formatStatus(entry.toStatus)}</strong>
            <span>{new Date(entry.changedAt).toLocaleString()}</span>
            {entry.reason ? <p>{entry.reason}</p> : null}
          </li>
        ))}
      </ol>
    </section>
  );
}
