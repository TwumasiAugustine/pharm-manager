import { useState } from 'react';
import type {
    ICreatePharmacyRequest,
    ICreateAdminRequest,
    IPharmacy,
} from '../api/super-admin.api';
import type { AdminUser } from '../types/admin.types';
import {
    useCreatePharmacy,
    useDeletePharmacy,
    useCreateAdmin,
    useUpdateAdmin,
    useAssignAdminToPharmacy,
    useRemoveAdminFromPharmacy,
    useRemoveAdminFromAllPharmacies,
} from './useSuperAdmin';

export const useSuperAdminManagement = () => {
    // Modal states
    const [showPharmacyModal, setShowPharmacyModal] = useState(false);
    const [showAdminModal, setShowAdminModal] = useState(false);
    const [showEditAdminModal, setShowEditAdminModal] = useState(false);
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [showRemoveModal, setShowRemoveModal] = useState(false);

    // Selection states
    const [selectedPharmacy, setSelectedPharmacy] = useState<IPharmacy | null>(
        null,
    );
    const [selectedAdminId, setSelectedAdminId] = useState<string>('');
    const [selectedAdminForRemoval, setSelectedAdminForRemoval] =
        useState<AdminUser | null>(null);
    const [selectedAdminForEdit, setSelectedAdminForEdit] =
        useState<AdminUser | null>(null);
    const [removeFromAllPharmacies, setRemoveFromAllPharmacies] =
        useState(false);

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

    const [editAdminForm, setEditAdminForm] = useState({
        name: '',
        email: '',
        pharmacyId: '',
        isActive: true,
    });

    // API hooks
    const createPharmacy = useCreatePharmacy();
    const deletePharmacy = useDeletePharmacy();
    const createAdmin = useCreateAdmin();
    const updateAdmin = useUpdateAdmin();
    const assignAdminToPharmacy = useAssignAdminToPharmacy();
    const removeAdminFromPharmacy = useRemoveAdminFromPharmacy();
    const removeAdminFromAllPharmacies = useRemoveAdminFromAllPharmacies();

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
        setSelectedAdminId('');
        setShowAssignModal(true);
    };

    const handleConfirmAssignment = async () => {
        if (!selectedPharmacy || !selectedAdminId) return;

        try {
            await assignAdminToPharmacy.mutateAsync({
                pharmacyId: selectedPharmacy._id,
                adminId: selectedAdminId,
            });
            setShowAssignModal(false);
            setSelectedPharmacy(null);
            setSelectedAdminId('');
        } catch (error) {
            console.error('Error assigning admin:', error);
        }
    };

    const handleRemoveAdmin = (admin: AdminUser) => {
        setSelectedAdminForRemoval(admin);
        setRemoveFromAllPharmacies(false);
        setShowRemoveModal(true);
    };

    const handleRemoveAdminFromAll = (admin: AdminUser) => {
        setSelectedAdminForRemoval(admin);
        setRemoveFromAllPharmacies(true);
        setShowRemoveModal(true);
    };

    const handleEditAdmin = (admin: AdminUser) => {
        setSelectedAdminForEdit(admin);
        setEditAdminForm({
            name: admin.name,
            email: admin.email,
            pharmacyId: admin.pharmacyId?._id || '',
            isActive: admin.isActive,
        });
        setShowEditAdminModal(true);
    };

    const handleEditAdminFormChange = (
        field: string,
        value: string | boolean,
    ) => {
        setEditAdminForm((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleUpdateAdmin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedAdminForEdit) return;

        try {
            await updateAdmin.mutateAsync({
                adminId: selectedAdminForEdit._id,
                data: editAdminForm,
            });
            setShowEditAdminModal(false);
            setSelectedAdminForEdit(null);
            resetEditAdminForm();
        } catch (error) {
            console.error('Error updating admin:', error);
        }
    };

    const handleConfirmRemoval = async () => {
        if (!selectedAdminForRemoval) return;

        try {
            if (
                removeFromAllPharmacies ||
                !selectedAdminForRemoval.pharmacyId
            ) {
                await removeAdminFromAllPharmacies.mutateAsync(
                    selectedAdminForRemoval._id,
                );
            } else {
                await removeAdminFromPharmacy.mutateAsync({
                    pharmacyId: selectedAdminForRemoval.pharmacyId._id,
                    adminId: selectedAdminForRemoval._id,
                });
            }
            setShowRemoveModal(false);
            setSelectedAdminForRemoval(null);
            setRemoveFromAllPharmacies(false);
        } catch (error) {
            console.error('Error removing admin:', error);
        }
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

    const resetEditAdminForm = () => {
        setEditAdminForm({
            name: '',
            email: '',
            pharmacyId: '',
            isActive: true,
        });
    };

    const closeRemoveModal = () => {
        setShowRemoveModal(false);
        setSelectedAdminForRemoval(null);
        setRemoveFromAllPharmacies(false);
    };

    return {
        // Modal states
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

        // Selection states
        selectedPharmacy,
        selectedAdminId,
        setSelectedAdminId,
        selectedAdminForRemoval,
        selectedAdminForEdit,
        removeFromAllPharmacies,
        setRemoveFromAllPharmacies,

        // Form states
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
        handleConfirmAssignment,
        handleEditAdmin,
        handleRemoveAdmin,
        handleRemoveAdminFromAll,
        handleConfirmRemoval,

        // API states
        isCreatingPharmacy: createPharmacy.status === 'pending',
        isCreatingAdmin: createAdmin.status === 'pending',
        isUpdatingAdmin: updateAdmin.status === 'pending',
        isAssigningAdmin: assignAdminToPharmacy.status === 'pending',
        isRemovingAdmin: removeAdminFromPharmacy.status === 'pending',
    };
};
