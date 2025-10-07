import type { ReactNode } from 'react';
import { useLogout } from '../hooks/useAuth';
import { useAuthStore } from '../store/auth.store';
import { Link, useLocation } from 'react-router-dom';
import type { User } from '../types/auth.types';
import { UserRole } from '../types/user.types';

interface NavItem {
    to: string;
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    match: (pathname: string) => boolean;
    adminOnly?: boolean;
    cashierOnly?: boolean;
    pharmacistOnly?: boolean;
    superAdminOnly?: boolean;
}
import {
    FaSignOutAlt,
    FaUser,
    FaUsers,
    FaTachometerAlt,
    FaPills,
    FaShoppingCart,
    FaCog,
    FaCogs,
    FaBars,
    FaTimes,
    FaExclamationTriangle,
    FaChartBar,
    FaHistory,
    FaUserSecret,
    FaChevronLeft,
    FaChevronRight,
    FaCrown,
} from 'react-icons/fa';
import { useState, useEffect } from 'react';

// Sidebar navigation items
const navItems: NavItem[] = [
    {
        to: '/super-admin',
        icon: FaCrown,
        label: 'Super Admin',
        match: (pathname: string) => pathname === '/super-admin',
        superAdminOnly: true,
    },
    {
        to: '/dashboard',
        icon: FaTachometerAlt,
        label: 'Dashboard',
        match: (pathname: string) => pathname === '/dashboard',
        adminOnly: true,
    },
    {
        to: '/drugs',
        icon: FaPills,
        label: 'Drug Inventory',
        match: (pathname: string) => pathname === '/drugs',
        adminOnly: false,
    },
    {
        to: '/sales',
        icon: FaShoppingCart,
        label: 'Sales & Billing',
        match: (pathname: string) =>
            pathname === '/sales' ||
            pathname === '/sales/new' ||
            /^\/sales\/[^/]+$/.test(pathname),
        adminOnly: false,
    },
    // Cashier-only: Finalize Sale (Short Code)
    {
        to: '/sales/new',
        icon: FaShoppingCart,
        label: 'Finalize Sale (Short Code)',
        match: (pathname: string) => pathname === '/sales/new',
        cashierOnly: true,
    },
    {
        to: '/customers',
        icon: FaUser,
        label: 'Customers',
        match: (pathname: string) =>
            pathname === '/customers' || /^\/customers\/[^/]+$/.test(pathname),
        adminOnly: false,
    },
    {
        to: '/users',
        icon: FaUsers,
        label: 'Users',
        match: (pathname: string) =>
            pathname === '/users' || /^\/users\/[^/]+$/.test(pathname),
        adminOnly: true,
    },
    {
        to: '/expiry',
        icon: FaExclamationTriangle,
        label: 'Expiry Tracker',
        match: (pathname: string) => pathname === '/expiry',
        pharmacistOnly: true,
    },
    {
        to: '/branches',
        icon: FaCogs,
        label: 'Branch Management',
        match: (pathname: string) => pathname === '/branches',
        adminOnly: true,
    },
    {
        to: '/reports',
        icon: FaChartBar,
        label: 'Reports',
        match: (pathname: string) => pathname === '/reports',
        pharmacistOnly: true,
    },
    {
        to: '/audit-logs',
        icon: FaHistory,
        label: 'Audit Logs',
        match: (pathname: string) => pathname === '/audit-logs',
        superAdminOnly: true,
    },
    {
        to: '/user-activity',
        icon: FaUserSecret,
        label: 'Activity Tracker',
        match: (pathname: string) => pathname === '/user-activity',
        adminOnly: true,
    },
    {
        to: '/cron-management',
        icon: FaCogs,
        label: 'Task Management',
        match: (pathname: string) => pathname === '/cron-management',
        superAdminOnly: true,
    },
    {
        to: '/pharmacy-setup',
        icon: FaCog,
        label: 'Pharmacy Settings',
        match: (pathname: string) => pathname === '/pharmacy-setup',
        adminOnly: true,
    },
];

// Tooltip component for collapsed sidebar
const Tooltip = ({
    children,
    text,
    show,
}: {
    children: ReactNode;
    text: string;
    show: boolean;
}) => {
    if (!show) return <>{children}</>;

    return (
        <div className="relative group">
            {children}
            <div className="absolute left-full ml-3 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 whitespace-nowrap z-50 pointer-events-none">
                {text}
                <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-full">
                    <div className="border-4 border-transparent border-r-gray-900"></div>
                </div>
            </div>
        </div>
    );
};

