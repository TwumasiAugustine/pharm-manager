export interface ExpiredSaleStats {
    expiredSalesCount: number;
    totalValue: number;
    totalExpiredSales: number;
    oldestExpired: string | null;
    totalSalesAffected: number;
}

export interface ExpiredSaleCleanupResult {
    success: boolean;
    message: string;
    cleanedUpCount: number;
}

export interface ShortCodeSettings {
    requireSaleShortCode: boolean;
    shortCodeExpiryMinutes: number;
}

export interface ShortCodeSettingsUpdate {
    requireSaleShortCode?: boolean;
    shortCodeExpiryMinutes?: number;
}

export interface ShortCodeSettingsResponse {
    success: boolean;
    message: string;
    data: ShortCodeSettings;
}
