import { createRunAction, updateRunAction } from "../actions";
import { runStatuses, type RunSummary } from "../types";

export function RunForm({
  mode,
  run,
}: {
  mode: "create" | "edit";
  run?: RunSummary;
}) {
  const action = mode === "create" ? createRunAction : updateRunAction;

  return (
    <form className="dialog-form" action={action}>
      {run ? <input type="hidden" name="id" value={run.id} /> : null}
      <div className="form-grid">
        <label>
          <span>Run number</span>
          <input name="runNumber" required defaultValue={run?.runNumber ?? ""} />
        </label>
        {mode === "edit" ? (
          <label>
            <span>Status</span>
            <select name="status" defaultValue={run?.status ?? "planned"}>
              {runStatuses.map((status) => (
                <option key={status} value={status}>{status.replaceAll("_", " ")}</option>
              ))}
            </select>
          </label>
        ) : null}
      </div>
      <label>
        <span>Title</span>
        <input name="title" required defaultValue={run?.title ?? ""} />
      </label>
      <div className="form-grid">
        <label>
          <span>Planned start</span>
          <input name="plannedStartAt" type="datetime-local" defaultValue={toDatetimeLocal(run?.plannedStartAt)} />
        </label>
        <label>
          <span>Planned end</span>
          <input name="plannedEndAt" type="datetime-local" defaultValue={toDatetimeLocal(run?.plannedEndAt)} />
        </label>
      </div>
      <div className="form-grid">
        <label>
          <span>Driver user ID</span>
          <input name="driverUserId" defaultValue={run?.driverUserId ?? ""} />
        </label>
        <label>
          <span>Vehicle ID</span>
          <input name="vehicleId" defaultValue={run?.vehicleId ?? ""} />
        </label>
      </div>
      <label>
        <span>Subcontractor membership ID</span>
        <input name="subcontractorId" defaultValue={run?.subcontractorId ?? ""} />
      </label>
      <label>
        <span>Notes</span>
        <textarea name="notes" rows={4} defaultValue={run?.notes ?? ""} />
      </label>
      <button type="submit">{mode === "create" ? "Create run" : "Save run"}</button>
    </form>
  );
}

function toDatetimeLocal(value?: string | null) {
  if (!value) return "";
  return value.slice(0, 16);
}
