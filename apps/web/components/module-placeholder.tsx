import { EmptyState } from "./states";

export interface ModulePlaceholderProps {
  title: string;
  eyebrow: string;
  description: string;
}

export function ModulePlaceholder({
  title,
  eyebrow,
  description,
}: ModulePlaceholderProps) {
  return (
    <div className="module-page">
      <header className="module-header">
        <p className="module-eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p>{description}</p>
      </header>
      <EmptyState
        title={`${title} module placeholder`}
        description="The layout, access boundary, and navigation entry are ready. Business workflows will be added later."
      />
    </div>
  );
}