// Sidebar component
function Sidebar({
    user,
    location,
    mobileOpen,
    desktopCollapsed,
    onMobileClose,
    onDesktopToggle,
}: {
    user: User | null;
    location: ReturnType<typeof useLocation>;
    mobileOpen: boolean;
    desktopCollapsed: boolean;
    onMobileClose: () => void;
    onDesktopToggle: () => void;
}) {
    return (
        <>
            {/* Mobile overlay */}
            <div
                className={`fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity lg:hidden ${
                    mobileOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
                }`}
                onClick={onMobileClose}
            />

            {/* Sidebar */}
            <aside
                className={`
                    fixed z-50 inset-y-0 left-0 bg-white shadow-xl transform transition-all duration-300 ease-in-out
                    ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
                    lg:translate-x-0 lg:relative lg:inset-auto lg:flex-shrink-0
                    w-64
                    ${desktopCollapsed ? 'lg:w-16' : 'lg:w-64'}
                `}
            >
                {/* Sidebar header */}
                <div
                    className={`p-4 border-b border-gray-200 transition-all duration-300 ${
                        desktopCollapsed ? 'lg:p-3' : 'lg:p-4'
                    }`}
                >
                    <div className="flex items-center justify-between">
                        {(!desktopCollapsed || mobileOpen) && (
                            <h1 className="text-xl font-bold text-blue-600 truncate">
                                PharmCare
                            </h1>
                        )}

                        {/* Mobile close button */}
                        <button
                            type="button"
                            className="lg:hidden text-gray-600 hover:text-gray-800 hover:bg-gray-100 p-1.5 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                            onClick={onMobileClose}
                            aria-label="Close sidebar"
                        >
                            <FaTimes className="w-5 h-5" />
                        </button>

                        {/* Desktop toggle button */}
                        <button
                            type="button"
                            className="hidden lg:block text-gray-600 hover:text-gray-800 hover:bg-gray-100 p-1.5 rounded-lg ml-auto transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                            onClick={onDesktopToggle}
                            aria-label={
                                desktopCollapsed
                                    ? 'Expand sidebar'
                                    : 'Collapse sidebar'
                            }
                            title={`${
                                desktopCollapsed ? 'Expand' : 'Collapse'
                            } sidebar (Ctrl+B)`}
                        >
                            {desktopCollapsed ? (
                                <FaChevronRight className="w-4 h-4" />
                            ) : (
                                <FaChevronLeft className="w-4 h-4" />
                            )}
                        </button>
                    </div>
                </div>

                {/* Navigation */}
                <nav
                    className={`flex-1 p-2 space-y-1 overflow-y-auto transition-all duration-300 ${
                        desktopCollapsed ? 'lg:px-1' : 'lg:px-2'
                    }`}
                >
                    {navItems.map((item) => {
                        // Handle role-based access control
                        const userRole = user?.role;

                        // Enforce special visibility rules:
                        // - Super Admin should only see the Super Admin link
                        // - Admin should see all management links except Super Admin
                        if (userRole === UserRole.SUPER_ADMIN) {
                            // If the logged in user is Super Admin, only allow
                            // items explicitly marked as superAdminOnly
                            if (!item.superAdminOnly) return null;
                        }

                        if (userRole === UserRole.ADMIN) {
                            // Admin should never see Super Admin link
                            if (item.superAdminOnly) return null;
                        }

                        // Super Admin and Admin exceptions are handled above.
                        // Now apply the existing per-item restrictions for other roles.

                        // Admin-only items (visible to Admins only)
                        if (item.adminOnly && userRole !== UserRole.ADMIN) {
                            return null;
                        }

                        // Cashier-only items
                        if (item.cashierOnly && userRole !== UserRole.CASHIER) {
                            return null;
                        }

                        // Pharmacist-only items (also visible to Admin)
                        if (
                            item.pharmacistOnly &&
                            userRole !== UserRole.PHARMACIST &&
                            userRole !== UserRole.ADMIN
                        ) {
                            return null;
                        }

                        const isActive = item.match(location.pathname);
                        const IconComponent = item.icon;

                        const linkContent = (
                            <Link
                                key={item.to}
                                to={item.to}
                                className={`
                                    flex items-center py-2.5 text-sm font-medium rounded-lg transition-all duration-300
                                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                                    ${
                                        desktopCollapsed
                                            ? 'lg:px-2 lg:justify-center'
                                            : 'px-3'
                                    }
                                    ${
                                        isActive
                                            ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-500'
                                            : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900 focus:bg-gray-100'
                                    }
                                `}
                                onClick={() => {
                                    onMobileClose();
                                }}
                                aria-label={
                                    desktopCollapsed ? item.label : undefined
                                }
                                title={
                                    desktopCollapsed ? item.label : undefined
                                }
                            >
                                <IconComponent
                                    className={`
                                    w-5 h-5 flex-shrink-0 transition-all duration-300
                                    ${desktopCollapsed ? 'lg:mx-0' : 'mr-3'}
                                    ${isActive ? 'text-blue-700' : ''}
                                `}
                                />
                                <span
                                    className={`
                                    truncate transition-all duration-300
                                    ${desktopCollapsed ? 'lg:hidden' : ''}
                                `}
                                >
                                    {item.label}
                                </span>
                            </Link>
                        );

                        return (
                            <Tooltip
                                key={item.to}
                                text={item.label}
                                show={desktopCollapsed}
                            >
                                {linkContent}
                            </Tooltip>
                        );
                    })}
                </nav>
            </aside>
        </>
    );
}
// TopBar component
function TopBar({
    user,
    onLogout,
    onMobileMenuClick,
}: {
    user: User | null;
    onLogout: () => void;
    onMobileMenuClick: () => void;
}) {
    return (
        <header className="bg-white border-b border-gray-200 z-30 relative">
            <div className="flex items-center justify-between px-4 py-3">
                {/* Left section - Mobile menu button */}
                <div className="flex items-center">
                    <button
                        type="button"
                        className="lg:hidden p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                        onClick={onMobileMenuClick}
                        aria-label="Open sidebar"
                        title="Open navigation menu"
                    >
                        <FaBars className="w-5 h-5" />
                    </button>
                </div>

                {/* Right section - User info and logout */}
                <div className="flex items-center space-x-4">
                    {/* User info */}
                    <div className="flex items-center space-x-3">
                        <div className="hidden sm:block text-right">
                            <div className="text-sm font-medium text-gray-900">
                                {user?.name}
                            </div>
                            <div className="text-xs text-gray-500 capitalize">
                                {user?.role?.replace('_', ' ')}
                                {user?.branch?.name && (
                                    <span className="ml-2 text-blue-600 font-medium">
                                        • {user.branch.name}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* User avatar */}
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <FaUser className="w-4 h-4 text-blue-600" />
                        </div>
                    </div>

                    {/* Logout button */}
                    <button
                        type="button"
                        onClick={onLogout}
                        className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
                        aria-label="Logout"
                        title="Logout"
                    >
                        <FaSignOutAlt className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </header>
    );
}

interface DashboardLayoutProps {
    children: ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
    const { mutate: logout } = useLogout();
    const store = useAuthStore();
    const location = useLocation();

    // State for mobile sidebar
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // State for desktop sidebar collapse (persist in localStorage)
    const [desktopCollapsed, setDesktopCollapsed] = useState(() => {
        const saved = localStorage.getItem('sidebar-collapsed');
        return saved ? JSON.parse(saved) : false;
    });

    const user = store.user;

    // Persist desktop sidebar state
    useEffect(() => {
        localStorage.setItem(
            'sidebar-collapsed',
            JSON.stringify(desktopCollapsed),
        );
    }, [desktopCollapsed]);

    // Close mobile menu on route change
    useEffect(() => {
        setMobileMenuOpen(false);
    }, [location.pathname]);

    // Handle keyboard navigation
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            // Close mobile menu on Escape
            if (event.key === 'Escape' && mobileMenuOpen) {
                setMobileMenuOpen(false);
            }

            // Toggle sidebar on Ctrl/Cmd + B
            if ((event.ctrlKey || event.metaKey) && event.key === 'b') {
                event.preventDefault();
                if (window.innerWidth >= 1024) {
                    setDesktopCollapsed(!desktopCollapsed);
                } else {
                    setMobileMenuOpen(!mobileMenuOpen);
                }
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [mobileMenuOpen, desktopCollapsed]);

    const handleLogout = () => logout();
    const handleMobileMenuToggle = () => setMobileMenuOpen(!mobileMenuOpen);
    const handleDesktopSidebarToggle = () =>
        setDesktopCollapsed(!desktopCollapsed);

    // Calculate dynamic content padding based on sidebar state
    const getContentPadding = () => {
        if (desktopCollapsed) {
            return 'px-4 sm:px-6 lg:px-8 xl:px-10'; // More padding when sidebar is collapsed (more space available)
        }
        return 'px-3 sm:px-4 lg:px-6 xl:px-8'; // Less padding when sidebar is expanded
    };

    // Calculate content max width based on sidebar state
    const getContentMaxWidth = () => {
        if (desktopCollapsed) {
            return 'max-w-none'; // Use full width when sidebar is collapsed
        }
        return 'max-w-7xl'; // Constrained width when sidebar is expanded
    };

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden">
            {/* Sidebar */}
            <Sidebar
                user={user}
                location={location}
                mobileOpen={mobileMenuOpen}
                desktopCollapsed={desktopCollapsed}
                onMobileClose={() => setMobileMenuOpen(false)}
                onDesktopToggle={handleDesktopSidebarToggle}
            />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden transition-all duration-300">
                {/* Top Bar */}
                <TopBar
                    user={user}
                    onLogout={handleLogout}
                    onMobileMenuClick={handleMobileMenuToggle}
                />

                {/* Main Content */}
                <main className="flex-1 relative overflow-y-auto focus:outline-none">
                    <div className="py-4 lg:py-6">
                        <div
                            className={`mx-auto transition-all duration-300 ${getContentPadding()} ${getContentMaxWidth()}`}
                        >
                            {children}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
