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
    result?: any;
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
