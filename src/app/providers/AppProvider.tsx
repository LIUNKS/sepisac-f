import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { queryClient } from '@/lib/query-client';
import { Toaster } from '@/components/ui/sonner';

interface AppProviderProps {
    children: React.ReactNode;
}

import { ThemeProvider } from '@/components/theme-provider';

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
    return (
        <ThemeProvider defaultTheme="light" storageKey="sepisac-theme">
            <QueryClientProvider client={queryClient}>
            <BrowserRouter>
                {children}
                <Toaster position="top-right" richColors />
            </BrowserRouter>
            <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
        </ThemeProvider>
    );
};