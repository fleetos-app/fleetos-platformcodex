"use client";

import { ErrorState } from "../../../components/states";

export default function AppError() {
  return (
    <div className="content-shell">
      <ErrorState
        title="Workspace unavailable"
        description="The application shell could not load this workspace."
      />
    </div>
  );
}
