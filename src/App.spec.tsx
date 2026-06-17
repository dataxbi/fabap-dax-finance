//-----------------------------------------------------------------------
// <copyright company="Microsoft Corporation">
//        Copyright (c) Microsoft Corporation.  All rights reserved.
//        Licensed under the MIT license. See LICENSE file in the project root for full license information.
// </copyright>
//-----------------------------------------------------------------------

import { describe, expect, it, vi } from "vitest";
import { render } from "@testing-library/react";
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
                            { name: "Cuenta[Sign]", dataType: "unknown" },
                            { name: "[Importe]", dataType: "unknown" },
                            { name: "[Presupuesto]", dataType: "unknown" },
                            { name: "[Variacion]", dataType: "unknown" },
                            { name: "[Variacion %]", dataType: "unknown" },
                        ],
                        rows: [[1, 1, "Presupuesto", 1, 88173165.6, 88173165.6, 0, 0]],
                    },
                    requestId: "test",
                    fromCache: false,
                },
                isLoading: false,
                error: undefined,
                refetch: vi.fn(),
            };
        }

        if (query.includes("'Fecha'[Year Month]")) {
            return {
                data: {
                    status: "success",
                    table: {
                        columns: [
                            { name: "Fecha[Year Month Sort]", dataType: "unknown" },
                            { name: "Fecha[Year Month]", dataType: "unknown" },
                            { name: "[Importe]", dataType: "unknown" },
                            { name: "[Presupuesto]", dataType: "unknown" },
                            { name: "[Gastos]", dataType: "unknown" },
                            { name: "[EBITDA]", dataType: "unknown" },
                            { name: "[Cash Flow]", dataType: "unknown" },
                        ],
                        rows: [[202601, "2026-01", 7634407.94, 3542711.6, 2973849.47, 588434.94, 529411.93]],
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
                        { name: "[Gastos]", dataType: "unknown" },
                        { name: "[EBITDA]", dataType: "unknown" },
                        { name: "[Cash Flow]", dataType: "unknown" },
                    ],
                    rows: [[2026, 96197251.87, 44630861.6, 37485867.28, 7411992.21, 6668530.78]],
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

    it("mounts content into the document", () => {
        render(<App />);
        expect(document.body).not.toBeEmptyDOMElement();
    });
});
