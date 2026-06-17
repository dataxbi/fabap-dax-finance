import { describe, expect, it } from "vitest";
import { accountTimeline } from "./account-timeline";

describe("accountTimeline", () => {
    it("returns the validated monthly account trend query and metadata", () => {
        const result = accountTimeline();

        expect(result.connection).toBe("plModel");
        expect(result.query).toContain('"Importe", [Importe]');
        expect(result.columnMetadata["Fecha[Year Month]"].displayName).toBe("Mes");
    });
});
