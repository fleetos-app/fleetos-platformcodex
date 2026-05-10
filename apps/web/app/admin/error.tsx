"use client";

import { ErrorState } from "../../components/states";

export default function AdminError() {
  return (
    <div className="content-shell">
      <ErrorState
        title="Admin area unavailable"
        description="FleetOS could not load this admin page. Refresh the page or try again after checking your access."
      />
    </div>
  );
}
