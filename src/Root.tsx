import { ErrorBoundary } from "react-error-boundary";
import App from "@/App";
import { AuthGate } from "@/components/auth-gate.component";
import { ThemeContext } from "@/hooks/theme.context";
import { AuthProvider } from "@/hooks/use-auth";
import { useAppTheme } from "@/hooks/use-theme";
import type { bootstrapAuth } from "@/services/rayfin-auth.service";
import { ErrorFallback } from "@/ErrorFallback";

interface RootProps {
    rayfinAuthService: ReturnType<typeof bootstrapAuth>;
}

export function Root({ rayfinAuthService }: RootProps) {
    const { isDark, toggleTheme } = useAppTheme();

    return (
        <ThemeContext.Provider value={{ isDark, toggleTheme }}>
            <ErrorBoundary FallbackComponent={ErrorFallback}>
                <AuthProvider rayfinAuthService={rayfinAuthService}>
                    <AuthGate>
                        <App />
                    </AuthGate>
                </AuthProvider>
            </ErrorBoundary>
        </ThemeContext.Provider>
    );
}
