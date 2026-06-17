import { Moon, Sun } from "lucide-react";
import { useContext } from "react";
import { PlReportShell } from "@/components/pl/pl-report-shell";
import { ThemeContext } from "@/hooks/theme.context";
import { cn } from "@/lib/utils";

export default function App() {
    const { isDark, toggleTheme } = useContext(ThemeContext);

    return (
        <div className={cn("min-h-screen bg-background text-foreground")}>
            <header className="sticky top-0 z-50 bg-card border-b border-border shadow-sm">
                <div className="mx-auto flex h-[56px] max-w-[1400px] items-center justify-between px-xxl">
                    <img
                        src="/dataxbi-logo.png"
                        alt="Dataxbi"
                        className="h-[36px] w-auto"
                    />
                    <button
                        onClick={toggleTheme}
                        aria-label={isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
                        className="flex items-center justify-center w-9 h-9 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                        {isDark ? (
                            <Sun className="icon-size-300" />
                        ) : (
                            <Moon className="icon-size-300" />
                        )}
                    </button>
                </div>
            </header>

            <main className="mx-auto w-full max-w-[1400px] px-xxl py-xxl">
                <div className="mb-xxl flex flex-col gap-l lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <p className="mb-xs text-200 leading-200 font-semibold uppercase tracking-normal text-primary">
                            Dataxbi Financial Analytics
                        </p>
                        <h1 className="text-hero-700 font-bold text-foreground leading-hero-700">
                            Informe PyG
                        </h1>
                        <p className="mt-xs text-300 leading-300 text-muted-foreground">
                            Resultado económico del negocio con tabla ejecutiva y comparativas.
                        </p>
                    </div>
                </div>

                <PlReportShell />
            </main>
        </div>
    );
}
