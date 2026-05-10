import { CreateEditDialog } from "../../../../modules/jobs-runs/components/create-edit-dialog";
import { FormMessage } from "../../../../components/form-message";
import { ModuleToolbar } from "../../../../modules/jobs-runs/components/module-toolbar";
import { VehicleForm } from "../../../../modules/fleet/components/vehicle-form";
import { VehiclesTable } from "../../../../modules/fleet/components/vehicles-table";
import { getFleetServerContext } from "../../../../modules/fleet/server";
import { isVehicleStatus, listVehicles } from "../../../../modules/fleet/services/vehicles-service";
import { vehicleStatuses } from "../../../../modules/fleet/types";

export default async function FleetPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const { supabase, scope } = await getFleetServerContext();
  const search = readParam(params.search);
  const status = readParam(params.status);
  const error = readParam(params.error);
  const message = readParam(params.message);
  const page = Number(readParam(params.page) ?? 1);
  const result = await listVehicles(supabase, scope, {
    search,
    status: isVehicleStatus(status) ? status : "all",
    page,
    pageSize: 25,
  });

  return (
    <div className="module-page">
      <header className="module-header split-header">
        <div>
          <p className="module-eyebrow">Fleet</p>
          <h1>Fleet and vehicles</h1>
          <p>Manage trucks, vans, trailers, refrigeration capability, service readiness, and availability.</p>
        </div>
        <CreateEditDialog title="Add vehicle" description="Create a tenant-scoped fleet asset.">
          <VehicleForm mode="create" />
        </CreateEditDialog>
      </header>
      <FormMessage error={error} message={message} />
      <form action="/app/fleet">
        <ModuleToolbar
          search={search}
          status={status}
          statuses={vehicleStatuses}
        />
      </form>
      <VehiclesTable result={result} />
    </div>
  );
}

function readParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}
