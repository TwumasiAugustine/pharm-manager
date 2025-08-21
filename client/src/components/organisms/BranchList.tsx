import type {Branch} from '../../types/branch.types'
import { Table } from '../molecules/Table';
import type {  TableColumn, TableAction } from '../molecules/Table';

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
}) => {
    const columns: TableColumn<Branch>[] = [
        { header: 'Name', accessor: 'name' },
        { header: 'Manager', accessor: 'manager', cell: (v) => (typeof v === 'string' && v) ? v : '-' },
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
            label: 'Delete',
            onClick: (b) => onDelete(b.id),
            className: 'text-red-600',
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
