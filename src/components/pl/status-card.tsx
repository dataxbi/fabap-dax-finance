import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface StatusCardDetail {
    label: string;
    value: string;
    tone?: "default" | "positive" | "negative";
}

interface StatusCardProps {
    label: string;
    value: string;
    detail?: string;
    tone?: "default" | "warning" | "success";
    icon?: ReactNode;
    comparisons?: StatusCardDetail[];
}

export function StatusCard({
    label,
    value,
    detail,
    tone = "default",
    icon,
    comparisons = [],
}: StatusCardProps) {
    return (
        <section
            className={cn(
                "rounded-xl border bg-card text-card-foreground p-l shadow-sm",
                tone === "warning" && "border-destructive/35 bg-destructive/5",
                tone === "success" && "border-primary/25 bg-accent/50",
            )}
        >
            <div className="flex items-start justify-between gap-m">
                <div className="min-w-0">
                    <p className="text-200 leading-200 font-medium uppercase tracking-normal text-muted-foreground">
                        {label}
                    </p>
                    <p className="mt-xs text-500 leading-500 font-semibold text-card-foreground">
                        {value}
                    </p>
                </div>
                {icon ? (
                    <div className="flex icon-size-500 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
                        {icon}
                    </div>
                ) : null}
            </div>
            {detail ? (
                <p className="mt-s text-200 leading-200 text-muted-foreground">
                    {detail}
                </p>
            ) : null}
            {comparisons.length > 0 ? (
                <div className="mt-m space-y-xs border-t border-border/70 pt-m">
                    {comparisons.map((comparison) => (
                        <div key={comparison.label} className="flex items-center justify-between gap-m">
                            <span className="text-200 leading-200 text-muted-foreground">
                                {comparison.label}
                            </span>
                            <span
                                className={cn(
                                    "rounded-full px-s py-xxs text-200 leading-200 font-semibold",
                                    comparison.tone === "positive" && "pl-ui-chip-positive",
                                    comparison.tone === "negative" && "pl-ui-chip-negative",
                                    (!comparison.tone || comparison.tone === "default") && "pl-ui-chip-neutral",
                                )}
                            >
                                {comparison.value}
                            </span>
                        </div>
                    ))}
                </div>
            ) : null}
        </section>
    );
}
