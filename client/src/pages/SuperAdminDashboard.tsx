import React, { useState } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import { FaUserTie, FaPlus, FaStore, FaSearch, FaTimes } from 'react-icons/fa';
import { Button } from '../components/atoms/Button';
import { Input } from '../components/atoms/Input';
import { Card, CardContent, CardHeader } from '../components/molecules/Card';
import { Modal } from '../components/molecules/Modal';
import { useAuthStore } from '../store/auth.store';
import { UserRole } from '../types/user.types';
import {
    usePharmacies,
    useCreatePharmacy,
    useDeletePharmacy,
    useAdmins,
    useCreateAdmin,
} from '../hooks/useSuperAdmin';
import type {
    ICreatePharmacyRequest,
    ICreateAdminRequest,
    IPharmacy,
} from '../api/super-admin.api';
import SEOMetadata from '../components/atoms/SEOMetadata';
import { useSEO, SEO_PRESETS } from '../hooks/useSEO';
import OverviewCards from './super-admin/OverviewCards';
import PharmacyTable from './super-admin/PharmacyTable';
import AdminTable from './super-admin/AdminTable';
import { useURLSearch, usePaginationURL } from '../hooks/useURLSearch';

interface AdminUser {
    _id: string;
    name: string;
    email: string;
    isActive: boolean;
    pharmacyId?: {
        _id: string;
        name: string;
    };
}

