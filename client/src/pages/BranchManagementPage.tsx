
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
    const [formError, setFormError] = useState<string | null>(null);
    const [deleteError, setDeleteError] = useState<string | null>(null);

    const createBranch = useCreateBranch();
    const updateBranch = useUpdateBranch();
    const deleteBranch = useDeleteBranch();

    /**
     * Handles input changes for the branch form.
     */
    function handleChange(e: ChangeEvent<HTMLInputElement>) {
        const { name, value } = e.target;
        if (name.startsWith('address.')) {
            const key = name.replace('address.', '');
            setForm((prev) => ({
                ...prev,
                address: {
                    ...prev.address,
                    [key]: value,
                },
            }));
        } else if (name.startsWith('contact.')) {
            const key = name.replace('contact.', '');
            setForm((prev) => ({
                ...prev,
                contact: {
                    ...prev.contact,
                    [key]: value,
                },
            }));
        } else {
            setForm((prev) => ({ ...prev, [name]: value }));
        }
    }

    function resetForm() {
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
        setEditingId(null);
        setShowForm(false);
        setFormError(null);
    }

    /**
     * Recursively removes id, _id, createdAt, updatedAt fields from an object.
     */
    function sanitizeBranchData<T>(data: T): T {
        const omitFields = (obj: any): any => {
            if (Array.isArray(obj)) return obj.map(omitFields);
            if (obj && typeof obj === 'object') {
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const { id, _id, createdAt, updatedAt, ...rest } = obj;
                Object.keys(rest).forEach((key) => {
                    rest[key] = omitFields(rest[key]);
                });
                return rest;
            }
            return obj;
        };
        return omitFields(data);
    }

    function handleSubmit(e: FormEvent) {
        e.preventDefault();
        setFormError(null);
        const sanitized = sanitizeBranchData(form);
        if (editingId) {
            updateBranch.mutate(
                { id: editingId, branch: sanitized },
                {
                    onSuccess: resetForm,
                    onError: (err: any) => {
                        setFormError(
                            err?.response?.data?.error ||
                                err?.message ||
                                'Failed to update branch',
                        );
                    },
                },
            );
        } else {
            createBranch.mutate(sanitized, {
                onSuccess: resetForm,
                onError: (err: any) => {
                    setFormError(
                        err?.response?.data?.error ||
                            err?.message ||
                            'Failed to create branch',
                    );
                },
            });
        }
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

    /**
     * Prepares the form for editing a branch.
     */
    function handleEdit(branch: Branch) {
        // Remove id, createdAt, updatedAt for form
        const { id, createdAt, updatedAt, ...rest } = branch;
        setForm({
            ...rest,
            address: { ...branch.address },
            contact: { ...branch.contact },
            manager: branch.manager || '',
        });
        setEditingId(id);
        setShowForm(true);
    }

    /**
     * Handles branch deletion.
     */
    function handleDelete(id: string) {
        setDeleteError(null);
        if (!id) return;
        deleteBranch.mutate(id, {
            onError: (err: any) => {
                let msg = 'Failed to delete branch';
                if (err?.response) {
                    msg = `Error ${err.response.status}: ${
                        err.response.data?.error || err.response.statusText
                    }`;
                } else if (err?.message) {
                    msg = err.message;
                }
                setDeleteError(msg);
            },
        });
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
                    <>
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
                        {formError && (
                            <div className="text-red-500 text-center mb-2">
                                {formError}
                            </div>
                        )}
                    </>
                )}
                <BranchList
                    branches={(branches || []).map((b: any) => ({
                        ...b,
                        id: b.id || b._id,
                    }))}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    isLoading={false}
                    deleteLoading={deleteBranch.isPending}
                />
                {deleteError && (
                    <div className="text-red-500 text-center mb-2">
                        {deleteError}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
