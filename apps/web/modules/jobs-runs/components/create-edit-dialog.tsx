export function CreateEditDialog({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <details className="create-dialog">
      <summary>{title}</summary>
      <div className="dialog-panel">
        <h2>{title}</h2>
        <p>{description}</p>
        <form className="dialog-form">{children}</form>
      </div>
    </details>
  );
}

export function PlaceholderFormFields({ mode }: { mode: "job" | "run" }) {
  return (
    <>
      <label>
        <span>Title</span>
        <input placeholder={mode === "job" ? "Customer delivery request" : "Run title"} />
      </label>
      <label>
        <span>Internal reference</span>
        <input placeholder="Internal reference" />
      </label>
      <label>
        <span>Notes</span>
        <textarea placeholder="Operational notes" rows={4} />
      </label>
      <button type="button">Save draft</button>
    </>
  );
}