// (skeletons moved to subcomponents)
const SuperAdminDashboard: React.FC = () => {
    const { user } = useAuthStore();

    // SEO configuration
    const seoData = useSEO({
        ...SEO_PRESETS.superAdminDashboard,
        structuredDataType: 'WebApplication',
    });

    // State for modals and forms
    const [showPharmacyModal, setShowPharmacyModal] = useState(false);
    const [showAdminModal, setShowAdminModal] = useState(false);
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [selectedPharmacy, setSelectedPharmacy] = useState<IPharmacy | null>(
        null,
    );

    // URL-based search and pagination
    const {
        searchQuery: pharmacySearch,
        setSearchQuery: setPharmacySearch,
        clearSearch,
    } = useURLSearch({
        paramName: 'pharmacySearch',
        debounceMs: 300,
        minLength: 0,
    });

    const {
        page: currentPage,
        setPage: setCurrentPage,
        limit,
    } = usePaginationURL(1, 10);

    const { searchQuery: adminSearch, setSearchQuery: setAdminSearch } =
        useURLSearch({
            paramName: 'adminSearch',
            debounceMs: 300,
            minLength: 0,
        });

    // Form states
    const [pharmacyForm, setPharmacyForm] = useState<ICreatePharmacyRequest>({
        name: '',
        address: {
            street: '',
            city: '',
            state: '',
            postalCode: '',
            country: '',
        },
        contact: {
            phone: '',
            email: '',
            website: '',
        },
        registrationNumber: '',
        taxId: '',
        operatingHours: '',
        slogan: '',
    });

    const [adminForm, setAdminForm] = useState<ICreateAdminRequest>({
        name: '',
        email: '',
        password: '',
        assignToPharmacy: '',
        permissions: [],
    });

    // Hooks - keep full query objects so we can inspect status/errors
    const pharmaciesQuery = usePharmacies({
        page: currentPage,
        limit,
        search: pharmacySearch,
    });

    const adminsQuery = useAdmins();

    const pharmaciesData = pharmaciesQuery.data;
    const pharmaciesLoading = pharmaciesQuery.isLoading ?? false;

    const adminsData = adminsQuery.data;
    const adminsLoading = adminsQuery.isLoading ?? false;
    const admins = (adminsData as AdminUser[]) || [];

    // Debug logging to diagnose persistent loading state
    console.debug('pharmaciesQuery', {
        status: pharmaciesQuery.status,
        isLoading: pharmaciesQuery.isLoading,
        isFetching: pharmaciesQuery.isFetching,
        error: pharmaciesQuery.error,
        data: pharmaciesQuery.data,
    });
    console.debug('adminsQuery', {
        status: adminsQuery.status,
        isLoading: adminsQuery.isLoading,
        isFetching: adminsQuery.isFetching,
        error: adminsQuery.error,
        data: adminsQuery.data,
    });

    const createPharmacy = useCreatePharmacy();
    const deletePharmacy = useDeletePharmacy();
    const createAdmin = useCreateAdmin();

    // Redirect if not Super Admin
    if (user?.role !== UserRole.SUPER_ADMIN) {
        return (
            <DashboardLayout>
                <div className="container mx-auto px-4 py-6 text-center">
                    <h1 className="text-2xl font-bold text-red-600 mb-4">
                        Access Denied
                    </h1>
                    <p className="text-gray-600">
                        Only Super Admins can access this page.
                    </p>
                </div>
            </DashboardLayout>
        );
    }

    // Handlers
    const handleCreatePharmacy = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await createPharmacy.mutateAsync(pharmacyForm);
            setShowPharmacyModal(false);
            resetPharmacyForm();
        } catch (error) {
            console.error('Error creating pharmacy:', error);
        }
    };

    const handleCreateAdmin = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await createAdmin.mutateAsync(adminForm);
            setShowAdminModal(false);
            resetAdminForm();
        } catch (error) {
            console.error('Error creating admin:', error);
        }
    };

    const handleDeletePharmacy = async (pharmacy: IPharmacy) => {
        if (
            window.confirm(`Are you sure you want to delete ${pharmacy.name}?`)
        ) {
            try {
                await deletePharmacy.mutateAsync(pharmacy._id);
            } catch (error) {
                console.error('Error deleting pharmacy:', error);
            }
        }
    };

    const handleAssignAdmin = (pharmacy: IPharmacy) => {
        setSelectedPharmacy(pharmacy);
        setShowAssignModal(true);
    };

    const resetPharmacyForm = () => {
        setPharmacyForm({
            name: '',
            address: {
                street: '',
                city: '',
                state: '',
                postalCode: '',
                country: '',
            },
            contact: {
                phone: '',
                email: '',
                website: '',
            },
            registrationNumber: '',
            taxId: '',
            operatingHours: '',
            slogan: '',
        });
    };

    const resetAdminForm = () => {
        setAdminForm({
            name: '',
            email: '',
            password: '',
            assignToPharmacy: '',
            permissions: [],
        });
    };

    // columns moved to PharmacyTable/AdminTable components

    return (
        <DashboardLayout>
            <SEOMetadata {...seoData} />
            <div className="container mx-auto px-4 py-6">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Super Admin Dashboard
                    </h1>
                    <p className="text-gray-600">
                        Manage pharmacies, admins, and system-wide operations
                    </p>
                </div>

                {/* Overview Cards */}
                <div className="mb-8">
                    <OverviewCards
                        pharmaciesData={
                            pharmaciesData?.pharmacies
                                ? {
                                      pharmacies: pharmaciesData.pharmacies,
                                      pagination: pharmaciesData.pagination,
                                  }
                                : undefined
                        }
                        adminsCount={admins.length}
                        loading={pharmaciesLoading || adminsLoading}
                    />
                </div>

                {/* Pharmacy Management Section */}
                <Card className="mb-8">
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                <FaStore className="text-blue-600" />
                                Pharmacy Management
                            </h2>
                            <Button onClick={() => setShowPharmacyModal(true)}>
                                <FaPlus className="mr-2" /> Create Pharmacy
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="mb-4 relative">
                            <div className="relative">
                                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <Input
                                    placeholder="Search pharmacies by name, city, email..."
                                    value={pharmacySearch}
                                    onChange={(e) =>
                                        setPharmacySearch(e.target.value)
                                    }
                                    className="pl-10 pr-10"
                                />
                                {pharmacySearch && (
                                    <button
                                        onClick={clearSearch}
                                        className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 h-auto bg-transparent hover:bg-gray-100 rounded"
                                        type="button"
                                    >
                                        <FaTimes className="text-gray-400 hover:text-gray-600" />
                                    </button>
                                )}
                            </div>
                        </div>

                        <PharmacyTable
                            pharmacies={pharmaciesData?.pharmacies || []}
                            loading={pharmaciesLoading}
                            onDelete={handleDeletePharmacy}
                            onAssign={handleAssignAdmin}
                            pagination={{
                                current: currentPage,
                                total: pharmaciesData?.pagination.pages || 1,
                                onPageChange: setCurrentPage,
                            }}
                        />
                    </CardContent>
                </Card>

                {/* Admin Management Section */}
                <Card>
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                <FaUserTie className="text-green-600" />
                                Admin Management
                            </h2>
                            <Button onClick={() => setShowAdminModal(true)}>
                                <FaPlus className="mr-2" /> Create Admin
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="mb-4 relative">
                            <div className="relative">
                                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <Input
                                    placeholder="Search admins by name or email..."
                                    value={adminSearch}
                                    onChange={(e) =>
                                        setAdminSearch(e.target.value)
                                    }
                                    className="pl-10 pr-10"
                                />
                                {adminSearch && (
                                    <button
                                        onClick={() => setAdminSearch('')}
                                        className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 h-auto bg-transparent hover:bg-gray-100 rounded"
                                        type="button"
                                    >
                                        <FaTimes className="text-gray-400 hover:text-gray-600" />
                                    </button>
                                )}
                            </div>
                        </div>

                        <AdminTable
                            admins={admins.filter((admin: AdminUser) =>
                                adminSearch
                                    ? admin.name
                                          .toLowerCase()
                                          .includes(
                                              adminSearch.toLowerCase(),
                                          ) ||
                                      admin.email
                                          .toLowerCase()
                                          .includes(adminSearch.toLowerCase())
                                    : true,
                            )}
                            loading={adminsLoading}
                        />
                    </CardContent>
                </Card>

                {/* Create Pharmacy Modal */}
                <Modal
                    isOpen={showPharmacyModal}
                    onClose={() => setShowPharmacyModal(false)}
                    title="Create New Pharmacy"
                >
                    <form onSubmit={handleCreatePharmacy} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                                label="Pharmacy Name"
                                value={pharmacyForm.name}
                                onChange={(e) =>
                                    setPharmacyForm({
                                        ...pharmacyForm,
                                        name: e.target.value,
                                    })
                                }
                                required
                            />
                            <Input
                                label="Registration Number"
                                value={pharmacyForm.registrationNumber}
                                onChange={(e) =>
                                    setPharmacyForm({
                                        ...pharmacyForm,
                                        registrationNumber: e.target.value,
                                    })
                                }
                                required
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                                label="Tax ID"
                                value={pharmacyForm.taxId}
                                onChange={(e) =>
                                    setPharmacyForm({
                                        ...pharmacyForm,
                                        taxId: e.target.value,
                                    })
                                }
                                required
                            />
                            <Input
                                label="Phone"
                                value={pharmacyForm.contact.phone}
                                onChange={(e) =>
                                    setPharmacyForm({
                                        ...pharmacyForm,
                                        contact: {
                                            ...pharmacyForm.contact,
                                            phone: e.target.value,
                                        },
                                    })
                                }
                                required
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                                label="Email"
                                type="email"
                                value={pharmacyForm.contact.email}
                                onChange={(e) =>
                                    setPharmacyForm({
                                        ...pharmacyForm,
                                        contact: {
                                            ...pharmacyForm.contact,
                                            email: e.target.value,
                                        },
                                    })
                                }
                                required
                            />
                            <Input
                                label="Website"
                                value={pharmacyForm.contact.website || ''}
                                onChange={(e) =>
                                    setPharmacyForm({
                                        ...pharmacyForm,
                                        contact: {
                                            ...pharmacyForm.contact,
                                            website: e.target.value,
                                        },
                                    })
                                }
                            />
                        </div>

                        <div className="space-y-4">
                            <h3 className="font-semibold text-gray-900">
                                Address
                            </h3>
                            <Input
                                label="Street"
                                value={pharmacyForm.address.street}
                                onChange={(e) =>
                                    setPharmacyForm({
                                        ...pharmacyForm,
                                        address: {
                                            ...pharmacyForm.address,
                                            street: e.target.value,
                                        },
                                    })
                                }
                                required
                            />
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <Input
                                    label="City"
                                    value={pharmacyForm.address.city}
                                    onChange={(e) =>
                                        setPharmacyForm({
                                            ...pharmacyForm,
                                            address: {
                                                ...pharmacyForm.address,
                                                city: e.target.value,
                                            },
                                        })
                                    }
                                    required
                                />
                                <Input
                                    label="State"
                                    value={pharmacyForm.address.state}
                                    onChange={(e) =>
                                        setPharmacyForm({
                                            ...pharmacyForm,
                                            address: {
                                                ...pharmacyForm.address,
                                                state: e.target.value,
                                            },
                                        })
                                    }
                                    required
                                />
                                <Input
                                    label="Postal Code"
                                    value={pharmacyForm.address.postalCode}
                                    onChange={(e) =>
                                        setPharmacyForm({
                                            ...pharmacyForm,
                                            address: {
                                                ...pharmacyForm.address,
                                                postalCode: e.target.value,
                                            },
                                        })
                                    }
                                    required
                                />
                            </div>
                            <Input
                                label="Country"
                                value={pharmacyForm.address.country}
                                onChange={(e) =>
                                    setPharmacyForm({
                                        ...pharmacyForm,
                                        address: {
                                            ...pharmacyForm.address,
                                            country: e.target.value,
                                        },
                                    })
                                }
                                required
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                                label="Operating Hours"
                                value={pharmacyForm.operatingHours}
                                onChange={(e) =>
                                    setPharmacyForm({
                                        ...pharmacyForm,
                                        operatingHours: e.target.value,
                                    })
                                }
                                placeholder="e.g., Mon-Fri 9AM-6PM, Sat 9AM-2PM"
                                required
                            />
                            <Input
                                label="Slogan"
                                value={pharmacyForm.slogan}
                                onChange={(e) =>
                                    setPharmacyForm({
                                        ...pharmacyForm,
                                        slogan: e.target.value,
                                    })
                                }
                                required
                            />
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t">
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={() => setShowPharmacyModal(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                isLoading={createPharmacy.status === 'pending'}
                            >
                                Create Pharmacy
                            </Button>
                        </div>
                    </form>
                </Modal>

                {/* Create Admin Modal */}
                <Modal
                    isOpen={showAdminModal}
                    onClose={() => setShowAdminModal(false)}
                    title="Create New Admin"
                >
                    <form onSubmit={handleCreateAdmin} className="space-y-4">
                        <Input
                            label="Name"
                            value={adminForm.name}
                            onChange={(e) =>
                                setAdminForm({
                                    ...adminForm,
                                    name: e.target.value,
                                })
                            }
                            required
                        />
                        <Input
                            label="Email"
                            type="email"
                            value={adminForm.email}
                            onChange={(e) =>
                                setAdminForm({
                                    ...adminForm,
                                    email: e.target.value,
                                })
                            }
                            required
                        />
                        <Input
                            label="Password"
                            type="password"
                            value={adminForm.password}
                            onChange={(e) =>
                                setAdminForm({
                                    ...adminForm,
                                    password: e.target.value,
                                })
                            }
                            required
                        />

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Assign to Pharmacy (Optional)
                            </label>
                            <select
                                value={adminForm.assignToPharmacy || ''}
                                onChange={(e) =>
                                    setAdminForm({
                                        ...adminForm,
                                        assignToPharmacy: e.target.value,
                                    })
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Select a pharmacy</option>
                                {pharmaciesData?.pharmacies.map((pharmacy) => (
                                    <option
                                        key={pharmacy._id}
                                        value={pharmacy._id}
                                    >
                                        {pharmacy.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t">
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={() => setShowAdminModal(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                isLoading={createAdmin.status === 'pending'}
                            >
                                Create Admin
                            </Button>
                        </div>
                    </form>
                </Modal>

                {/* Assign Admin Modal */}
                {selectedPharmacy && (
                    <Modal
                        isOpen={showAssignModal}
                        onClose={() => setShowAssignModal(false)}
                        title={`Assign Admin to ${selectedPharmacy.name}`}
                    >
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Select Admin
                                </label>
                                <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                                    <option value="">Select an admin</option>
                                    {admins
                                        .filter(
                                            (admin: AdminUser) =>
                                                !admin.pharmacyId,
                                        )
                                        .map((admin: AdminUser) => (
                                            <option
                                                key={admin._id}
                                                value={admin._id}
                                            >
                                                {admin.name} ({admin.email})
                                            </option>
                                        ))}
                                </select>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t">
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={() => setShowAssignModal(false)}
                                >
                                    Cancel
                                </Button>
                                <Button>Assign Admin</Button>
                            </div>
                        </div>
                    </Modal>
                )}
            </div>
        </DashboardLayout>
    );
};

export default SuperAdminDashboard;
