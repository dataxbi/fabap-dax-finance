import {
    AllCommunityModule as AgGridAllCommunityModule,
    ModuleRegistry as AgGridModuleRegistry,
} from "ag-grid-community";
import {
    AllCommunityModule as AgChartsAllCommunityModule,
    ModuleRegistry as AgChartsModuleRegistry,
} from "ag-charts-community";

let registered = false;

export function registerAgCommunityModules() {
    if (registered) return;

    AgGridModuleRegistry.registerModules([AgGridAllCommunityModule]);
    AgChartsModuleRegistry.registerModules([AgChartsAllCommunityModule]);
    registered = true;
}
