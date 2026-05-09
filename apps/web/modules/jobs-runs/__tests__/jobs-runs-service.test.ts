import { describe, expect, it } from "vitest";
import { createOperationalScope, normalizePageInput, validateTemperatureRange } from "../services/jobs-runs-service";

describe("jobs-runs service", () => {
  it("normalizes pagination boundaries", () => {
    expect(normalizePageInput({ page: -2, pageSize: 500 })).toEqual({
      page: 1,
      pageSize: 100,
    });
  });

  it("requires active tenant and organization scope", () => {
    expect(() =>
      createOperationalScope({ actorUserId: "user_1" }),
    ).toThrow("Active organization membership is required.");
  });

  it("rejects invalid temperature ranges", () => {
    expect(() => validateTemperatureRange(4, -2)).toThrow(
      "Minimum temperature cannot be greater than maximum temperature.",
    );
  });
});
