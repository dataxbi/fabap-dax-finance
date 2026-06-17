import {
    ArrowDownCircle,
    ArrowDownWideNarrow,
    ArrowUpCircle,
    ArrowUpNarrowWide,
    BarChart3,
    ChevronDown,
    ChevronRight,
    Coins,
    Database,
    Ellipsis,
    Filter,
    RefreshCw,
    Table2,
    Wallet,
    X,
} from "lucide-react";
import {
    flexRender,
    getCoreRowModel,
    getExpandedRowModel,
    getFilteredRowModel,
    getSortedRowModel,
    useReactTable,
    type Column,
    type ColumnDef,
    type ColumnFiltersState,
    type ColumnPinningState,
    type ExpandedState,
    type FilterFn,
    type Row,
    type SortingState,
    type VisibilityState,
} from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { StatusCard } from "@/components/pl/status-card";
import { useSemanticModelQuery } from "@/hooks/use-semantic-model-query";
import { formatCurrencyEs, formatPercentEs } from "@/lib/format";
import { queryTableToRows, type GridRow } from "@/lib/query-table-rows";
import {
    buildPlHierarchy,
    getVarianceLabel,
    getVarianceTone,
    mapHierarchyToTreeRows,
    type PlGridRow,
    type PlTreeRow,
} from "@/lib/pl-grid";
import { cn } from "@/lib/utils";
import { yearSummary, plTable } from "@/queries/pl";

interface NumericFilterValue {
    operator: "gte" | "lte" | "eq";
    value: string;
}

interface PlColumnMeta {
    align?: "left" | "right";
    filterType?: "text" | "number";
}

const initialExpanded: ExpandedState = {
    "summary-root": true,
};

const accountFilter: FilterFn<PlTreeRow> = (row, columnId, filterValue) => {
    const search = String(filterValue ?? "").trim().toLowerCase();
    if (!search) return true;
    return String(row.getValue(columnId) ?? "").toLowerCase().includes(search);
};

const numericFilter: FilterFn<PlTreeRow> = (row, columnId, filterValue) => {
    const nextFilter = filterValue as NumericFilterValue | undefined;
    if (!nextFilter?.value) return true;

    const candidate = toNumber(row.getValue(columnId));
    const reference = toNumber(nextFilter.value);

    if (candidate == null || reference == null) return false;

    if (nextFilter.operator === "lte") return candidate <= reference;
    if (nextFilter.operator === "eq") return candidate === reference;
    return candidate >= reference;
};

function LoadingBlock({ label }: { label: string }) {
    return (
        <div className="flex min-h-[220px] items-center justify-center rounded-xl border border-border bg-secondary/60">
            <div className="flex items-center gap-s text-300 leading-300 text-muted-foreground">
                <RefreshCw className="icon-size-300 animate-spin" />
                {label}
            </div>
        </div>
    );
}

function ErrorBlock({ message }: { message: string }) {
    return (
        <div className="rounded-xl border border-destructive/35 bg-destructive/5 p-l">
            <div className="flex items-start gap-m">
                <X className="mt-xxs icon-size-400 shrink-0 text-destructive" />
                <div>
                    <p className="text-300 leading-300 font-semibold text-card-foreground">
                        No se pudieron cargar los datos
                    </p>
                    <p className="mt-xs text-200 leading-200 text-muted-foreground">{message}</p>
                </div>
            </div>
        </div>
    );
}

function firstError(...errors: Array<Error | undefined>) {
    return errors.find(Boolean);
}

function dataError(data: ReturnType<typeof useSemanticModelQuery>["data"]) {
    return data?.status === "error" ? data.error.message : undefined;
}

function toNumber(value: unknown) {
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string" && value.trim() !== "") {
        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : undefined;
    }
    return undefined;
}

function toComparisonTone(delta: number, sign: number) {
    const scoredDelta = delta * (sign === 0 ? 1 : sign);
    if (Math.abs(delta) < 0.5) return "neutral";
    return scoredDelta > 0 ? "positive" : scoredDelta < 0 ? "negative" : "neutral";
}

function signedPercentFromDelta(delta: unknown, pct: unknown) {
    const deltaNumber = toNumber(delta) ?? 0;
    const pctNumber = toNumber(pct) ?? 0;
    const pctMagnitude = Math.abs(pctNumber);

    if (Math.abs(deltaNumber) < 0.5 || pctMagnitude === 0) {
        return 0;
    }

    return deltaNumber < 0 ? -pctMagnitude : pctMagnitude;
}

