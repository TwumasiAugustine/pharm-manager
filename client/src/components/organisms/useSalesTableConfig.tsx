import { useNavigate } from 'react-router-dom';
import { FaEye } from 'react-icons/fa';
import { format, parseISO, isValid } from 'date-fns';
import type {
    TableColumn,
    TableAction,
} from '../molecules/Table';
import type {
    Sale,
    GroupedSales,
    SaleItem,
    DrugDetails,
} from '../../types/sale.types';

interface UseSalesTableConfigProps {
    onViewDetails?: (group: GroupedSales) => void;
}

export const useSalesTableConfig = (props?: UseSalesTableConfigProps) => {
    const navigate = useNavigate();

    const groupedColumns: TableColumn<GroupedSales>[] = [
        {
            header: 'Date',
            accessor: (group) => {
                try {
                    const date = parseISO(group.date);
                    return isValid(date)
                        ? format(date, 'PPP')
                        : group.date;
                } catch {
                    return group.date;
                }
            },
        },
        {
            header: '# of Sales',
            accessor: (group) => group.saleCount?.toString() || '0',
            className: 'text-center',
        },
        {
            header: 'Total Items',
            accessor: (group) => group.totalItems?.toString() || '0',
            className: 'text-center',
        },
        {
            header: 'Total Amount',
            accessor: (group) => {
                const amount =
                    typeof group.totalAmount === 'number'
                        ? group.totalAmount
                        : 0;
                return `GH₵${amount.toFixed(2)}`;
            },
            className: 'text-right',
        },
    ];

    const groupedActions: TableAction<GroupedSales>[] = [
        {
            label: 'View Details',
            onClick: (group) => props?.onViewDetails?.(group),
            icon: <FaEye className="h-4 w-4" />,
        },
    ];

    const saleColumns: TableColumn<Sale>[] = [
        {
            header: 'Sale Date',
            accessor: (sale) => {
                const dateValue = sale.date || sale.createdAt;
                if (!dateValue) return 'N/A';
                try {
                    const date =
                        typeof dateValue === 'string'
                            ? parseISO(dateValue)
                            : dateValue;
                    if (isValid(date)) {
                        return format(date, 'PPp');
                    }
                    const message = `Invalid date value: ${JSON.stringify(dateValue)}`;
                    console.error(message);
                    return 'Invalid date';
                } catch (error) {
                    const message = `Failed to parse date: ${JSON.stringify(dateValue)} - ${error}`;
                    console.error(message);
                    return 'Invalid date';
                }
            },
        },
        {
            header: 'Sold By',
            accessor: (sale) => {
                if (typeof sale.soldBy === 'object' && sale.soldBy) {
                    return sale.soldBy.name || 'Unknown';
                }
                return 'Unknown';
            },
        },
        {
            header: 'Customer',
            accessor: (sale) => {
                if (typeof sale.customer === 'object' && sale.customer) {
                    const name = sale.customer.name || 'Walk-in Customer';
                    const phone = sale.customer.phone
                        ? ` (${sale.customer.phone})`
                        : '';
                    return `${name}${phone}`;
                }
                return 'Walk-in Customer';
            },
        },
        {
            header: 'Items Sold',
            accessor: (sale) => {
                if (!sale.items || !Array.isArray(sale.items))
                    return 'No items';
                return sale.items
                    .map((item: SaleItem) => {
                        if (item.drug && item.drug.name) {
                            const drugDetails = item.drug as DrugDetails;
                            const brand = drugDetails.brand
                                ? ` (${drugDetails.brand})`
                                : '';
                            return `${drugDetails.name}${brand} x${item.quantity}`;
                        } else if (item.name) {
                            const brand = item.brand ? ` (${item.brand})` : '';
                            return `${item.name}${brand} x${item.quantity}`;
                        } else if (item.drugId) {
                            return `Drug #${item.drugId} x${item.quantity}`;
                        }
                        return 'Unknown Item';
                    })
                    .join(', ');
            },
        },
        {
            header: 'Finalized',
            accessor: (sale) => (sale.finalized ? 'Yes' : 'No'),
            className: 'text-center',
        },
        {
            header: 'Total Amount',
            accessor: (sale) => {
                const amount =
                    typeof sale.totalAmount === 'number'
                        ? sale.totalAmount
                        : 0;
                return `GH₵${amount.toFixed(2)}`;
            },
            className: 'text-right',
        },
    ];

    const saleActions: TableAction<Sale>[] = [
        {
            label: 'View',
            onClick: (sale) => {
                if (sale._id || sale.id) {
                    navigate(`/sales/${sale._id || sale.id}`);
                } else {
                    console.error('Sale ID is missing:', sale);
                }
            },
            icon: <FaEye className="h-4 w-4" />,
        },
    ];

    return {
        groupedColumns,
        groupedActions,
        saleColumns,
        saleActions,
    };
};
