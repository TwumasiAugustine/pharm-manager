export interface Branch {
    id: string;
    name: string;
    address: {
        street: string;
        city: string;
        state: string;
        postalCode: string;
        country: string;
    };
    contact: {
        phone: string;
        email: string;
    };
    manager?: string;
    createdAt: string;
    updatedAt: string;
}
