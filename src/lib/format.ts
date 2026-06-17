const esCurrencyFormatter = new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
});

const esNumberFormatter = new Intl.NumberFormat("es-ES", {
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
});

const esPercentFormatter = new Intl.NumberFormat("es-ES", {
    style: "percent",
    maximumFractionDigits: 1,
    minimumFractionDigits: 1,
});

const esDateFormatter = new Intl.DateTimeFormat("es-ES", {
    month: "short",
    year: "numeric",
});

function toNumber(value: unknown): number | undefined {
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string" && value.trim() !== "") {
        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : undefined;
    }
    return undefined;
}

export function formatCurrencyEs(value: unknown): string {
    const numberValue = toNumber(value);
    return numberValue == null ? "" : esCurrencyFormatter.format(numberValue);
}

export function formatNumberEs(value: unknown): string {
    const numberValue = toNumber(value);
    return numberValue == null ? "" : esNumberFormatter.format(numberValue);
}

export function formatPercentEs(value: unknown): string {
    const numberValue = toNumber(value);
    return numberValue == null ? "" : esPercentFormatter.format(numberValue);
}

export function formatMonthEs(value: unknown): string {
    if (value instanceof Date) return esDateFormatter.format(value);
    if (typeof value !== "string" && typeof value !== "number") return "";

    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? String(value) : esDateFormatter.format(parsed);
}
