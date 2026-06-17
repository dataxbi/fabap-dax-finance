import type { ColumnMetadataMap } from "@/lib/to-data-table";
import query from "./account-timeline.dax?raw";

const connection = "plModel";

export const columnMetadata: ColumnMetadataMap = {
    "Cuenta[Account]": { name: "CuentaAccount", displayName: "Cuenta" },
    "Cuenta[Parent Account]": { name: "CuentaParentAccount", displayName: "Cuenta padre" },
    "Fecha[Year Month Sort]": { name: "FechaYearMonthSort", displayName: "Orden mes" },
    "Fecha[Year Month]": { name: "FechaYearMonth", displayName: "Mes" },
    "[Importe]": { name: "Importe", displayName: "Importe", format: "$#,##0.00" },
};

export function accountTimeline() {
    return { connection, query, columnMetadata };
}
