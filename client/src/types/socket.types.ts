// Socket event types for cron jobs
export interface CronJobTriggeredEvent {
    jobName: string;
    jobType: string;
    timestamp: string;
}

export interface CronJobCompletedEvent {
    jobName: string;
    jobType: string;
    timestamp: string;
    duration?: number;
    result?: unknown;
}

export interface CronJobFailedEvent {
    jobName: string;
    jobType: string;
    timestamp: string;
    error: string;
}

export type CronJobSocketEvent =
    | CronJobTriggeredEvent
    | CronJobCompletedEvent
    | CronJobFailedEvent;

// Expired sale cleanup events
export interface ExpiredSalesCleanedEvent {
    count: number;
    timestamp: string;
}

export type ExpiredSaleSocketEvent = ExpiredSalesCleanedEvent;
