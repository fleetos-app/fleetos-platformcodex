import { createRunAction, updateRunAction } from "../actions";
import { SubmitButton } from "../../../components/submit-button";
import { runStatuses, type RunSummary, type SelectOption } from "../types";

export function RunForm({
  mode,
  run,
  options,
}: {
  mode: "create" | "edit";
  run?: RunSummary;
  options: {
    drivers: SelectOption[];
    subcontractors: SelectOption[];
    vehicles: SelectOption[];
  };
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
          <span>Driver</span>
          <select name="driverUserId" defaultValue={run?.driverUserId ?? ""}>
            <option value="">Unassigned</option>
            {options.drivers.map((option) => (
              <option key={option.id} value={option.id}>{option.label}</option>
            ))}
          </select>
        </label>
        <label>
          <span>Vehicle</span>
          <select name="vehicleId" defaultValue={run?.vehicleId ?? ""}>
            <option value="">Unassigned</option>
            {options.vehicles.map((option) => (
              <option key={option.id} value={option.id}>{option.label}</option>
            ))}
          </select>
        </label>
      </div>
      <label>
        <span>Subcontractor user</span>
        <select name="subcontractorId" defaultValue={run?.subcontractorId ?? ""}>
          <option value="">Unassigned</option>
          {options.subcontractors.map((option) => (
            <option key={option.id} value={option.id}>{option.label}</option>
          ))}
        </select>
      </label>
      <label>
        <span>Notes</span>
        <textarea name="notes" rows={4} defaultValue={run?.notes ?? ""} />
      </label>
      <SubmitButton pendingLabel={mode === "create" ? "Creating..." : "Saving..."}>
        {mode === "create" ? "Create run" : "Save run"}
      </SubmitButton>
    </form>
  );
}

function toDatetimeLocal(value?: string | null) {
  if (!value) return "";
  return value.slice(0, 16);
}
