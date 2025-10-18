import React from 'react';
import {
    FiMail,
    FiPhone,
    FiMapPin,
    FiFacebook,
    FiTwitter,
    FiLinkedin,
    FiInstagram,
    FiArrowRight,
} from 'react-icons/fi';
import { useSystemHealth } from '../../hooks/useHealth';

export const Footer: React.FC = () => {
    const currentYear = new Date().getFullYear();
    const { data: systemHealth, isLoading: healthLoading } = useSystemHealth();

    const quickLinks = [
        { name: 'Features', href: '#features' },
        { name: 'Pricing', href: '#pricing' },
        { name: 'About Us', href: '#about' },
        { name: 'Contact', href: '#contact' },
        { name: 'Blog', href: '#blog' },
        { name: 'Help Center', href: '#help' },
    ];

    const solutions = [
        { name: 'Inventory Management', href: '#inventory' },
        { name: 'Sales Analytics', href: '#analytics' },
        { name: 'Expiry Tracking', href: '#expiry' },
        { name: 'Customer Management', href: '#customers' },
        { name: 'Multi-Branch', href: '#multi-branch' },
        { name: 'API Integration', href: '#api' },
    ];

    const resources = [
        { name: 'Documentation', href: '#docs' },
        { name: 'API Reference', href: '#api-docs' },
        { name: 'Community', href: '#community' },
        { name: 'Tutorials', href: '#tutorials' },
        { name: 'Webinars', href: '#webinars' },
        { name: 'Case Studies', href: '#cases' },
    ];

    const legal = [
        { name: 'Privacy Policy', href: '#privacy' },
        { name: 'Terms of Service', href: '#terms' },
        { name: 'Cookie Policy', href: '#cookies' },
        { name: 'HIPAA Compliance', href: '#hipaa' },
        { name: 'Security', href: '#security' },
        { name: 'Accessibility', href: '#accessibility' },
    ];

    const socialLinks = [
        { icon: <FiFacebook />, href: '#', label: 'Facebook' },
        { icon: <FiTwitter />, href: '#', label: 'Twitter' },
        { icon: <FiLinkedin />, href: '#', label: 'LinkedIn' },
        { icon: <FiInstagram />, href: '#', label: 'Instagram' },
    ];

    return (
        <footer className="bg-gray-900 text-white">
            {/* Newsletter Section */}
            <div className="border-b border-gray-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="grid lg:grid-cols-2 gap-8 items-center">
                        <div>
                            <h3 className="text-2xl font-bold mb-4">
                                Stay Updated with Pharmacy Trends
                            </h3>
                            <p className="text-gray-400 text-lg">
                                Get the latest insights, tips, and updates about
                                pharmacy management and healthcare technology
                                delivered to your inbox.
                            </p>
                        </div>

                        <div className="lg:text-right">
                            <div className="flex flex-col sm:flex-row gap-3 max-w-md lg:ml-auto">
                                <input
                                    type="email"
                                    placeholder="Enter your email address"
                                    className="flex-1 px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                                <button className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-semibold transition-colors duration-200 flex items-center justify-center gap-2 whitespace-nowrap">
                                    Subscribe
                                    <FiArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                            <p className="text-sm text-gray-400 mt-2">
                                No spam. Unsubscribe anytime.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Footer Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
                    {/* Company Info */}
                    <div className="lg:col-span-2">
                        <div className="mb-6">
                            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                                PharmManager
                            </h2>
                            <p className="text-gray-400 mt-4 leading-relaxed">
                                The leading pharmacy management system trusted
                                by healthcare professionals worldwide.
                                Streamline your operations with our
                                comprehensive, secure, and user-friendly
                                platform.
                            </p>
                        </div>

                        {/* Contact Info */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <FiMail className="text-blue-400 w-5 h-5" />
                                <span className="text-gray-300">
                                    support@pharmmanager.com
                                </span>
                            </div>
                            <div className="flex items-center gap-3">
                                <FiPhone className="text-blue-400 w-5 h-5" />
                                <span className="text-gray-300">
                                    +233 24 123 4567
                                </span>
                            </div>
                            <div className="flex items-center gap-3">
                                <FiMapPin className="text-blue-400 w-5 h-5" />
                                <span className="text-gray-300">
                                    Accra, Ghana
                                </span>
                            </div>
                        </div>

                        {/* Social Links */}
                        <div className="mt-6">
                            <p className="text-sm text-gray-400 mb-3">
                                Follow us on social media
                            </p>
                            <div className="flex gap-3">
                                {socialLinks.map((social, index) => (
                                    <a
                                        key={index}
                                        href={social.href}
                                        aria-label={social.label}
                                        className="w-10 h-10 bg-gray-800 hover:bg-blue-600 rounded-lg flex items-center justify-center transition-colors duration-200"
                                    >
                                        {social.icon}
                                    </a>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-lg font-semibold mb-6">
                            Quick Links
                        </h3>
                        <ul className="space-y-3">
                            {quickLinks.map((link, index) => (
                                <li key={index}>
                                    <a
                                        href={link.href}
                                        className="text-gray-400 hover:text-white transition-colors duration-200"
                                    >
                                        {link.name}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Solutions */}
                    <div>
                        <h3 className="text-lg font-semibold mb-6">
                            Solutions
                        </h3>
                        <ul className="space-y-3">
                            {solutions.map((solution, index) => (
                                <li key={index}>
                                    <a
                                        href={solution.href}
                                        className="text-gray-400 hover:text-white transition-colors duration-200"
                                    >
                                        {solution.name}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Resources */}
                    <div>
                        <h3 className="text-lg font-semibold mb-6">
                            Resources
                        </h3>
                        <ul className="space-y-3">
                            {resources.map((resource, index) => (
                                <li key={index}>
                                    <a
                                        href={resource.href}
                                        className="text-gray-400 hover:text-white transition-colors duration-200"
                                    >
                                        {resource.name}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Legal */}
                    <div>
                        <h3 className="text-lg font-semibold mb-6">Legal</h3>
                        <ul className="space-y-3">
                            {legal.map((item, index) => (
                                <li key={index}>
                                    <a
                                        href={item.href}
                                        className="text-gray-400 hover:text-white transition-colors duration-200"
                                    >
                                        {item.name}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>

            {/* Bottom Footer */}
            <div className="border-t border-gray-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="text-gray-400 text-sm">
                            © {currentYear} PharmCare. All rights reserved.
                        </div>

                        <div className="flex md:flex-wrap items-center gap-6 text-sm text-gray-400">
                                <span>Made with ❤️ in Ghana</span>

                                <span>Serving pharmacies globally</span>
                                <span className='md:sr-only'>•</span>
                            <span className="flex items-center gap-1">
                                {healthLoading ? (
                                    <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                                ) : (
                                    <div
                                        className={`w-2 h-2 rounded-full ${
                                            systemHealth?.status ===
                                            'operational'
                                                ? 'bg-green-400 animate-pulse'
                                                : systemHealth?.status ===
                                                  'degraded'
                                                ? 'bg-yellow-400 animate-pulse'
                                                : systemHealth?.status ===
                                                  'maintenance'
                                                ? 'bg-blue-400 animate-pulse'
                                                : 'bg-red-400 animate-pulse'
                                        }`}
                                        title={`System Status: ${
                                            systemHealth?.status || 'Unknown'
                                        } | Response Time: ${
                                            systemHealth?.responseTime?.toFixed(
                                                0,
                                            ) || 'N/A'
                                        }ms | Last Check: ${
                                            systemHealth?.lastChecked
                                                ? new Date(
                                                      systemHealth.lastChecked,
                                                  ).toLocaleTimeString()
                                                : 'N/A'
                                        }`}
                                    ></div>
                                )}
                                <span>
                                    {
                                        healthLoading
                                            ? 'Checking system status...'
                                            : systemHealth?.status ===
                                              'operational'
                                            ? 'All systems operational'
                                            : systemHealth?.status ===
                                              'degraded'
                                            ? 'Some services degraded'
                                            : systemHealth?.status ===
                                              'maintenance'
                                            ? 'Under maintenance'
                                            : systemHealth?.status === 'outage'
                                            ? 'Service outage detected'
                                            : 'All systems operational' // Default to operational for fallback data
                                    }
                                </span>
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
