import { describe, expect, it } from "vitest";
import type { QueryTable } from "@microsoft/fabric-app-data";
import { cleanColumnName, queryTableToRows } from "@/lib/query-table-rows";
import type { ColumnMetadataMap } from "@/lib/to-data-table";

describe("query-table-rows", () => {
    const queryTable: QueryTable = {
        columns: [
            { name: "Cuenta[Nombre]", dataType: "string" },
            { name: "[Importe]", dataType: "number" },
        ],
        rows: [
            ["Ingresos", 1250],
            ["Gastos", -250],
        ],
    };

    it("cleans DAX column names into object field names", () => {
        expect(cleanColumnName("Cuenta[Nombre]")).toBe("CuentaNombre");
        expect(cleanColumnName("[Importe]")).toBe("Importe");
    });

    it("converts query rows into objects using metadata names", () => {
        const metadata: ColumnMetadataMap = {
            "Cuenta[Nombre]": { name: "CuentaNombre", displayName: "Cuenta" },
            "[Importe]": { name: "Importe", displayName: "Importe", format: "#,##0" },
        };

        const result = queryTableToRows(queryTable, metadata);

        expect(result).toEqual([
            { CuentaNombre: "Ingresos", Importe: 1250 },
            { CuentaNombre: "Gastos", Importe: -250 },
        ]);
    });
});
