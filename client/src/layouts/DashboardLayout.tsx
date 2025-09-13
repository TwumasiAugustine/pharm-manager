import type { ReactNode } from 'react';
import { useLogout } from '../hooks/useAuth';
import { useAuthStore } from '../store/auth.store';
import { Link, useLocation } from 'react-router-dom';
import type { User } from '../types/auth.types';
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
} from 'react-icons/fa';
import { useState } from 'react';

// Sidebar navigation items
const navItems = [
    {
        to: '/dashboard',
        icon: <FaTachometerAlt className="mr-3" />,
        label: 'Dashboard',
        match: (pathname: string) => pathname === '/dashboard',
        adminOnly: false,
    },
    {
        to: '/drugs',
        icon: <FaPills className="mr-3" />,
        label: 'Drug Inventory',
        match: (pathname: string) => pathname === '/drugs',
        adminOnly: false,
    },
    {
        to: '/sales',
        icon: <FaShoppingCart className="mr-3" />,
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
        icon: <FaShoppingCart className="mr-3" />,
        label: 'Finalize Sale (Short Code)',
        match: (pathname: string) => pathname === '/sales/new',
        cashierOnly: true,
    },
    {
        to: '/customers',
        icon: <FaUser className="mr-3" />,
        label: 'Customers',
        match: (pathname: string) =>
            pathname === '/customers' || /^\/customers\/[^/]+$/.test(pathname),
        adminOnly: false,
    },
    {
        to: '/users',
        icon: <FaUsers className="mr-3" />,
        label: 'Users',
        match: (pathname: string) =>
            pathname === '/users' || /^\/users\/[^/]+$/.test(pathname),
        adminOnly: true,
    },
    {
        to: '/expiry',
        icon: <FaExclamationTriangle className="mr-3" />,
        label: 'Expiry Tracker',
        match: (pathname: string) => pathname === '/expiry',
        adminOnly: false,
    },
    {
        to: '/branches',
        icon: <FaCogs className="mr-3" />,
        label: 'Branch Management',
        match: (pathname: string) => pathname === '/branches',
        adminOnly: true,
    },
    {
        to: '/reports',
        icon: <FaChartBar className="mr-3" />,
        label: 'Reports',
        match: (pathname: string) => pathname === '/reports',
        adminOnly: false,
    },
    {
        to: '/audit-logs',
        icon: <FaHistory className="mr-3" />,
        label: 'Audit Logs',
        match: (pathname: string) => pathname === '/audit-logs',
        adminOnly: true,
    },
    {
        to: '/user-activity',
        icon: <FaUserSecret className="mr-3" />,
        label: 'Activity Tracker',
        match: (pathname: string) => pathname === '/user-activity',
        adminOnly: true,
    },
    {
        to: '/cron-management',
        icon: <FaCogs className="mr-3" />,
        label: 'Task Management',
        match: (pathname: string) => pathname === '/cron-management',
        adminOnly: true,
    },
    {
        to: '/pharmacy-setup',
        icon: <FaCog className="mr-3" />,
        label: 'Pharmacy Settings',
        match: (pathname: string) => pathname === '/pharmacy-setup',
        adminOnly: true,
    },
];