function comparisonText(value: number, pct: number | undefined) {
    const valueText = `${value >= 0 ? "+" : ""}${formatCurrencyEs(value)}`;
    const pctText = pct == null ? "" : `${pct >= 0 ? "+" : ""}${formatPercentEs(pct)}`;
    return pctText ? `${valueText} · ${pctText}` : valueText;
}

function nodeIconForType(type: PlTreeRow["nodeType"]) {
    if (type === "summary") return <Wallet className="icon-size-200 text-primary" />;
    if (type === "income") return <ArrowUpCircle className="icon-size-200 text-primary" />;
    if (type === "expense") return <ArrowDownCircle className="icon-size-200 text-destructive" />;
    if (type === "metric") return <Coins className="icon-size-200 text-primary" />;
    return <span className="pl-grid-leaf-dot" aria-hidden="true" />;
}

function rowSurfaceClass(nodeType: PlTreeRow["nodeType"]) {
    return nodeType === "leaf" ? "bg-card" : "bg-secondary/55";
}

function sortIndicator(column: Column<PlTreeRow>) {
    const sort = column.getIsSorted();

    if (sort === "asc") return <ArrowUpNarrowWide className="icon-size-200 text-primary" />;
    if (sort === "desc") return <ArrowDownWideNarrow className="icon-size-200 text-primary" />;
    return null;
}

function AccountCell({ row }: { row: Row<PlTreeRow> }) {
    const original = row.original;
    const canExpand = row.getCanExpand();
    const isExpanded = row.getIsExpanded();

    return (
        <div
            className="flex items-center gap-s"
            style={{ paddingLeft: `calc(${row.depth} * var(--spacing-l))` }}
        >
            <button
                type="button"
                onClick={canExpand ? row.getToggleExpandedHandler() : undefined}
                disabled={!canExpand}
                aria-label={canExpand ? (isExpanded ? "Contraer fila" : "Expandir fila") : "Fila sin hijos"}
                className={cn(
                    "flex h-7 w-7 items-center justify-center rounded-md border border-transparent text-muted-foreground transition-colors",
                    canExpand && "hover:border-border hover:bg-muted hover:text-foreground",
                    !canExpand && "cursor-default",
                )}
            >
                {canExpand ? (
                    isExpanded ? (
                        <ChevronDown className="icon-size-200" />
                    ) : (
                        <ChevronRight className="icon-size-200" />
                    )
                ) : (
                    <span className="h-4 w-4" aria-hidden="true" />
                )}
            </button>
            <span className="shrink-0">{nodeIconForType(original.nodeType)}</span>
            <span className={cn(original.nodeType !== "leaf" && "font-semibold")}>
                {String(row.getValue("account") ?? "")}
            </span>
        </div>
    );
}

function DeltaCell({
    value,
    pctValue,
    tone,
}: {
    value: unknown;
    pctValue: unknown;
    tone: "positive" | "negative" | "neutral";
}) {
    const indicator = tone === "positive" ? "▲" : tone === "negative" ? "▼" : "•";

    return (
        <div className="flex items-center justify-end gap-s">
            <span className={`pl-grid-indicator pl-grid-indicator-${tone}`}>
                <span aria-hidden="true" className="pl-grid-indicator-icon">
                    {indicator}
                </span>
                <span>{formatCurrencyEs(value)}</span>
            </span>
            <span
                className={cn(
                    "rounded-full px-s py-xxs text-200 leading-200 font-semibold",
                    tone === "positive" && "pl-ui-chip-positive",
                    tone === "negative" && "pl-ui-chip-negative",
                    tone === "neutral" && "pl-ui-chip-neutral",
                )}
            >
                {formatPercentEs(pctValue)}
            </span>
        </div>
    );
}

function ColumnHeaderButton({
    active,
    label,
    onClick,
    children,
}: {
    active?: boolean;
    label: string;
    onClick: () => void;
    children: React.ReactNode;
}) {
    return (
        <button
            type="button"
            aria-label={label}
            onClick={onClick}
            className={cn(
                "flex h-8 w-8 items-center justify-center rounded-md border border-transparent text-muted-foreground transition-colors hover:border-border hover:bg-card hover:text-foreground",
                active && "border-border bg-card text-primary",
            )}
        >
            {children}
        </button>
    );
}

