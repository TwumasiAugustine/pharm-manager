import React, { useEffect, useState } from 'react';
import {
    FiArrowRight,
    FiPlay,
    FiShield,
    FiTrendingUp,
    FiZap,
} from 'react-icons/fi';
import Badge from '../atoms/Badge';
import '../../styles/hero-animations.css';

export const HeroSection: React.FC = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [animateStats, setAnimateStats] = useState(false);

    useEffect(() => {
        setIsVisible(true);
        const timer = setTimeout(() => setAnimateStats(true), 800);
        return () => clearTimeout(timer);
    }, []);

    return (
        <section className="relative bg-gradient-to-br from-blue-50 via-white to-indigo-50 min-h-screen flex items-center overflow-hidden">
            {/* Enhanced Background decorations with mobile-optimized positioning */}
            <div className="absolute inset-0 overflow-hidden">
                {/* Mobile: smaller, repositioned blobs */}
                <div className="absolute -top-20 -right-16 w-40 h-40 sm:w-60 sm:h-60 lg:-top-40 lg:-right-32 lg:w-80 lg:h-80 bg-blue-100 rounded-full opacity-20 blur-2xl lg:blur-3xl animate-pulse duration-4000"></div>
                <div className="absolute -bottom-20 -left-16 w-40 h-40 sm:w-60 sm:h-60 lg:-bottom-40 lg:-left-32 lg:w-80 lg:h-80 bg-indigo-100 rounded-full opacity-20 blur-2xl lg:blur-3xl animate-pulse duration-6000 delay-1000"></div>

                {/* Additional floating particles for enhanced visual appeal */}
                <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-blue-400 rounded-full opacity-40 animate-bounce duration-3000 delay-500"></div>
                <div className="absolute top-3/4 right-1/4 w-1 h-1 bg-indigo-400 rounded-full opacity-40 animate-bounce duration-2000 delay-1000"></div>
                <div className="absolute top-1/2 left-3/4 w-3 h-3 bg-purple-400 rounded-full opacity-30 animate-pulse duration-4000 delay-2000"></div>
            </div>

            <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                    {/* Left Content - Mobile-first approach */}
                    <div
                        className={`text-center lg:text-left space-y-6 lg:space-y-8 transform transition-all duration-1000 ${
                            isVisible
                                ? 'translate-y-0 opacity-100'
                                : 'translate-y-8 opacity-0'
                        }`}
                    >
                        <div className="space-y-4">
                            <div
                                className={`transform transition-all duration-700 delay-300 ${
                                    isVisible
                                        ? 'translate-y-0 opacity-100'
                                        : 'translate-y-4 opacity-0'
                                }`}
                            >
                                <Badge
                                    variant="info"
                                    size="md"
                                    className="inline-flex items-center gap-2 animate-pulse"
                                >
                                    <FiZap className="w-4 h-4" />
                                    Next-Gen Pharmacy Management
                                </Badge>
                            </div>

                            <h1
                                className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight transform transition-all duration-700 delay-500 ${
                                    isVisible
                                        ? 'translate-y-0 opacity-100'
                                        : 'translate-y-6 opacity-0'
                                }`}
                            >
                                Streamline Your{' '}
                                <span className="relative">
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 animate-gradient-x">
                                        Pharmacy
                                    </span>
                                    <div className="absolute -bottom-1 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 transform scale-x-0 animate-scale-x delay-1000"></div>
                                </span>{' '}
                                Operations
                            </h1>

                            <p
                                className={`text-lg sm:text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto lg:mx-0 transform transition-all duration-700 delay-700 ${
                                    isVisible
                                        ? 'translate-y-0 opacity-100'
                                        : 'translate-y-4 opacity-0'
                                }`}
                            >
                                Comprehensive pharmacy management system with
                                real-time inventory tracking, sales analytics,
                                expiry monitoring, and automated reporting.
                                Built for modern pharmacies.
                            </p>
                        </div>

                        {/* Enhanced Key Benefits - Mobile-optimized grid */}
                        <div
                            className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 transform transition-all duration-700 delay-900 ${
                                isVisible
                                    ? 'translate-y-0 opacity-100'
                                    : 'translate-y-4 opacity-0'
                            }`}
                        >
                            <div className="flex items-center gap-2 justify-center lg:justify-start p-2 rounded-lg hover:bg-white/50 transition-all duration-300 transform hover:scale-105">
                                <FiShield className="text-green-500 text-lg animate-pulse" />
                                <span className="text-sm font-medium text-gray-700">
                                    HIPAA Compliant
                                </span>
                            </div>
                            <div className="flex items-center gap-2 justify-center lg:justify-start p-2 rounded-lg hover:bg-white/50 transition-all duration-300 transform hover:scale-105">
                                <FiTrendingUp className="text-blue-500 text-lg animate-pulse delay-200" />
                                <span className="text-sm font-medium text-gray-700">
                                    Real-time Analytics
                                </span>
                            </div>
                            <div className="flex items-center gap-2 justify-center lg:justify-start p-2 rounded-lg hover:bg-white/50 transition-all duration-300 transform hover:scale-105 sm:col-span-2 lg:col-span-1">
                                <div className="w-4 h-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-pulse delay-400"></div>
                                <span className="text-sm font-medium text-gray-700">
                                    24/7 Support
                                </span>
                            </div>
                        </div>

                        {/* Enhanced CTA Buttons - Mobile-first layout */}
                        <div
                            className={`flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start transform transition-all duration-700 delay-1100 ${
                                isVisible
                                    ? 'translate-y-0 opacity-100'
                                    : 'translate-y-4 opacity-0'
                            }`}
                        >
                            <button className="group bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold text-base sm:text-lg hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-2xl transform hover:-translate-y-1 hover:scale-105 flex items-center justify-center gap-2 animate-gradient-x">
                                Get Started Free
                                <FiArrowRight className="text-lg group-hover:translate-x-1 transition-transform duration-300" />
                            </button>

                            <button className="group border-2 border-gray-300 text-gray-700 px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold text-base sm:text-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1 flex items-center justify-center gap-2">
                                <FiPlay className="text-lg group-hover:scale-110 transition-transform duration-300" />
                                Watch Demo
                            </button>
                        </div>

                        {/* Enhanced Trust indicators - Mobile-optimized */}
                        <div
                            className={`pt-6 sm:pt-8 border-t border-gray-200 space-y-4 transform transition-all duration-700 delay-1300 ${
                                isVisible
                                    ? 'translate-y-0 opacity-100'
                                    : 'translate-y-4 opacity-0'
                            }`}
                        >
                            <p className="text-sm text-gray-500">
                                Trusted by 500+ pharmacies worldwide
                            </p>
                            <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-6 justify-center lg:justify-start">
                                <div className="text-xs text-gray-400 font-medium flex items-center gap-1">
                                    <span className="text-yellow-400">
                                        ⭐⭐⭐⭐⭐
                                    </span>
                                    <span>4.9/5 Rating</span>
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

                    {/* Right Content - Enhanced Dashboard Preview with mobile-first design */}
                    <div
                        className={`relative mt-8 lg:mt-0 transform transition-all duration-1000 delay-500 ${
                            isVisible
                                ? 'translate-x-0 opacity-100'
                                : 'translate-x-8 opacity-0'
                        }`}
                    >
                        <div className="relative z-10">
                            {/* Enhanced Dashboard mockup */}
                            <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden border border-gray-200 transform hover:scale-105 transition-all duration-500 hover:shadow-3xl">
                                {/* Header with improved animations */}
                                <div className="bg-gray-50 px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 bg-red-400 rounded-full animate-pulse duration-2000"></div>
                                        <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse duration-2000 delay-200"></div>
                                        <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse duration-2000 delay-400"></div>
                                        <div className="ml-2 sm:ml-4 text-xs sm:text-sm text-gray-600 font-medium truncate">
                                            https://www.pharmcare.com/dashboard
                                        </div>
                                    </div>
                                </div>

                                {/* Enhanced Dashboard content */}
                                <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                                    <div className="grid grid-cols-2 gap-3 sm:gap-4">
                                        <div
                                            className={`bg-gradient-to-br from-blue-50 to-blue-100 p-3 sm:p-4 rounded-lg transform transition-all duration-500 hover:scale-105 ${
                                                animateStats
                                                    ? 'animate-bounce-in'
                                                    : ''
                                            }`}
                                        >
                                            <div className="text-xl sm:text-2xl font-bold text-blue-600 animate-count-up">
                                                1,234
                                            </div>
                                            <div className="text-xs sm:text-sm text-gray-600">
                                                Total Sales
                                            </div>
                                        </div>
                                        <div
                                            className={`bg-gradient-to-br from-green-50 to-green-100 p-3 sm:p-4 rounded-lg transform transition-all duration-500 hover:scale-105 delay-200 ${
                                                animateStats
                                                    ? 'animate-bounce-in'
                                                    : ''
                                            }`}
                                        >
                                            <div className="text-xl sm:text-2xl font-bold text-green-600 animate-count-up">
                                                ₵45,670
                                            </div>
                                            <div className="text-xs sm:text-sm text-gray-600">
                                                Revenue
                                            </div>
                                        </div>
                                    </div>

                                    {/* Enhanced Chart area with animated bars */}
                                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 h-24 sm:h-32 rounded-lg flex items-end justify-center p-4 space-x-2">
                                        <div
                                            className="bg-blue-400 w-3 rounded-t animate-grow-bar delay-1000"
                                            style={{ height: '60%' }}
                                        ></div>
                                        <div
                                            className="bg-green-400 w-3 rounded-t animate-grow-bar delay-1200"
                                            style={{ height: '80%' }}
                                        ></div>
                                        <div
                                            className="bg-purple-400 w-3 rounded-t animate-grow-bar delay-1400"
                                            style={{ height: '45%' }}
                                        ></div>
                                        <div
                                            className="bg-yellow-400 w-3 rounded-t animate-grow-bar delay-1600"
                                            style={{ height: '70%' }}
                                        ></div>
                                        <div
                                            className="bg-pink-400 w-3 rounded-t animate-grow-bar delay-1800"
                                            style={{ height: '90%' }}
                                        ></div>
                                    </div>

                                    {/* Enhanced Recent activity */}
                                    <div className="space-y-2 sm:space-y-3">
                                        <div className="flex items-center justify-between text-sm p-2 rounded-lg hover:bg-gray-50 transition-all duration-300 transform hover:translate-x-1">
                                            <span className="text-gray-600 text-xs sm:text-sm">
                                                Paracetamol sold
                                            </span>
                                            <Badge
                                                variant="success"
                                                size="sm"
                                                className="animate-pulse"
                                            >
                                                +50 units
                                            </Badge>
                                        </div>
                                        <div className="flex items-center justify-between text-sm p-2 rounded-lg hover:bg-gray-50 transition-all duration-300 transform hover:translate-x-1">
                                            <span className="text-gray-600 text-xs sm:text-sm">
                                                Low stock alert
                                            </span>
                                            <Badge
                                                variant="warning"
                                                size="sm"
                                                className="animate-pulse delay-300"
                                            >
                                                3 items
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Enhanced Floating elements with mobile-optimized positioning */}
                        <div className="absolute -top-3 -left-3 sm:-top-6 sm:-left-6 bg-white rounded-lg shadow-lg p-2 sm:p-3 z-20 animate-float-1">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                                <span className="text-xs font-medium text-gray-700">
                                    Live Updates
                                </span>
                            </div>
                        </div>

                        <div className="absolute -bottom-3 -right-3 sm:-bottom-6 sm:-right-6 bg-white rounded-lg shadow-lg p-2 sm:p-3 z-20 animate-float-2">
                            <div className="flex items-center gap-2">
                                <FiShield className="text-blue-500 text-sm animate-pulse" />
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
