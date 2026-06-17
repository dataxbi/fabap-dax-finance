import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface StatusCardProps {
    label: string;
    value: string;
    detail?: string;
    tone?: "default" | "warning" | "success";
    icon?: ReactNode;
}

export function StatusCard({ label, value, detail, tone = "default", icon }: StatusCardProps) {
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
        </section>
    );
}
