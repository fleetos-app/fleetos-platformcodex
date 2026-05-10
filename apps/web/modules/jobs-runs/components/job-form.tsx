import { createJobAction, updateJobAction } from "../actions";
import { SubmitButton } from "../../../components/submit-button";
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
    drivers: SelectOption[];
    subcontractors: SelectOption[];
    vehicles: SelectOption[];
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
          <span>Driver</span>
          <select name="driverUserId" defaultValue={job?.driverUserId ?? ""}>
            <option value="">Unassigned</option>
            {options.drivers.map((option) => (
              <option key={option.id} value={option.id}>{option.label}</option>
            ))}
          </select>
        </label>
        <label>
          <span>Vehicle</span>
          <select name="vehicleId" defaultValue={job?.vehicleId ?? ""}>
            <option value="">Unassigned</option>
            {options.vehicles.map((option) => (
              <option key={option.id} value={option.id}>{option.label}</option>
            ))}
          </select>
        </label>
      </div>
      <label>
        <span>Subcontractor user</span>
        <select name="subcontractorId" defaultValue={job?.subcontractorId ?? ""}>
          <option value="">Unassigned</option>
          {options.subcontractors.map((option) => (
            <option key={option.id} value={option.id}>{option.label}</option>
          ))}
        </select>
      </label>
      <label className="checkbox-row">
        <input name="podRequired" type="checkbox" defaultChecked={job?.podRequired ?? false} />
        <span>POD required</span>
      </label>
      <label>
        <span>Notes</span>
        <textarea name="notes" rows={4} defaultValue={job?.notes ?? ""} />
      </label>
      <SubmitButton pendingLabel={mode === "create" ? "Creating..." : "Saving..."}>
        {mode === "create" ? "Create job" : "Save job"}
      </SubmitButton>
    </form>
  );
}

function toDatetimeLocal(value?: string | null) {
  if (!value) return "";
  return value.slice(0, 16);
}
