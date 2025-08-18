import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { useEffect } from 'react';
import { useCurrentUser } from './hooks/useAuth';
import { NotificationProvider } from './context/NotificationContext';
import { DisplayProvider } from './context/DisplayContext';
import { NotificationContainer } from './components/molecules/NotificationContainer';
import CronJobNotifications from './components/organisms/CronJobNotifications';
import { useAuthStore } from './store/auth.store';
import ErrorBoundary from './components/ErrorBoundary';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Services
import { socketService } from './services/socket.service';

// Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import DrugsPage from './pages/DrugsPage';
import EditDrugPage from './pages/EditDrugPage';
import UnauthorizedPage from './pages/UnauthorizedPage';
import PharmacySetupPage from './pages/PharmacySetupPage';
import NotFoundPage from './pages/NotFoundPage';

import SalesListPage from './pages/SalesListPage';
import SalesNewPage from './pages/SalesNewPage';
import SalesReceiptPage from './pages/SalesReceiptPage';

import CustomerManagementPage from './pages/CustomerManagementPage';
import CustomerDetailsPage from './pages/CustomerDetailsPage';
import { ExpiryPage } from './pages/ExpiryPage';
import ReportsPage from './pages/ReportsPage';
import AuditLogsPage from './pages/AuditLogsPage';
import UserActivityPage from './pages/UserActivityPage';
import CronManagementPage from './pages/CronManagementPage';
import UserManagementPage from './pages/UserManagementPage';

// Components
import { ProtectedRoute } from './components/molecules/ProtectedRoute';
import { UserRole } from './types/auth.types';

// Create routes
const router = createBrowserRouter([
    {
        path: '/',
        element: <LoginPage />,
        errorElement: <NotFoundPage />,
    },
    {
        path: '/login',
        element: <LoginPage />,
    },
    {
        path: '/register',
        element: <RegisterPage />,
    },
    {
        path: '/unauthorized',
        element: <UnauthorizedPage />,
    },
    {
        element: <ProtectedRoute />,
        children: [
            {
                path: '/dashboard',
                element: <DashboardPage />,
            },
            {
                path: '/drugs',
                element: <DrugsPage />,
            },
            {
                path: '/drugs/edit/:id',
                element: <EditDrugPage />,
            },
            {
                path: '/sales',
                element: <SalesListPage />,
            },
            {
                path: '/sales/new',
                element: <SalesNewPage />,
            },
            {
                path: '/sales/:id',
                element: <SalesReceiptPage />,
            },
            {
                path: '/customers',
                element: <CustomerManagementPage />,
            },
            {
                path: '/customers/:id',
                element: <CustomerDetailsPage />,
            },
            {
                path: '/expiry',
                element: <ExpiryPage />,
            },
            {
                path: '/reports',
                element: <ReportsPage />,
            },
        ],
    },
    {
        element: <ProtectedRoute allowedRoles={[UserRole.ADMIN]} />,
        children: [
            // Admin-only routes will go here
            {
                path: '/pharmacy-setup',
                element: <PharmacySetupPage />,
            },
            {
                path: '/audit-logs',
                element: <AuditLogsPage />,
            },
            {
                path: '/user-activity',
                element: <UserActivityPage />,
            },
            {
                path: '/cron-management',
                element: <CronManagementPage />,
            },
            {
                path: '/users',
                element: <UserManagementPage />,
            },
        ],
    },
    {
        element: (
            <ProtectedRoute
                allowedRoles={[UserRole.ADMIN, UserRole.PHARMACIST]}
            />
        ),
        children: [
            // Admin and Pharmacist routes will go here
        ],
    },
    {
        path: '*',
        element: <NotFoundPage />,
    },
]);

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false,
            staleTime: 5 * 60 * 1000, // 5 minutes
        },
    },
});

// Socket listeners for real-time updates
socketService.on('expiry-notifications-updated', () => {
    queryClient.invalidateQueries({ queryKey: ['expiry-notifications'] });
});

