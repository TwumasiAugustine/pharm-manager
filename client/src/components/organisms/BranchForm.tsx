import React from 'react';
import type { Branch } from '../../types/branch.types';

interface BranchFormProps {
    form: Omit<Branch, 'id' | 'createdAt' | 'updatedAt'>;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onSubmit: (e: React.FormEvent) => void;
    isEditing: boolean;
    onCancelEdit?: () => void;
    isPending?: boolean;
}

export const BranchForm: React.FC<BranchFormProps> = ({
    form,
    onChange,
    onSubmit,
    isEditing,
    onCancelEdit,
    isPending = false,
}) => {
    return (
        <form
            onSubmit={onSubmit}
            className="space-y-4 bg-white p-4 rounded shadow-sm border border-gray-200 mb-6"
        >
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Branch Name *
                </label>
                <input
                    name="name"
                    value={form.name}
                    onChange={onChange}
                    placeholder="Branch Name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                />
            </div>
            {/* Add more fields for address, contact, manager as needed */}
            <div className="flex gap-2 justify-end">
                {isEditing && onCancelEdit && (
                    <button
                        type="button"
                        onClick={onCancelEdit}
                        className="px-4 py-2 bg-gray-200 rounded-md"
                    >
                        Cancel
                    </button>
                )}
                <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    disabled={isPending}
                >
                    {isPending
                        ? isEditing
                            ? 'Updating...'
                            : 'Creating...'
                        : isEditing
                        ? 'Update Branch'
                        : 'Create Branch'}
                </button>
            </div>
        </form>
    );
};
