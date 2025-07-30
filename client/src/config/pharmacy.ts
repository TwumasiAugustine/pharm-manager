/**
 * Pharmacy configuration settings for client-side use
 * Contains pharmacy information displayed on receipts and throughout the application
 */

export const PHARMACY_CONFIG = {
    name: 'HealthCare Pharmacy',
    address: {
        street: '123 Medical Avenue',
        city: 'Healthcare City',
        state: 'HC',
        postalCode: '12345',
        country: 'United States',
    },
    contact: {
        phone: '+1 (555) 123-4567',
        email: 'contact@healthcarepharmacy.com',
        website: 'www.healthcarepharmacy.com',
    },
    registrationNumber: 'PHM-12345-REG',
    taxId: 'TAX-67890-ID',
    operatingHours: '8:00 AM - 8:00 PM, Monday to Saturday',
    slogan: 'Your Health, Our Priority',
    logo: '/logo.png', // Path to the pharmacy logo file in public folder
};

/**
 * Gets the pharmacy's formatted full address as a string
 * @returns Formatted address string
 */
export const getFormattedAddress = (): string => {
    const { street, city, state, postalCode, country } =
        PHARMACY_CONFIG.address;
    return `${street}, ${city}, ${state} ${postalCode}, ${country}`;
};

/**
 * Gets the pharmacy's contact information as a formatted string
 * @returns Formatted contact information string
 */
export const getFormattedContact = (): string => {
    const { phone, email, website } = PHARMACY_CONFIG.contact;
    return `Phone: ${phone} | Email: ${email} | Website: ${website}`;
};

export default PHARMACY_CONFIG;
