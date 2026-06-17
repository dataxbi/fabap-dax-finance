import { describe, expect, it } from "vitest";
import { yearSummary } from "./year-summary";

describe("yearSummary", () => {
    it("returns the validated yearly summary query and metadata", () => {
        const result = yearSummary();

        expect(result.connection).toBe("plModel");
        expect(result.query).toContain("'Fecha'[Year]");
        expect(result.query).toContain('"Importe AA"');
        expect(result.columnMetadata["[EBITDA]"].format).toBe("$#,##0.00");
        expect(result.columnMetadata["[Presupuesto AA]"].format).toBe("$#,##0.00");
    });
});
