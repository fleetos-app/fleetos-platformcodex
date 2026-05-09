import { createJobAction, updateJobAction } from "../actions";
import { jobStatuses, type JobSummary, type SelectOption } from "../types";

export function JobForm({
  mode,
  job,
  options,
}: {
  mode: "create" | "edit";
  job?: JobSummary;
  options: {
    customers: SelectOption[];
    pickupLocations: SelectOption[];
    deliveryLocations: SelectOption[];
    runs: SelectOption[];
  };
}) {
  const action = mode === "create" ? createJobAction : updateJobAction;

  return (
    <form className="dialog-form" action={action}>
      {job ? <input type="hidden" name="id" value={job.id} /> : null}
      <label>
        <span>Customer</span>
        <select name="customerId" required defaultValue={job?.customer?.id ?? ""}>
          <option value="" disabled>Select customer</option>
          {options.customers.map((option) => (
            <option key={option.id} value={option.id}>{option.label}</option>
          ))}
        </select>
      </label>
      <label>
        <span>Title</span>
        <input name="title" required defaultValue={job?.title ?? ""} />
      </label>
      {mode === "edit" ? (
        <label>
          <span>Status</span>
          <select name="status" defaultValue={job?.status ?? "pending"}>
            {jobStatuses.map((status) => (
              <option key={status} value={status}>{status.replaceAll("_", " ")}</option>
            ))}
          </select>
        </label>
      ) : null}
      <label>
        <span>Pickup location</span>
        <select name="pickupLocationId" defaultValue={job?.pickupLocation?.id ?? ""}>
          <option value="">TBC</option>
          {options.pickupLocations.map((option) => (
            <option key={option.id} value={option.id}>{option.label}</option>
          ))}
        </select>
      </label>
      <label>
        <span>Delivery location</span>
        <select name="deliveryLocationId" defaultValue={job?.deliveryLocation?.id ?? ""}>
          <option value="">TBC</option>
          {options.deliveryLocations.map((option) => (
            <option key={option.id} value={option.id}>{option.label}</option>
          ))}
        </select>
      </label>
      <div className="form-grid">
        <label>
          <span>Customer reference</span>
          <input name="customerReference" defaultValue={job?.customerReference ?? ""} />
        </label>
        <label>
          <span>Internal reference</span>
          <input name="internalReference" defaultValue={job?.internalReference ?? ""} />
        </label>
      </div>
      <div className="form-grid">
        <label>
          <span>Pickup time</span>
          <input name="requestedPickupAt" type="datetime-local" defaultValue={toDatetimeLocal(job?.requestedPickupAt)} />
        </label>
        <label>
          <span>Delivery time</span>
          <input name="requestedDeliveryAt" type="datetime-local" defaultValue={toDatetimeLocal(job?.requestedDeliveryAt)} />
        </label>
      </div>
      <div className="form-grid">
        <label>
          <span>Min temp C</span>
          <input name="temperatureMinC" type="number" step="0.1" defaultValue={job?.temperatureMinC ?? ""} />
        </label>
        <label>
          <span>Max temp C</span>
          <input name="temperatureMaxC" type="number" step="0.1" defaultValue={job?.temperatureMaxC ?? ""} />
        </label>
      </div>
      <label>
        <span>Assign to run</span>
        <select name="runId" defaultValue="">
          <option value="">Unassigned</option>
          {options.runs.map((option) => (
            <option key={option.id} value={option.id}>{option.label}</option>
          ))}
        </select>
      </label>
      <div className="form-grid">
        <label>
          <span>Driver user ID</span>
          <input name="driverUserId" placeholder="Optional Supabase user id" />
        </label>
        <label>
          <span>Vehicle ID</span>
          <input name="vehicleId" placeholder="Optional vehicle id" />
        </label>
      </div>
      <label>
        <span>Subcontractor membership ID</span>
        <input name="subcontractorId" placeholder="Optional membership id" />
      </label>
      <label className="checkbox-row">
        <input name="podRequired" type="checkbox" defaultChecked={job?.podRequired ?? false} />
        <span>POD required</span>
      </label>
      <label>
        <span>Notes</span>
        <textarea name="notes" rows={4} defaultValue={job?.notes ?? ""} />
      </label>
      <button type="submit">{mode === "create" ? "Create job" : "Save job"}</button>
    </form>
  );
}

function toDatetimeLocal(value?: string | null) {
  if (!value) return "";
  return value.slice(0, 16);
}
