import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import { registerSchema } from '../utils/validation';
import { Input } from '../components/atoms/Input';
import { Button } from '../components/atoms/Button';
import { useRegister } from '../hooks/useAuth';
import { UserRole } from '../types/user.types';
import SEOMetadata from '../components/atoms/SEOMetadata';
import { useSEO, SEO_PRESETS } from '../hooks/useSEO';
// import { BranchSelect } from '../components/molecules/BranchSelect';

type RegisterFormValues = z.infer<typeof registerSchema>;

const RegisterPage = () => {
    const { mutate: register, isPending } = useRegister();

    // SEO configuration
    const seoData = useSEO({
        ...SEO_PRESETS.register,
        canonicalPath: '/register',
    });

    const {
        register: registerField,
        handleSubmit,
        formState: { errors },
    } = useForm<RegisterFormValues>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            name: '',
            email: '',
            password: '',
            confirmPassword: '',
            role: UserRole.CASHIER, // Default role
        },
    });

    const onSubmit = (data: RegisterFormValues) => {
        // Exclude confirmPassword before sending data to register
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { confirmPassword, ...registerData } = data;
        register(registerData);
    };

    return (
        <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 to-white">
            <SEOMetadata {...seoData} />
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 space-y-8 border border-gray-100">
                <div className="flex flex-col items-center">
                    {/* Optional: Add a logo or icon here */}
                    <h2 className="mt-2 text-center text-3xl font-extrabold text-gray-900 tracking-tight">
                        Create a new account
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Or{' '}
                        <Link
                            to="/login"
                            className="font-medium text-blue-600 hover:text-blue-500"
                        >
                            sign in to your account
                        </Link>
                    </p>
                </div>
                <form
                    className="mt-6 space-y-6"
                    onSubmit={handleSubmit(onSubmit)}
                >
                    <div className="space-y-4">
                        <Input
                            id="name"
                            type="text"
                            label="Full Name"
                            placeholder="Full name"
                            autoComplete="name"
                            {...registerField('name')}
                            error={errors.name?.message}
                        />
                        <Input
                            id="email"
                            type="email"
                            label="Email Address"
                            placeholder="Email address"
                            autoComplete="email"
                            {...registerField('email')}
                            error={errors.email?.message}
                        />
                        <Input
                            id="password"
                            type="password"
                            label="Password"
                            placeholder="Password"
                            autoComplete="new-password"
                            {...registerField('password')}
                            error={errors.password?.message}
                        />
                        <Input
                            id="confirmPassword"
                            type="password"
                            label="Confirm Password"
                            placeholder="Confirm password"
                            autoComplete="new-password"
                            {...registerField('confirmPassword')}
                            error={errors.confirmPassword?.message}
                        />

                        <div className="mb-4">
                            <label
                                htmlFor="role"
                                className="form-label block text-sm font-medium text-gray-700 mb-1"
                            >
                                Role
                            </label>
                            <div className="relative">
                                <select
                                    id="role"
                                    className="block w-full rounded-lg border border-gray-300 bg-white py-2 px-3 pr-8 text-gray-700 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all appearance-none"
                                    {...registerField('role')}
                                >
                                    <option value={UserRole.CASHIER}>
                                        Cashier
                                    </option>
                                    <option value={UserRole.PHARMACIST}>
                                        Pharmacist
                                    </option>
                                    <option value={UserRole.ADMIN}>
                                        Admin
                                    </option>
                                </select>
                                <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400">
                                    <svg
                                        className="h-4 w-4"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M19 9l-7 7-7-7"
                                        />
                                    </svg>
                                </span>
                            </div>
                            {errors.role?.message && (
                                <p className="error-message text-red-600 text-xs mt-1">
                                    {errors.role.message}
                                </p>
                            )}
                        </div>
                        <div className="mb-4">
                            <label
                                htmlFor="branchId"
                                className="form-label block text-sm font-medium text-gray-700 mb-1"
                            >
                                Branch
                            </label>
                            <div className="relative">
                                {/* <BranchSelect
                                    value={undefined}
                                    onChange={() => {}}
                                /> */}
                                <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400">
                                    <svg
                                        className="h-4 w-4"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M19 9l-7 7-7-7"
                                        />
                                    </svg>
                                </span>
                            </div>
                        </div>
                    </div>

                    <div>
                        <Button
                            type="submit"
                            variant="primary"
                            isLoading={isPending}
                            className="w-full"
                        >
                            Create account
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RegisterPage;
