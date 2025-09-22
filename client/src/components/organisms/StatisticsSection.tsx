import React from 'react';
import { FiTrendingUp, FiUsers, FiGlobe, FiAward } from 'react-icons/fi';

interface Statistic {
    icon: React.ReactNode;
    value: string;
    label: string;
    description: string;
    color: string;
}

export const StatisticsSection: React.FC = () => {
    const statistics: Statistic[] = [
        {
            icon: <FiUsers className="text-4xl" />,
            value: '500+',
            label: 'Active Pharmacies',
            description: 'Trusted by pharmacies worldwide',
            color: 'text-blue-600',
        },
        {
            icon: <FiTrendingUp className="text-4xl" />,
            value: '₵2.5M+',
            label: 'Revenue Tracked',
            description: 'Monthly revenue managed',
            color: 'text-green-600',
        },
        {
            icon: <FiGlobe className="text-4xl" />,
            value: '25+',
            label: 'Countries',
            description: 'Global pharmacy operations',
            color: 'text-purple-600',
        },
        {
            icon: <FiAward className="text-4xl" />,
            value: '99.9%',
            label: 'Uptime',
            description: 'Reliable system performance',
            color: 'text-orange-600',
        },
    ];

    const achievements = [
        '⭐ 4.9/5 Average Rating',
        '🏆 Best Pharmacy Software 2024',
        '🔒 ISO 27001 Certified',
        '⚡ 99.9% Uptime Guarantee',
        '🌍 Available in 25+ Countries',
        '📱 Mobile-First Design',
    ];

    return (
        <section className="py-20 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Section Header */}
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                        Trusted by Pharmacies{' '}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                            Worldwide
                        </span>
                    </h2>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                        Our platform powers pharmacy operations across the
                        globe, helping businesses increase efficiency and
                        profitability.
                    </p>
                </div>

                {/* Main Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
                    {statistics.map((stat, index) => (
                        <div
                            key={index}
                            className="bg-white rounded-2xl p-8 text-center shadow-lg hover:shadow-xl transition-all duration-300 group hover:-translate-y-2"
                        >
                            {/* Icon */}
                            <div
                                className={`${stat.color} mb-4 group-hover:scale-110 transition-transform duration-300`}
                            >
                                <div className="flex justify-center">
                                    {stat.icon}
                                </div>
                            </div>

                            {/* Value */}
                            <div className="text-4xl md:text-5xl font-bold text-gray-900 mb-2 group-hover:scale-105 transition-transform duration-300">
                                {stat.value}
                            </div>

                            {/* Label */}
                            <div className="text-lg font-semibold text-gray-700 mb-2">
                                {stat.label}
                            </div>

                            {/* Description */}
                            <div className="text-sm text-gray-500">
                                {stat.description}
                            </div>

                            {/* Animated border */}
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        </div>
                    ))}
                </div>

                {/* Achievements Grid */}
                <div className="bg-white rounded-2xl p-8 lg:p-12 shadow-lg">
                    <div className="text-center mb-12">
                        <h3 className="text-3xl font-bold text-gray-900 mb-4">
                            Award-Winning Platform
                        </h3>
                        <p className="text-lg text-gray-600">
                            Recognized for excellence in pharmacy technology and
                            innovation
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                        {achievements.map((achievement, index) => (
                            <div
                                key={index}
                                className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg hover:bg-blue-50 transition-colors duration-200"
                            >
                                <span className="text-lg">{achievement}</span>
                            </div>
                        ))}
                    </div>

                    {/* Customer Success Story */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-8 text-center">
                        <div className="max-w-3xl mx-auto">
                            <div className="text-lg text-gray-700 mb-6 italic">
                                "Since implementing this system, we've reduced
                                inventory costs by 30% and improved customer
                                service significantly. The expiry tracking alone
                                has saved us thousands of cedis in waste."
                            </div>
                            <div className="flex items-center justify-center gap-4">
                                <div className="w-12 h-12 bg-blue-200 rounded-full flex items-center justify-center">
                                    <span className="text-blue-700 font-bold text-lg">
                                        JA
                                    </span>
                                </div>
                                <div className="text-left">
                                    <div className="font-semibold text-gray-900">
                                        John Asante
                                    </div>
                                    <div className="text-sm text-gray-600">
                                        Pharmacy Owner, Accra
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Performance Metrics */}
                <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="bg-white rounded-xl p-6 text-center shadow-lg">
                        <div className="text-3xl font-bold text-green-600 mb-2">
                            30%
                        </div>
                        <div className="text-gray-700 font-medium mb-1">
                            Cost Reduction
                        </div>
                        <div className="text-sm text-gray-500">
                            Average inventory cost savings
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-6 text-center shadow-lg">
                        <div className="text-3xl font-bold text-blue-600 mb-2">
                            45%
                        </div>
                        <div className="text-gray-700 font-medium mb-1">
                            Time Saved
                        </div>
                        <div className="text-sm text-gray-500">
                            Daily operational efficiency
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-6 text-center shadow-lg">
                        <div className="text-3xl font-bold text-purple-600 mb-2">
                            98%
                        </div>
                        <div className="text-gray-700 font-medium mb-1">
                            Customer Satisfaction
                        </div>
                        <div className="text-sm text-gray-500">
                            User satisfaction rating
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default StatisticsSection;
