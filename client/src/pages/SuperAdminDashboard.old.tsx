import React, { useState } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import { FaSitemap, FaInfoCircle } from 'react-icons/fa';
import { Button } from '../components/atoms/Button';
import RoleHierarchyIndicator from '../components/molecules/RoleHierarchyIndicator';
import RoleSystemDemo from '../components/organisms/RoleSystemDemo';
import PharmacyManagementSection from '../components/organisms/PharmacyManagementSection';
import AdminManagementSection from '../components/organisms/AdminManagementSection';
import CreatePharmacyModal from '../components/organisms/CreatePharmacyModal';
import CreateAdminModal from '../components/organisms/CreateAdminModal';
import AssignAdminModal from '../components/organisms/AssignAdminModal';
import RemoveAdminModal from '../components/organisms/RemoveAdminModal';
import { useAuthStore } from '../store/auth.store';
import { UserRole } from '../types/user.types';
import { usePharmacies, useAdmins } from '../hooks/useSuperAdmin';
import type { IPharmacy } from '../api/super-admin.api';
import SEOMetadata from '../components/atoms/SEOMetadata';
import { useSEO, SEO_PRESETS } from '../hooks/useSEO';
import OverviewCards from './super-admin/OverviewCards';
import { useURLSearch, usePaginationURL } from '../hooks/useURLSearch';
import type { AdminUser } from '../types/admin.types';
import { useSuperAdminManagement } from '../hooks/useSuperAdminManagement';

