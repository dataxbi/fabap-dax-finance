import { AlertTriangle, BarChart3, Database, RefreshCw, Search, Table2 } from "lucide-react";
import { AgGridProvider, AgGridReact } from "ag-grid-react";
import { AllCommunityModule, type CellClassParams, type ColDef } from "ag-grid-community";
import { AgCharts } from "ag-charts-react";
import type { AgChartOptions } from "ag-charts-community";
import { useMemo, useState } from "react";
import { StatusCard } from "@/components/pl/status-card";
import { registerAgCommunityModules } from "@/lib/ag-community-modules";
import { formatCurrencyEs } from "@/lib/format";
import { toAgGridData, type GridRow } from "@/lib/ag-grid-data";
import { toDataTable } from "@/lib/to-data-table";
import { useSemanticModelQuery } from "@/hooks/use-semantic-model-query";
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

export function PlReportShell() {
    const [quickFilter, setQuickFilter] = useState("");
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

    const gridData = useMemo(() => {
        if (plTableResult.data?.status !== "success") {
            return { columnDefs: [] as ColDef<GridRow>[], rowData: [] as GridRow[] };
        }

        const dataTable = toDataTable(plTableResult.data.table, tableQuery.columnMetadata);
        const converted = toAgGridData(
            { columns: plTableResult.data.table.columns, rows: dataTable.rows },
            tableQuery.columnMetadata,
        );

        return {
            rowData: converted.rowData,
            columnDefs: converted.columnDefs.map((column) => ({
                ...column,
                hide: ["CuentaOrder", "CuentaLevel", "CuentaSign"].includes(String(column.field)),
                flex: column.field === "CuentaAccount" ? 1.4 : 1,
                minWidth: column.field === "CuentaAccount" ? 180 : 120,
                pinned: column.field === "CuentaAccount" ? ("left" as const) : undefined,
                floatingFilter: !["CuentaOrder", "CuentaLevel", "CuentaSign"].includes(
                    String(column.field),
                ),
                filter:
                    column.field === "CuentaAccount" ? "agTextColumnFilter" : "agNumberColumnFilter",
                cellClassRules:
                    column.field === "Variacion" || column.field === "VariacionPct"
                        ? {
                              "pl-grid-positive": (params: CellClassParams<GridRow>) =>
                                  toNumber(params.value) > 0,
                              "pl-grid-negative": (params: CellClassParams<GridRow>) =>
                                  toNumber(params.value) < 0,
                              "pl-grid-neutral": (params: CellClassParams<GridRow>) =>
                                  toNumber(params.value) === 0,
                          }
                        : undefined,
            })),
        };
    }, [plTableResult.data, tableQuery.columnMetadata]);

    const yearlyRows = useMemo(() => {
        if (yearlyResult.data?.status !== "success") return [];
        return toAgGridData(yearlyResult.data.table, yearlyQuery.columnMetadata).rowData;
    }, [yearlyResult.data, yearlyQuery.columnMetadata]);

    const latestYear = yearlyRows.at(-1);
    const latestYearLabel = latestYear?.FechaYear != null ? String(latestYear.FechaYear) : "-";
    const latestImporte = toNumber(latestYear?.Importe);
    const latestPresupuesto = toNumber(latestYear?.Presupuesto);
    const latestEbitda = toNumber(latestYear?.EBITDA);
    const tableRowCount = gridData.rowData.length;
    const summaryRow = useMemo<GridRow | undefined>(() => {
        if (!latestYear) return undefined;
        return {
            CuentaAccount: `Resumen ${latestYearLabel}`,
            Importe: latestImporte,
            Presupuesto: latestPresupuesto,
            Variacion: latestImporte - latestPresupuesto,
            VariacionPct:
                latestPresupuesto === 0 ? undefined : (latestImporte - latestPresupuesto) / latestPresupuesto,
        };
    }, [latestImporte, latestPresupuesto, latestYear, latestYearLabel]);

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

    return (
        <div className="space-y-xxl">
            <section className="grid gap-l md:grid-cols-3">
                <StatusCard
                    label={`Importe ${latestYearLabel}`}
                    value={formatCurrencyEs(latestImporte)}
                    detail="Medida [Importe] del modelo P&L"
                    tone="success"
                    icon={<Database className="icon-size-300" />}
                />
                <StatusCard
                    label={`Presupuesto ${latestYearLabel}`}
                    value={formatCurrencyEs(latestPresupuesto)}
                    detail="Medida [Presupuesto]"
                    icon={<Table2 className="icon-size-300" />}
                />
                <StatusCard
                    label={`EBITDA ${latestYearLabel}`}
                    value={formatCurrencyEs(latestEbitda)}
                    detail="Medida [EBITDA]"
                    icon={<BarChart3 className="icon-size-300" />}
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
                            Cuentas ordenadas por el modelo con importe, presupuesto y variacion.
                        </p>
                    </div>
                    <div className="flex items-center gap-s text-200 leading-200 text-muted-foreground">
                        <span>{tableRowCount} filas</span>
                        <Table2 className="icon-size-400" />
                    </div>
                </div>
                <div className="mb-l flex flex-wrap items-center gap-m">
                    <label className="flex min-w-[240px] flex-1 items-center gap-s rounded-lg border border-input bg-background px-m py-s text-300 leading-300 text-muted-foreground">
                        <Search className="icon-size-200 shrink-0" />
                        <input
                            value={quickFilter}
                            onChange={(event) => setQuickFilter(event.target.value)}
                            className="w-full bg-transparent text-card-foreground outline-none placeholder:text-muted-foreground"
                            placeholder="Buscar cuenta o importe"
                        />
                    </label>
                </div>
                <div className="ag-theme-quartz overflow-hidden rounded-xl border border-border">
                    <AgGridProvider modules={[AllCommunityModule]}>
                        <AgGridReact<GridRow>
                            key={gridData.columnDefs.length}
                            theme="legacy"
                            columnDefs={gridData.columnDefs}
                            rowData={gridData.rowData}
                            pinnedBottomRowData={summaryRow ? [summaryRow] : []}
                            quickFilterText={quickFilter}
                            defaultColDef={{
                                flex: 1,
                                minWidth: 120,
                                sortable: true,
                                resizable: true,
                            }}
                            domLayout="autoHeight"
                            rowSelection={{ mode: "multiRow", enableClickSelection: true }}
                            rowClassRules={{
                                "pl-grid-highlight-row": (params) =>
                                    ["EBITDA", "Cash Flow"].includes(
                                        String(params.data?.CuentaAccount ?? ""),
                                    ),
                            }}
                            animateRows
                            overlayNoRowsTemplate="Sin datos P&L disponibles"
                            suppressDragLeaveHidesColumns
                        />
                    </AgGridProvider>
                </div>
            </section>

            <section className="grid gap-l lg:grid-cols-3">
                <div className="rounded-xl border border-border bg-card p-l shadow-sm lg:col-span-2">
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
                </div>

                <div className="rounded-xl border border-border bg-card p-l shadow-sm">
                    <div className="flex items-start gap-m">
                        <Database className="mt-xxs icon-size-400 shrink-0 text-primary" />
                        <div>
                            <h2 className="text-400 leading-400 font-semibold text-card-foreground">
                                Modelo conectado
                            </h2>
                            <p className="mt-s text-300 leading-300 text-muted-foreground">
                                Las consultas DAX de esta vista fueron validadas con `plModel`
                                usando los nombres de columnas devueltos por el CLI.
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
