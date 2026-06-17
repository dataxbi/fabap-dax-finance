import type { GridRow } from "@/lib/query-table-rows";

export type VarianceTone = "positive" | "negative" | "neutral";

export interface PlGridRow extends GridRow {
    varianceLabel?: string;
    varianceTone?: VarianceTone;
}

export interface PlHierarchyNode {
    id: string;
    label: string;
    depth: number;
    row: PlGridRow;
    children: PlHierarchyNode[];
    expandable: boolean;
}

export interface PlTreeRow extends PlGridRow {
    id: string;
    nodeType: "summary" | "income" | "expense" | "metric" | "leaf";
    subRows?: PlTreeRow[];
}

function toFiniteNumber(value: unknown): number | undefined {
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string" && value.trim() !== "") {
        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : undefined;
    }
    return undefined;
}

function toText(value: unknown) {
    return typeof value === "string" ? value.trim() : "";
}

function toSignMultiplier(value: unknown) {
    const numericSign = toFiniteNumber(value);
    if (numericSign == null || numericSign === 0) return 1;
    return numericSign < 0 ? -1 : 1;
}

function divideSafe(numerator: number, denominator: number) {
    return denominator === 0 ? undefined : numerator / denominator;
}

function buildBranchRow(label: string, rows: GridRow[], sign: number, parentAccount = ""): GridRow {
    const importe = rows.reduce((sum, row) => sum + (toFiniteNumber(row.Importe) ?? 0), 0);
    const presupuesto = rows.reduce((sum, row) => sum + (toFiniteNumber(row.Presupuesto) ?? 0), 0);
    const importeAA = rows.reduce((sum, row) => sum + (toFiniteNumber(row.ImporteAA) ?? 0), 0);
    const variacion = importe - presupuesto;
    const variacionAA = importe - importeAA;

    return {
        CuentaAccount: label,
        CuentaParentAccount: parentAccount,
        CuentaSign: sign,
        Importe: importe,
        Presupuesto: presupuesto,
        ImporteAA: importeAA,
        Variacion: variacion,
        VariacionPct: divideSafe(variacion, presupuesto),
        VariacionAA: variacionAA,
        VariacionAAPct: divideSafe(variacionAA, importeAA),
    };
}

function decorateRow(row: GridRow): PlGridRow {
    return {
        ...row,
        varianceLabel: getVarianceLabel(row),
        varianceTone: getVarianceTone(row),
    };
}

function makeNode(
    id: string,
    label: string,
    depth: number,
    row: GridRow,
    children: PlHierarchyNode[] = [],
): PlHierarchyNode {
    return {
        id,
        label,
        depth,
        row: decorateRow(row),
        children,
        expandable: children.length > 0,
    };
}

export function getVarianceTone(row: GridRow): VarianceTone {
    const variance = toFiniteNumber(row.Variacion) ?? 0;
    const variancePct = toFiniteNumber(row.VariacionPct) ?? 0;
    const signMultiplier = toSignMultiplier(row.CuentaSign);
    const scoredVariance = variance * signMultiplier;

    if (Math.abs(variance) < 0.5 && Math.abs(variancePct) < 0.001) {
        return "neutral";
    }

    if (scoredVariance > 0) return "positive";
    if (scoredVariance < 0) return "negative";
    return "neutral";
}

export function getVarianceLabel(row: GridRow) {
    const tone = getVarianceTone(row);

    if (tone === "positive") return "Favorable";
    if (tone === "negative") return "Desfavorable";
    return "En linea";
}

export function buildPlHierarchy(rows: GridRow[], summaryRow: GridRow): PlHierarchyNode[] {
    const incomeLeaves = rows
        .filter((row) => toText(row.CuentaParentAccount) === "Ingresos")
        .map((row) => makeNode(`leaf-${toText(row.CuentaAccount)}`, toText(row.CuentaAccount), 2, row));
    const expenseLeaves = rows
        .filter((row) => toText(row.CuentaParentAccount) === "Gastos")
        .map((row) => makeNode(`leaf-${toText(row.CuentaAccount)}`, toText(row.CuentaAccount), 2, row));
    const incomeBranch = makeNode(
        "branch-ingresos",
        "Ingresos",
        1,
        buildBranchRow("Ingresos", incomeLeaves.map((node) => node.row), 1, toText(summaryRow.CuentaAccount)),
        incomeLeaves,
    );
    const expenseBranch = makeNode(
        "branch-gastos",
        "Gastos",
        1,
        buildBranchRow("Gastos", expenseLeaves.map((node) => node.row), -1, toText(summaryRow.CuentaAccount)),
        expenseLeaves,
    );
    const standaloneNodes = rows
        .filter((row) => toText(row.CuentaParentAccount) === "")
        .map((row) => makeNode(`leaf-${toText(row.CuentaAccount)}`, toText(row.CuentaAccount), 1, row));
    const summaryNode = makeNode(
        "summary-root",
        toText(summaryRow.CuentaAccount),
        0,
        summaryRow,
        [incomeBranch, expenseBranch, ...standaloneNodes],
    );

    return [summaryNode];
}

export function filterPlHierarchy<TNode extends PlHierarchyNode>(nodes: TNode[], searchText: string): TNode[] {
    const normalizedSearch = searchText.trim().toLowerCase();
    if (!normalizedSearch) return nodes;

    return nodes.flatMap((node) => {
        const filteredChildren = filterPlHierarchy(node.children, searchText);
        const matchesSelf = [
            node.label,
            node.row.varianceLabel,
            node.row.Importe,
            node.row.Presupuesto,
            node.row.ImporteAA,
            node.row.Variacion,
            node.row.VariacionPct,
            node.row.VariacionAA,
            node.row.VariacionAAPct,
        ]
            .map((value) => String(value ?? "").toLowerCase())
            .some((value) => value.includes(normalizedSearch));

        if (!matchesSelf && filteredChildren.length === 0) {
            return [];
        }

        return [
            {
                ...node,
                children: filteredChildren,
                expandable: filteredChildren.length > 0,
            } as TNode,
        ];
    });
}

function rowTypeForNode(node: PlHierarchyNode): PlTreeRow["nodeType"] {
    if (node.depth === 0) return "summary";
    if (node.label === "Ingresos") return "income";
    if (node.label === "Gastos") return "expense";
    if (node.label === "EBITDA" || node.label === "Cash Flow") return "metric";
    return "leaf";
}

export function flattenHierarchyToTreeRows(nodes: PlHierarchyNode[]): PlTreeRow[] {
    return nodes.flatMap((node) => {
        const self: PlTreeRow = {
            ...node.row,
            id: node.id,
            nodeType: rowTypeForNode(node),
        };

        const children = flattenHierarchyToTreeRows(node.children).map((child) => ({
            ...child,
        }));

        return [self, ...children];
    });
}

export function mapHierarchyToTreeRows(nodes: PlHierarchyNode[]): PlTreeRow[] {
    return nodes.map((node) => ({
        ...node.row,
        id: node.id,
        nodeType: rowTypeForNode(node),
        subRows: mapHierarchyToTreeRows(node.children),
    }));
}
