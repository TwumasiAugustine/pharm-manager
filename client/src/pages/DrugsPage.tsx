import React, { useState } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import { DrugList } from '../components/organisms/DrugList';
import { DrugForm } from '../components/organisms/DrugForm';
import { useCreateDrug } from '../hooks/useDrugs';
import type { DrugFormValues } from '../validations/drug.validation';

/**
 * DrugsPage component - handles listing and management of drugs
 */
const DrugsPage: React.FC = () => {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const createDrug = useCreateDrug();

    const handleAddDrug = (data: DrugFormValues) => {
        createDrug.mutate(data, {
            onSuccess: () => {
                setIsAddModalOpen(false);
            },
        });
    };

    return (
        <DashboardLayout>
            <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-semibold">Drug Inventory</h2>
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        Add New Drug
                    </button>
                </div>

                <DrugList />

                {isAddModalOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xl font-semibold">
                                    Add New Drug
                                </h3>
                                <button
                                    onClick={() => setIsAddModalOpen(false)}
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    <span className='sr-only'>Modal button</span>
                                    <svg
                                        className="w-6 h-6"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M6 18L18 6M6 6l12 12"
                                        ></path>
                                    </svg>
                                </button>
                            </div>
                            <DrugForm
                                onSubmit={handleAddDrug}
                                isSubmitting={createDrug.isPending}
                            />
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default DrugsPage;
