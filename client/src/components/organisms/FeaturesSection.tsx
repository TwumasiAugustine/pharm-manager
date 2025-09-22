import React from 'react';
import {
    FiPackage,
    FiTrendingUp,
    FiAlertTriangle,
    FiUsers,
    FiBarChart,
    FiShield,
    FiRefreshCw,
    FiClock,
    FiDollarSign,
    FiFileText,
} from 'react-icons/fi';
import Badge from '../atoms/Badge';

interface Feature {
    icon: React.ReactNode;
    title: string;
    description: string;
    benefits: string[];
    badge?: string;
}

export const FeaturesSection: React.FC = () => {
    const features: Feature[] = [
        {
            icon: <FiPackage className="text-3xl text-blue-600" />,
            title: 'Smart Inventory Management',
            description:
                'Real-time inventory tracking with automated stock level monitoring and intelligent reorder suggestions.',
            benefits: [
                'Auto stock alerts',
                'Batch tracking',
                'Supplier management',
                'Stock transfers',
            ],
            badge: 'Most Popular',
        },
        {
            icon: <FiTrendingUp className="text-3xl text-green-600" />,
            title: 'Advanced Sales Analytics',
            description:
                'Comprehensive sales reporting with detailed analytics, trends, and performance insights.',
            benefits: [
                'Sales dashboards',
                'Trend analysis',
                'Top sellers',
                'Revenue tracking',
            ],
        },
        {
            icon: <FiAlertTriangle className="text-3xl text-orange-600" />,
            title: 'Expiry Date Monitoring',
            description:
                'Automated expiry tracking with smart notifications to prevent stock waste and ensure safety.',
            benefits: [
                'Expiry alerts',
                'FEFO rotation',
                'Waste reduction',
                'Compliance tracking',
            ],
        },
        {
            icon: <FiUsers className="text-3xl text-purple-600" />,
            title: 'Customer Management',
            description:
                'Complete customer database with purchase history, loyalty programs, and personalized service.',
            benefits: [
                'Customer profiles',
                'Purchase history',
                'Loyalty rewards',
                'Prescription tracking',
            ],
        },
        {
            icon: <FiBarChart className="text-3xl text-indigo-600" />,
            title: 'Business Intelligence',
            description:
                'Powerful reporting and analytics tools to make data-driven decisions for your pharmacy.',
            benefits: [
                'Custom reports',
                'KPI tracking',
                'Forecasting',
                'Performance metrics',
            ],
        },
        {
            icon: <FiShield className="text-3xl text-red-600" />,
            title: 'Security & Compliance',
            description:
                'Enterprise-grade security with full compliance to pharmacy regulations and data protection.',
            benefits: [
                'HIPAA compliant',
                'Data encryption',
                'Access controls',
                'Audit trails',
            ],
        },
    ];

    const additionalFeatures = [
        {
            icon: <FiRefreshCw />,
            title: 'Real-time Sync',
            description: 'Instant updates across all devices',
        },
        {
            icon: <FiClock />,
            title: '24/7 Support',
            description: 'Round-the-clock technical assistance',
        },
        {
            icon: <FiDollarSign />,
            title: 'Cost Effective',
            description: 'Reduce operational costs by 30%',
        },
        {
            icon: <FiFileText />,
            title: 'Easy Reports',
            description: 'Generate reports in seconds',
        },
    ];

    return (
        <section className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Section Header */}
                <div className="text-center mb-16">
                    <Badge variant="primary" size="md" className="mb-4">
                        ✨ Powerful Features
                    </Badge>
                    <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                        Everything You Need to{' '}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                            Manage Your Pharmacy
                        </span>
                    </h2>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                        From inventory management to sales analytics, our
                        comprehensive platform provides all the tools needed to
                        run a successful modern pharmacy.
                    </p>
                </div>

                {/* Main Features Grid */}
                <div className="grid lg:grid-cols-3 gap-8 mb-20">
                    {features.map((feature, index) => (
                        <div
                            key={index}
                            className="relative bg-white border border-gray-200 rounded-xl p-8 hover:shadow-xl transition-all duration-300 group hover:-translate-y-2"
                        >
                            {/* Badge for popular feature */}
                            {feature.badge && (
                                <div className="absolute -top-3 left-6">
                                    <Badge variant="warning" size="sm">
                                        {feature.badge}
                                    </Badge>
                                </div>
                            )}

                            {/* Icon */}
                            <div className="mb-6 group-hover:scale-110 transition-transform duration-300">
                                <div className="w-16 h-16 bg-gray-50 rounded-xl flex items-center justify-center group-hover:bg-blue-50 transition-colors">
                                    {feature.icon}
                                </div>
                            </div>

                            {/* Content */}
                            <h3 className="text-xl font-bold text-gray-900 mb-3">
                                {feature.title}
                            </h3>
                            <p className="text-gray-600 mb-6 leading-relaxed">
                                {feature.description}
                            </p>

                            {/* Benefits */}
                            <div className="space-y-2">
                                {feature.benefits.map(
                                    (benefit, benefitIndex) => (
                                        <div
                                            key={benefitIndex}
                                            className="flex items-center gap-2"
                                        >
                                            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                                            <span className="text-sm text-gray-700">
                                                {benefit}
                                            </span>
                                        </div>
                                    ),
                                )}
                            </div>

                            {/* Hover effect */}
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-indigo-500/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        </div>
                    ))}
                </div>

                {/* Additional Features */}
                <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-8 lg:p-12">
                    <div className="text-center mb-12">
                        <h3 className="text-3xl font-bold text-gray-900 mb-4">
                            Plus Many More Features
                        </h3>
                        <p className="text-lg text-gray-600">
                            Discover additional capabilities that make our
                            platform complete
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {additionalFeatures.map((feature, index) => (
                            <div
                                key={index}
                                className="bg-white rounded-lg p-6 text-center hover:shadow-lg transition-all duration-200 group"
                            >
                                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-200 transition-colors">
                                    <div className="text-blue-600 text-xl">
                                        {feature.icon}
                                    </div>
                                </div>
                                <h4 className="font-semibold text-gray-900 mb-2">
                                    {feature.title}
                                </h4>
                                <p className="text-sm text-gray-600">
                                    {feature.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* CTA Section */}
                <div className="text-center mt-16">
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">
                        Ready to Transform Your Pharmacy?
                    </h3>
                    <p className="text-lg text-gray-600 mb-8">
                        Join thousands of pharmacies already using our platform
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl">
                            Start Free Trial
                        </button>
                        <button className="border border-gray-300 text-gray-700 px-8 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-all duration-200">
                            Schedule Demo
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default FeaturesSection;
