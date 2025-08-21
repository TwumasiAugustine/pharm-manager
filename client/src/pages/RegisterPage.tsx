import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import { registerSchema } from '../utils/validation';
import { Input } from '../components/atoms/Input';
import { Button } from '../components/atoms/Button';
import { useRegister } from '../hooks/useAuth';
import { UserRole } from '../types/auth.types';
import { BranchSelect } from '../components/molecules/BranchSelect';

type RegisterFormValues = z.infer<typeof registerSchema>;

const RegisterPage = () => {
    const { mutate: register, isPending } = useRegister();

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
        <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
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
                    className="mt-8 space-y-6"
                    onSubmit={handleSubmit(onSubmit)}
                >
                    <div className="rounded-md shadow-sm -space-y-px">
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
                            <select
                                id="role"
                                className="input block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                {...registerField('role')}
                            >
                                <option value={UserRole.CASHIER}>
                                    Cashier
                                </option>
                                <option value={UserRole.PHARMACIST}>
                                    Pharmacist
                                </option>
                                <option value={UserRole.ADMIN}>Admin</option>
                            </select>
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
                            <BranchSelect
                                value={undefined}
                                onChange={() => {}}
                            />
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
