import React from 'react';
import { FaCogs, FaSync, FaExclamationTriangle } from 'react-icons/fa';
import { useCronJobStatus, useCronTriggers } from '../hooks/useCron';
import CronJobCard from '../components/molecules/CronJobCard';
import ManualControlCard from '../components/molecules/ManualControlCard';
import CronJobActivityWidget from '../components/organisms/CronJobActivityWidget';
import DashboardLayout from '../layouts/DashboardLayout';

const CronManagementPage: React.FC = () => {
    const {
        data: cronStatus,
        isLoading,
        isError,
        refetch,
    } = useCronJobStatus();
    const {
        triggerExpiryNotifications,
        triggerCleanupNotifications,
        triggerDailyAuditLogCleanup,
        triggerWeeklyAuditLogCleanup,
        triggerMonthlyUserActivityCleanup,
        triggerInventoryCheck,
        triggerExpiredSessionsCleanup,
        triggerWeeklySummaryReports,
    } = useCronTriggers();

    const getTriggerFunction = (jobName: string) => {
        switch (jobName) {
            case 'Daily Expiry Notifications':
                return () => triggerExpiryNotifications.mutate();
            case 'Weekly Notification Cleanup':
                return () => triggerCleanupNotifications.mutate();
            case 'Weekly Audit Log Cleanup':
                return () => triggerWeeklyAuditLogCleanup.mutate();
            case 'Monthly User Activity Cleanup':
                return () => triggerMonthlyUserActivityCleanup.mutate();
            case 'Daily Inventory Check':
                return () => triggerInventoryCheck.mutate();
            case 'Daily Session Cleanup':
                return () => triggerExpiredSessionsCleanup.mutate();
            case 'Weekly Summary Reports':
                return () => triggerWeeklySummaryReports.mutate();
            default:
                return () => {};
        }
    };

    const getLoadingState = (jobName: string) => {
        switch (jobName) {
            case 'Daily Expiry Notifications':
                return triggerExpiryNotifications.isPending;
            case 'Weekly Notification Cleanup':
                return triggerCleanupNotifications.isPending;
            case 'Weekly Audit Log Cleanup':
                return triggerWeeklyAuditLogCleanup.isPending;
            case 'Monthly User Activity Cleanup':
                return triggerMonthlyUserActivityCleanup.isPending;
            case 'Daily Inventory Check':
                return triggerInventoryCheck.isPending;
            case 'Daily Session Cleanup':
                return triggerExpiredSessionsCleanup.isPending;
            case 'Weekly Summary Reports':
                return triggerWeeklySummaryReports.isPending;
            default:
                return false;
        }
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                                <FaCogs className="mr-3 text-blue-600" />
                                Automated Task Management
                            </h1>
                            <p className="text-gray-600 mt-2">
                                Monitor and manage automated system tasks and
                                cron jobs
                            </p>
                        </div>
                        <button
                            onClick={() => refetch()}
                            className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                        >
                            <FaSync className="mr-2" />
                            Refresh
                        </button>
                    </div>
                </div>

                {/* Error State */}
                {isError && (
                    <div className="text-center py-12">
                        <FaExclamationTriangle className="mx-auto h-12 w-12 text-red-500 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            Failed to load cron job status
                        </h3>
                        <p className="text-gray-600 mb-4">
                            There was an error loading the automated task
                            information.
                        </p>
                        <button
                            onClick={() => refetch()}
                            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        >
                            <FaSync className="mr-2" />
                            Try Again
                        </button>
                    </div>
                )}

                {/* Automated Tasks */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">
                        Automated Tasks
                    </h2>
                    <p className="text-gray-600 mb-6">
                        These tasks run automatically on their scheduled
                        intervals. You can manually trigger them for testing or
                        immediate execution.
                    </p>

                    {isLoading ? (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {[1, 2, 3, 4].map((i) => (
                                <div
                                    key={i}
                                    className="bg-gray-100 rounded-lg shadow-sm border border-gray-200 p-4 animate-pulse"
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex-1">
                                            <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                                            <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                                        </div>
                                        <div className="h-8 w-16 bg-gray-200 rounded"></div>
                                    </div>
                                    <div className="h-16 bg-gray-200 rounded"></div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {cronStatus?.cronJobs.map((cronJob) => (
                                <CronJobCard
                                    key={cronJob.name}
                                    cronJob={cronJob}
                                    onTrigger={getTriggerFunction(cronJob.name)}
                                    isLoading={getLoadingState(cronJob.name)}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Manual Control Section */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">
                        Manual Control
                    </h2>
                    <p className="text-gray-600 mb-6">
                        Tasks that require manual intervention and are not
                        automated by design.
                    </p>

                    {isLoading ? (
                        <div className="bg-gray-100 rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse">
                            <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
                            <div className="h-16 bg-gray-200 rounded mb-4"></div>
                            <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                            <div className="h-8 bg-gray-200 rounded w-32"></div>
                        </div>
                    ) : (
                        cronStatus?.manualControl?.dailyAuditLogCleanup && (
                            <ManualControlCard
                                title="Daily Audit Log Cleanup"
                                description={
                                    cronStatus.manualControl
                                        .dailyAuditLogCleanup.description
                                }
                                note={
                                    cronStatus.manualControl
                                        .dailyAuditLogCleanup.note
                                }
                                onTrigger={(daysToKeep?: number) =>
                                    triggerDailyAuditLogCleanup.mutate(
                                        daysToKeep || 1,
                                    )
                                }
                                isLoading={
                                    triggerDailyAuditLogCleanup.isPending
                                }
                            />
                        )
                    )}
                </div>

                {/* Real-time Activity Widget */}
                <CronJobActivityWidget />

                {/* Information Panel */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <h3 className="text-lg font-medium text-blue-900 mb-3">
                        Important Information
                    </h3>
                    <div className="space-y-2 text-sm text-blue-800">
                        <p>
                            • Automated tasks run according to their scheduled
                            times shown above
                        </p>
                        <p>
                            • Manual triggers are useful for testing or
                            immediate execution
                        </p>
                        <p>
                            • All task executions are logged in the audit logs
                            for monitoring
                        </p>
                        <p>
                            • Daily audit log cleanup requires manual control to
                            prevent accidental data loss
                        </p>
                        <p>
                            • Low stock items are checked daily at 9:00 AM with
                            notifications for items ≤ 10 units
                        </p>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default CronManagementPage;
