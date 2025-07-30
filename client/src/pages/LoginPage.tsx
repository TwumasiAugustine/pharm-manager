import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import { loginSchema } from '../utils/validation';
import { Input } from '../components/atoms/Input';
import { Button } from '../components/atoms/Button';
import { useLogin } from '../hooks/useAuth';

type LoginFormValues = z.infer<typeof loginSchema>;

const LoginPage = () => {
    const { mutate: login, isPending } = useLogin();

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
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Sign in to your account
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Or{' '}
                        <Link
                            to="/register"
                            className="font-medium text-primary-600 hover:text-primary-500"
                        >
                            create a new account
                        </Link>
                    </p>
                </div>
                <form
                    className="mt-8 space-y-6"
                    onSubmit={handleSubmit(onSubmit)}
                >
                    <div className="rounded-md shadow-sm -space-y-px">
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
    );
};

export default LoginPage;
