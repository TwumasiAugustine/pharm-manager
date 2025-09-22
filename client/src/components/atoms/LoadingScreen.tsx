import React from 'react';
import { FaPills, FaHeartbeat, FaShieldAlt } from 'react-icons/fa';

interface LoadingScreenProps {
    message?: string;
    showBrand?: boolean;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({
    message = 'Loading...',
    showBrand = true,
}) => {
    return (
        <div className="fixed inset-0 bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center z-50">
            <div className="text-center max-w-md px-6">
                {/* Brand Logo */}
                {showBrand && (
                    <div className="mb-8">
                        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                            PharmCare
                        </h1>
                        <p className="text-gray-600 text-sm font-medium">
                            Modern Pharmacy Management System
                        </p>
                    </div>
                )}

                {/* Animated Icons */}
                <div className="flex justify-center items-center space-x-6 mb-8">
                    {/* Pills Icon with bounce animation */}
                    <div className="animate-bounce">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                            <FaPills className="w-6 h-6 text-blue-600" />
                        </div>
                    </div>

                    {/* Heartbeat Icon with pulse animation */}
                    <div className="animate-pulse">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                            <FaHeartbeat className="w-6 h-6 text-green-600" />
                        </div>
                    </div>

                    {/* Shield Icon with ping animation */}
                    <div className="relative">
                        <div className="animate-ping absolute inset-0 w-12 h-12 bg-indigo-400 rounded-full opacity-25"></div>
                        <div className="relative w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                            <FaShieldAlt className="w-6 h-6 text-indigo-600" />
                        </div>
                    </div>
                </div>

                {/* Loading Spinner */}
                <div className="relative mb-6">
                    {/* Outer rotating ring */}
                    <div className="w-16 h-16 mx-auto border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>

                    {/* Inner pulsing dot */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-4 h-4 bg-blue-600 rounded-full animate-pulse"></div>
                    </div>
                </div>

                {/* Loading Message */}
                <div className="space-y-2">
                    <p className="text-gray-700 font-medium">{message}</p>
                    <div className="flex justify-center space-x-1">
                        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                </div>

                {/* Progress Indicator */}
                <div className="mt-6">
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 h-1.5 rounded-full animate-pulse" style={{ width: '70%' }}></div>
                    </div>
                </div>

                {/* Feature highlights for longer loading */}
                <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-gray-500">
                    <div className="flex items-center justify-center space-x-1">
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        <span>Inventory Tracking</span>
                    </div>
                    <div className="flex items-center justify-center space-x-1">
                        <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                        <span>Sales Management</span>
                    </div>
                    <div className="flex items-center justify-center space-x-1">
                        <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                        <span>Analytics & Reports</span>
                    </div>
                </div>

                {/* Security indicator */}
                <div className="mt-6 flex items-center justify-center space-x-2 text-xs text-gray-400">
                    <FaShieldAlt className="w-3 h-3" />
                    <span>Secure Connection</span>
                </div>
            </div>

            {/* Background decorative elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {/* Floating pills animation */}
                <div className="absolute top-1/4 left-1/4 w-8 h-8 text-blue-200 animate-float">
                    <FaPills className="w-full h-full" />
                </div>
                <div className="absolute top-3/4 right-1/4 w-6 h-6 text-indigo-200 animate-float-delayed">
                    <FaHeartbeat className="w-full h-full" />
                </div>
                <div className="absolute top-1/2 right-1/6 w-4 h-4 text-green-200 animate-float-slow">
                    <FaShieldAlt className="w-full h-full" />
                </div>
            </div>
        </div>
    );
};

// Variants for different loading scenarios
export const PageLoadingScreen: React.FC = () => (
    <LoadingScreen message="Loading page..." showBrand={true} />
);

export const ComponentLoadingScreen: React.FC<{ message?: string }> = ({
    message = "Loading..."
}) => (
    <LoadingScreen message={message} showBrand={false} />
);

export const AuthLoadingScreen: React.FC = () => (
    <LoadingScreen message="Authenticating..." showBrand={true} />
);

export const DataLoadingScreen: React.FC = () => (
    <LoadingScreen message="Fetching data..." showBrand={false} />
);

export default LoadingScreen;
