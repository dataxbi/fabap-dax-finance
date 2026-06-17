import { AlertTriangle, BarChart3, Database, Table2 } from "lucide-react";
import { AgGridReact } from "ag-grid-react";
import type { ColDef } from "ag-grid-community";
import { StatusCard } from "@/components/pl/status-card";
import { registerAgCommunityModules } from "@/lib/ag-community-modules";
import type { GridRow } from "@/lib/ag-grid-data";

registerAgCommunityModules();

const emptyColumnDefs: ColDef<GridRow>[] = [];

function EmptyGridPreview() {
    return (
        <div className="ag-theme-quartz h-full min-h-[320px] overflow-hidden rounded-xl border border-border">
            <AgGridReact<GridRow>
                columnDefs={emptyColumnDefs}
                rowData={[]}
                overlayNoRowsTemplate="Sin datos P&L validados"
                suppressDragLeaveHidesColumns
            />
        </div>
    );
}

function EmptyChartPreview() {
    return (
        <div className="flex h-[320px] items-center justify-center rounded-xl border border-dashed border-border bg-secondary/60 p-l">
            <div className="text-center">
                <BarChart3 className="mx-auto icon-size-700 text-muted-foreground" />
                <p className="mt-m text-300 leading-300 font-medium text-card-foreground">
                    Sin consulta DAX validada
                </p>
                <p className="mt-xs max-w-[360px] text-200 leading-200 text-muted-foreground">
                    El gráfico AG Charts se renderizará cuando la serie temporal del modelo P&amp;L esté validada.
                </p>
            </div>
        </div>
    );
}

export function PlReportShell() {
    return (
        <div className="space-y-xxl">
            <section className="grid gap-l md:grid-cols-3">
                <StatusCard
                    label="Modelo"
                    value="plModel"
                    detail="Alias registrado en fabric.yaml"
                    tone="success"
                    icon={<Database className="icon-size-300" />}
                />
                <StatusCard
                    label="DAX"
                    value="Pendiente"
                    detail="La API de Fabric devuelve 401 al consultar el modelo"
                    tone="warning"
                    icon={<AlertTriangle className="icon-size-300" />}
                />
                <StatusCard
                    label="Visuales"
                    value="AG Grid / Charts"
                    detail="Librerías instaladas e integradas en el shell"
                    icon={<BarChart3 className="icon-size-300" />}
                />
            </section>

            <section className="rounded-xl border border-border bg-card p-l shadow-sm">
                <div className="mb-l flex items-center justify-between gap-l">
                    <div>
                        <h2 className="text-500 leading-500 font-semibold text-card-foreground">
                            Tabla P&amp;L
                        </h2>
                        <p className="mt-xs text-300 leading-300 text-muted-foreground">
                            La tabla se activará con columnas reales cuando las consultas DAX estén validadas.
                        </p>
                    </div>
                    <Table2 className="icon-size-400 text-muted-foreground" />
                </div>
                <EmptyGridPreview />
            </section>

            <section className="grid gap-l lg:grid-cols-3">
                <div className="rounded-xl border border-border bg-card p-l shadow-sm lg:col-span-2">
                    <div className="mb-l">
                        <h2 className="text-500 leading-500 font-semibold text-card-foreground">
                            Tendencia de resultado
                        </h2>
                        <p className="mt-xs text-300 leading-300 text-muted-foreground">
                            AG Charts queda preparado para la serie temporal del modelo P&amp;L.
                        </p>
                    </div>
                    <EmptyChartPreview />
                </div>

                <div className="rounded-xl border border-destructive/35 bg-destructive/5 p-l shadow-sm">
                    <div className="flex items-start gap-m">
                        <AlertTriangle className="mt-xxs icon-size-400 shrink-0 text-destructive" />
                        <div>
                            <h2 className="text-400 leading-400 font-semibold text-card-foreground">
                                Acceso a datos bloqueado
                            </h2>
                            <p className="mt-s text-300 leading-300 text-muted-foreground">
                                `npx fabric-app-data query plModel --file C:\tmp\pl-scope.dax`
                                devolvió Fabric API 401. No se han creado consultas P&amp;L ni metadatos
                                porque deben salir de la respuesta real del modelo.
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
