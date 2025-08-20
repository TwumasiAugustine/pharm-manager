import  { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { NotificationProvider } from './context/NotificationContext';
import { DisplayProvider } from './context/DisplayContext';
import { NotificationContainer } from './components/molecules/NotificationContainer';
import CronJobNotifications from './components/organisms/CronJobNotifications';
import ErrorBoundary from './components/ErrorBoundary';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ProtectedRoute } from './components/molecules/ProtectedRoute';
import { UserRole } from './types/auth.types';
import { socketService } from './services/socket.service';

// Lazy load all pages
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const DrugsPage = lazy(() => import('./pages/DrugsPage'));
const EditDrugPage = lazy(() => import('./pages/EditDrugPage'));
const UnauthorizedPage = lazy(() => import('./pages/UnauthorizedPage'));
const PharmacySetupPage = lazy(() => import('./pages/PharmacySetupPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));
const SalesListPage = lazy(() => import('./pages/SalesListPage'));
const SalesNewPage = lazy(() => import('./pages/SalesNewPage'));
const SalesReceiptPage = lazy(() => import('./pages/SalesReceiptPage'));
const CustomerManagementPage = lazy(
    () => import('./pages/CustomerManagementPage'),
);
const CustomerDetailsPage = lazy(() => import('./pages/CustomerDetailsPage'));
const ExpiryPage = lazy(() => import('./pages/ExpiryPage'));
const ReportsPage = lazy(() => import('./pages/ReportsPage'));
const AuditLogsPage = lazy(() => import('./pages/AuditLogsPage'));
const UserActivityPage = lazy(() => import('./pages/UserActivityPage'));
const CronManagementPage = lazy(() => import('./pages/CronManagementPage'));
const UserManagementPage = lazy(() => import('./pages/UserManagementPage'));

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
                <ErrorBoundary>
                    <DisplayProvider>
                        <Router>
                            <Suspense
                                fallback={
                                    <div className="flex items-center justify-center min-h-screen">
                                        Loading...
                                    </div>
                                }
                            >
                                <Routes>
                                    <Route path="/" element={<LoginPage />} />
                                    <Route
                                        path="/login"
                                        element={<LoginPage />}
                                    />
                                    <Route
                                        path="/register"
                                        element={<RegisterPage />}
                                    />
                                    <Route
                                        path="/unauthorized"
                                        element={<UnauthorizedPage />}
                                    />
                                    <Route element={<ProtectedRoute />}>
                                        <Route
                                            path="/dashboard"
                                            element={<DashboardPage />}
                                        />
                                        <Route
                                            path="/drugs"
                                            element={<DrugsPage />}
                                        />
                                        <Route
                                            path="/drugs/edit/:id"
                                            element={<EditDrugPage />}
                                        />
                                        <Route
                                            path="/sales"
                                            element={<SalesListPage />}
                                        />
                                        <Route
                                            path="/sales/new"
                                            element={<SalesNewPage />}
                                        />
                                        <Route
                                            path="/sales/:id"
                                            element={<SalesReceiptPage />}
                                        />
                                        <Route
                                            path="/customers"
                                            element={<CustomerManagementPage />}
                                        />
                                        <Route
                                            path="/customers/:id"
                                            element={<CustomerDetailsPage />}
                                        />
                                        <Route
                                            path="/expiry"
                                            element={<ExpiryPage />}
                                        />
                                        <Route
                                            path="/reports"
                                            element={<ReportsPage />}
                                        />
                                    </Route>
                                    <Route
                                        element={
                                            <ProtectedRoute
                                                allowedRoles={[UserRole.ADMIN]}
                                            />
                                        }
                                    >
                                        <Route
                                            path="/pharmacy-setup"
                                            element={<PharmacySetupPage />}
                                        />
                                        <Route
                                            path="/audit-logs"
                                            element={<AuditLogsPage />}
                                        />
                                        <Route
                                            path="/user-activity"
                                            element={<UserActivityPage />}
                                        />
                                        <Route
                                            path="/cron-management"
                                            element={<CronManagementPage />}
                                        />
                                        <Route
                                            path="/users"
                                            element={<UserManagementPage />}
                                        />
                                    </Route>
                                    <Route
                                        path="*"
                                        element={<NotFoundPage />}
                                    />
                                </Routes>
                            </Suspense>
                        </Router>
                    </DisplayProvider>
                    <NotificationContainer />
                    <CronJobNotifications />
                </ErrorBoundary>
            </NotificationProvider>
        </QueryClientProvider>
    );
}

export default App;
