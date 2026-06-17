//-----------------------------------------------------------------------
// <copyright company="Microsoft Corporation">
//        Copyright (c) Microsoft Corporation.  All rights reserved.
//        Licensed under the MIT license. See LICENSE file in the project root for full license information.
// </copyright>
//-----------------------------------------------------------------------

import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import App from "@/App";

vi.mock("@/hooks/use-semantic-model-query", () => ({
    useSemanticModelQuery: ({ query }: { query: string }) => {
        if (query.includes("'Cuenta'[Account]")) {
            return {
                data: {
                    status: "success",
                    table: {
                        columns: [
                            { name: "Cuenta[Order]", dataType: "unknown" },
                            { name: "Cuenta[Level]", dataType: "unknown" },
                            { name: "Cuenta[Account]", dataType: "unknown" },
                            { name: "Cuenta[Parent Account]", dataType: "unknown" },
                            { name: "Cuenta[Sign]", dataType: "unknown" },
                            { name: "[Importe]", dataType: "unknown" },
                            { name: "[Presupuesto]", dataType: "unknown" },
                            { name: "[Importe AA]", dataType: "unknown" },
                            { name: "[Variacion]", dataType: "unknown" },
                            { name: "[Variacion %]", dataType: "unknown" },
                            { name: "[Variacion AA]", dataType: "unknown" },
                            { name: "[Variacion AA %]", dataType: "unknown" },
                        ],
                        rows: [
                            [1, 2, "Producto A", "Ingresos", 1, 42000000, 39000000, 40000000, 3000000, 0.0769, 2000000, 0.05],
                            [2, 2, "Producto B", "Ingresos", 1, 22000000, 21000000, 20500000, 1000000, 0.0476, 1500000, 0.0732],
                            [3, 2, "Personal", "Gastos", -1, 18000000, 19000000, 17500000, -1000000, -0.0526, 500000, 0.0286],
                            [4, 1, "EBITDA", "", 1, 7411992.21, 6200000, 6800000, 1211992.21, 0.1955, 611992.21, 0.09],
                            [5, 1, "Cash Flow", "", 1, 6668530.78, 5900000, 6100000, 768530.78, 0.1303, 568530.78, 0.0932],
                        ],
                    },
                    requestId: "test",
                    fromCache: false,
                },
                isLoading: false,
                error: undefined,
                refetch: vi.fn(),
            };
        }

        return {
            data: {
                status: "success",
                table: {
                    columns: [
                        { name: "Fecha[Year]", dataType: "unknown" },
                        { name: "[Importe]", dataType: "unknown" },
                        { name: "[Presupuesto]", dataType: "unknown" },
                        { name: "[Presupuesto AA]", dataType: "unknown" },
                        { name: "[Importe AA]", dataType: "unknown" },
                        { name: "[Gastos]", dataType: "unknown" },
                        { name: "[EBITDA]", dataType: "unknown" },
                        { name: "[EBITDA AA]", dataType: "unknown" },
                        { name: "[Cash Flow]", dataType: "unknown" },
                    ],
                    rows: [[2026, 96197251.87, 44630861.6, 42000000, 93000000, 37485867.28, 7411992.21, 6800000, 6668530.78]],
                },
                requestId: "test",
                fromCache: false,
            },
            isLoading: false,
            error: undefined,
            refetch: vi.fn(),
        };
    },
}));

describe("App", () => {
    it("renders without throwing", () => {
        expect(() => render(<App />)).not.toThrow();
    });

    it("shows the P&L table without the removed trend chart", () => {
        render(<App />);

        expect(screen.getByText("Tabla P&L")).toBeInTheDocument();
        expect(screen.queryByText("Tendencia de resultado")).not.toBeInTheDocument();
    });
});
