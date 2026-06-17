import { describe, expect, it } from "vitest";
import { monthTrend } from "./month-trend";

describe("monthTrend", () => {
    it("returns the validated monthly trend query and metadata", () => {
        const result = monthTrend();

        expect(result.connection).toBe("plModel");
        expect(result.query).toContain("'Fecha'[Year Month]");
        expect(result.columnMetadata["Fecha[Year Month]"].name).toBe("FechaYearMonth");
        expect(result.columnMetadata["[Cash Flow]"].displayName).toBe("Cash Flow");
    });
});
