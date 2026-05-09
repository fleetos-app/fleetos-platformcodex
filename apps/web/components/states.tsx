import { AlertCircle, Inbox, Loader2 } from "lucide-react";

export function LoadingState({ label = "Loading" }: { label?: string }) {
  return (
    <div className="state-panel" role="status" aria-live="polite">
      <Loader2 className="state-icon spin" aria-hidden="true" />
      <p>{label}</p>
    </div>
  );
}

export function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="state-panel">
      <Inbox className="state-icon" aria-hidden="true" />
      <h2>{title}</h2>
      <p>{description}</p>
    </div>
  );
}

export function ErrorState({
  title = "Something went wrong",
  description = "Try refreshing the page.",
}: {
  title?: string;
  description?: string;
}) {
  return (
    <div className="state-panel" role="alert">
      <AlertCircle className="state-icon" aria-hidden="true" />
      <h2>{title}</h2>
      <p>{description}</p>
    </div>
  );
}
