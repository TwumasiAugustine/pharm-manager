import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import { loginSchema } from '../utils/validation';
import { Input } from '../components/atoms/Input';
import { Button } from '../components/atoms/Button';
import { useLogin } from '../hooks/useAuth';
import SEOMetadata from '../components/atoms/SEOMetadata';
import { useSEO, SEO_PRESETS } from '../hooks/useSEO';
import { AuthLoadingScreen } from '../components/atoms/LoadingScreen';

type LoginFormValues = z.infer<typeof loginSchema>;

const LoginPage = () => {
    const { mutate: login, isPending } = useLogin();

    // Generate SEO metadata for the login page
    const seoData = useSEO({
        ...SEO_PRESETS.login,
        structuredDataType: 'WebApplication',
    });

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: '',
            password: '',
        },
    });

    const onSubmit = (data: LoginFormValues) => {
        login(data);
    };

    // Show full loading screen during authentication
    if (isPending) {
        return <AuthLoadingScreen />;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex flex-col">
            {/* SEO Metadata - React 19 will hoist to <head> */}
            <SEOMetadata {...seoData} />

            {/* Header with PharmCare branding */}
            <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="text-center">
                        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                            PharmCare
                        </h1>
                        <p className="text-gray-600 font-medium mt-2">
                            Modern Pharmacy Management System
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                            Secure • Reliable • Efficient
                        </p>
                    </div>
                </div>
            </header>

            {/* Main content */}
            <main className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 space-y-6 border border-gray-100">
                    {/* Login Form Header */}
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
                            Sign in to your account
                        </h2>
                        <p className="mt-2 text-sm text-gray-600">
                            Access your pharmacy dashboard and manage your
                            business efficiently
                        </p>
                        <p className="mt-3 text-xs text-gray-500">
                            Don't have an account?{' '}
                            <Link
                                to="/register"
                                className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
                            >
                                Create one here
                            </Link>
                        </p>
                    </div>
                    <form
                        className="space-y-6"
                        onSubmit={handleSubmit(onSubmit)}
                    >
                        <div className="space-y-4">
                            <Input
                                id="email"
                                type="email"
                                label="Email Address"
                                placeholder="Email address"
                                autoComplete="email"
                                {...register('email')}
                                error={errors.email?.message}
                            />
                            <Input
                                id="password"
                                type="password"
                                label="Password"
                                placeholder="Password"
                                autoComplete="current-password"
                                {...register('password')}
                                error={errors.password?.message}
                            />
                            <div className="flex justify-end">
                                <Link
                                    to="/forgot-password"
                                    className="text-sm text-blue-600 hover:text-blue-500 font-medium transition-colors"
                                >
                                    Forgot password?
                                </Link>
                            </div>
                        </div>
                        <div>
                            <Button
                                type="submit"
                                variant="primary"
                                isLoading={isPending}
                                className="w-full"
                            >
                                Sign in
                            </Button>
                        </div>
                    </form>
                </div>
            </main>

            {/* Footer */}
            <footer className="bg-white/80 backdrop-blur-sm border-t border-gray-200/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="text-center">
                        <p className="text-xs text-gray-400">
                            © 2025 PharmCare. All rights reserved.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LoginPage;
