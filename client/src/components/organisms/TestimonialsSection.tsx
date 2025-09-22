import React from 'react';
import { FiStar } from 'react-icons/fi';
import { BsQuote } from 'react-icons/bs';

import Badge from '../atoms/Badge';

interface Testimonial {
    name: string;
    role: string;
    company: string;
    avatar: string;
    content: string;
    rating: number;
    metrics?: {
        label: string;
        value: string;
        color: string;
    };
}

export const TestimonialsSection: React.FC = () => {
    const testimonials: Testimonial[] = [
        {
            name: 'Kwame Osei',
            role: 'Pharmacy Owner',
            company: 'MediCare Pharmacy, Kumasi',
            avatar: 'KO',
            content:
                "This system transformed our pharmacy operations completely. The inventory management is incredible - we've reduced waste by 40% and never run out of essential medications anymore. The expiry tracking feature alone has saved us thousands of cedis.",
            rating: 5,
            metrics: {
                label: 'Waste Reduction',
                value: '40%',
                color: 'text-green-600',
            },
        },
        {
            name: 'Dr. Akosua Mensah',
            role: 'Head Pharmacist',
            company: 'University Hospital Pharmacy',
            avatar: 'AM',
            content:
                'The reporting and analytics features are outstanding. We can now track our performance in real-time and make data-driven decisions. The system is intuitive and our staff adapted quickly. Customer service is also excellent.',
            rating: 5,
            metrics: {
                label: 'Efficiency Gain',
                value: '60%',
                color: 'text-blue-600',
            },
        },
        {
            name: 'Emmanuel Boateng',
            role: 'Pharmacy Manager',
            company: 'HealthPlus Pharmacies (5 locations)',
            avatar: 'EB',
            content:
                'Managing multiple locations was a nightmare before this system. Now I can monitor all our branches from one dashboard. The multi-branch inventory transfers and centralized reporting have streamlined our entire operation.',
            rating: 5,
            metrics: {
                label: 'Time Saved',
                value: '50%',
                color: 'text-purple-600',
            },
        },
        {
            name: 'Ama Adjei',
            role: 'Independent Pharmacist',
            company: 'Adjei Pharmacy, Takoradi',
            avatar: 'AA',
            content:
                'As a small pharmacy owner, I was worried about the cost and complexity. But this system is affordable and so easy to use! The customer management features have helped me build stronger relationships with my patients.',
            rating: 5,
            metrics: {
                label: 'Customer Retention',
                value: '85%',
                color: 'text-orange-600',
            },
        },
        {
            name: 'Dr. Joseph Amponsah',
            role: 'Chief Pharmacist',
            company: 'Regional Medical Center',
            avatar: 'JA',
            content:
                'The compliance and audit trail features are exactly what we needed for our regulatory requirements. The system handles HIPAA compliance seamlessly, and the security features give us peace of mind.',
            rating: 5,
            metrics: {
                label: 'Compliance Score',
                value: '100%',
                color: 'text-red-600',
            },
        },
        {
            name: 'Fatima Abdul-Rahman',
            role: 'Pharmacy Owner',
            company: 'Northern Pharmacy Network',
            avatar: 'FA',
            content:
                "The mobile app is a game-changer! I can check inventory, approve orders, and monitor sales even when I'm not at the pharmacy. The real-time notifications keep me informed of everything important.",
            rating: 5,
            metrics: {
                label: 'Mobile Usage',
                value: 'Daily',
                color: 'text-indigo-600',
            },
        },
    ];

    const renderStars = (rating: number) => {
        return (
            <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                    <FiStar
                        key={i}
                        className={`w-4 h-4 ${
                            i < rating
                                ? 'text-yellow-400 fill-current'
                                : 'text-gray-300'
                        }`}
                    />
                ))}
            </div>
        );
    };

    return (
        <section className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Section Header */}
                <div className="text-center mb-16">
                    <Badge variant="success" size="md" className="mb-4">
                        💬 Customer Stories
                    </Badge>
                    <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                        What Our Customers{' '}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-blue-600">
                            Are Saying
                        </span>
                    </h2>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                        Don't just take our word for it. Here's what pharmacy
                        owners and managers across Ghana and beyond are saying
                        about our platform.
                    </p>
                </div>

                {/* Testimonials Grid */}
                <div className="grid lg:grid-cols-3 gap-8 mb-16">
                    {testimonials.map((testimonial, index) => (
                        <div
                            key={index}
                            className="bg-white border border-gray-200 rounded-2xl p-8 hover:shadow-xl transition-all duration-300 group relative overflow-hidden"
                        >
                            {/* Quote Icon */}
                            <div className="absolute top-6 right-6 opacity-10 group-hover:opacity-20 transition-opacity">
                                <BsQuote className="text-4xl text-blue-600" />
                            </div>

                            {/* Rating */}
                            <div className="mb-6">
                                {renderStars(testimonial.rating)}
                            </div>

                            {/* Content */}
                            <blockquote className="text-gray-700 mb-6 leading-relaxed italic">
                                "{testimonial.content}"
                            </blockquote>

                            {/* Metrics */}
                            {testimonial.metrics && (
                                <div className="mb-6 p-3 bg-gray-50 rounded-lg">
                                    <div className="text-center">
                                        <div
                                            className={`text-2xl font-bold ${testimonial.metrics.color} mb-1`}
                                        >
                                            {testimonial.metrics.value}
                                        </div>
                                        <div className="text-sm text-gray-600">
                                            {testimonial.metrics.label}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Author */}
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold">
                                    {testimonial.avatar}
                                </div>
                                <div>
                                    <div className="font-semibold text-gray-900">
                                        {testimonial.name}
                                    </div>
                                    <div className="text-sm text-gray-600">
                                        {testimonial.role}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        {testimonial.company}
                                    </div>
                                </div>
                            </div>

                            {/* Hover Effect */}
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-green-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
                        </div>
                    ))}
                </div>

                {/* Overall Rating Section */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 lg:p-12">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        {/* Left: Rating Stats */}
                        <div className="text-center lg:text-left">
                            <h3 className="text-3xl font-bold text-gray-900 mb-6">
                                Loved by Pharmacy Professionals
                            </h3>

                            <div className="space-y-6">
                                <div className="flex items-center justify-center lg:justify-start gap-4">
                                    <div className="text-6xl font-bold text-blue-600">
                                        4.9
                                    </div>
                                    <div>
                                        <div className="flex gap-1 mb-2">
                                            {[...Array(5)].map((_, i) => (
                                                <FiStar
                                                    key={i}
                                                    className="w-6 h-6 text-yellow-400 fill-current"
                                                />
                                            ))}
                                        </div>
                                        <div className="text-gray-600">
                                            out of 5 stars
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            Based on 500+ reviews
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    {[
                                        { stars: 5, percentage: 92 },
                                        { stars: 4, percentage: 6 },
                                        { stars: 3, percentage: 2 },
                                    ].map((rating, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center gap-3"
                                        >
                                            <span className="text-sm text-gray-600 w-8">
                                                {rating.stars}★
                                            </span>
                                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                                                <div
                                                    className="bg-yellow-400 h-2 rounded-full"
                                                    style={{
                                                        width: `${rating.percentage}%`,
                                                    }}
                                                ></div>
                                            </div>
                                            <span className="text-sm text-gray-600 w-8">
                                                {rating.percentage}%
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Right: Key Benefits */}
                        <div className="space-y-6">
                            <h4 className="text-xl font-bold text-gray-900 mb-4">
                                Why Customers Choose Us
                            </h4>

                            <div className="space-y-4">
                                {[
                                    {
                                        label: 'Easy Implementation',
                                        value: '95% say setup was simple',
                                    },
                                    {
                                        label: 'Excellent Support',
                                        value: '98% satisfaction rate',
                                    },
                                    {
                                        label: 'Cost Effective',
                                        value: 'Average 30% cost reduction',
                                    },
                                    {
                                        label: 'Reliable System',
                                        value: '99.9% uptime guarantee',
                                    },
                                ].map((benefit, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center justify-between p-3 bg-white rounded-lg"
                                    >
                                        <span className="font-medium text-gray-900">
                                            {benefit.label}
                                        </span>
                                        <span className="text-sm text-gray-600">
                                            {benefit.value}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* CTA */}
                <div className="text-center mt-16">
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">
                        Join These Happy Customers
                    </h3>
                    <p className="text-lg text-gray-600 mb-8">
                        Start your free trial today and see why pharmacies love
                        our platform
                    </p>
                    <button className="bg-gradient-to-r from-green-600 to-blue-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:from-green-700 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                        Start Free Trial - No Credit Card Required
                    </button>
                </div>
            </div>
        </section>
    );
};

export default TestimonialsSection;
