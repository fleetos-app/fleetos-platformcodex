import { CreateEditDialog } from "../../../modules/jobs-runs/components/create-edit-dialog";
import { EmptyState } from "../../../components/states";
import { VehicleForm } from "./vehicle-form";
import type { VehicleListResult } from "../types";

export function VehiclesTable({ result }: { result: VehicleListResult }) {
  if (result.data.length === 0) {
    return (
      <EmptyState
        title="No vehicles found"
        description="Add trucks, vans, trailers, and refrigerated assets to make FleetOS operational."
      />
    );
  }

  return (
    <div className="data-table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            <th>Vehicle</th>
            <th>Status</th>
            <th>Type</th>
            <th>Temperature</th>
            <th>Next service</th>
            <th>Odometer</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {result.data.map((vehicle) => (
            <tr key={vehicle.id}>
              <td>
                <strong>{vehicle.registrationNumber}</strong>
                <small>{vehicle.name}{vehicle.fleetNumber ? ` - ${vehicle.fleetNumber}` : ""}</small>
              </td>
              <td><span className={`status-badge tone-${vehicle.status === "maintenance" ? "danger" : vehicle.status === "available" ? "success" : "active"}`}>{vehicle.status}</span></td>
              <td>{vehicle.vehicleType}</td>
              <td>{vehicle.refrigerated ? `${vehicle.temperatureMinC ?? "-"} C to ${vehicle.temperatureMaxC ?? "-"} C` : "Ambient"}</td>
              <td>{vehicle.nextServiceDueAt ? new Date(vehicle.nextServiceDueAt).toLocaleDateString() : "Not set"}</td>
              <td>{vehicle.odometerKm?.toLocaleString() ?? "Not set"}</td>
              <td>
                <CreateEditDialog title="Edit" description="Update vehicle availability, service, and refrigeration details.">
                  <VehicleForm mode="edit" vehicle={vehicle} />
                </CreateEditDialog>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="pagination-meta">Page {result.page} of {result.pageCount} - {result.total} records</div>
    </div>
  );
}
