"use server";

import { revalidatePath } from "next/cache";
import { guardPermission } from "../../lib/auth/server";
import { createServerSupabaseClient } from "../../lib/supabase/server";
import { createFleetScope } from "./services/vehicles-service";
import { createVehicle, isVehicleStatus, isVehicleType, saveVehicle } from "./services/vehicles-service";

function optionalString(value: FormDataEntryValue | null) {
  const text = String(value ?? "").trim();
  return text.length > 0 ? text : null;
}

function requireString(value: FormDataEntryValue | null, label: string) {
  const text = optionalString(value);
  if (!text) throw new Error(`${label} is required.`);
  return text;
}

function optionalNumber(value: FormDataEntryValue | null) {
  const text = optionalString(value);
  return text == null ? null : Number(text);
}

async function getWriteContext() {
  const [session, supabase] = await Promise.all([
    guardPermission("vehicles.write"),
    createServerSupabaseClient(),
  ]);
  const scope = createFleetScope({
    tenantId: session.activeMembership?.tenantId,
    organizationId: session.activeMembership?.organizationId,
    actorUserId: session.user.id,
  });
  return { supabase, scope };
}

export async function createVehicleAction(formData: FormData) {
  const { supabase, scope } = await getWriteContext();
  await createVehicle(supabase, scope, {
    registrationNumber: requireString(formData.get("registrationNumber"), "Registration"),
    fleetNumber: optionalString(formData.get("fleetNumber")),
    name: requireString(formData.get("name"), "Name"),
    vehicleType: readVehicleType(formData.get("vehicleType")),
    status: readVehicleStatus(formData.get("status")),
    refrigerated: formData.get("refrigerated") === "on",
    temperatureMinC: optionalNumber(formData.get("temperatureMinC")),
    temperatureMaxC: optionalNumber(formData.get("temperatureMaxC")),
    nextServiceDueAt: optionalString(formData.get("nextServiceDueAt")),
    odometerKm: optionalNumber(formData.get("odometerKm")),
    notes: optionalString(formData.get("notes")),
  });

  revalidatePath("/app/fleet");
}

export async function updateVehicleAction(formData: FormData) {
  const { supabase, scope } = await getWriteContext();
  await saveVehicle(supabase, scope, {
    id: requireString(formData.get("id"), "Vehicle id"),
    registrationNumber: requireString(formData.get("registrationNumber"), "Registration"),
    fleetNumber: optionalString(formData.get("fleetNumber")),
    name: requireString(formData.get("name"), "Name"),
    vehicleType: readVehicleType(formData.get("vehicleType")),
    status: readVehicleStatus(formData.get("status")),
    refrigerated: formData.get("refrigerated") === "on",
    temperatureMinC: optionalNumber(formData.get("temperatureMinC")),
    temperatureMaxC: optionalNumber(formData.get("temperatureMaxC")),
    nextServiceDueAt: optionalString(formData.get("nextServiceDueAt")),
    odometerKm: optionalNumber(formData.get("odometerKm")),
    notes: optionalString(formData.get("notes")),
  });

  revalidatePath("/app/fleet");
}

function readVehicleStatus(value: FormDataEntryValue | null) {
  const status = optionalString(value);
  return isVehicleStatus(status) ? status : "available";
}

function readVehicleType(value: FormDataEntryValue | null) {
  const type = optionalString(value);
  return isVehicleType(type) ? type : "truck";
}
