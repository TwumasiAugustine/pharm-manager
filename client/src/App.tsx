import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { useEffect } from 'react';
import { useCurrentUser } from './hooks/useAuth';
import { NotificationProvider } from './context/NotificationContext';
import { NotificationContainer } from './components/molecules/NotificationContainer';
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
        // and if we have some reason to believe the user might be authenticated
        // (e.g., we have a session cookie or previous auth state)
        const checkAuth = async () => {
            // Check if we might have a session cookie
            const mightHaveSession =
                document.cookie.includes('session') ||
                sessionStorage.getItem('hasSession') === 'true';

            // Skip authentication check entirely if we're certain we're not logged in
            if (!mightHaveSession && window.location.pathname === '/login') {
                // If we're on the login page and we know we're not authenticated,
                // clear any stale state and don't even try to check auth
                setIsLoading(false);
                setIsAuthenticated(false);
                sessionStorage.removeItem('hasSession');
                return;
            }

            if (mightHaveSession) {
                try {
                    await refetch();
                    // If successful, remember that the user has logged in before
                    localStorage.setItem('hasLoggedInBefore', 'true');
                    sessionStorage.setItem('hasSession', 'true');
                } catch (error) {
                    // If auth fails, clear session indicator to prevent future retries
                    sessionStorage.removeItem('hasSession');

                    // If we're on a protected route, redirect to login
                    if (
                        !window.location.pathname.includes('/login') &&
                        !window.location.pathname.includes('/register')
                    ) {
                        window.location.href = '/login';
                    }

                    console.error('Auth check failed:', error);
                }
            } else {
                // If we know we're not authenticated, update the state accordingly
                setIsAuthenticated(false);
                setIsLoading(false);
            }
        };

        if (!isLoading) {
            checkAuth();
        }

        // Set up a refresh interval only if authenticated
        // This prevents constant polling when not logged in
        let refreshInterval: number | undefined;
        if (isAuthenticated) {
            refreshInterval = window.setInterval(() => {
                // Check if session still exists before refreshing
                if (
                    document.cookie.includes('session') ||
                    sessionStorage.getItem('hasSession') === 'true'
                ) {
                    refetch();
                } else {
                    // Clear interval if session is gone
                    if (refreshInterval) {
                        clearInterval(refreshInterval);
                    }
                }
            }, 15 * 60 * 1000); // Refresh every 15 minutes

            // When authenticated, ensure we have the session indicators set
            localStorage.setItem('hasLoggedInBefore', 'true');
            sessionStorage.setItem('hasSession', 'true');
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
                    !data.isFirstSetup &&
                    window.location.pathname !== '/pharmacy-setup'
                ) {
                    window.location.href = '/pharmacy-setup';
                }
            } catch (error) {
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
                <RouterProvider router={router} />
            </ErrorBoundary>
            <NotificationContainer />
        </>
    );
}

export default App;
