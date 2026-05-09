"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createJob, createRun, updateJob, updateRun } from "./services/jobs-runs-service";
import { getJobsRunsServerContext } from "./server";
import type { JobStatus, RunStatus } from "./types";
import { jobStatuses, runStatuses } from "./types";

function optionalString(value: FormDataEntryValue | null) {
  const text = String(value ?? "").trim();
  return text.length > 0 ? text : null;
}

function optionalNumber(value: FormDataEntryValue | null) {
  const text = optionalString(value);
  return text == null ? null : Number(text);
}

function requireString(value: FormDataEntryValue | null, label: string) {
  const text = optionalString(value);
  if (!text) {
    throw new Error(`${label} is required.`);
  }
  return text;
}

export async function createJobAction(formData: FormData) {
  const { supabase, scope } = await getJobsRunsServerContext("jobs.write");
  const job = await createJob(supabase, scope, {
    customerId: requireString(formData.get("customerId"), "Customer"),
    pickupLocationId: optionalString(formData.get("pickupLocationId")),
    deliveryLocationId: optionalString(formData.get("deliveryLocationId")),
    title: requireString(formData.get("title"), "Title"),
    customerReference: optionalString(formData.get("customerReference")),
    internalReference: optionalString(formData.get("internalReference")),
    notes: optionalString(formData.get("notes")),
    requestedPickupAt: optionalString(formData.get("requestedPickupAt")),
    requestedDeliveryAt: optionalString(formData.get("requestedDeliveryAt")),
    temperatureMinC: optionalNumber(formData.get("temperatureMinC")),
    temperatureMaxC: optionalNumber(formData.get("temperatureMaxC")),
    podRequired: formData.get("podRequired") === "on",
    runId: optionalString(formData.get("runId")),
    driverUserId: optionalString(formData.get("driverUserId")),
    subcontractorId: optionalString(formData.get("subcontractorId")),
    vehicleId: optionalString(formData.get("vehicleId")),
  });

  revalidatePath("/app/jobs");
  redirect(`/app/jobs/${job.id}`);
}

export async function updateJobAction(formData: FormData) {
  const { supabase, scope } = await getJobsRunsServerContext("jobs.write");
  const id = requireString(formData.get("id"), "Job id");
  const status = optionalString(formData.get("status"));

  await updateJob(supabase, scope, {
    id,
    customerId: requireString(formData.get("customerId"), "Customer"),
    pickupLocationId: optionalString(formData.get("pickupLocationId")),
    deliveryLocationId: optionalString(formData.get("deliveryLocationId")),
    title: requireString(formData.get("title"), "Title"),
    status: isJobStatus(status) ? status : undefined,
    customerReference: optionalString(formData.get("customerReference")),
    internalReference: optionalString(formData.get("internalReference")),
    notes: optionalString(formData.get("notes")),
    requestedPickupAt: optionalString(formData.get("requestedPickupAt")),
    requestedDeliveryAt: optionalString(formData.get("requestedDeliveryAt")),
    temperatureMinC: optionalNumber(formData.get("temperatureMinC")),
    temperatureMaxC: optionalNumber(formData.get("temperatureMaxC")),
    podRequired: formData.get("podRequired") === "on",
    runId: optionalString(formData.get("runId")),
    driverUserId: optionalString(formData.get("driverUserId")),
    subcontractorId: optionalString(formData.get("subcontractorId")),
    vehicleId: optionalString(formData.get("vehicleId")),
  });

  revalidatePath("/app/jobs");
  revalidatePath(`/app/jobs/${id}`);
  redirect(`/app/jobs/${id}`);
}

export async function createRunAction(formData: FormData) {
  const { supabase, scope } = await getJobsRunsServerContext("runs.write");
  const run = await createRun(supabase, scope, {
    runNumber: requireString(formData.get("runNumber"), "Run number"),
    title: requireString(formData.get("title"), "Title"),
    plannedStartAt: optionalString(formData.get("plannedStartAt")),
    plannedEndAt: optionalString(formData.get("plannedEndAt")),
    driverUserId: optionalString(formData.get("driverUserId")),
    subcontractorId: optionalString(formData.get("subcontractorId")),
    vehicleId: optionalString(formData.get("vehicleId")),
    notes: optionalString(formData.get("notes")),
  });

  revalidatePath("/app/runs");
  redirect(`/app/runs/${run.id}`);
}

export async function updateRunAction(formData: FormData) {
  const { supabase, scope } = await getJobsRunsServerContext("runs.write");
  const id = requireString(formData.get("id"), "Run id");
  const status = optionalString(formData.get("status"));

  await updateRun(supabase, scope, {
    id,
    runNumber: requireString(formData.get("runNumber"), "Run number"),
    title: requireString(formData.get("title"), "Title"),
    status: isRunStatus(status) ? status : undefined,
    plannedStartAt: optionalString(formData.get("plannedStartAt")),
    plannedEndAt: optionalString(formData.get("plannedEndAt")),
    driverUserId: optionalString(formData.get("driverUserId")),
    subcontractorId: optionalString(formData.get("subcontractorId")),
    vehicleId: optionalString(formData.get("vehicleId")),
    notes: optionalString(formData.get("notes")),
  });

  revalidatePath("/app/runs");
  revalidatePath(`/app/runs/${id}`);
  redirect(`/app/runs/${id}`);
}

function isJobStatus(value: string | null): value is JobStatus {
  return Boolean(value && jobStatuses.includes(value as JobStatus));
}

function isRunStatus(value: string | null): value is RunStatus {
  return Boolean(value && runStatuses.includes(value as RunStatus));
}
