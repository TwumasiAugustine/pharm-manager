export interface AdminUser {
    _id: string;
    name: string;
    email: string;
    isActive: boolean;
    pharmacyId?: {
        _id: string;
        name: string;
    } | null;
}
