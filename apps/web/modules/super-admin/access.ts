import type { PlatformSuperAdminRecord } from "./types";

export function isActiveSuperAdminRecord(
  record: Pick<PlatformSuperAdminRecord, "status"> | null | undefined,
) {
  return record?.status === "active";
}
