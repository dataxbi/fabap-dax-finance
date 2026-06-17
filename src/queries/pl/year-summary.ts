import type { ColumnMetadataMap } from "@/lib/to-data-table";
import query from "./year-summary.dax?raw";

const connection = "plModel";

export const columnMetadata: ColumnMetadataMap = {
    "Fecha[Year]": { name: "FechaYear", displayName: "Año" },
    "[Importe]": { name: "Importe", displayName: "Importe", format: "$#,##0.00" },
    "[Presupuesto]": { name: "Presupuesto", displayName: "Presupuesto", format: "$#,##0.00" },
    "[Presupuesto AA]": { name: "PresupuestoAA", displayName: "Presupuesto año anterior", format: "$#,##0.00" },
    "[Importe AA]": { name: "ImporteAA", displayName: "Importe año anterior", format: "$#,##0.00" },
    "[Gastos]": { name: "Gastos", displayName: "Gastos", format: "$#,##0.00" },
    "[EBITDA]": { name: "EBITDA", displayName: "EBITDA", format: "$#,##0.00" },
    "[EBITDA AA]": { name: "EBITDAAA", displayName: "EBITDA año anterior", format: "$#,##0.00" },
    "[Cash Flow]": { name: "Cash Flow", displayName: "Cash Flow", format: "$#,##0.00" },
};

export function yearSummary() {
    return { connection, query, columnMetadata };
}
