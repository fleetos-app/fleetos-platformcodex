export function FormMessage({
  error,
  message,
}: {
  error?: string;
  message?: string;
}) {
  if (!error && !message) {
    return null;
  }

  return (
    <div
      className={`form-message ${error ? "error" : "success"}`}
      role={error ? "alert" : "status"}
      aria-live="polite"
    >
      {error ?? message}
    </div>
  );
}