function TextFilterPanel({
    column,
    onClose,
}: {
    column: Column<PlTreeRow>;
    onClose: () => void;
}) {
    return (
        <div className="absolute right-0 top-full z-20 mt-xs w-64 rounded-xl border border-border bg-popover p-m shadow-lg">
            <div className="mb-s flex items-center justify-between gap-s">
                <p className="text-200 leading-200 font-semibold text-popover-foreground">Filtrar cuenta</p>
                <button
                    type="button"
                    onClick={onClose}
                    className="rounded-md p-xxs text-muted-foreground hover:bg-muted hover:text-foreground"
                    aria-label="Cerrar filtro"
                >
                    <X className="icon-size-200" />
                </button>
            </div>
            <input
                autoFocus
                value={String(column.getFilterValue() ?? "")}
                onChange={(event) => column.setFilterValue(event.target.value)}
                placeholder="Buscar cuenta"
                className="w-full rounded-lg border border-input bg-background px-m py-s text-300 leading-300 text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            <div className="mt-m flex justify-end">
                <button
                    type="button"
                    onClick={() => {
                        column.setFilterValue(undefined);
                        onClose();
                    }}
                    className="rounded-lg border border-border px-m py-s text-200 leading-200 font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                    Limpiar
                </button>
            </div>
        </div>
    );
}

function NumericFilterPanel({
    column,
    onClose,
}: {
    column: Column<PlTreeRow>;
    onClose: () => void;
}) {
    const filter = (column.getFilterValue() as NumericFilterValue | undefined) ?? {
        operator: "gte" as const,
        value: "",
    };

    return (
        <div className="absolute right-0 top-full z-20 mt-xs w-72 rounded-xl border border-border bg-popover p-m shadow-lg">
            <div className="mb-s flex items-center justify-between gap-s">
                <p className="text-200 leading-200 font-semibold text-popover-foreground">Filtrar valores</p>
                <button
                    type="button"
                    onClick={onClose}
                    className="rounded-md p-xxs text-muted-foreground hover:bg-muted hover:text-foreground"
                    aria-label="Cerrar filtro"
                >
                    <X className="icon-size-200" />
                </button>
            </div>
            <div className="grid gap-s sm:grid-cols-[120px_minmax(0,1fr)]">
                <select
                    value={filter.operator}
                    onChange={(event) =>
                        column.setFilterValue({
                            operator: event.target.value as NumericFilterValue["operator"],
                            value: filter.value,
                        })
                    }
                    className="rounded-lg border border-input bg-background px-m py-s text-300 leading-300 text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                    <option value="gte">Mayor o igual</option>
                    <option value="lte">Menor o igual</option>
                    <option value="eq">Igual a</option>
                </select>
                <input
                    autoFocus
                    inputMode="decimal"
                    value={filter.value}
                    onChange={(event) =>
                        column.setFilterValue({
                            operator: filter.operator,
                            value: event.target.value,
                        })
                    }
                    placeholder="Escribe un importe"
                    className="w-full rounded-lg border border-input bg-background px-m py-s text-300 leading-300 text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
            </div>
            <div className="mt-m flex justify-end">
                <button
                    type="button"
                    onClick={() => {
                        column.setFilterValue(undefined);
                        onClose();
                    }}
                    className="rounded-lg border border-border px-m py-s text-200 leading-200 font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                    Limpiar
                </button>
            </div>
        </div>
    );
}

