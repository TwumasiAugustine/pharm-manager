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

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        setForm({ ...form, [e.target.name]: e.target.value });
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
    }

    function handleEdit(branch: Branch) {
        setForm(branch);
        setEditingId(branch.id);
    }

    function handleDelete(id: string) {
        deleteBranch.mutate(id);
    }

    if (isLoading) return <LoadingSkeleton />;

    return (
        <DashboardLayout>
            <h1>Branch Management</h1>
            {error && (
                <div className="flex items-center justify-center text-red-500 text-md">
                    Error loading branches
                </div>
            )}
            <BranchForm
                form={form}
                onChange={handleChange}
                onSubmit={handleSubmit}
                isEditing={!!editingId}
                onCancelEdit={editingId ? handleCancelEdit : undefined}
                isPending={createBranch.isPending || updateBranch.isPending}
            />
            <BranchList
                branches={branches || []}
                onEdit={handleEdit}
                onDelete={handleDelete}
                isLoading={false}
            />
        </DashboardLayout>
    );
}
