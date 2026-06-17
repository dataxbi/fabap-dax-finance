import { describe, expect, it } from "vitest";
import { plTable } from "./pl-table";

describe("plTable", () => {
    it("returns the validated P&L table query and metadata", () => {
        const result = plTable();

        expect(result.connection).toBe("plModel");
        expect(result.query).toContain("SUMMARIZECOLUMNS");
        expect(Object.keys(result.columnMetadata)).toEqual([
            "Cuenta[Order]",
            "Cuenta[Level]",
            "Cuenta[Account]",
            "Cuenta[Sign]",
            "[Importe]",
            "[Presupuesto]",
            "[Variacion]",
            "[Variacion %]",
        ]);
    });
});
