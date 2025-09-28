import { useMemo } from 'react';

interface SEOConfig {
    title: string;
    description?: string;
    keywords?: readonly string[];
    canonicalPath?: string;
    ogImage?: string;
    structuredDataType?:
        | 'WebApplication'
        | 'Organization'
        | 'LocalBusiness'
        | 'MedicalBusiness';
    preloadFonts?: boolean;
}

interface GeneratedSEOData {
    title: string;
    description: string;
    keywords: string;
    canonicalUrl: string;
    ogImage?: string;
    structuredData?: object;
    preloadResources: Array<{
        href: string;
        as: 'script' | 'style' | 'font' | 'image';
        type?: string;
        crossorigin?: 'anonymous' | 'use-credentials';
    }>;
}

/**
 * Hook for generating SEO metadata specific to pharmacy management context
 *
 * This hook provides:
 * - Default SEO values tailored for pharmacy/healthcare
 * - Automatic structured data generation
 * - Performance optimizations
 * - Consistent metadata patterns across the app
 */
export const useSEO = (config: SEOConfig): GeneratedSEOData => {
    const baseUrl = window.location.origin;

    const seoData = useMemo(() => {
        const {
            title,
            description,
            keywords = [],
            canonicalPath = window.location.pathname,
            ogImage,
            structuredDataType = 'WebApplication',
            preloadFonts = true,
        } = config;

        // Generate comprehensive description
        const defaultDescription =
            'Modern pharmacy management system for inventory tracking, prescription management, ' +
            'sales processing, and customer management. Streamline your pharmacy operations with ' +
            'our comprehensive healthcare management solution.';

        const finalDescription = description || defaultDescription;

        // Generate comprehensive keywords
        const defaultKeywords = [
            'pharmacy management',
            'prescription management',
            'inventory tracking',
            'healthcare software',
            'medical inventory',
            'pharmacy POS',
            'drug tracking',
            'medication management',
            'healthcare analytics',
            'pharmacy system',
        ];

        const finalKeywords = [
            ...new Set([...keywords, ...defaultKeywords]),
        ].join(', ');

        // Generate canonical URL
        const canonicalUrl = `${baseUrl}${canonicalPath}`;

        // Generate structured data based on type
        let structuredData: object | undefined;

        switch (structuredDataType) {
            case 'WebApplication':
                structuredData = {
                    '@context': 'https://schema.org',
                    '@type': 'WebApplication',
                    name: 'PharmCare Management System',
                    description: finalDescription,
                    url: baseUrl,
                    applicationCategory: 'HealthcareApplication',
                    operatingSystem: 'Web Browser',
                    offers: {
                        '@type': 'Offer',
                        price: '0',
                        priceCurrency: 'USD',
                    },
                    featureList: [
                        'Inventory Management',
                        'Prescription Tracking',
                        'Sales Processing',
                        'Customer Management',
                        'Expiry Tracking',
                        'Reporting & Analytics',
                    ],
                };
                break;

            case 'Organization':
            case 'LocalBusiness':
            case 'MedicalBusiness':
                structuredData = {
                    '@context': 'https://schema.org',
                    '@type': structuredDataType,
                    name: 'PharmCare Management System',
                    description: finalDescription,
                    url: baseUrl,
                    ...(structuredDataType === 'MedicalBusiness' && {
                        medicalSpecialty: 'Pharmacy',
                        healthPlanNetworkId: 'Pharmacy Network',
                    }),
                };
                break;
        }

        // Generate preload resources
        const preloadResources: GeneratedSEOData['preloadResources'] = [];

        // Preload critical fonts if enabled
        if (preloadFonts) {
            preloadResources.push({
                href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
                as: 'style',
            });
        }

        return {
            title,
            description: finalDescription,
            keywords: finalKeywords,
            canonicalUrl,
            ogImage,
            structuredData,
            preloadResources,
        };
    }, [config, baseUrl]);

    return seoData;
};

/**
 * Predefined SEO configurations for common pages
 */
/**
 * Predefined SEO configurations for common pages.
 *
 * Use these presets to quickly set SEO metadata for standard pages in the pharmacy management app.
 * Each preset provides a title, description, keywords, and other relevant SEO options.
 */
