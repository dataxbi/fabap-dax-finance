import type { ColumnMetadataMap } from "@/lib/to-data-table";
import query from "./pl-table.dax?raw";

const connection = "plModel";

export const columnMetadata: ColumnMetadataMap = {
    "Cuenta[Order]": { name: "CuentaOrder", displayName: "Orden" },
    "Cuenta[Level]": { name: "CuentaLevel", displayName: "Nivel" },
    "Cuenta[Account]": { name: "CuentaAccount", displayName: "Cuenta" },
    "Cuenta[Parent Account]": { name: "CuentaParentAccount", displayName: "Cuenta padre" },
    "Cuenta[Sign]": { name: "CuentaSign", displayName: "Signo" },
    "[Importe]": { name: "Importe", displayName: "Importe", format: "$#,##0.00" },
    "[Presupuesto]": { name: "Presupuesto", displayName: "Presupuesto", format: "$#,##0.00" },
    "[Importe AA]": { name: "ImporteAA", displayName: "Año anterior", format: "$#,##0.00" },
    "[Variacion]": { name: "Variacion", displayName: "Variacion", format: "$#,##0.00" },
    "[Variacion %]": { name: "VariacionPct", displayName: "Variacion %", format: "0.0%" },
    "[Variacion AA]": { name: "VariacionAA", displayName: "Variacion AA", format: "$#,##0.00" },
    "[Variacion AA %]": { name: "VariacionAAPct", displayName: "Variacion AA %", format: "0.0%" },
};

export function plTable() {
    return { connection, query, columnMetadata };
}
