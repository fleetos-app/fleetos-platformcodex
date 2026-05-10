"use client";

import { useFormStatus } from "react-dom";

export function SubmitButton({
  children,
  pendingLabel = "Saving...",
  disabled = false,
  className,
}: {
  children: React.ReactNode;
  pendingLabel?: string;
  disabled?: boolean;
  className?: string;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      className={className}
      disabled={disabled || pending}
      aria-disabled={disabled || pending}
    >
      {pending ? pendingLabel : children}
    </button>
  );
}
