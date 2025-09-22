import React from 'react';
import { FiArrowRight, FiPlay, FiShield, FiTrendingUp } from 'react-icons/fi';
import Badge from '../atoms/Badge';

export const HeroSection: React.FC = () => {
    return (
        <section className="relative bg-gradient-to-br from-blue-50 via-white to-indigo-50 pt-20 pb-16 lg:pt-28 lg:pb-24">
            {/* Background decorations */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-32 w-80 h-80 bg-blue-100 rounded-full opacity-20 blur-3xl"></div>
                <div className="absolute -bottom-40 -left-32 w-80 h-80 bg-indigo-100 rounded-full opacity-20 blur-3xl"></div>
            </div>

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    {/* Left Content */}
                    <div className="text-center lg:text-left">
                        <div className="mb-6">
                            <Badge variant="info" size="md" className="mb-4">
                                🚀 Next-Gen Pharmacy Management
                            </Badge>
                        </div>

                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
                            Streamline Your{' '}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                                Pharmacy
                            </span>{' '}
                            Operations
                        </h1>

                        <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                            Comprehensive pharmacy management system with
                            real-time inventory tracking, sales analytics,
                            expiry monitoring, and automated reporting. Built
                            for modern pharmacies.
                        </p>

                        {/* Key Benefits */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                            <div className="flex items-center gap-2 justify-center lg:justify-start">
                                <FiShield className="text-green-500 text-lg" />
                                <span className="text-sm font-medium text-gray-700">
                                    HIPAA Compliant
                                </span>
                            </div>
                            <div className="flex items-center gap-2 justify-center lg:justify-start">
                                <FiTrendingUp className="text-blue-500 text-lg" />
                                <span className="text-sm font-medium text-gray-700">
                                    Real-time Analytics
                                </span>
                            </div>
                            <div className="flex items-center gap-2 justify-center lg:justify-start">
                                <div className="w-4 h-4 bg-purple-500 rounded-full"></div>
                                <span className="text-sm font-medium text-gray-700">
                                    24/7 Support
                                </span>
                            </div>
                        </div>

                        {/* CTA Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                            <button className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center justify-center gap-2">
                                Get Started Free
                                <FiArrowRight className="text-lg" />
                            </button>

                            <button className="border border-gray-300 text-gray-700 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-50 transition-all duration-200 flex items-center justify-center gap-2">
                                <FiPlay className="text-lg" />
                                Watch Demo
                            </button>
                        </div>

                        {/* Trust indicators */}
                        <div className="mt-8 pt-8 border-t border-gray-200">
                            <p className="text-sm text-gray-500 mb-4">
                                Trusted by 500+ pharmacies worldwide
                            </p>
                            <div className="flex items-center gap-6 justify-center lg:justify-start">
                                <div className="text-xs text-gray-400 font-medium">
                                    ⭐⭐⭐⭐⭐ 4.9/5 Rating
                                </div>
                                <div className="text-xs text-gray-400 font-medium">
                                    • 99.9% Uptime
                                </div>
                                <div className="text-xs text-gray-400 font-medium">
                                    • ISO 27001 Certified
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Content - Dashboard Preview */}
                    <div className="relative">
                        <div className="relative z-10">
                            {/* Dashboard mockup */}
                            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200">
                                {/* Header */}
                                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                                        <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                                        <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                                        <div className="ml-4 text-sm text-gray-600 font-medium">
                                            pharmacy-manager.com
                                        </div>
                                    </div>
                                </div>

                                {/* Dashboard content */}
                                <div className="p-6">
                                    <div className="grid grid-cols-2 gap-4 mb-6">
                                        <div className="bg-blue-50 p-4 rounded-lg">
                                            <div className="text-2xl font-bold text-blue-600">
                                                1,234
                                            </div>
                                            <div className="text-sm text-gray-600">
                                                Total Sales
                                            </div>
                                        </div>
                                        <div className="bg-green-50 p-4 rounded-lg">
                                            <div className="text-2xl font-bold text-green-600">
                                                ₵45,670
                                            </div>
                                            <div className="text-sm text-gray-600">
                                                Revenue
                                            </div>
                                        </div>
                                    </div>

                                    {/* Chart area */}
                                    <div className="bg-gray-50 h-32 rounded-lg mb-4 flex items-center justify-center">
                                        <div className="text-gray-400 text-sm">
                                            Sales Analytics Chart
                                        </div>
                                    </div>

                                    {/* Recent activity */}
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-gray-600">
                                                Paracetamol sold
                                            </span>
                                            <Badge variant="success" size="sm">
                                                +50 units
                                            </Badge>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-gray-600">
                                                Low stock alert
                                            </span>
                                            <Badge variant="warning" size="sm">
                                                3 items
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Floating elements */}
                        <div className="absolute -top-6 -left-6 bg-white rounded-lg shadow-lg p-3 z-20">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                                <span className="text-xs font-medium text-gray-700">
                                    Live Updates
                                </span>
                            </div>
                        </div>

                        <div className="absolute -bottom-6 -right-6 bg-white rounded-lg shadow-lg p-3 z-20">
                            <div className="flex items-center gap-2">
                                <FiShield className="text-blue-500 text-sm" />
                                <span className="text-xs font-medium text-gray-700">
                                    Secure & Encrypted
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default HeroSection;
