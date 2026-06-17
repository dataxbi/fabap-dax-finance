import {
    AllEnterpriseModule as AgGridAllEnterpriseModule,
    ModuleRegistry as AgGridModuleRegistry,
} from "ag-grid-enterprise";
import {
    AllCommunityModule as AgChartsAllCommunityModule,
    ModuleRegistry as AgChartsModuleRegistry,
} from "ag-charts-community";

let registered = false;

export function registerAgCommunityModules() {
    if (registered) return;

    AgGridModuleRegistry.registerModules([AgGridAllEnterpriseModule]);
    AgChartsModuleRegistry.registerModules([AgChartsAllCommunityModule]);
    registered = true;
}
