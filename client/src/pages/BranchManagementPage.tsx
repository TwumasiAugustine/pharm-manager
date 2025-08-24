import React, { useState } from 'react';
import type { Branch } from '../types/branch.types';
import {
    useBranches,
    useCreateBranch,
    useUpdateBranch,
    useDeleteBranch,
} from '../hooks/useBranches';
import DashboardLayout from '../layouts/DashboardLayout';
import LoadingSkeleton from '../components/organisms/LoadingSkeleton';
import { BranchForm } from '../components/organisms/BranchForm';
import { BranchList } from '../components/organisms/BranchList';
import { FaSitemap, FaPlus } from 'react-icons/fa';
import { Button } from '../components/atoms/Button';

export default function BranchManagementPage() {
    const { data: branches, isLoading, error } = useBranches();
    const createBranch = useCreateBranch();
    const updateBranch = useUpdateBranch();
    const deleteBranch = useDeleteBranch();
    const [form, setForm] = useState<
        Omit<Branch, 'id' | 'createdAt' | 'updatedAt'>
    >({
        name: '',
        address: {
            street: '',
            city: '',
            state: '',
            postalCode: '',
            country: '',
        },
        contact: { phone: '', email: '' },
        manager: '',
    });
    const [editingId, setEditingId] = useState<string | null>(null);
    const [showForm, setShowForm] = useState(false);

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        const { name, value } = e.target;
        if (name.startsWith('address.')) {
            const key = name.replace('address.', '');
            setForm({
                ...form,
                address: {
                    ...form.address,
                    [key]: value,
                },
            });
        } else if (name.startsWith('contact.')) {
            const key = name.replace('contact.', '');
            setForm({
                ...form,
                contact: {
                    ...form.contact,
                    [key]: value,
                },
            });
        } else {
            setForm({ ...form, [name]: value });
        }
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (editingId) {
            updateBranch.mutate({ id: editingId, branch: form });
            setEditingId(null);
        } else {
            createBranch.mutate(form);
        }
        setForm({
            name: '',
            address: {
                street: '',
                city: '',
                state: '',
                postalCode: '',
                country: '',
            },
            contact: { phone: '', email: '' },
            manager: '',
        });
        setShowForm(false);
    }

    function handleCancelEdit() {
        setEditingId(null);
        setForm({
            name: '',
            address: {
                street: '',
                city: '',
                state: '',
                postalCode: '',
                country: '',
            },
            contact: { phone: '', email: '' },
            manager: '',
        });
        setShowForm(false);
    }

    function handleEdit(branch: Branch) {
        // Remove id, createdAt, updatedAt for form
        const { id, createdAt, updatedAt, ...rest } = branch;
        setForm({
            ...rest,
            address: { ...branch.address },
            contact: { ...branch.contact },
            manager: branch.manager || '',
        });
        setEditingId(branch.id);
        setShowForm(true);
    }

    function handleDelete(id: string) {
        deleteBranch.mutate(id);
    }

    if (isLoading) return <LoadingSkeleton />;

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold flex items-center">
                            <FaSitemap className="mr-2 text-blue-500" />
                            Branch Management
                        </h1>
                        <p className="mt-1 text-sm text-gray-600">
                            Manage your pharmacy branches and locations
                        </p>
                    </div>
                    <div className="flex items-center gap-3 flex-wrap justify-end lg:justify-start">
                        <Button
                            onClick={() => {
                                setShowForm((prev) => !prev);
                                if (editingId) setEditingId(null);
                                if (!showForm) {
                                    setForm({
                                        name: '',
                                        address: {
                                            street: '',
                                            city: '',
                                            state: '',
                                            postalCode: '',
                                            country: '',
                                        },
                                        contact: { phone: '', email: '' },
                                        manager: '',
                                    });
                                }
                            }}
                            color="primary"
                        >
                            <FaPlus className="mr-2" /> New Branch
                        </Button>
                    </div>
                </div>
                {error && (
                    <div className="flex items-center justify-center text-red-500 text-md">
                        Error loading branches
                    </div>
                )}
                {showForm && (
                    <BranchForm
                        form={form}
                        onChange={handleChange}
                        onSubmit={handleSubmit}
                        isEditing={!!editingId}
                        onCancelEdit={handleCancelEdit}
                        isPending={
                            createBranch.isPending || updateBranch.isPending
                        }
                    />
                )}
                <BranchList
                    branches={branches || []}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    isLoading={false}
                />
            </div>
        </DashboardLayout>
    );
}
