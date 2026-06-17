import {
    AlertTriangle,
    ArrowDownCircle,
    ArrowUpCircle,
    BarChart3,
    Coins,
    Database,
    Landmark,
    RefreshCw,
    Table2,
    Wallet,
} from "lucide-react";
import { AgCharts } from "ag-charts-react";
import type { AgChartOptions } from "ag-charts-community";
import { AllEnterpriseModule } from "ag-grid-enterprise";
import {
    type ColDef,
    type CustomCellRendererProps,
    type ValueFormatterParams,
} from "ag-grid-community";
import { AgGridProvider, AgGridReact } from "ag-grid-react";
import { useMemo } from "react";
import { StatusCard } from "@/components/pl/status-card";
import { useSemanticModelQuery } from "@/hooks/use-semantic-model-query";
import { registerAgCommunityModules } from "@/lib/ag-community-modules";
import { formatCurrencyEs, formatPercentEs } from "@/lib/format";
import { toAgGridData, type GridRow } from "@/lib/ag-grid-data";
import {
    buildPlHierarchy,
    flattenHierarchyToTreeRows,
    getVarianceLabel,
    getVarianceTone,
    type PlGridRow,
    type PlTreeRow,
} from "@/lib/pl-grid";
import { toDataTable } from "@/lib/to-data-table";
import { monthTrend, plTable, yearSummary } from "@/queries/pl";

registerAgCommunityModules();

const isTest = import.meta.env.MODE === "test";

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
                <AlertTriangle className="mt-xxs icon-size-400 shrink-0 text-destructive" />
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
    return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function toComparisonTone(delta: number, sign: number) {
    const scoredDelta = delta * (sign === 0 ? 1 : sign);
    if (Math.abs(delta) < 0.5) return "neutral";
    return scoredDelta > 0 ? "positive" : scoredDelta < 0 ? "negative" : "neutral";
}

function signedPercentFromDelta(delta: unknown, pct: unknown) {
    const deltaNumber = typeof delta === "number" && Number.isFinite(delta) ? delta : 0;
    const pctNumber = typeof pct === "number" && Number.isFinite(pct) ? pct : 0;
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

function AutoGroupCell(params: CustomCellRendererProps<PlTreeRow>) {
    const type = params.data?.nodeType ?? "leaf";
    const label = String(params.valueFormatted ?? params.value ?? "");

    return (
        <div className="flex items-center gap-s">
            <span className="shrink-0">{nodeIconForType(type)}</span>
            <span
                className={
                    type === "summary" || type === "income" || type === "expense" || type === "metric"
                        ? "font-semibold"
                        : ""
                }
            >
                {label}
            </span>
        </div>
    );
}

function DeltaCell({
    value,
    data,
    tone,
    pctField,
}: CustomCellRendererProps<PlTreeRow> & {
    tone: "positive" | "negative" | "neutral";
    pctField: "VariacionPct" | "VariacionAAPct";
}) {
    if (!data) return null;
    const pctValue = signedPercentFromDelta(value, data[pctField]);
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
                className={`rounded-full px-s py-xxs text-200 leading-200 font-semibold ${
                    tone === "positive"
                        ? "pl-ui-chip-positive"
                        : tone === "negative"
                          ? "pl-ui-chip-negative"
                          : "pl-ui-chip-neutral"
                }`}
            >
                {formatPercentEs(pctValue)}
            </span>
        </div>
    );
}

