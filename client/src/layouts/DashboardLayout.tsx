import type { ReactNode } from 'react';
import { useLogout } from '../hooks/useAuth';
import { useAuthStore } from '../store/auth.store';
import { Link, useLocation } from 'react-router-dom';
import {
    FaSignOutAlt,
    FaUser,
    FaTachometerAlt,
    FaPills,
    FaShoppingCart,
    FaCog,
    FaBars,
    FaTimes,
    FaClock,
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
    {
        to: '/customers',
        icon: <FaUser className="mr-3" />,
        label: 'Customers',
        match: (pathname: string) =>
            pathname === '/customers' || /^\/customers\/[^/]+$/.test(pathname),
        adminOnly: false,
    },
    {
        to: '/expiry',
        icon: <FaClock className="mr-3" />,
        label: 'Expiry Tracker',
        match: (pathname: string) => pathname === '/expiry',
        adminOnly: false,
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
    user: any;
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
                } md:translate-x-0 md:static md:inset-0`}
            >
                <div className="p-6 flex items-center justify-between md:block">
                    <h1 className="text-2xl font-bold text-primary-600">
                        Pharmacy App
                    </h1>
                    <button
                        className="md:hidden text-gray-600 text-2xl"
                        onClick={onClose}
                        aria-label="Close sidebar"
                    >
                        <FaTimes />
                    </button>
                </div>
                <nav className="mt-6">
                    {navItems.map(
                        (item) =>
                            (!item.adminOnly || user?.role === 'admin') && (
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
                            ),
                    )}
                </nav>
            </aside>
        </>
    );
}

// Topbar component
function Topbar({
    user,
    onLogout,
    onMenuClick,
}: {
    user: any;
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
    else if (
        /^\/customers\/[^/]+$/.test(location.pathname) &&
        location.pathname !== '/customers'
    )
        title = 'Customer Details';
    else if (location.pathname === '/expiry') title = 'Expiry Tracker';
    else if (
        !/^\/(dashboard|drugs|sales|sales\/new|sales\/[^/]+|customers|customers\/[^/]+|expiry)$/.test(
            location.pathname,
        )
    )
        title = 'Dashboard';

    return (
        <header className="bg-white shadow-sm z-10">
            <div className="flex items-center justify-between p-4">
                <div className="flex items-center">
                    {/* Hamburger menu for mobile */}
                    <button
                        className="md:hidden mr-4 text-2xl text-gray-700"
                        onClick={onMenuClick}
                        aria-label="Open sidebar"
                    >
                        <FaBars />
                    </button>
                    <h1 className="text-xl font-semibold">{title}</h1>
                </div>
                <div className="flex items-center">
                    <div className="mr-4 flex items-center">
                        <FaUser className="mr-2" />
                        <span className="truncate max-w-[120px]">
                            {user?.email} ({user?.role})
                        </span>
                    </div>
                    <button
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
    const { user } = useAuthStore();
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(false);

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
            <div className="flex-1 flex flex-col overflow-hidden md:ml-64">
                <Topbar
                    user={user}
                    onLogout={handleLogout}
                    onMenuClick={() => setSidebarOpen(true)}
                />
                <main className="flex-1 overflow-auto p-4 sm:p-6 bg-gray-100">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
