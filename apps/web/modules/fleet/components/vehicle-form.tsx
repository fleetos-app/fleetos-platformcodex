import { createVehicleAction, updateVehicleAction } from "../actions";
import { SubmitButton } from "../../../components/submit-button";
import { vehicleStatuses, vehicleTypes, type VehicleSummary } from "../types";

export function VehicleForm({
  mode,
  vehicle,
}: {
  mode: "create" | "edit";
  vehicle?: VehicleSummary;
}) {
  const action = mode === "create" ? createVehicleAction : updateVehicleAction;

  return (
    <form className="dialog-form" action={action}>
      {vehicle ? <input type="hidden" name="id" value={vehicle.id} /> : null}
      <div className="form-grid">
        <label>
          <span>Registration</span>
          <input name="registrationNumber" required defaultValue={vehicle?.registrationNumber ?? ""} />
        </label>
        <label>
          <span>Fleet number</span>
          <input name="fleetNumber" defaultValue={vehicle?.fleetNumber ?? ""} />
        </label>
      </div>
      <label>
        <span>Name</span>
        <input name="name" required defaultValue={vehicle?.name ?? ""} />
      </label>
      <div className="form-grid">
        <label>
          <span>Type</span>
          <select name="vehicleType" defaultValue={vehicle?.vehicleType ?? "truck"}>
            {vehicleTypes.map((type) => <option key={type} value={type}>{type}</option>)}
          </select>
        </label>
        <label>
          <span>Status</span>
          <select name="status" defaultValue={vehicle?.status ?? "available"}>
            {vehicleStatuses.map((status) => <option key={status} value={status}>{status}</option>)}
          </select>
        </label>
      </div>
      <label className="checkbox-row">
        <input name="refrigerated" type="checkbox" defaultChecked={vehicle?.refrigerated ?? false} />
        <span>Refrigerated vehicle</span>
      </label>
      <div className="form-grid">
        <label>
          <span>Min temp C</span>
          <input name="temperatureMinC" type="number" step="0.1" defaultValue={vehicle?.temperatureMinC ?? ""} />
        </label>
        <label>
          <span>Max temp C</span>
          <input name="temperatureMaxC" type="number" step="0.1" defaultValue={vehicle?.temperatureMaxC ?? ""} />
        </label>
      </div>
      <div className="form-grid">
        <label>
          <span>Next service</span>
          <input name="nextServiceDueAt" type="datetime-local" defaultValue={toDatetimeLocal(vehicle?.nextServiceDueAt)} />
        </label>
        <label>
          <span>Odometer km</span>
          <input name="odometerKm" type="number" defaultValue={vehicle?.odometerKm ?? ""} />
        </label>
      </div>
      <label>
        <span>Notes</span>
        <textarea name="notes" rows={3} defaultValue={vehicle?.notes ?? ""} />
      </label>
      <SubmitButton pendingLabel={mode === "create" ? "Creating..." : "Saving..."}>
        {mode === "create" ? "Create vehicle" : "Save vehicle"}
      </SubmitButton>
    </form>
  );
}

function toDatetimeLocal(value?: string | null) {
  if (!value) return "";
  return value.slice(0, 16);
}
