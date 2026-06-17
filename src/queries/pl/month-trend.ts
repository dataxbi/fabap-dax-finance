import type { ColumnMetadataMap } from "@/lib/to-data-table";
import query from "./month-trend.dax?raw";

const connection = "plModel";

export const columnMetadata: ColumnMetadataMap = {
    "Fecha[Year Month Sort]": { name: "FechaYearMonthSort", displayName: "Orden mes" },
    "Fecha[Year Month]": { name: "FechaYearMonth", displayName: "Mes" },
    "[Importe]": { name: "Importe", displayName: "Importe", format: "$#,##0.00" },
    "[Presupuesto]": { name: "Presupuesto", displayName: "Presupuesto", format: "$#,##0.00" },
    "[Gastos]": { name: "Gastos", displayName: "Gastos", format: "$#,##0.00" },
    "[EBITDA]": { name: "EBITDA", displayName: "EBITDA", format: "$#,##0.00" },
    "[Cash Flow]": { name: "Cash Flow", displayName: "Cash Flow", format: "$#,##0.00" },
};

export function monthTrend() {
    return { connection, query, columnMetadata };
}
