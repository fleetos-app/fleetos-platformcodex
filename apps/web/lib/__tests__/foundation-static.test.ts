import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { appNavigationItems } from "../navigation";

const repoRoot = path.resolve(process.cwd(), "../..");

function readRepoFile(relativePath: string) {
  return readFileSync(path.join(repoRoot, relativePath), "utf8");
}

function walkFiles(root: string, extensions = new Set([".ts", ".tsx", ".md", ".sql"])) {
  const results: string[] = [];

  for (const entry of readdirSync(root)) {
    if (entry === "node_modules" || entry === ".next" || entry === "dist") {
      continue;
    }

    const fullPath = path.join(root, entry);
    const stats = statSync(fullPath);

    if (stats.isDirectory()) {
      results.push(...walkFiles(fullPath, extensions));
      continue;
    }

    if (extensions.has(path.extname(entry))) {
      results.push(fullPath);
    }
  }

  return results;
}

function toRepoRelative(filePath: string) {
  return path.relative(repoRoot, filePath).replaceAll(path.sep, "/");
}

describe("FleetOS foundation static checks", () => {
  it("points app navigation at real routes", () => {
    for (const item of appNavigationItems) {
      const route = item.href.replace(/^\/app\/?/, "");
      const pagePath = path.join(
        repoRoot,
        "apps/web/app/(protected)/app",
        route,
        "page.tsx",
      );

      expect(existsSync(pagePath), `${item.href} should resolve to an app route`).toBe(true);
    }
  });

  it("keeps protected app access behind server-side auth and organization membership gates", () => {
    const protectedLayout = readRepoFile("apps/web/app/(protected)/layout.tsx");
    const appLayout = readRepoFile("apps/web/app/(protected)/app/layout.tsx");

    expect(protectedLayout).toContain("getRequiredAuthSession");
    expect(appLayout).toContain("getRequiredAuthSession");
    expect(appLayout).toContain("session.memberships.length === 0");
    expect(appLayout).toContain("No organization access");
  });

  it("keeps platform admin data routes behind the super-admin guard", () => {
    const adminPages = [
      "apps/web/app/admin/billing/page.tsx",
      "apps/web/app/admin/organizations/page.tsx",
      "apps/web/app/admin/support/page.tsx",
      "apps/web/app/admin/system-health/page.tsx",
      "apps/web/app/admin/users/page.tsx",
    ];

    for (const page of adminPages) {
      expect(readRepoFile(page), `${page} should require platform super-admin access`).toContain(
        "requireSuperAdmin",
      );
    }
  });

  it("keeps service-role Supabase access server-only", () => {
    expect(readRepoFile("apps/web/lib/supabase/admin.ts")).toContain('import "server-only"');

    const clientFiles = walkFiles(path.join(repoRoot, "apps/web"))
      .filter((file) => !file.endsWith(".test.ts") && !file.endsWith(".test.tsx"))
      .filter((file) => readFileSync(file, "utf8").includes('"use client"'));

    for (const file of clientFiles) {
      const source = readFileSync(file, "utf8");
      expect(source, `${toRepoRelative(file)} must not import the service-role helper`).not.toContain(
        "createServiceSupabaseClient",
      );
      expect(source, `${toRepoRelative(file)} must not reference service-role secrets`).not.toContain(
        "SUPABASE_SERVICE_ROLE_KEY",
      );
    }
  });

  it("uses auth.getUser for server-side authorization decisions", () => {
    const sourceFiles = [
      ...walkFiles(path.join(repoRoot, "apps/web"), new Set([".ts", ".tsx"])),
      ...walkFiles(path.join(repoRoot, "packages"), new Set([".ts", ".tsx"])),
    ];

    const unsafeSessionUsers = sourceFiles
      .map((file) => ({ file, source: readFileSync(file, "utf8") }))
      .filter(({ file }) => !toRepoRelative(file).endsWith("packages/auth/src/provider.tsx"))
      .filter(({ source }) => /getSession\s*\(/.test(source))
      .map(({ file }) => toRepoRelative(file));

    expect(unsafeSessionUsers).toEqual([]);
    expect(readRepoFile("packages/auth/src/server.ts")).toContain("supabase.auth.getUser()");
    expect(readRepoFile("apps/web/modules/super-admin/server.ts")).toContain("auth.getUser()");
  });

  it("does not retain old generated references or unused placeholder systems", () => {
    const scanRoots = ["apps", "packages", "docs", "supabase"].map((segment) =>
      path.join(repoRoot, segment),
    );
    const matches = scanRoots
      .flatMap((root) => walkFiles(root))
      .filter((file) => !toRepoRelative(file).includes("/__tests__/"))
      .flatMap((file) => {
        const source = readFileSync(file, "utf8");
        const oldGeneratedTool = "Lov" + "able";
        const badTerms = [
          oldGeneratedTool,
          oldGeneratedTool.toLowerCase(),
          "module-" + "placeholder",
        ];
        return badTerms
          .filter((term) => source.includes(term))
          .map((term) => `${toRepoRelative(file)}:${term}`);
      });

    expect(matches).toEqual([]);
  });

  it("keeps FleetOS workspace packages acyclic", () => {
    const packagesDir = path.join(repoRoot, "packages");
    const manifests = readdirSync(packagesDir)
      .map((name) => path.join(packagesDir, name, "package.json"))
      .filter((manifest) => existsSync(manifest))
      .map((manifest) => JSON.parse(readFileSync(manifest, "utf8")) as {
        name: string;
        dependencies?: Record<string, string>;
      });

    const localPackageNames = new Set(manifests.map((manifest) => manifest.name));
    const graph = new Map(
      manifests.map((manifest) => [
        manifest.name,
        Object.keys(manifest.dependencies ?? {}).filter((dependency) =>
          localPackageNames.has(dependency),
        ),
      ]),
    );
    const visiting = new Set<string>();
    const visited = new Set<string>();

    function visit(packageName: string, stack: string[] = []) {
      if (visiting.has(packageName)) {
        throw new Error(`Package dependency cycle: ${[...stack, packageName].join(" -> ")}`);
      }

      if (visited.has(packageName)) {
        return;
      }

      visiting.add(packageName);
      for (const dependency of graph.get(packageName) ?? []) {
        visit(dependency, [...stack, packageName]);
      }
      visiting.delete(packageName);
      visited.add(packageName);
    }

    for (const packageName of graph.keys()) {
      visit(packageName);
    }

    expect(visited.size).toBe(localPackageNames.size);
  });
});
