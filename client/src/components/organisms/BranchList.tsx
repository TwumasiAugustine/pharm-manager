import type { Branch } from '../../types/branch.types';
import { Table } from '../molecules/Table';
import type { TableColumn, TableAction } from '../molecules/Table';

import { Pagination } from '../molecules/Pagination';

interface BranchListProps {
    branches: Branch[];
    onEdit: (branch: Branch) => void;
    onDelete: (id: string) => void;
    isLoading?: boolean;
    page?: number;
    totalPages?: number;
    onPageChange?: (page: number) => void;
    totalItems?: number;
    itemsPerPage?: number;
    deleteLoading?: boolean;
}

export const BranchList: React.FC<BranchListProps> = ({
    branches,
    onEdit,
    onDelete,
    isLoading = false,
    page = 1,
    totalPages = 1,
    onPageChange,
    totalItems,
    itemsPerPage,
    deleteLoading = false,
}) => {
    const columns: TableColumn<Branch>[] = [
        { header: 'Name', accessor: 'name' },
        { header: 'City', accessor: (b) => b.address.city },
        { header: 'Country', accessor: (b) => b.address.country },
    ];

    const actions: TableAction<Branch>[] = [
        {
            label: 'Edit',
            onClick: onEdit,
            className: 'text-blue-600',
        },
        {
            label: deleteLoading ? 'Deleting...' : 'Delete',
            onClick: (b) => {
                if (!deleteLoading && b.id) onDelete(b.id);
            },
            className: `text-red-600 ${
                deleteLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`,
            icon: deleteLoading ? (
                <svg
                    className="animate-spin h-4 w-4 mr-1 inline"
                    viewBox="0 0 24 24"
                >
                    <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                    />
                    <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v8z"
                    />
                </svg>
            ) : undefined,
        },
    ];

    return (
        <div>
            <Table<Branch>
                data={branches}
                columns={columns}
                actions={actions}
                isLoading={isLoading}
                emptyMessage="No branches found."
            />
            {onPageChange && totalPages > 1 && (
                <div className="mt-4 flex justify-center">
                    <Pagination
                        currentPage={page}
                        totalPages={totalPages}
                        onPageChange={onPageChange}
                        totalItems={totalItems}
                        itemsPerPage={itemsPerPage}
                        size="md"
                    />
                </div>
            )}
        </div>
    );
};
