import {
    AllCommunityModule as AgGridAllCommunityModule,
    ModuleRegistry as AgGridModuleRegistry,
} from "ag-grid-community";

let registered = false;

export function registerAgCommunityModules() {
    if (registered) return;

    AgGridModuleRegistry.registerModules([AgGridAllCommunityModule]);
    registered = true;
}
