import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';
import HeroSection from '../components/organisms/HeroSection';
import FeaturesSection from '../components/organisms/FeaturesSection';
import StatisticsSection from '../components/organisms/StatisticsSection';
import TestimonialsSection from '../components/organisms/TestimonialsSection';
import Footer from '../components/organisms/Footer';
import SEOMetadata from '../components/atoms/SEOMetadata';
import { useSEO, SEO_PRESETS } from '../hooks/useSEO';

export const Homepage: React.FC = () => {
    const { isAuthenticated } = useAuthStore();
    const navigate = useNavigate();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);

    // SEO configuration for homepage
    const seoData = useSEO(SEO_PRESETS.pharmcare);

    // Handle scroll effect for navbar
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Smooth scroll to section
    const scrollToSection = (sectionId: string) => {
        const element = document.getElementById(sectionId);
        if (element) {
            element.scrollIntoView({
                behavior: 'smooth',
                block: 'start',
            });
        }
        setIsMobileMenuOpen(false);
    };

    // Handle CTA actions
    const handleGetStarted = () => {
        if (isAuthenticated) {
            navigate('/dashboard');
        } else {
            navigate('/register');
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

            {/* Navigation Bar */}
            <nav
                className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
                    isScrolled
                        ? 'bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm'
                        : 'bg-white/90 backdrop-blur-sm border-b border-gray-100'
                }`}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        {/* Logo */}
                        <div className="flex items-center">
                            <Link
                                to="/"
                                className="flex items-center space-x-2 group"
                                onClick={() =>
                                    window.scrollTo({
                                        top: 0,
                                        behavior: 'smooth',
                                    })
                                }
                            >
                                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                                    <svg
                                        className="w-5 h-5 text-white"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 4a1 1 0 011-1h12a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1V8z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                </div>
                                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent group-hover:from-blue-700 group-hover:to-indigo-700 transition-all duration-200">
                                    PharmCare
                                </h1>
                            </Link>
                        </div>

                        {/* Navigation Links */}
                        <div className="hidden md:flex items-center space-x-8">
                            <button
                                onClick={() => scrollToSection('features')}
                                className="text-gray-600 hover:text-blue-600 transition-colors duration-200 font-medium"
                            >
                                Features
                            </button>
                            <button
                                onClick={() => scrollToSection('statistics')}
                                className="text-gray-600 hover:text-blue-600 transition-colors duration-200 font-medium"
                            >
                                Solutions
                            </button>
                            <button
                                onClick={() => scrollToSection('testimonials')}
                                className="text-gray-600 hover:text-blue-600 transition-colors duration-200 font-medium"
                            >
                                Testimonials
                            </button>
                            <a
                                href="#contact"
                                className="text-gray-600 hover:text-blue-600 transition-colors duration-200 font-medium"
                            >
                                Contact
                            </a>
                        </div>

                        {/* CTA Buttons */}
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={handleSignIn}
                                className="hidden sm:block text-gray-600 hover:text-blue-600 transition-colors duration-200 font-medium"
                            >
                                {isAuthenticated ? 'Dashboard' : 'Sign In'}
                            </button>
                            <button
                                onClick={handleGetStarted}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 active:transform-none"
                            >
                                {isAuthenticated
                                    ? 'Go to Dashboard'
                                    : 'Get Started'}
                            </button>
                        </div>

                        {/* Mobile Menu Button */}
                        <div className="md:hidden">
                            <button
                                onClick={() =>
                                    setIsMobileMenuOpen(!isMobileMenuOpen)
                                }
                                className="text-gray-600 hover:text-blue-600 p-2 transition-colors duration-200"
                                aria-label="Toggle mobile menu"
                            >
                                <svg
                                    className={`w-6 h-6 transition-transform duration-200 ${
                                        isMobileMenuOpen ? 'rotate-90' : ''
                                    }`}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d={
                                            isMobileMenuOpen
                                                ? 'M6 18L18 6M6 6l12 12'
                                                : 'M4 6h16M4 12h16M4 18h16'
                                        }
                                    />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu */}
                <div
                    className={`md:hidden transition-all duration-300 overflow-hidden ${
                        isMobileMenuOpen
                            ? 'max-h-96 opacity-100'
                            : 'max-h-0 opacity-0'
                    }`}
                >
                    <div className="px-4 pt-2 pb-6 space-y-4 bg-white/95 backdrop-blur-md border-t border-gray-200">
                        <button
                            onClick={() => scrollToSection('features')}
                            className="block w-full text-left text-gray-600 hover:text-blue-600 transition-colors duration-200 font-medium py-2"
                        >
                            Features
                        </button>
                        <button
                            onClick={() => scrollToSection('statistics')}
                            className="block w-full text-left text-gray-600 hover:text-blue-600 transition-colors duration-200 font-medium py-2"
                        >
                            Solutions
                        </button>
                        <button
                            onClick={() => scrollToSection('testimonials')}
                            className="block w-full text-left text-gray-600 hover:text-blue-600 transition-colors duration-200 font-medium py-2"
                        >
                            Testimonials
                        </button>
                        <a
                            href="#contact"
                            className="block text-gray-600 hover:text-blue-600 transition-colors duration-200 font-medium py-2"
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            Contact
                        </a>
                        <div className="flex flex-col space-y-3 pt-4 border-t border-gray-200">
                            <button
                                onClick={handleSignIn}
                                className="text-gray-600 hover:text-blue-600 transition-colors duration-200 font-medium text-left py-2"
                            >
                                {isAuthenticated ? 'Dashboard' : 'Sign In'}
                            </button>
                            <button
                                onClick={handleGetStarted}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 text-center"
                            >
                                {isAuthenticated
                                    ? 'Go to Dashboard'
                                    : 'Get Started'}
                            </button>
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

                {/* Call-to-Action Section */}
                <section className="py-20 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700 text-white relative overflow-hidden">
                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-10">
                        <div
                            className="absolute inset-0"
                            style={{
                                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                            }}
                        />
                    </div>

                    <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8 relative z-10">
                        <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                            Ready to Transform Your{' '}
                            <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                                Pharmacy?
                            </span>
                        </h2>
                        <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto leading-relaxed">
                            Join thousands of pharmacies worldwide that trust
                            PharmCare to streamline their operations and
                            increase profitability.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                            <button
                                onClick={handleGetStarted}
                                className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-50 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 active:transform-none group"
                            >
                                <span className="flex items-center space-x-2">
                                    <span>
                                        {isAuthenticated
                                            ? 'Go to Dashboard'
                                            : 'Start Free Trial'}
                                    </span>
                                    <svg
                                        className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M13 7l5 5m0 0l-5 5m5-5H6"
                                        />
                                    </svg>
                                </span>
                            </button>
                            <Link
                                to="#contact"
                                className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-blue-600 transition-all duration-200 inline-flex items-center space-x-2 group"
                            >
                                <span>Schedule Demo</span>
                                <svg
                                    className="w-5 h-5 group-hover:scale-110 transition-transform duration-200"
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
                            </Link>
                        </div>
                        <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-6 text-sm mt-6 opacity-75">
                            <div className="flex items-center space-x-2">
                                <svg
                                    className="w-4 h-4 text-green-300"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                                <span>30-day free trial</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <svg
                                    className="w-4 h-4 text-green-300"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                                <span>No credit card required</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <svg
                                    className="w-4 h-4 text-green-300"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                                <span>Setup in minutes</span>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <Footer />

            {/* Scroll to Top Button */}
            <button
                className={`fixed bottom-8 right-8 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 z-40 transform ${
                    isScrolled
                        ? 'translate-y-0 opacity-100'
                        : 'translate-y-16 opacity-0'
                }`}
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                aria-label="Scroll to top"
            >
                <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 10l7-7m0 0l7 7m-7-7v18"
                    />
                </svg>
            </button>

            {/* Mobile menu backdrop */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}
        </div>
    );
};

export default Homepage;