// Sidebar component
function Sidebar({
    user,
    location,
    open,
    onClose,
}: {
    user: User | null;
    location: ReturnType<typeof useLocation>;
    open: boolean;
    onClose: () => void;
}) {
    return (
        <>
            {/* Overlay for mobile */}
            <div
                className={`fixed inset-0 bg-black bg-opacity-30 z-30 transition-opacity md:hidden ${
                    open ? 'block' : 'hidden'
                }`}
                onClick={onClose}
            />
            <aside
                className={`fixed z-40 inset-y-0 left-0 w-64 bg-white shadow-md transform transition-transform duration-200 ease-in-out
                ${
                    open ? 'translate-x-0' : '-translate-x-full'
                } md:translate-x-0 md:relative md:inset-auto md:w-64 md:flex-shrink-0`}
            >
                <div className="p-6 flex items-center justify-between md:block">
                    <h1 className="text-2xl font-bold text-primary-600">
                        Pharmacy App
                    </h1>
                    <button
                        type="button"
                        className="md:hidden text-gray-600 text-2xl"
                        onClick={onClose}
                        aria-label="Close sidebar"
                    >
                        <FaTimes />
                    </button>
                </div>
                <nav className="mt-6">
                    {navItems.map((item) => {
                        // Super admin can access everything EXCEPT finalize (cashier-only items)
                        if (user?.role === 'super_admin') {
                            // Super admin cannot access cashier-only items (finalize functionality)
                            if (item.cashierOnly) return null;
                        } else {
                            // Admin-only items
                            if (item.adminOnly && user?.role !== 'admin')
                                return null;
                            // Cashier-only items
                            if (item.cashierOnly && user?.role !== 'cashier')
                                return null;
                        }
                        return (
                            <Link
                                key={item.to}
                                to={item.to}
                                className={`flex items-center px-6 py-3 text-gray-700 hover:bg-gray-100 transition-colors ${
                                    item.match(location.pathname)
                                        ? 'bg-blue-50 border-r-4 border-blue-500'
                                        : ''
                                }`}
                                onClick={onClose}
                            >
                                {item.icon}
                                {item.label}
                            </Link>
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
    onMenuClick,
}: {
    user: User | null;
    onLogout: () => void;
    onMenuClick: () => void;
}) {
    const location = useLocation();

    // Title logic
    let title = 'Dashboard';
    if (location.pathname === '/drugs') title = 'Drug Inventory';
    else if (location.pathname === '/sales') title = 'Sales & Billing';
    else if (location.pathname === '/sales/new') title = 'Create New Sale';
    else if (
        /^\/sales\/[^/]+$/.test(location.pathname) &&
        location.pathname !== '/sales'
    )
        title = 'Sale Details';
    else if (location.pathname === '/customers') title = 'Customer Management';
    else if (location.pathname === '/users') title = 'User Management';
    else if (
        /^\/customers\/[^/]+$/.test(location.pathname) &&
        location.pathname !== '/customers'
    )
        title = 'Customer Details';

    return (
        <header className="bg-white shadow-sm z-10">
            <div className="flex items-center justify-between p-4">
                <div className="flex items-center">
                    {/* Hamburger menu for mobile */}
                    <button
                        type="button"
                        className="md:hidden mr-4 text-2xl text-gray-700"
                        onClick={onMenuClick}
                        aria-label="Open sidebar"
                    >
                        <FaBars />
                    </button>
                    <h1 className="text-xl font-semibold">{title}</h1>
                </div>
                <div className="flex items-center">
                    <div className="mr-4 flex flex-col items-start">
                        <span className="font-semibold flex items-center">
                            <FaUser className="mr-2" />
                            {user?.name}
                        </span>
                        <span className="text-gray-600 text-xs">
                            {user?.email}
                        </span>
                        <span className="text-gray-400 text-xs">
                            {user?.role}
                        </span>
                        {user?.branch?.name && (
                            <span className="text-blue-600 text-xs font-semibold">
                                Branch: {user.branch.name}
                            </span>
                        )}
                    </div>
                    <button
                        type="button"
                        onClick={onLogout}
                        className="flex items-center text-red-600 hover:text-red-800"
                    >
                        <FaSignOutAlt className="mr-2" />
                        Logout
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
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const user = store.user;
    const handleLogout = () => logout();

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar */}
            <Sidebar
                user={user}
                location={location}
                open={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
            />

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <TopBar
                    user={user}
                    onLogout={handleLogout}
                    onMenuClick={() => setSidebarOpen(true)}
                />
                <main className="flex-1 overflow-y-auto p-2 sm:p-4 md:p-6 lg:p-4">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
