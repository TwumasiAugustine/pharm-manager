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

    return (
        <>
            {/* SEO Metadata - React 19 will hoist to <head> */}
            <SEOMetadata {...seoData} />

            <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 to-white">
                <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 space-y-8 border border-gray-100">
                    <div className="flex flex-col items-center">
                        <h2 className="mt-2 text-center text-3xl font-extrabold text-gray-900 tracking-tight">
                            Sign in to your account
                        </h2>
                        <p className="mt-2 text-center text-sm text-gray-600">
                            Or{' '}
                            <Link
                                to="/register"
                                className="font-medium text-blue-600 hover:text-blue-500"
                            >
                                create a new account
                            </Link>
                        </p>
                    </div>
                    <form
                        className="mt-6 space-y-6"
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
            </div>
        </>
    );
};

export default LoginPage;