socketService.on('audit-logs-updated', () => {
    queryClient.invalidateQueries({ queryKey: ['audit-logs'] });
});

socketService.on('user-activity-updated', () => {
    queryClient.invalidateQueries({ queryKey: ['user-activity'] });
});

// Enhanced cron job socket listeners

socketService.on('cron-job-triggered', () => {
    queryClient.invalidateQueries({ queryKey: ['cronJobStatus'] });
});

interface CronJobCompletedData {
    jobType?: string;
}
socketService.on('cron-job-completed', (data: CronJobCompletedData) => {
    queryClient.invalidateQueries({ queryKey: ['cronJobStatus'] });

    // Update relevant data based on job type
    switch (data.jobType || '') {
        case 'expiry-notifications':
            queryClient.invalidateQueries({
                queryKey: ['expiry-notifications'],
            });
            queryClient.invalidateQueries({ queryKey: ['expiry'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard'] });
            break;
        case 'notification-cleanup':
            queryClient.invalidateQueries({
                queryKey: ['expiry-notifications'],
            });
            break;
        case 'audit-cleanup':
            queryClient.invalidateQueries({ queryKey: ['audit-logs'] });
            break;
        case 'user-activity-cleanup':
            queryClient.invalidateQueries({ queryKey: ['user-activity'] });
            break;
        case 'inventory-check':
            queryClient.invalidateQueries({ queryKey: ['drugs'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard'] });
            break;
        default:
            // Refresh dashboard for unknown job types
            queryClient.invalidateQueries({ queryKey: ['dashboard'] });
            break;
    }
});

socketService.on('cron-job-failed', () => {
    queryClient.invalidateQueries({ queryKey: ['cronJobStatus'] });
});

function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <NotificationProvider>
                <AppContent />
            </NotificationProvider>
        </QueryClientProvider>
    );
}

// Separate component to use hooks within the NotificationProvider context
function AppContent() {
    const { refetch } = useCurrentUser();
    const { isAuthenticated, isLoading, setIsLoading, setIsAuthenticated } =
        useAuthStore();

    useEffect(() => {
        // Only check authentication if we're not already in a loading state
        // All session checks are handled by the server via httpOnly cookies
        const checkAuth = async () => {
            try {
                await refetch();
            } catch (error) {
                // If auth fails, redirect to login if not already
                console.error('error', error);
                if (
                    !window.location.pathname.includes('/login') &&
                    !window.location.pathname.includes('/register')
                ) {
                    window.location.href = '/login';
                }
                setIsAuthenticated(false);
                setIsLoading(false);
            }
        };

        if (!isLoading) {
            checkAuth();
        }

        // Set up a refresh interval only if authenticated
        let refreshInterval: number | undefined;
        if (isAuthenticated) {
            refreshInterval = window.setInterval(() => {
                refetch();
            }, 15 * 60 * 1000); // Refresh every 15 minutes
        }

        return () => {
            if (refreshInterval) {
                clearInterval(refreshInterval);
            }
        };
    }, [refetch, isAuthenticated, isLoading, setIsAuthenticated, setIsLoading]);

    useEffect(() => {
        const checkFirstSetup = async () => {
            try {
                const response = await fetch('/api/pharmacy/admin-first-setup');
                const data = await response.json();



                if (
                    data.isFirstSetup &&
                    window.location.pathname !== '/pharmacy-setup'
                ) {
                    window.location.href = '/pharmacy-setup';
                }
            } catch (error) {
                // Swallow error: setup check is non-critical, but log if possible
                console.error(
                    'Failed to check admin first setup status:',
                    error,
                );
            }
        };

        if (isAuthenticated && !isLoading) {
            checkFirstSetup();
        }
    }, [isAuthenticated, isLoading]);

    return (
        <>
            <ErrorBoundary>
                <DisplayProvider>
                    <RouterProvider router={router} />
                </DisplayProvider>
            </ErrorBoundary>
            <NotificationContainer />
            <CronJobNotifications />
        </>
    );
}

export default App;