function ColumnMenuPanel({
    column,
    columns,
    onClose,
}: {
    column: Column<PlTreeRow>;
    columns: Column<PlTreeRow>[];
    onClose: () => void;
}) {
    return (
        <div className="absolute right-0 top-full z-20 mt-xs w-72 rounded-xl border border-border bg-popover p-m shadow-lg">
            <div className="mb-s flex items-center justify-between gap-s">
                <p className="text-200 leading-200 font-semibold text-popover-foreground">Opciones de columna</p>
                <button
                    type="button"
                    onClick={onClose}
                    className="rounded-md p-xxs text-muted-foreground hover:bg-muted hover:text-foreground"
                    aria-label="Cerrar menu"
                >
                    <X className="icon-size-200" />
                </button>
            </div>

            <div className="space-y-xs border-b border-border pb-m">
                <button
                    type="button"
                    onClick={() => {
                        column.toggleSorting(false);
                        onClose();
                    }}
                    className="flex w-full items-center gap-s rounded-lg px-m py-s text-left text-200 leading-200 text-popover-foreground hover:bg-muted"
                >
                    <ArrowUpNarrowWide className="icon-size-200" />
                    Orden ascendente
                </button>
                <button
                    type="button"
                    onClick={() => {
                        column.toggleSorting(true);
                        onClose();
                    }}
                    className="flex w-full items-center gap-s rounded-lg px-m py-s text-left text-200 leading-200 text-popover-foreground hover:bg-muted"
                >
                    <ArrowDownWideNarrow className="icon-size-200" />
                    Orden descendente
                </button>
                <button
                    type="button"
                    onClick={() => {
                        column.clearSorting();
                        onClose();
                    }}
                    className="flex w-full items-center gap-s rounded-lg px-m py-s text-left text-200 leading-200 text-popover-foreground hover:bg-muted"
                >
                    <X className="icon-size-200" />
                    Limpiar ordenación
                </button>
            </div>

            <div className="mt-m space-y-xs">
                <p className="px-m text-200 leading-200 font-semibold text-muted-foreground">Columnas visibles</p>
                {columns
                    .filter((item) => item.getCanHide())
                    .map((item) => (
                        <label
                            key={item.id}
                            className="flex items-center justify-between gap-s rounded-lg px-m py-s text-200 leading-200 text-popover-foreground hover:bg-muted"
                        >
                            <span>{String(item.columnDef.header ?? item.id)}</span>
                            <input
                                type="checkbox"
                                checked={item.getIsVisible()}
                                onChange={item.getToggleVisibilityHandler()}
                                className="h-4 w-4 rounded border-border accent-[var(--color-primary)]"
                            />
                        </label>
                    ))}
            </div>
        </div>
    );
}

