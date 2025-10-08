import { Link } from 'react-router-dom';
import { Button } from '../components/atoms/Button';
import { useAuthStore } from '../store/auth.store';
import SEOMetadata from '../components/atoms/SEOMetadata';
import { useSEO, SEO_PRESETS } from '../hooks/useSEO';

const UnauthorizedPage = () => {
    const { user } = useAuthStore();

    // Generate SEO metadata for the unauthorized page
    const seoData = useSEO({
        ...SEO_PRESETS.unauthorized,
        structuredDataType: 'WebApplication',
    });

    return (
        <>
            {/* SEO Metadata - React 19 will hoist to <head> */}
            <SEOMetadata {...seoData} />

            <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full space-y-8 text-center">
                    <div>
                        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                            Access Denied
                        </h2>
                        <p className="mt-2 text-center text-sm text-gray-600">
                            You don't have permission to access this page.
                        </p>
                        <p className="mt-2 text-center text-sm text-gray-600">
                            Current role:{' '}
                            <span className="font-medium uppercase">{user?.role}</span>
                        </p>
                    </div>

                    <div className="mt-8">
                        {user?.role === 'super_admin' ?
                        <Link to="/super-admin">
                            <Button variant="primary" className="w-full">
                                Return to Dashboard
                            </Button>
                        </Link>
                        :  <Link to="/dashboard">
                            <Button variant="primary" className="w-full">
                                Return to Dashboard
                            </Button>
                        </Link>
                        }
                    </div>
                </div>
            </div>
        </>
    );
};

export default UnauthorizedPage;
