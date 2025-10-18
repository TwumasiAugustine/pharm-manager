import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';
import HeroSection from '../components/organisms/HeroSection';
import FeaturesSection from '../components/organisms/FeaturesSection';
import StatisticsSection from '../components/organisms/StatisticsSection';
import TestimonialsSection from '../components/organisms/TestimonialsSection';
import Footer from '../components/organisms/Footer';
import SEOMetadata from '../components/atoms/SEOMetadata';
import { useSEO, SEO_PRESETS } from '../hooks/useSEO';
import {
    FiChevronRight,
    FiArrowUp,
    FiStar,
    FiShield,
    FiClock,
    FiCheck
} from 'react-icons/fi';
import {UserRole} from '../types/auth.types'


export const Homepage: React.FC = () => {
    const { isAuthenticated, user } = useAuthStore();
    const navigate = useNavigate();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [activeSection, setActiveSection] = useState('hero');
    const [showScrollTop, setShowScrollTop] = useState(false);
    const observerRef = useRef<IntersectionObserver | null>(null);

    // SEO configuration for homepage
    const seoData = useSEO(SEO_PRESETS.pharmcare);

    // Enhanced scroll effects and section tracking
    useEffect(() => {
        const handleScroll = () => {
            const scrollY = window.scrollY;
            setIsScrolled(scrollY > 20);
            setShowScrollTop(scrollY > 500);
        };

        // Intersection Observer for active section tracking
        const sections = ['hero', 'features', 'statistics', 'testimonials'];
        observerRef.current = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
                        setActiveSection(entry.target.id);
                    }
                });
            },
            {
                threshold: [0.1, 0.5],
                rootMargin: '-20% 0px -20% 0px',
            }
        );

        // Observe all sections
        sections.forEach((sectionId) => {
            const element = document.getElementById(sectionId);
            if (element && observerRef.current) {
                observerRef.current.observe(element);
            }
        });

        window.addEventListener('scroll', handleScroll, { passive: true });

        return () => {
            window.removeEventListener('scroll', handleScroll);
            if (observerRef.current) {
                observerRef.current.disconnect();
            }
        };
    }, []);

    // Enhanced smooth scroll with mobile menu close
    const scrollToSection = (sectionId: string) => {
        const element = document.getElementById(sectionId);
        if (element) {
            const headerOffset = 80;
            const elementPosition = element.offsetTop;
            const offsetPosition = elementPosition - headerOffset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth',
            });
        }
        setIsMobileMenuOpen(false);
    };

    // Handle mobile menu toggle with body scroll lock
    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
        if (!isMobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
    };

    // Clean up body scroll lock on component unmount
    useEffect(() => {
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, []);

    // Handle CTA actions
    const handleGetStarted = () => {
        if (isAuthenticated) {
            const destination = user?.role === UserRole.SUPER_ADMIN ? '/super-admin' : '/dashboard';
            navigate(destination);
        } else {
            navigate('/login');
        }
    };

    const handleSignIn = () => {
        if (isAuthenticated) {
            navigate('/dashboard');
        } else {
            navigate('/login');
        }
    };

    return (
        <div className="min-h-screen bg-white">
            {/* SEO Metadata */}
            <SEOMetadata
                title={seoData.title}
                description={seoData.description}
                keywords={seoData.keywords}
                canonicalUrl={seoData.canonicalUrl}
                ogTitle="PharmCare - Complete Pharmacy Management Solution"
                ogDescription="Transform your pharmacy operations with our comprehensive management system. Inventory tracking, sales processing, customer management, and analytics in one platform."
                ogImage={seoData.ogImage}
                ogType="website"
                twitterCard="summary_large_image"
                twitterSite="@PharmCare"
                twitterCreator="@PharmCare"
                structuredData={seoData.structuredData}
                preloadResources={seoData.preloadResources}
            />

            {/* Modern Navigation Bar */}
            <nav
                className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-out ${
                    isScrolled
                        ? 'bg-white/95 backdrop-blur-xl border-b border-gray-200/50 shadow-lg shadow-gray-100/50'
                        : 'bg-white/80 backdrop-blur-md border-b border-gray-100/30'
                }`}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16 sm:h-18">
                        {/* Enhanced Logo */}
                        <div className="flex items-center">
                            <Link
                                to="/"
                                className="flex items-center space-x-3 group"
                                onClick={() => scrollToSection('hero')}
                            >
                                <div className="relative">
                                    <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                                        <svg
                                            className="w-5 h-5 sm:w-6 sm:h-6 text-white"
                                            fill="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10h-4v4h-2v-4H7v-2h4V7h2v4h4v2z" />
                                        </svg>
                                    </div>
                                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
                                </div>
                                <div>
                                    <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent group-hover:from-blue-700 group-hover:via-indigo-700 group-hover:to-purple-700 transition-all duration-300">
                                        PharmCare
                                    </h1>
                                    <p className="text-xs text-gray-500 -mt-1 hidden sm:block">
                                        Healthcare Technology
                                    </p>
                                </div>
                            </Link>
                        </div>

                        {/* Desktop Navigation Links */}
                        <div className="hidden lg:flex items-center space-x-8">
                            {[
                                { id: 'features', label: 'Features' },
                                { id: 'statistics', label: 'Solutions' },
                                { id: 'testimonials', label: 'Reviews' },
                                { id: 'contact', label: 'Contact' },
                            ].map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => scrollToSection(item.id)}
                                    className={`relative px-3 py-2 rounded-lg font-medium transition-all duration-300 group ${
                                        activeSection === item.id
                                            ? 'text-blue-600 bg-blue-50'
                                            : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50/50'
                                    }`}
                                >
                                    {item.label}
                                    <span
                                        className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full ${
                                            activeSection === item.id
                                                ? 'w-full'
                                                : ''
                                        }`}
                                    ></span>
                                </button>
                            ))}
                        </div>

                        {/* CTA Buttons */}
                        <div className="flex items-center space-x-3">
                            <button
                                onClick={handleSignIn}
                                className="hidden sm:flex items-center px-4 py-2 text-gray-600 hover:text-blue-600 font-medium transition-all duration-300 rounded-lg hover:bg-blue-50/50"
                            >
                                {isAuthenticated ? 'Dashboard' : 'Sign In'}
                            </button>
                            <button
                                onClick={handleGetStarted}
                                className="hidden sm:flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 sm:px-6 py-2.5 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 text-sm sm:text-base"
                            >
                                <span>
                                    {isAuthenticated
                                        ? 'Dashboard'
                                        : 'Get Started'}
                                </span>
                                <FiChevronRight className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Mobile Menu Button */}
                        <div className="lg:hidden ml-3">
                            <button
                                onClick={toggleMobileMenu}
                                className="relative p-2 text-gray-600 hover:text-blue-600 transition-colors duration-300 rounded-lg hover:bg-blue-50/50"
                                aria-label="Toggle mobile menu"
                            >
                                <div className="w-6 h-6 relative">
                                    <span
                                        className={`absolute top-2 left-0 w-6 h-0.5 bg-current transition-all duration-300 ${
                                            isMobileMenuOpen
                                                ? 'rotate-45 translate-y-1'
                                                : ''
                                        }`}
                                    ></span>
                                    <span
                                        className={`absolute top-3.5 left-0 w-6 h-0.5 bg-current transition-all duration-300 ${
                                            isMobileMenuOpen ? 'opacity-0' : ''
                                        }`}
                                    ></span>
                                    <span
                                        className={`absolute top-5 left-0 w-6 h-0.5 bg-current transition-all duration-300 ${
                                            isMobileMenuOpen
                                                ? '-rotate-45 -translate-y-1'
                                                : ''
                                        }`}
                                    ></span>
                                </div>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Enhanced Mobile Menu */}
                <div
                    className={`lg:hidden fixed inset-x-0 top-16 sm:top-18 transition-all duration-500 ease-out ${
                        isMobileMenuOpen
                            ? 'opacity-100 translate-y-0 pointer-events-auto'
                            : 'opacity-0 -translate-y-4 pointer-events-none'
                    }`}
                >
                    <div className="bg-white/95 backdrop-blur-xl border-b border-gray-200/50 shadow-2xl">
                        <div className="px-4 py-6 space-y-1">
                            {/* Navigation Links */}
                            {[
                                {
                                    id: 'features',
                                    label: 'Features',
                                    icon: '✨',
                                },
                                {
                                    id: 'statistics',
                                    label: 'Solutions',
                                    icon: '🚀',
                                },
                                {
                                    id: 'testimonials',
                                    label: 'Reviews',
                                    icon: '⭐',
                                },
                                { id: 'contact', label: 'Contact', icon: '📞' },
                            ].map((item, index) => (
                                <button
                                    key={item.id}
                                    onClick={() => scrollToSection(item.id)}
                                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left font-medium transition-all duration-300 ${
                                        activeSection === item.id
                                            ? 'text-blue-600 bg-blue-50 shadow-sm'
                                            : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50/50'
                                    }`}
                                    style={{
                                        animationDelay: `${index * 50}ms`,
                                        animation: isMobileMenuOpen
                                            ? 'slideInLeft 0.3s ease-out forwards'
                                            : '',
                                    }}
                                >
                                    <span className="text-lg">{item.icon}</span>
                                    <span>{item.label}</span>
                                    <FiChevronRight className="w-4 h-4 ml-auto opacity-30" />
                                </button>
                            ))}

                            {/* Divider */}
                            <div className="my-4 border-t border-gray-200"></div>

                            {/* Action Buttons */}
                            <div className="space-y-3">
                                <button
                                    onClick={handleSignIn}
                                    className="w-full flex items-center justify-center space-x-2 px-4 py-3 text-gray-700 hover:text-blue-600 font-medium rounded-xl transition-all duration-300 hover:bg-blue-50/50"
                                >
                                    <span>
                                        {isAuthenticated
                                            ? '📊 Dashboard'
                                            : '🔐 Sign In'}
                                    </span>
                                </button>
                                <button
                                    onClick={handleGetStarted}
                                    className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0"
                                >
                                    <span>
                                        {isAuthenticated
                                            ? 'Go to Dashboard'
                                            : 'Get Started Free'}
                                    </span>
                                    <FiChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main>
                {/* Hero Section */}
                <section id="hero" className="pt-16">
                    <HeroSection />
                </section>

                {/* Features Section */}
                <section id="features">
                    <FeaturesSection />
                </section>

                {/* Statistics Section */}
                <section id="statistics">
                    <StatisticsSection />
                </section>

                {/* Testimonials Section */}
                <section id="testimonials">
                    <TestimonialsSection />
                </section>

                {/* Enhanced Call-to-Action Section */}
                <section className="relative py-16 sm:py-20 lg:py-24 bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800 text-white overflow-hidden">
                    {/* Animated Background Elements */}
                    <div className="absolute inset-0 opacity-20">
                        <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full blur-xl animate-float"></div>
                        <div
                            className="absolute top-32 right-20 w-32 h-32 bg-purple-300/10 rounded-full blur-2xl animate-float"
                            style={{ animationDelay: '2s' }}
                        ></div>
                        <div
                            className="absolute bottom-20 left-1/4 w-24 h-24 bg-blue-300/10 rounded-full blur-xl animate-float"
                            style={{ animationDelay: '4s' }}
                        ></div>
                        <div
                            className="absolute inset-0 opacity-30"
                            style={{
                                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='1.5'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                            }}
                        />
                    </div>

                    <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8 relative z-10">
                        {/* Headline */}
                        <div className="mb-8">
                            <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold mb-4 leading-tight">
                                Ready to Transform Your{' '}
                                <span className="relative inline-block">
                                    <span className="bg-gradient-to-r from-yellow-300 via-orange-300 to-pink-300 bg-clip-text text-transparent animate-gradient-x">
                                        Pharmacy?
                                    </span>
                                    <div className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-yellow-300 via-orange-300 to-pink-300 rounded-full animate-pulse"></div>
                                </span>
                            </h2>
                            <p className="text-lg sm:text-xl lg:text-2xl opacity-90 max-w-3xl mx-auto leading-relaxed">
                                Join{' '}
                                <span className="font-semibold text-yellow-300">
                                    5,000+
                                </span>{' '}
                                pharmacies worldwide that trust PharmManager to
                                streamline operations and boost profitability.
                            </p>
                        </div>

                        {/* Trust Indicators */}
                        <div className="flex flex-wrap justify-center items-center gap-6 mb-8 text-sm opacity-80">
                            <div className="flex items-center space-x-2">
                                <FiStar className="w-4 h-4 text-yellow-300" />
                                <span>4.9/5 Rating</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <FiShield className="w-4 h-4 text-green-300" />
                                <span>HIPAA Compliant</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <FiClock className="w-4 h-4 text-blue-300" />
                                <span>24/7 Support</span>
                            </div>
                        </div>

                        {/* CTA Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
                            <button
                                onClick={handleGetStarted}
                                className="group w-full sm:w-auto bg-white text-blue-600 px-8 py-4 rounded-2xl font-bold text-lg hover:bg-gray-50 transition-all duration-300 shadow-2xl hover:shadow-3xl transform hover:-translate-y-1 hover:scale-105 active:scale-95"
                            >
                                <span className="flex items-center justify-center space-x-2">
                                    <span>
                                        {isAuthenticated
                                            ? 'Go to Dashboard'
                                            : 'Start Free Trial'}
                                    </span>
                                    <FiChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                                </span>
                            </button>
                            <button
                                onClick={() => scrollToSection('contact')}
                                className="group w-full sm:w-auto border-2 border-white/50 backdrop-blur-sm text-white px-8 py-4 rounded-2xl font-semibold text-lg hover:bg-white/10 hover:border-white transition-all duration-300 hover:scale-105 active:scale-95"
                            >
                                <span className="flex items-center justify-center space-x-2">
                                    <span>Schedule Demo</span>
                                    <svg
                                        className="w-5 h-5 group-hover:scale-110 transition-transform duration-300"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                        />
                                    </svg>
                                </span>
                            </button>
                        </div>

                        {/* Benefits List */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm opacity-90">
                            {[
                                { icon: FiCheck, text: '30-day free trial' },
                                {
                                    icon: FiCheck,
                                    text: 'No credit card required',
                                },
                                { icon: FiCheck, text: 'Setup in 5 minutes' },
                            ].map((benefit, index) => (
                                <div
                                    key={index}
                                    className="flex items-center space-x-2 justify-center sm:justify-start p-3 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10"
                                    style={{
                                        animationDelay: `${index * 100}ms`,
                                        animation:
                                            'slideInUp 0.6s ease-out forwards',
                                    }}
                                >
                                    <benefit.icon className="w-4 h-4 text-green-300 flex-shrink-0" />
                                    <span className="font-medium">
                                        {benefit.text}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <Footer />

            {/* Enhanced Scroll to Top Button */}
            <button
                className={`fixed bottom-6 right-6 sm:bottom-8 sm:right-8 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white p-3 sm:p-4 rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-500 z-40 transform group ${
                    showScrollTop
                        ? 'translate-y-0 opacity-100 scale-100'
                        : 'translate-y-16 opacity-0 scale-75 pointer-events-none'
                }`}
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                aria-label="Scroll to top"
            >
                <FiArrowUp className="w-5 h-5 sm:w-6 sm:h-6 group-hover:-translate-y-1 transition-transform duration-300" />
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-400 to-indigo-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
            </button>

            {/* Enhanced Mobile menu backdrop */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/40 backdrop-blur-md z-40 lg:hidden transition-all duration-300"
                    onClick={toggleMobileMenu}
                />
            )}
        </div>
    );
};

export default Homepage;
