import React from 'react';
import { Table } from '../molecules/Table';
import type { Customer } from '../../types/customer.types';
import type { TableColumn } from '../molecules/Table';
import { FaEye } from 'react-icons/fa';
import { useBranches } from '../../hooks/useBranches';

interface CustomerTableProps {
    customers: Customer[];
    isLoading: boolean;
    onView: (customer: Customer) => void;
    emptyMessage: string;
}

export const CustomerTable: React.FC<CustomerTableProps> = ({
    customers,
    isLoading,
    onView,
    emptyMessage,
}) => {
    const { data: branches } = useBranches();
    return (
        <Table<Customer>
            data={customers}
            isLoading={isLoading}
            columns={
                [
                    { header: 'Name', accessor: 'name' },
                    { header: 'Phone', accessor: 'phone' },
                    {
                        header: 'Email',
                        accessor: 'email',
                        cell: (value) => value || '-',
                    },
                    {
                        header: 'Branch',
                        accessor: 'branchId',
                        cell: (value) => {
                            if (!value || !branches) return '-';
                            const branch = branches.find((b) => b.id === value);
                            return branch ? branch.name : '-';
                        },
                    },
                ] as TableColumn<Customer>[]
            }
            actions={[
                {
                    label: 'View Details',
                    icon: <FaEye />,
                    onClick: onView,
                },
            ]}
            emptyMessage={emptyMessage}
        />
    );
};