export function PlReportShell() {
    const tableQuery = plTable();
    const yearlyQuery = yearSummary();
    const trendQuery = monthTrend();

    const plTableResult = useSemanticModelQuery({
        connection: tableQuery.connection,
        query: tableQuery.query,
    });
    const yearlyResult = useSemanticModelQuery({
        connection: yearlyQuery.connection,
        query: yearlyQuery.query,
    });
    const trendResult = useSemanticModelQuery({
        connection: trendQuery.connection,
        query: trendQuery.query,
    });

    const isLoading = plTableResult.isLoading || yearlyResult.isLoading || trendResult.isLoading;
    const networkError = firstError(plTableResult.error, yearlyResult.error, trendResult.error);
    const queryError =
        dataError(plTableResult.data) ?? dataError(yearlyResult.data) ?? dataError(trendResult.data);
    const errorMessage = networkError?.message ?? queryError;

    const yearlyRows = useMemo(() => {
        if (yearlyResult.data?.status !== "success") return [];
        return toAgGridData(yearlyResult.data.table, yearlyQuery.columnMetadata).rowData;
    }, [yearlyResult.data, yearlyQuery.columnMetadata]);

    const latestYear = yearlyRows.at(-1);
    const latestYearLabel = latestYear?.FechaYear != null ? String(latestYear.FechaYear) : "-";
    const latestImporte = toNumber(latestYear?.Importe);
    const latestPresupuesto = toNumber(latestYear?.Presupuesto);
    const latestPresupuestoAA = toNumber(latestYear?.PresupuestoAA);
    const latestImporteAA = toNumber(latestYear?.ImporteAA);
    const latestEbitda = toNumber(latestYear?.EBITDA);
    const latestEbitdaAA = toNumber(latestYear?.EBITDAAA);
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
            VariacionPct: latestPresupuesto === 0 ? undefined : (latestImporte - latestPresupuesto) / latestPresupuesto,
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

        const dataTable = toDataTable(plTableResult.data.table, tableQuery.columnMetadata);
        const converted = toAgGridData(
            { columns: plTableResult.data.table.columns, rows: dataTable.rows },
            tableQuery.columnMetadata,
        );

        return flattenHierarchyToTreeRows(buildPlHierarchy(converted.rowData, summaryRow));
    }, [plTableResult.data, summaryRow, tableQuery.columnMetadata]);

    const trendRows = useMemo(() => {
        if (trendResult.data?.status !== "success") return [];
        return toAgGridData(trendResult.data.table, trendQuery.columnMetadata).rowData;
    }, [trendResult.data, trendQuery.columnMetadata]);

    const chartOptions: AgChartOptions = useMemo(
        () => ({
            data: trendRows,
            background: { fill: "transparent" },
            series: [
                { type: "line", xKey: "FechaYearMonth", yKey: "Importe", yName: "Importe" },
                { type: "line", xKey: "FechaYearMonth", yKey: "Gastos", yName: "Gastos" },
                { type: "line", xKey: "FechaYearMonth", yKey: "EBITDA", yName: "EBITDA" },
            ],
            legend: { enabled: true },
        }),
        [trendRows],
    );

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

    const columnDefs = useMemo<ColDef<PlTreeRow>[]>(
        () => [
            {
                headerName: "Cuenta",
                showRowGroup: true,
                pinned: "left",
                minWidth: 280,
                filter: "agTextColumnFilter",
                cellRenderer: AutoGroupCell,
                valueFormatter: (params) => String(params.value ?? ""),
            },
            {
                field: "Importe",
                headerName: "Actual",
                filter: "agNumberColumnFilter",
                valueFormatter: (params: ValueFormatterParams<PlTreeRow>) => formatCurrencyEs(params.value),
                cellClass: "text-right",
            },
            {
                field: "Presupuesto",
                headerName: "Presupuesto",
                filter: "agNumberColumnFilter",
                valueFormatter: (params: ValueFormatterParams<PlTreeRow>) => formatCurrencyEs(params.value),
                cellClass: "text-right",
            },
            {
                field: "ImporteAA",
                headerName: "Año anterior",
                filter: "agNumberColumnFilter",
                valueFormatter: (params: ValueFormatterParams<PlTreeRow>) => formatCurrencyEs(params.value),
                cellClass: "text-right",
            },
            {
                field: "Variacion",
                headerName: "vs plan",
                filter: "agNumberColumnFilter",
                cellRenderer: (params: CustomCellRendererProps<PlTreeRow>) => (
                    <DeltaCell {...params} tone={params.data?.varianceTone ?? "neutral"} pctField="VariacionPct" />
                ),
                comparator: (left, right) => toNumber(left) - toNumber(right),
            },
            {
                field: "VariacionAA",
                headerName: "vs AA",
                filter: "agNumberColumnFilter",
                cellRenderer: (params: CustomCellRendererProps<PlTreeRow>) => (
                    <DeltaCell
                        {...params}
                        tone={toComparisonTone(toNumber(params.value), toNumber(params.data?.CuentaSign) || 1)}
                        pctField="VariacionAAPct"
                    />
                ),
                comparator: (left, right) => toNumber(left) - toNumber(right),
            },
        ],
        [],
    );

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
                            AG Grid Enterprise con tree data nativo, filtros por columna y ordenación integrada.
                        </p>
                    </div>
                    <div className="flex items-center gap-s text-200 leading-200 text-muted-foreground">
                        <span>{treeRows.length} nodos</span>
                        <Table2 className="icon-size-400" />
                    </div>
                </div>
                <div className="ag-theme-quartz overflow-hidden rounded-xl border border-border">
                    <AgGridProvider modules={[AllEnterpriseModule]}>
                        <AgGridReact<PlTreeRow>
                            theme="legacy"
                            rowData={treeRows}
                            columnDefs={columnDefs}
                            treeData
                            getDataPath={(data) => data.hierarchyPath}
                            groupDefaultExpanded={1}
                            animateRows
                            suppressDragLeaveHidesColumns
                            defaultColDef={{
                                sortable: true,
                                resizable: true,
                                flex: 1,
                                minWidth: 140,
                                filter: true,
                                suppressHeaderMenuButton: false,
                                suppressHeaderFilterButton: false,
                            }}
                            autoGroupColumnDef={{
                                headerName: "Cuenta",
                                minWidth: 320,
                                pinned: "left",
                                filter: "agTextColumnFilter",
                                cellRendererParams: {
                                    suppressCount: true,
                                },
                            }}
                            domLayout="autoHeight"
                            rowClassRules={{
                                "pl-grid-parent-row": (params) =>
                                    ["summary", "income", "expense", "metric"].includes(
                                        String(params.data?.nodeType ?? ""),
                                    ),
                            }}
                            overlayNoRowsTemplate="Sin datos P&L disponibles"
                        />
                    </AgGridProvider>
                </div>
            </section>

            <section className="rounded-xl border border-border bg-card p-l shadow-sm">
                <div className="mb-l">
                    <h2 className="text-500 leading-500 font-semibold text-card-foreground">
                        Tendencia de resultado
                    </h2>
                    <p className="mt-xs text-300 leading-300 text-muted-foreground">
                        Ultimos 24 meses por importe, gastos y EBITDA.
                    </p>
                </div>
                <div className="h-[320px] rounded-xl border border-border bg-card p-m">
                    {isTest ? (
                        <div className="flex h-full items-center justify-center text-300 leading-300 text-muted-foreground">
                            Grafico disponible en navegador
                        </div>
                    ) : (
                        <AgCharts options={chartOptions} />
                    )}
                </div>
            </section>
        </div>
    );
}
