import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import { DrugForm } from '../components/organisms/DrugForm';
import { useDrug, useUpdateDrug } from '../hooks/useDrugs';
import type { DrugFormValues } from '../validations/drug.validation';

const EditDrugPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    // If id is undefined, redirect after first render
    React.useEffect(() => {
        if (!id) {
            navigate('/drugs');
        }
    }, [id, navigate]);

    // Provide a fallback for id to satisfy hook requirements
    const safeId = id ?? '';
    const updateDrug = useUpdateDrug(safeId);
    const { data: drug, isLoading, isError } = useDrug(safeId);

    const handleSubmit = (data: DrugFormValues) => {
        updateDrug.mutate(data, {
            onSuccess: () => {
                navigate('/drugs');
            },
        });
    };

    return (
        <DashboardLayout>
            {/* Error State */}
            {(isError || !drug) && !isLoading && (
                <div className="bg-red-50 border border-red-300 rounded-md p-4 text-center mb-6">
                    <p className="text-red-600">
                        Failed to load drug data. It might not exist or there
                        was a server error.
                    </p>
                    <button
                        type="button"
                        onClick={() => navigate('/drugs')}
                        className="mt-2 px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200"
                    >
                        Back to Drug List
                    </button>
                </div>
            )}

            <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-semibold mb-6">Edit Drug</h2>

                {isLoading ? (
                    <div className="space-y-6 animate-pulse">
                        {/* Form loading skeleton */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                                <div className="h-10 bg-gray-200 rounded"></div>
                            </div>
                            <div>
                                <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                                <div className="h-10 bg-gray-200 rounded"></div>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                                <div className="h-10 bg-gray-200 rounded"></div>
                            </div>
                            <div>
                                <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                                <div className="h-10 bg-gray-200 rounded"></div>
                            </div>
                        </div>
                        <div>
                            <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                            <div className="h-20 bg-gray-200 rounded"></div>
                        </div>
                        <div className="flex gap-4">
                            <div className="h-10 bg-gray-200 rounded w-24"></div>
                            <div className="h-10 bg-gray-200 rounded w-24"></div>
                        </div>
                    </div>
                ) : drug ? (
                    <DrugForm
                        key={drug.id} // Force re-render when drug changes
                        onSubmit={handleSubmit}
                        initialData={drug}
                        isSubmitting={updateDrug.isPending}
                    />
                ) : null}
            </div>
        </DashboardLayout>
    );
};

export default EditDrugPage;