export function PlReportShell() {
    const tableQuery = plTable();
    const yearlyQuery = yearSummary();

    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [expanded, setExpanded] = useState<ExpandedState>(initialExpanded);
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
    const [columnPinning, setColumnPinning] = useState<ColumnPinningState>({
        left: ["account"],
        right: [],
    });
    const [openFilterColumnId, setOpenFilterColumnId] = useState<string | null>(null);
    const [openMenuColumnId, setOpenMenuColumnId] = useState<string | null>(null);

    const plTableResult = useSemanticModelQuery({
        connection: tableQuery.connection,
        query: tableQuery.query,
    });
    const yearlyResult = useSemanticModelQuery({
        connection: yearlyQuery.connection,
        query: yearlyQuery.query,
    });

    const isLoading = plTableResult.isLoading || yearlyResult.isLoading;
    const networkError = firstError(plTableResult.error, yearlyResult.error);
    const queryError = dataError(plTableResult.data) ?? dataError(yearlyResult.data);
    const errorMessage = networkError?.message ?? queryError;

    const yearlyRows = useMemo(() => {
        if (yearlyResult.data?.status !== "success") return [];
        return queryTableToRows(yearlyResult.data.table, yearlyQuery.columnMetadata);
    }, [yearlyResult.data, yearlyQuery.columnMetadata]);

    const latestYear = yearlyRows.at(-1);
    const latestYearLabel = latestYear?.FechaYear != null ? String(latestYear.FechaYear) : "-";
    const latestImporte = toNumber(latestYear?.Importe) ?? 0;
    const latestPresupuesto = toNumber(latestYear?.Presupuesto) ?? 0;
    const latestPresupuestoAA = toNumber(latestYear?.PresupuestoAA) ?? 0;
    const latestImporteAA = toNumber(latestYear?.ImporteAA) ?? 0;
    const latestEbitda = toNumber(latestYear?.EBITDA) ?? 0;
    const latestEbitdaAA = toNumber(latestYear?.EBITDAAA) ?? 0;
    const previousYearLabel =
        latestYear?.FechaYear != null && Number.isFinite(Number(latestYear.FechaYear))
            ? String(Number(latestYear.FechaYear) - 1)
            : "año anterior";

    const summaryRow = useMemo<PlGridRow | undefined>(() => {
        if (!latestYear) return undefined;

        const row: GridRow = {
            CuentaAccount: `Resumen ${latestYearLabel}`,
            CuentaSign: 1,
            Importe: latestImporte,
            Presupuesto: latestPresupuesto,
            ImporteAA: latestImporteAA,
            Variacion: latestImporte - latestPresupuesto,
            VariacionPct:
                latestPresupuesto === 0 ? undefined : (latestImporte - latestPresupuesto) / latestPresupuesto,
            VariacionAA: latestImporte - latestImporteAA,
            VariacionAAPct: latestImporteAA === 0 ? undefined : (latestImporte - latestImporteAA) / latestImporteAA,
        };

        return {
            ...row,
            varianceLabel: getVarianceLabel(row),
            varianceTone: getVarianceTone(row),
        };
    }, [latestImporte, latestImporteAA, latestPresupuesto, latestYear, latestYearLabel]);

    const treeRows = useMemo(() => {
        if (plTableResult.data?.status !== "success" || !summaryRow) return [] as PlTreeRow[];

        const rows = queryTableToRows(plTableResult.data.table, tableQuery.columnMetadata);
        return mapHierarchyToTreeRows(buildPlHierarchy(rows, summaryRow));
    }, [plTableResult.data, summaryRow, tableQuery.columnMetadata]);

    const importeVsBudget = latestImporte - latestPresupuesto;
    const importeVsBudgetPct = latestPresupuesto === 0 ? undefined : importeVsBudget / latestPresupuesto;
    const importeVsBudgetTone = toComparisonTone(importeVsBudget, 1);
    const importeVsYear = latestImporte - latestImporteAA;
    const importeVsYearPct = latestImporteAA === 0 ? undefined : importeVsYear / latestImporteAA;
    const importeVsYearTone = toComparisonTone(importeVsYear, 1);
    const presupuestoVsYear = latestPresupuesto - latestPresupuestoAA;
    const presupuestoVsYearPct =
        latestPresupuestoAA === 0 ? undefined : presupuestoVsYear / latestPresupuestoAA;
    const presupuestoVsYearTone = toComparisonTone(presupuestoVsYear, 1);
    const ebitdaVsYear = latestEbitda - latestEbitdaAA;
    const ebitdaVsYearPct = latestEbitdaAA === 0 ? undefined : ebitdaVsYear / latestEbitdaAA;
    const ebitdaVsYearTone = toComparisonTone(ebitdaVsYear, 1);

    const columns = useMemo<ColumnDef<PlTreeRow>[]>(
        () => [
            {
                id: "account",
                accessorKey: "CuentaAccount",
                header: "Cuenta",
                enableHiding: false,
                filterFn: accountFilter,
                meta: { align: "left", filterType: "text" } satisfies PlColumnMeta,
                cell: ({ row }) => <AccountCell row={row} />,
            },
            {
                id: "Importe",
                accessorKey: "Importe",
                header: "Actual",
                filterFn: numericFilter,
                meta: { align: "right", filterType: "number" } satisfies PlColumnMeta,
                cell: ({ getValue }) => formatCurrencyEs(getValue()),
            },
            {
                id: "Presupuesto",
                accessorKey: "Presupuesto",
                header: "Presupuesto",
                filterFn: numericFilter,
                meta: { align: "right", filterType: "number" } satisfies PlColumnMeta,
                cell: ({ getValue }) => formatCurrencyEs(getValue()),
            },
            {
                id: "ImporteAA",
                accessorKey: "ImporteAA",
                header: "Año anterior",
                filterFn: numericFilter,
                meta: { align: "right", filterType: "number" } satisfies PlColumnMeta,
                cell: ({ getValue }) => formatCurrencyEs(getValue()),
            },
            {
                id: "Variacion",
                accessorKey: "Variacion",
                header: "vs plan",
                filterFn: numericFilter,
                meta: { align: "right", filterType: "number" } satisfies PlColumnMeta,
                cell: ({ row, getValue }) => (
                    <DeltaCell
                        value={getValue()}
                        pctValue={signedPercentFromDelta(getValue(), row.original.VariacionPct)}
                        tone={row.original.varianceTone ?? "neutral"}
                    />
                ),
            },
            {
                id: "VariacionAA",
                accessorKey: "VariacionAA",
                header: "vs AA",
                filterFn: numericFilter,
                meta: { align: "right", filterType: "number" } satisfies PlColumnMeta,
                cell: ({ row, getValue }) => (
                    <DeltaCell
                        value={getValue()}
                        pctValue={signedPercentFromDelta(getValue(), row.original.VariacionAAPct)}
                        tone={toComparisonTone(
                            toNumber(getValue()) ?? 0,
                            toNumber(row.original.CuentaSign) ?? 1,
                        )}
                    />
                ),
            },
        ],
        [],
    );

    const table = useReactTable({
        data: treeRows,
        columns,
        state: {
            sorting,
            expanded,
            columnFilters,
            columnVisibility,
            columnPinning,
        },
        onSortingChange: setSorting,
        onExpandedChange: setExpanded,
        onColumnFiltersChange: setColumnFilters,
        onColumnVisibilityChange: setColumnVisibility,
        onColumnPinningChange: setColumnPinning,
        filterFns: {
            accountFilter,
            numericFilter,
        },
        getSubRows: (row) => row.subRows ?? [],
        getRowId: (row) => row.id,
        getCoreRowModel: getCoreRowModel(),
        getExpandedRowModel: getExpandedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getSortedRowModel: getSortedRowModel(),
        filterFromLeafRows: true,
    });

    return (
        <div className="space-y-xxl">
            <section className="grid gap-l md:grid-cols-3">
                <StatusCard
                    label={`Importe ${latestYearLabel}`}
                    value={formatCurrencyEs(latestImporte)}
                    detail="Medida [Importe] del modelo P&L"
                    tone="success"
                    icon={<Database className="icon-size-300" />}
                    comparisons={[
                        {
                            label: "vs presupuesto",
                            value: comparisonText(importeVsBudget, importeVsBudgetPct),
                            tone: importeVsBudgetTone === "neutral" ? "default" : importeVsBudgetTone,
                        },
                        {
                            label: `vs ${previousYearLabel}`,
                            value: comparisonText(importeVsYear, importeVsYearPct),
                            tone: importeVsYearTone === "neutral" ? "default" : importeVsYearTone,
                        },
                    ]}
                />
                <StatusCard
                    label={`Presupuesto ${latestYearLabel}`}
                    value={formatCurrencyEs(latestPresupuesto)}
                    detail="Medida [Presupuesto]"
                    icon={<Table2 className="icon-size-300" />}
                    comparisons={[
                        {
                            label: `vs ${previousYearLabel}`,
                            value: comparisonText(presupuestoVsYear, presupuestoVsYearPct),
                            tone: presupuestoVsYearTone === "neutral" ? "default" : presupuestoVsYearTone,
                        },
                    ]}
                />
                <StatusCard
                    label={`EBITDA ${latestYearLabel}`}
                    value={formatCurrencyEs(latestEbitda)}
                    detail="Medida [EBITDA]"
                    icon={<BarChart3 className="icon-size-300" />}
                    comparisons={[
                        {
                            label: `vs ${previousYearLabel}`,
                            value: comparisonText(ebitdaVsYear, ebitdaVsYearPct),
                            tone: ebitdaVsYearTone === "neutral" ? "default" : ebitdaVsYearTone,
                        },
                    ]}
                />
            </section>

            {isLoading ? <LoadingBlock label="Cargando datos reales de Fabric..." /> : null}
            {errorMessage ? <ErrorBlock message={errorMessage} /> : null}

            <section className="rounded-xl border border-border bg-card p-l shadow-sm">
                <div className="mb-l flex items-center justify-between gap-l">
                    <div>
                        <h2 className="text-500 leading-500 font-semibold text-card-foreground">
                            Tabla P&amp;L
                        </h2>
                        <p className="mt-xs text-300 leading-300 text-muted-foreground">
                            TanStack Table con jerarquía, filtros por columna y menú de cabecera propio.
                        </p>
                    </div>
                    <div className="flex items-center gap-s text-200 leading-200 text-muted-foreground">
                        <span>{treeRows.length} nodos</span>
                        <Table2 className="icon-size-400" />
                    </div>
                </div>

                <div className="overflow-auto rounded-xl border border-border">
                    <table className="pl-finance-table min-w-full border-separate border-spacing-0">
                        <thead>
                            {table.getHeaderGroups().map((headerGroup) => (
                                <tr key={headerGroup.id} className="bg-secondary">
                                    {headerGroup.headers.map((header) => {
                                        const meta = header.column.columnDef.meta as PlColumnMeta | undefined;
                                        const isAccount = header.column.id === "account";
                                        const filterType = meta?.filterType;
                                        const headerLabel = String(header.column.columnDef.header ?? header.column.id);

                                        return (
                                            <th
                                                key={header.id}
                                                className={cn(
                                                    "relative border-b border-border px-m py-s text-200 leading-200 font-semibold text-secondary-foreground",
                                                    meta?.align === "right" ? "text-right" : "text-left",
                                                    isAccount && "sticky left-0 z-10 min-w-[320px] bg-secondary",
                                                    !isAccount && "min-w-[160px]",
                                                )}
                                            >
                                                {header.isPlaceholder ? null : (
                                                    <div className="flex items-center justify-between gap-s">
                                                        <div className="flex min-w-0 items-center gap-s">
                                                            <span className="truncate">
                                                                {flexRender(
                                                                    header.column.columnDef.header,
                                                                    header.getContext(),
                                                                )}
                                                            </span>
                                                            {sortIndicator(header.column)}
                                                        </div>
                                                        <div className="flex items-center gap-xs">
                                                            {filterType ? (
                                                                <ColumnHeaderButton
                                                                    active={header.column.getIsFiltered()}
                                                                    label={`Filtrar columna ${headerLabel}`}
                                                                    onClick={() => {
                                                                        setOpenMenuColumnId(null);
                                                                        setOpenFilterColumnId((current) =>
                                                                            current === header.column.id
                                                                                ? null
                                                                                : header.column.id,
                                                                        );
                                                                    }}
                                                                >
                                                                    <Filter className="icon-size-200" />
                                                                </ColumnHeaderButton>
                                                            ) : null}
                                                            <ColumnHeaderButton
                                                                active={openMenuColumnId === header.column.id}
                                                                label={`Opciones de columna ${headerLabel}`}
                                                                onClick={() => {
                                                                    setOpenFilterColumnId(null);
                                                                    setOpenMenuColumnId((current) =>
                                                                        current === header.column.id
                                                                            ? null
                                                                            : header.column.id,
                                                                    );
                                                                }}
                                                            >
                                                                <Ellipsis className="icon-size-200" />
                                                            </ColumnHeaderButton>
                                                        </div>
                                                    </div>
                                                )}

                                                {openFilterColumnId === header.column.id && filterType === "text" ? (
                                                    <TextFilterPanel
                                                        column={header.column}
                                                        onClose={() => setOpenFilterColumnId(null)}
                                                    />
                                                ) : null}

                                                {openFilterColumnId === header.column.id && filterType === "number" ? (
                                                    <NumericFilterPanel
                                                        column={header.column}
                                                        onClose={() => setOpenFilterColumnId(null)}
                                                    />
                                                ) : null}

                                                {openMenuColumnId === header.column.id ? (
                                                    <ColumnMenuPanel
                                                        column={header.column}
                                                        columns={table.getAllLeafColumns()}
                                                        onClose={() => setOpenMenuColumnId(null)}
                                                    />
                                                ) : null}
                                            </th>
                                        );
                                    })}
                                </tr>
                            ))}
                        </thead>
                        <tbody>
                            {table.getRowModel().rows.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={table.getAllLeafColumns().length}
                                        className="px-l py-xxl text-center text-300 leading-300 text-muted-foreground"
                                    >
                                        Sin datos P&amp;L disponibles
                                    </td>
                                </tr>
                            ) : (
                                table.getRowModel().rows.map((row) => {
                                    const rowSurface = rowSurfaceClass(row.original.nodeType);

                                    return (
                                        <tr
                                            key={row.id}
                                            className={cn(
                                                "group border-b border-border/70 transition-colors hover:bg-hover/60",
                                                rowSurface,
                                            )}
                                        >
                                            {row.getVisibleCells().map((cell) => {
                                                const meta = cell.column.columnDef.meta as PlColumnMeta | undefined;
                                                const isAccount = cell.column.id === "account";

                                                return (
                                                    <td
                                                        key={cell.id}
                                                        className={cn(
                                                            "border-b border-border/70 px-m py-s text-300 leading-300 text-card-foreground",
                                                            meta?.align === "right"
                                                                ? "text-right font-numeric"
                                                                : "text-left",
                                                            isAccount &&
                                                                cn(
                                                                    "sticky left-0 z-[1]",
                                                                    rowSurface,
                                                                ),
                                                        )}
                                                    >
                                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
}
