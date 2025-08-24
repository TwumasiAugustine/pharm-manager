import React from 'react';
import { BranchSelect } from '../molecules/BranchSelect';
import type { CreateCustomerRequest } from '../../types/customer.types';

interface CustomerFormProps {
    formData: CreateCustomerRequest;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onBranchChange: (id: string) => void;
    onSubmit: (e: React.FormEvent) => void;
    isPending?: boolean;
}

export const CustomerForm: React.FC<CustomerFormProps> = ({
    formData,
    onChange,
    onBranchChange,
    onSubmit,
    isPending = false,
}) => (
    <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700 mb-1"
                >
                    Name *
                </label>
                <input
                    id="name"
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={onChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                />
            </div>
            <div>
                <label
                    htmlFor="phone"
                    className="block text-sm font-medium text-gray-700 mb-1"
                >
                    Phone *
                </label>
                <input
                    id="phone"
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={onChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                />
            </div>
            <div className="md:col-span-2">
                <label
                    htmlFor="branchId"
                    className="block text-sm font-medium text-gray-700 mb-1"
                >
                    Branch
                </label>
                <BranchSelect
                    value={formData.branchId || ''}
                    onChange={onBranchChange}
                />
            </div>
            <div>
                <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 mb-1"
                >
                    Email
                </label>
                <input
                    id="email"
                    type="email"
                    name="email"
                    value={formData.email || ''}
                    onChange={onChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
            </div>
            <div>
                <label
                    htmlFor="address"
                    className="block text-sm font-medium text-gray-700 mb-1"
                >
                    Address
                </label>
                <input
                    id="address"
                    type="text"
                    name="address"
                    value={formData.address || ''}
                    onChange={onChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
            </div>
        </div>
        <div className="flex justify-end">
            <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                disabled={isPending}
            >
                {isPending ? 'Saving...' : 'Save Customer'}
            </button>
        </div>
    </form>
);
