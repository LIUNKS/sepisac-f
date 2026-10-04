import { Outlet, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/app/store/useAuthStore';
import CursorGrid from '@/components/magicui/cursor-grid';
import { ThemeToggle } from '@/components/theme-toggle';
import { useTheme } from '@/components/theme-provider';

export const AuthLayout = () => {
    const { isAuthenticated } = useAuthStore();
    const { theme } = useTheme();

    if (isAuthenticated) {
        return <Navigate to="/dashboard" replace />;
    }

    const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia("(prefers-color-scheme: dark)").matches);

    return (
        <div className="min-h-screen relative flex items-center justify-center bg-background p-4 overflow-hidden">
            <div className="absolute inset-0 z-0">
                <CursorGrid
                    cellSize={70}
                    color={isDark ? '#ffffff' : '#000000'}
                    radius={140}
                    falloff="smooth"
                    holdTime={400}
                    fadeDuration={800}
                    lineWidth={1.2}
                    maxOpacity={1}
                    fillOpacity={0}
                    gridOpacity={0}
                    cellRadius={0}
                    clickPulse
                    pulseSpeed={600}
                />
            </div>
            
            <div className="absolute top-4 right-4 z-20">
                <ThemeToggle />
            </div>

            <div className="w-full max-w-md relative z-10">
                <Outlet />
            </div>
        </div>
    );
};
