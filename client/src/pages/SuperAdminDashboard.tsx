import React from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import { UserRole } from '../types/auth.types';
import type { AdminUser } from '../types/admin.types';
import { useAuthStore } from '../store/auth.store';
import { usePharmaciesByRole, useAdminsByRole } from '../hooks/useSuperAdmin';
import { useSuperAdminManagement } from '../hooks/useSuperAdminManagement';
import { useURLSearch, usePaginationURL } from '../hooks/useURLSearch';
import type { IPharmacyResponse } from '../api/super-admin.api';

// Components
import { Button } from '../components/atoms/Button';
import RoleHierarchyIndicator from '../components/molecules/RoleHierarchyIndicator';
import OverviewCards from '../pages/super-admin/OverviewCards';
import RoleSystemDemo from '../components/organisms/RoleSystemDemo';

// Extracted components
import PharmacyManagementSection from '../components/organisms/PharmacyManagementSection';
import AdminManagementSection from '../components/organisms/AdminManagementSection';
import CreatePharmacyModal from '../components/organisms/CreatePharmacyModal';
import CreateAdminModal from '../components/organisms/CreateAdminModal';
import EditAdminModal from '../components/organisms/EditAdminModal';
import AssignAdminModal from '../components/organisms/AssignAdminModal';
import RemoveAdminModal from '../components/organisms/RemoveAdminModal';

// Icons
import { FaInfoCircle } from 'react-icons/fa';

const SuperAdminDashboard: React.FC = () => {
    const { user } = useAuthStore();
    const {
        page: currentPage,
        setPage: setCurrentPage,
        limit,
    } = usePaginationURL(1, 10);
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
        searchQuery: adminSearch,
        setSearchQuery: setAdminSearch,
        clearSearch: clearAdminSearch,
    } = useURLSearch({
        paramName: 'adminSearch',
        debounceMs: 300,
        minLength: 0,
    });
    const [showRoleSystemDemo, setShowRoleSystemDemo] = React.useState(false);

    // Use custom management hook
    const {
        // State
        showPharmacyModal,
        setShowPharmacyModal,
        showAdminModal,
        setShowAdminModal,
        showEditAdminModal,
        setShowEditAdminModal,
        showAssignModal,
        setShowAssignModal,
        showRemoveModal,
        closeRemoveModal,
        selectedPharmacy,
        selectedAdminId,
        setSelectedAdminId,
        selectedAdminForRemoval,
        selectedAdminForEdit,
        removeFromAllPharmacies,
        setRemoveFromAllPharmacies,
        pharmacyForm,
        setPharmacyForm,
        adminForm,
        setAdminForm,
        editAdminForm,
        handleEditAdminFormChange,

        // Handlers
        handleCreatePharmacy,
        handleCreateAdmin,
        handleUpdateAdmin,
        handleDeletePharmacy,
        handleAssignAdmin,
        handleEditAdmin,
        handleRemoveAdmin,
        handleRemoveAdminFromAll,
        handleConfirmAssignment,
        handleConfirmRemoval,

        // Loading states
        isCreatingPharmacy,
        isCreatingAdmin,
        isUpdatingAdmin,
        isAssigningAdmin,
        isRemovingAdmin,
    } = useSuperAdminManagement();

    // Data fetching
    const pharmaciesQuery = usePharmaciesByRole({
        page: currentPage,
        limit,
        search: pharmacySearch,
    });

    const adminsQuery = useAdminsByRole();

    const pharmaciesData = pharmaciesQuery.data as
        | IPharmacyResponse
        | undefined;
    const pharmaciesLoading = pharmaciesQuery.isLoading ?? false;

    const adminsData = adminsQuery.data;
    const adminsLoading = adminsQuery.isLoading ?? false;
    const admins = (adminsData as AdminUser[]) || [];

    // Check if user has appropriate role (Super Admin or Admin)
    if (user?.role !== UserRole.SUPER_ADMIN && user?.role !== UserRole.ADMIN) {
        return (
            <DashboardLayout>
                <div className="container mx-auto px-4 py-6 text-center">
                    <h1 className="text-2xl font-bold text-red-600 mb-4">
                        Access Denied
                    </h1>
                    <p className="text-gray-600">
                        Only Super Admins and Admins can access this page.
                    </p>
                </div>
            </DashboardLayout>
        );
    }

    // Determine dashboard title based on user role
    const dashboardTitle =
        user?.role === UserRole.SUPER_ADMIN
            ? 'Super Admin Dashboard'
            : 'Admin Dashboard';

    const dashboardSubtitle =
        user?.role === UserRole.SUPER_ADMIN
            ? 'Manage all pharmacies and admins across the system'
            : 'Manage your assigned pharmacy';

    return (
        <DashboardLayout>
            <div className="container mx-auto px-4 py-6">
                <div className="mb-8">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                {dashboardTitle}
                            </h1>
                            <p className="text-gray-600">{dashboardSubtitle}</p>
                        </div>
                        <div className="flex gap-3">
                            <Button
                                onClick={() => setShowRoleSystemDemo(true)}
                                variant="secondary"
                                className="flex items-center gap-2"
                            >
                                <FaInfoCircle />
                                Role System Guide
                            </Button>
                        </div>
                    </div>
                    <RoleHierarchyIndicator
                        currentUserRole={user?.role || UserRole.SUPER_ADMIN}
                    />
                </div>

                {/* Overview Cards */}
                <OverviewCards
                    pharmaciesData={pharmaciesData}
                    adminsCount={admins.length}
                    loading={pharmaciesLoading || adminsLoading}
                />

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
                    onEditAdmin={handleEditAdmin}
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

                {/* Edit Admin Modal */}
                <EditAdminModal
                    isOpen={showEditAdminModal}
                    onClose={() => setShowEditAdminModal(false)}
                    admin={selectedAdminForEdit}
                    pharmacies={pharmaciesData?.pharmacies || []}
                    adminForm={editAdminForm}
                    onFormChange={handleEditAdminFormChange}
                    onSubmit={handleUpdateAdmin}
                    isLoading={isUpdatingAdmin}
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

                {/* Role System Demo Modal */}
                {showRoleSystemDemo && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-lg shadow-xl w-full max-w-7xl max-h-[95vh] overflow-auto">
                            <div className="flex items-center justify-between p-6 border-b border-gray-200">
                                <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                                    <FaInfoCircle className="text-purple-600" />
                                    Complete Role System & Permission Guide
                                </h2>
                                <button
                                    onClick={() => setShowRoleSystemDemo(false)}
                                    className="text-gray-400 hover:text-gray-600 text-xl"
                                >
                                    ×
                                </button>
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