// (skeletons moved to subcomponents)
const SuperAdminDashboard: React.FC = () => {
    const { user } = useAuthStore();
    const [showRoleSystemDemo, setShowRoleSystemDemo] = useState(false);

    // SEO configuration
    const seoData = useSEO({
        ...SEO_PRESETS.superAdminDashboard,
        structuredDataType: 'WebApplication',
    });

    // URL-based search and pagination
    const {
        searchQuery: pharmacySearch,
        setSearchQuery: setPharmacySearch,
        clearSearch: clearPharmacySearch,
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

    const { 
        searchQuery: adminSearch, 
        setSearchQuery: setAdminSearch,
        clearSearch: clearAdminSearch,
    } = useURLSearch({
        paramName: 'adminSearch',
        debounceMs: 300,
        minLength: 0,
    });

    // Custom hook for Super Admin management
    const {
        // Modal states
        showPharmacyModal,
        setShowPharmacyModal,
        showAdminModal,
        setShowAdminModal,
        showAssignModal,
        setShowAssignModal,
        showRemoveModal,
        closeRemoveModal,

        // Selection states
        selectedPharmacy,
        selectedAdminId,
        setSelectedAdminId,
        selectedAdminForRemoval,
        removeFromAllPharmacies,
        setRemoveFromAllPharmacies,

        // Form states
        pharmacyForm,
        setPharmacyForm,
        adminForm,
        setAdminForm,

        // Handlers
        handleCreatePharmacy,
        handleCreateAdmin,
        handleDeletePharmacy,
        handleAssignAdmin,
        handleConfirmAssignment,
        handleRemoveAdmin,
        handleRemoveAdminFromAll,
        handleConfirmRemoval,

        // API states
        isCreatingPharmacy,
        isCreatingAdmin,
        isAssigningAdmin,
        isRemovingAdmin,
    } = useSuperAdminManagement();

    // Data fetching
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



    return (
        <DashboardLayout>
            <SEOMetadata {...seoData} />
            <div className="container mx-auto px-4 py-6">
                <div className="mb-8">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                Super Admin Dashboard
                            </h1>
                            <p className="text-gray-600">
                                Manage pharmacies, admins, and system-wide
                                operations
                            </p>
                        </div>
                        <Button
                            onClick={() => setShowRoleSystemDemo(true)}
                            color="secondary"
                            className="mt-4 sm:mt-0"
                        >
                            <FaSitemap className="mr-2" />
                            View Role System
                        </Button>
                    </div>

                    {/* Role Hierarchy System Information */}
                    <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-lg p-4 mb-6">
                        <div className="flex items-center gap-2 mb-3">
                            <FaInfoCircle className="text-purple-600" />
                            <h3 className="text-lg font-semibold text-purple-900">
                                System Role Hierarchy
                            </h3>
                        </div>
                        <p className="text-purple-700 mb-4">
                            As a Super Admin, you manage the top level of our
                            4-tier role system. You handle pharmacy creation and
                            admin management, while Admins manage daily
                            operations.
                        </p>
                        <RoleHierarchyIndicator
                            currentUserRole={user?.role || UserRole.SUPER_ADMIN}
                        />
                    </div>
                </div>

                {/* Overview Cards */}
                <OverviewCards />

                {/* Pharmacy Management Section */}
                <PharmacyManagementSection
                    pharmacies={pharmaciesData?.pharmacies || []}
                    loading={pharmaciesLoading}
                    searchQuery={pharmacySearch}
                    onSearchChange={setPharmacySearch}
                    onClearSearch={clearPharmacySearch}
                    onCreatePharmacy={() => setShowPharmacyModal(true)}
                    onDeletePharmacy={handleDeletePharmacy}
                    onAssignAdmin={handleAssignAdmin}
                    pagination={{
                        current: currentPage,
                        total: pharmaciesData?.pagination.pages || 1,
                        onPageChange: setCurrentPage,
                    }}
                />

                {/* Admin Management Section */}
                <AdminManagementSection
                    admins={admins}
                    loading={adminsLoading}
                    searchQuery={adminSearch}
                    onSearchChange={setAdminSearch}
                    onClearSearch={clearAdminSearch}
                    onCreateAdmin={() => setShowAdminModal(true)}
                    onRemoveAdmin={handleRemoveAdmin}
                    onRemoveAdminFromAll={handleRemoveAdminFromAll}
                />

                {/* Create Pharmacy Modal */}
                <CreatePharmacyModal
                    isOpen={showPharmacyModal}
                    onClose={() => setShowPharmacyModal(false)}
                    formData={pharmacyForm}
                    onFormChange={setPharmacyForm}
                    onSubmit={handleCreatePharmacy}
                    isLoading={isCreatingPharmacy}
                />

                {/* Create Admin Modal */}
                <CreateAdminModal
                    isOpen={showAdminModal}
                    onClose={() => setShowAdminModal(false)}
                    formData={adminForm}
                    onFormChange={setAdminForm}
                    onSubmit={handleCreateAdmin}
                    pharmacies={pharmaciesData?.pharmacies || []}
                    isLoading={isCreatingAdmin}
                />

                {/* Assign Admin Modal */}
                <AssignAdminModal
                    isOpen={showAssignModal}
                    onClose={() => setShowAssignModal(false)}
                    pharmacy={selectedPharmacy}
                    admins={admins}
                    selectedAdminId={selectedAdminId}
                    onAdminSelect={setSelectedAdminId}
                    onConfirm={handleConfirmAssignment}
                    isLoading={isAssigningAdmin}
                />

                {/* Remove Admin Modal */}
                <RemoveAdminModal
                    isOpen={showRemoveModal}
                    onClose={closeRemoveModal}
                    admin={selectedAdminForRemoval}
                    removeFromAllPharmacies={removeFromAllPharmacies}
                    onRemoveFromAllChange={setRemoveFromAllPharmacies}
                    onConfirm={handleConfirmRemoval}
                    isLoading={isRemovingAdmin}
                />

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
                        onClose={() => {
                            setShowAssignModal(false);
                            setSelectedPharmacy(null);
                            setSelectedAdminId('');
                        }}
                        title={`Assign Admin to ${selectedPharmacy.name}`}
                    >
                        <div className="space-y-4">
                            <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-4">
                                <p className="text-sm text-blue-700">
                                    <strong>Note:</strong> Admins can be
                                    assigned to multiple pharmacies. This will
                                    add the pharmacy to their list of managed
                                    pharmacies while preserving their primary
                                    assignment.
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Select Admin
                                </label>
                                <select
                                    value={selectedAdminId}
                                    onChange={(e) =>
                                        setSelectedAdminId(e.target.value)
                                    }
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">Select an admin</option>
                                    {admins
                                        .filter(
                                            (admin: AdminUser) =>
                                                admin.isActive,
                                        )
                                        .map((admin: AdminUser) => (
                                            <option
                                                key={admin._id}
                                                value={admin._id}
                                            >
                                                {admin.name} ({admin.email})
                                                {admin.pharmacyId &&
                                                    ` - Currently at ${admin.pharmacyId.name}`}
                                            </option>
                                        ))}
                                </select>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t">
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={() => {
                                        setShowAssignModal(false);
                                        setSelectedPharmacy(null);
                                        setSelectedAdminId('');
                                    }}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleConfirmAssignment}
                                    disabled={!selectedAdminId}
                                    isLoading={
                                        assignAdminToPharmacy.status ===
                                        'pending'
                                    }
                                >
                                    Assign Admin
                                </Button>
                            </div>
                        </div>
                    </Modal>
                )}

                {/* Remove Admin Modal */}
                {selectedAdminForRemoval && (
                    <Modal
                        isOpen={showRemoveModal}
                        onClose={() => {
                            setShowRemoveModal(false);
                            setSelectedAdminForRemoval(null);
                            setRemoveFromAllPharmacies(false);
                        }}
                        title="Remove Admin from Pharmacy"
                    >
                        <div className="space-y-4">
                            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                                <div className="flex items-start">
                                    <div className="ml-3">
                                        <h3 className="text-sm font-medium text-yellow-800">
                                            Confirm Removal
                                        </h3>
                                        <div className="mt-2 text-sm text-yellow-700">
                                            <p>
                                                You are about to remove{' '}
                                                <strong>
                                                    {
                                                        selectedAdminForRemoval.name
                                                    }
                                                </strong>
                                                {selectedAdminForRemoval.pharmacyId &&
                                                    !removeFromAllPharmacies && (
                                                        <span>
                                                            {' '}
                                                            from{' '}
                                                            <strong>
                                                                {
                                                                    selectedAdminForRemoval
                                                                        .pharmacyId
                                                                        .name
                                                                }
                                                            </strong>
                                                        </span>
                                                    )}
                                                {removeFromAllPharmacies && (
                                                    <span>
                                                        {' '}
                                                        from{' '}
                                                        <strong>
                                                            all assigned
                                                            pharmacies
                                                        </strong>
                                                    </span>
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {selectedAdminForRemoval.pharmacyId && (
                                <div className="space-y-3">
                                    <label className="flex items-center">
                                        <input
                                            type="radio"
                                            name="removalType"
                                            value="single"
                                            checked={!removeFromAllPharmacies}
                                            onChange={() =>
                                                setRemoveFromAllPharmacies(
                                                    false,
                                                )
                                            }
                                            className="mr-2"
                                        />
                                        <span className="text-sm">
                                            Remove from{' '}
                                            <strong>
                                                {
                                                    selectedAdminForRemoval
                                                        .pharmacyId.name
                                                }
                                            </strong>{' '}
                                            only
                                        </span>
                                    </label>
                                    <label className="flex items-center">
                                        <input
                                            type="radio"
                                            name="removalType"
                                            value="all"
                                            checked={removeFromAllPharmacies}
                                            onChange={() =>
                                                setRemoveFromAllPharmacies(true)
                                            }
                                            className="mr-2"
                                        />
                                        <span className="text-sm">
                                            Remove from all assigned pharmacies
                                            (leave with no pharmacy assignment)
                                        </span>
                                    </label>
                                </div>
                            )}

                            <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                                <p className="text-sm text-blue-700">
                                    <strong>This action will:</strong>
                                </p>
                                <ul className="list-disc ml-4 mt-1 text-sm text-blue-700">
                                    {removeFromAllPharmacies ? (
                                        <>
                                            <li>
                                                Remove their access to all
                                                assigned pharmacies
                                            </li>
                                            <li>Keep their admin role</li>
                                            <li>
                                                Allow them to be assigned to
                                                pharmacies later
                                            </li>
                                        </>
                                    ) : (
                                        <>
                                            <li>
                                                Remove their access to this
                                                specific pharmacy
                                            </li>
                                            <li>
                                                Keep their admin role and access
                                                to other assigned pharmacies
                                            </li>
                                            <li>
                                                Allow them to be reassigned to
                                                different pharmacies later
                                            </li>
                                        </>
                                    )}
                                </ul>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t">
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={() => {
                                        setShowRemoveModal(false);
                                        setSelectedAdminForRemoval(null);
                                        setRemoveFromAllPharmacies(false);
                                    }}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleConfirmRemoval}
                                    isLoading={
                                        removeAdminFromPharmacy.status ===
                                        'pending'
                                    }
                                    className="bg-red-600 hover:bg-red-700 text-white"
                                    disabled={
                                        !selectedAdminForRemoval ||
                                        (!selectedAdminForRemoval.pharmacyId &&
                                            !removeFromAllPharmacies)
                                    }
                                >
                                    {removeFromAllPharmacies
                                        ? 'Remove from All'
                                        : 'Remove Admin'}
                                </Button>
                            </div>
                        </div>
                    </Modal>
                )}

                {/* Role System Demo Modal */}
                {showRoleSystemDemo && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-lg shadow-xl w-full max-w-7xl max-h-[95vh] overflow-auto">
                            <div className="flex items-center justify-between p-6 border-b border-gray-200">
                                <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                                    <FaSitemap className="text-purple-600" />
                                    Complete Role System & Permission Guide
                                </h2>
                                <Button
                                    onClick={() => setShowRoleSystemDemo(false)}
                                    color="secondary"
                                >
                                    <FaTimes className="mr-2" />
                                    Close
                                </Button>
                            </div>
                            <div className="p-6">
                                <RoleSystemDemo />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default SuperAdminDashboard;
