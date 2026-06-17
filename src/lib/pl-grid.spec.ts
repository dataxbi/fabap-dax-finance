import { describe, expect, it } from "vitest";
import { buildPlHierarchy, filterPlHierarchy, getVarianceLabel, getVarianceTone } from "./pl-grid";

describe("pl-grid helpers", () => {
    it("builds a hierarchy from parent account plus standalone totals", () => {
        const tree = buildPlHierarchy(
            [
                { CuentaAccount: "Producto A", CuentaParentAccount: "Ingresos", CuentaSign: 1, Importe: 100, Presupuesto: 90, Variacion: 10, VariacionPct: 10 / 90 },
                { CuentaAccount: "Producto B", CuentaParentAccount: "Ingresos", CuentaSign: 1, Importe: 80, Presupuesto: 85, Variacion: -5, VariacionPct: -5 / 85 },
                { CuentaAccount: "Personal", CuentaParentAccount: "Gastos", CuentaSign: -1, Importe: 60, Presupuesto: 70, Variacion: -10, VariacionPct: -10 / 70 },
                { CuentaAccount: "EBITDA", CuentaParentAccount: "", CuentaSign: 1, Importe: 120, Presupuesto: 105, Variacion: 15, VariacionPct: 15 / 105 },
            ],
            { CuentaAccount: "Resumen 2026", CuentaSign: 1, Importe: 180, Presupuesto: 175, Variacion: 5, VariacionPct: 5 / 175 },
        );

        expect(tree).toHaveLength(1);
        expect(tree[0].label).toBe("Resumen 2026");
        expect(tree[0].children.map((node) => node.label)).toEqual(["Ingresos", "Gastos", "EBITDA"]);
        expect(tree[0].children[0].children.map((node) => node.label)).toEqual(["Producto A", "Producto B"]);
        expect(tree[0].children[1].children.map((node) => node.label)).toEqual(["Personal"]);
    });

    it("keeps ancestors when filtering the hierarchy", () => {
        const tree = buildPlHierarchy(
            [
                { CuentaAccount: "Producto A", CuentaParentAccount: "Ingresos", CuentaSign: 1, Importe: 100, Presupuesto: 90, Variacion: 10, VariacionPct: 10 / 90 },
                { CuentaAccount: "Producto B", CuentaParentAccount: "Ingresos", CuentaSign: 1, Importe: 80, Presupuesto: 85, Variacion: -5, VariacionPct: -5 / 85 },
                { CuentaAccount: "Personal", CuentaParentAccount: "Gastos", CuentaSign: -1, Importe: 60, Presupuesto: 70, Variacion: -10, VariacionPct: -10 / 70 },
            ],
            { CuentaAccount: "Resumen 2026", CuentaSign: 1, Importe: 180, Presupuesto: 175, Variacion: 5, VariacionPct: 5 / 175 },
        );

        const filtered = filterPlHierarchy(tree, "producto b");

        expect(filtered).toHaveLength(1);
        expect(filtered[0].label).toBe("Resumen 2026");
        expect(filtered[0].children).toHaveLength(1);
        expect(filtered[0].children[0].label).toBe("Ingresos");
        expect(filtered[0].children[0].children.map((node) => node.label)).toEqual(["Producto B"]);
    });

    it("marks positive-sign favorable variances as positive", () => {
        const row = { CuentaSign: 1, Variacion: 120, VariacionPct: 0.1 };

        expect(getVarianceTone(row)).toBe("positive");
        expect(getVarianceLabel(row)).toBe("Favorable");
    });

    it("marks lower-than-budget expense variances as favorable", () => {
        const row = { CuentaSign: -1, Variacion: -80, VariacionPct: -0.05 };

        expect(getVarianceTone(row)).toBe("positive");
        expect(getVarianceLabel(row)).toBe("Favorable");
    });

    it("marks near-zero variances as neutral", () => {
        const row = { CuentaSign: 1, Variacion: 0.1, VariacionPct: 0.0002 };

        expect(getVarianceTone(row)).toBe("neutral");
        expect(getVarianceLabel(row)).toBe("En linea");
    });
});
