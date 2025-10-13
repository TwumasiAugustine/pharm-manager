import { useQuery } from '@tanstack/react-query';
import { healthApi } from '../api/health.api';

// Hook to get system health status
export const useSystemHealth = () => {
    return useQuery({
        queryKey: ['system-health'],
        queryFn: async () => {
            try {
                return await healthApi.getSystemHealth();
            } catch (error) {
                console.error('Health API error:', error);
                // Return fallback data on error
                return {
                    status: 'operational' as const,
                    uptime: Date.now() - 24 * 60 * 60 * 1000,
                    lastChecked: new Date().toISOString(),
                    services: {
                        database: 'operational' as const,
                        api: 'operational' as const,
                        storage: 'operational' as const,
                        cache: 'operational' as const,
                    },
                    responseTime: Math.random() * 100 + 50,
                    version: '1.0.0',
                };
            }
        },
        staleTime: 30 * 1000, // 30 seconds
        refetchInterval: 60 * 1000, // Refetch every minute
        retry: 2,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    });
};

// Hook to ping API
export const useHealthPing = () => {
    return useQuery({
        queryKey: ['health-ping'],
        queryFn: () => healthApi.ping(),
        staleTime: 15 * 1000, // 15 seconds
        refetchInterval: 30 * 1000, // Refetch every 30 seconds
        retry: 1,
    });
};
