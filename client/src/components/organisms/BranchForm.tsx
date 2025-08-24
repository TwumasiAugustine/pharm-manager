import React from 'react';
import type { Branch } from '../../types/branch.types';
import { UserSelect } from '../molecules/UserSelect';

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
    // Responsive, grouped, improved UI/UX
    return (
        <form
            onSubmit={onSubmit}
            className="space-y-6 bg-white p-6 rounded-2xl shadow-xl border border-gray-100 mb-6 max-w-2xl mx-auto"
        >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Branch Name <span className="text-red-500">*</span>
                    </label>
                    <input
                        name="name"
                        value={form.name}
                        onChange={onChange}
                        placeholder="Branch Name"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition"
                        required
                    />
                </div>
                <div>
                    <UserSelect
                        value={form.manager || ''}
                        onChange={(id) => {
                            // Simulate a synthetic event for compatibility with parent onChange
                            onChange({
                                target: { name: 'manager', value: id },
                            } as React.ChangeEvent<HTMLInputElement>);
                        }}
                        label="Manager"
                        required={false}
                    />
                </div>
            </div>
            {/* Address Group */}
            <div className="bg-gray-50 rounded-lg p-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Street
                    </label>
                    <input
                        name="address.street"
                        value={form.address.street}
                        onChange={onChange}
                        placeholder="Street Address"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        City
                    </label>
                    <input
                        name="address.city"
                        value={form.address.city}
                        onChange={onChange}
                        placeholder="City"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        State
                    </label>
                    <input
                        name="address.state"
                        value={form.address.state}
                        onChange={onChange}
                        placeholder="State"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Postal Code
                    </label>
                    <input
                        name="address.postalCode"
                        value={form.address.postalCode}
                        onChange={onChange}
                        placeholder="Postal Code"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Country
                    </label>
                    <input
                        name="address.country"
                        value={form.address.country}
                        onChange={onChange}
                        placeholder="Country"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition"
                    />
                </div>
            </div>
            {/* Contact Group */}
            <div className="bg-gray-50 rounded-lg p-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone
                    </label>
                    <input
                        name="contact.phone"
                        value={form.contact.phone}
                        onChange={onChange}
                        placeholder="Phone Number"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                    </label>
                    <input
                        name="contact.email"
                        value={form.contact.email}
                        onChange={onChange}
                        placeholder="Email"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition"
                    />
                </div>
            </div>
            <div className="flex gap-2 justify-end mt-4">
                {onCancelEdit && (
                    <button
                        type="button"
                        onClick={onCancelEdit}
                        className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 transition"
                    >
                        Cancel
                    </button>
                )}
                <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
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