export const SEO_PRESETS = {
    pharmcare: {
        title: 'PharmCare - Modern Pharmacy Management System',
        description:
            'Streamline your pharmacy operations with PharmCare. Complete inventory management, prescription tracking, sales processing, and customer management solution for modern pharmacies.',
        keywords: [
            'pharmacy management system',
            'pharmacy software',
            'inventory management',
            'prescription management',
            'pharmacy POS',
            'healthcare management',
            'drug inventory',
            'pharmacy analytics',
            'medical software',
            'pharmacy solution',
        ],
        canonicalPath: '/',
        structuredDataType: 'WebApplication' as const,
        ogImage: '/images/pharmcare-og-image.jpg', // Add this image to public/images/
        preloadFonts: true,
    },

    dashboard: {
        title: 'Dashboard',
        description:
            'Pharmacy management dashboard with real-time analytics, inventory status, and key performance indicators.',
        keywords: [
            'pharmacy dashboard',
            'healthcare analytics',
            'inventory overview',
        ],
    },

    superAdminDashboard: {
        title: 'Super Admin Dashboard',
        description: '',
        keywords: ['super admin', 'dashboard', 'pharmacy management'],
    },

    inventory: {
        title: 'Drug Inventory',
        description:
            'Manage your pharmacy inventory with real-time stock tracking, low stock alerts, and automated reorder points.',
        keywords: ['drug inventory', 'stock management', 'pharmacy stock'],
    },

    sales: {
        title: 'Sales Management',
        description:
            'Process sales, manage transactions, and track revenue with our comprehensive pharmacy POS system.',
        keywords: ['pharmacy sales', 'POS system', 'transaction management'],
    },

    customers: {
        title: 'Customer Management',
        description:
            'Manage customer profiles, prescription history, and loyalty programs for better patient care.',
        keywords: [
            'customer management',
            'patient records',
            'prescription history',
        ],
    },

    reports: {
        title: 'Reports & Analytics',
        description:
            'Generate comprehensive reports for inventory, sales, customer analytics, and business intelligence.',
        keywords: [
            'pharmacy reports',
            'healthcare analytics',
            'business intelligence',
        ],
    },

    expiry: {
        title: 'Expiry Management',
        description:
            'Track medication expiry dates, receive alerts, and manage expired drug disposal efficiently.',
        keywords: ['drug expiry', 'medication tracking', 'expiry alerts'],
    },

    users: {
        title: 'User Management',
        description:
            'Manage staff accounts, roles, permissions, and access controls for your pharmacy team.',
        keywords: ['user management', 'staff accounts', 'role permissions'],
    },

    branches: {
        title: 'Branch Management',
        description:
            'Manage multiple pharmacy locations, inventory transfers, and centralized operations.',
        keywords: ['branch management', 'multi-location', 'pharmacy network'],
    },

    audit: {
        title: 'Audit Logs',
        description:
            'Track system activities, user actions, and maintain comprehensive audit trails for compliance.',
        keywords: ['audit logs', 'compliance tracking', 'system monitoring'],
    },

    login: {
        title: 'Sign In',
        description:
            'Secure access to your pharmacy management system. Sign in to manage inventory, sales, and operations.',
        keywords: ['pharmacy login', 'secure access', 'system login'],
    },

    register: {
        title: 'Create Account',
        description:
            'Register for pharmacy management system access. Set up your account to start managing operations.',
        keywords: ['pharmacy registration', 'create account', 'signup'],
    },

    pharmacySetup: {
        title: 'Pharmacy Setup',
        description:
            'Configure your pharmacy settings, branch information, and system preferences for optimal operations.',
        keywords: [
            'pharmacy setup',
            'system configuration',
            'pharmacy settings',
        ],
    },

    userActivity: {
        title: 'User Activity',
        description:
            'Monitor user activities, track system usage, and review staff performance metrics.',
        keywords: ['user activity', 'staff monitoring', 'system usage'],
    },

    cronManagement: {
        title: 'Automated Tasks',
        description:
            'Manage scheduled tasks, automated processes, and system maintenance operations.',
        keywords: ['automated tasks', 'scheduled jobs', 'system maintenance'],
    },

    customerDetails: {
        title: 'Customer Details',
        description:
            'View detailed customer information, purchase history, and manage customer relationships.',
        keywords: ['customer profile', 'purchase history', 'customer details'],
    },

    editDrug: {
        title: 'Edit Drug',
        description:
            'Update drug information, pricing, stock levels, and medication details in your inventory.',
        keywords: ['edit drug', 'update medication', 'drug management'],
    },

    createSale: {
        title: 'Create Sale',
        description:
            'Process new sales transactions, add items to cart, and complete customer purchases.',
        keywords: ['create sale', 'process transaction', 'pharmacy checkout'],
    },

    salesReceipt: {
        title: 'Sales Receipt',
        description:
            'View and print sales receipts, transaction details, and customer purchase records.',
        keywords: ['sales receipt', 'transaction receipt', 'purchase record'],
    },

    notFound: {
        title: 'Page Not Found',
        description:
            'The requested page could not be found. Return to the dashboard or use navigation to find what you need.',
        keywords: ['404 error', 'page not found', 'missing page'],
    },

    unauthorized: {
        title: 'Access Denied',
        description:
            'You do not have permission to access this page. Contact your administrator for access.',
        keywords: ['access denied', 'unauthorized', 'permission error'],
    },
} as const;
