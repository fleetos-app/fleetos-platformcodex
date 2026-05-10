import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const repoRoot = path.resolve(process.cwd(), "../..");
const migrationsDir = path.join(repoRoot, "supabase/migrations");
const migrationSql = readdirSync(migrationsDir)
  .filter((file) => file.endsWith(".sql"))
  .sort()
  .map((file) => readFileSync(path.join(migrationsDir, file), "utf8"))
  .join("\n");
const seedSql = readFileSync(path.join(repoRoot, "supabase/seed.sql"), "utf8");

const coreTables = [
  "organizations",
  "organization_memberships",
  "drivers",
  "subcontractors",
  "vehicles",
  "customers",
  "jobs",
  "runs",
  "allocations",
  "audit_logs",
];

const organizationOwnedTables = [
  "organization_memberships",
  "drivers",
  "subcontractors",
  "vehicles",
  "customers",
  "jobs",
  "runs",
  "allocations",
];

function tableDefinition(table: string) {
  const match = migrationSql.match(
    new RegExp(`create table public\\.${table} \\(([\\s\\S]*?)\\n\\);`, "i"),
  );
  return match?.[1] ?? "";
}

describe("FleetOS database foundation", () => {
  it("creates all core SaaS and operations tables", () => {
    for (const table of coreTables) {
      expect(migrationSql, `${table} should be created by migrations`).toMatch(
        new RegExp(`create table public\\.${table}\\b`, "i"),
      );
    }
  });

  it("keeps organization-owned tables scoped by tenant and organization", () => {
    expect(tableDefinition("organizations")).toContain("tenant_id uuid not null");

    for (const table of organizationOwnedTables) {
      const definition = tableDefinition(table);
      expect(definition, `${table} should include tenant_id`).toContain("tenant_id uuid");
      expect(definition, `${table} should include organization_id`).toContain("organization_id uuid");
    }
  });

  it("enables RLS on core tenant-owned tables", () => {
    for (const table of coreTables) {
      expect(migrationSql, `${table} should have RLS enabled`).toMatch(
        new RegExp(`alter table public\\.${table} enable row level security`, "i"),
      );
    }
  });

  it("indexes common tenant, organization, and user access paths", () => {
    for (const table of organizationOwnedTables) {
      expect(migrationSql, `${table} should index tenant_id`).toMatch(
        new RegExp(`create (unique )?index [\\w_]+ on public\\.${table}\\(tenant_id\\)`, "i"),
      );
      expect(migrationSql, `${table} should index organization_id`).toMatch(
        new RegExp(`create (unique )?index [\\w_]+ on public\\.${table}\\(organization_id\\)`, "i"),
      );
    }

    expect(migrationSql).toContain("organization_memberships_user_id_idx");
    expect(migrationSql).toContain("audit_logs_actor_user_id_idx");
    expect(migrationSql).toContain("drivers_user_id_idx");
    expect(migrationSql).toContain("allocations_driver_user_id_idx");
  });

  it("uses explicit PostgREST relationship embeds where relationships are ambiguous", () => {
    const appSource = readFileSync(path.join(repoRoot, "packages/auth/src/server.ts"), "utf8")
      + readFileSync(
        path.join(repoRoot, "apps/web/modules/jobs-runs/repositories/jobs-runs-repository.ts"),
        "utf8",
      );

    expect(appSource).toContain(
      "organizations!organization_memberships_tenant_organization_fkey",
    );
    expect(appSource).toContain("customers!jobs_customer_tenant_organization_fkey");
    expect(appSource).toContain("pickup_locations!jobs_pickup_location_tenant_organization_fkey");
    expect(appSource).toContain("delivery_locations!jobs_delivery_location_tenant_organization_fkey");
    expect(appSource).toContain("run_stops!run_stops_run_tenant_organization_fkey");
  });

  it("keeps job assignment reads aligned with the allocations contract", () => {
    const repositorySource = readFileSync(
      path.join(repoRoot, "apps/web/modules/jobs-runs/repositories/jobs-runs-repository.ts"),
      "utf8",
    );
    const jobsListSelect = repositorySource.match(
      /\.from\("jobs"\)[\s\S]*?\.select\(\s*"([^"]+)"/,
    )?.[1] ?? "";

    expect(jobsListSelect).not.toContain("driver_user_id");
    expect(jobsListSelect).not.toContain("subcontractor_id");
    expect(jobsListSelect).not.toContain("vehicle_id");
    expect(repositorySource).toContain('.from("allocations")');
    expect(readFileSync(path.join(repoRoot, "docs/SCHEMA_CONTRACT.md"), "utf8")).toContain(
      "Jobs do not own assignment columns.",
    );
  });

  it("keeps local seed data deterministic and safe to rerun", () => {
    expect(seedSql).toContain("admin@fleetos.local");
    expect(seedSql).toContain("Jindal Transport");
    expect(seedSql).toContain("on conflict (provider_id, provider) do update");
    expect(seedSql).toContain("on conflict (organization_id, user_id) do update");
    expect(seedSql).toContain("on conflict (id) do update");
    expect(seedSql).toContain("seed_audit_log_id");
  });
});
