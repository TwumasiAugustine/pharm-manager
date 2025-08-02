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

    console.log(drug);

    if (isLoading) {
        return (
            <DashboardLayout>
                <div className="flex justify-center items-center h-40">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
                </div>
            </DashboardLayout>
        );
    }

    if (isError || !drug) {
        return (
            <DashboardLayout>
                <div className="bg-red-50 border border-red-300 rounded-md p-4 text-center">
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
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-semibold mb-6">Edit Drug</h2>
                <DrugForm
                    key={drug.id} // Force re-render when drug changes
                    onSubmit={handleSubmit}
                    initialData={drug}
                    isSubmitting={updateDrug.isPending}
                />
            </div>
        </DashboardLayout>
    );
};

export default EditDrugPage;
