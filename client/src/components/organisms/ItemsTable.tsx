import React from 'react';
import { Table } from '../molecules/Table';
import {
    Card,
    CardHeader,
    CardContent,
    CardTitle,
    CardDescription,
    CardFooter,
} from '../molecules/Card';
import type { SaleItem, DrugDetails } from '../../types/sale.types';
import { formatGHSDisplayAmount } from '../../utils/currency';

// Create a type that extends SaleItem with an optional id property
// Make sure it includes the drug property
type TableSaleItem = SaleItem & {
    id?: string | number;
    drug?: DrugDetails;
};

interface ItemsTableProps {
    items: SaleItem[];
    subtotal: number;
    tax: number;
    discount: number;
    totalAmount: number;
    isLoading?: boolean;
}

const ItemsTable: React.FC<ItemsTableProps> = ({
    items,
    subtotal,
    tax,
    discount,
    totalAmount,
    isLoading = false,
}) => {
    if (isLoading) {
        return (
            <Card>
                <CardHeader className="border-b">
                    <div className="h-6 bg-gray-200 animate-pulse rounded w-32 mb-2"></div>
                    <div className="h-4 bg-gray-200 animate-pulse rounded w-48"></div>
                </CardHeader>
                <CardContent className="pt-6">
                    {/* Table skeleton */}
                    <div className="space-y-4">
                        {/* Table header */}
                        <div className="grid grid-cols-5 gap-4 pb-2 border-b">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <div
                                    key={i}
                                    className="h-4 bg-gray-200 animate-pulse rounded"
                                ></div>
                            ))}
                        </div>
                        {/* Table rows */}
                        {Array.from({ length: 3 }).map((_, i) => (
                            <div
                                key={i}
                                className="grid grid-cols-5 gap-4 py-2"
                            >
                                {Array.from({ length: 5 }).map((_, j) => (
                                    <div
                                        key={j}
                                        className="h-4 bg-gray-200 animate-pulse rounded"
                                    ></div>
                                ))}
                            </div>
                        ))}
                    </div>

                    {/* Summary skeleton */}
                    <div className="mt-6 space-y-2">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="flex justify-between">
                                <div className="h-4 bg-gray-200 animate-pulse rounded w-20"></div>
                                <div className="h-4 bg-gray-200 animate-pulse rounded w-16"></div>
                            </div>
                        ))}
                    </div>
                </CardContent>
                <CardFooter className="flex justify-end border-t p-6">
                    <div className="text-right space-y-2">
                        <div className="h-4 bg-gray-200 animate-pulse rounded w-24"></div>
                        <div className="h-8 bg-gray-200 animate-pulse rounded w-32"></div>
                    </div>
                </CardFooter>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader className="border-b">
                <CardTitle className="text-xl">Items Sold</CardTitle>
                <CardDescription>
                    {items.length} item{items.length !== 1 ? 's' : ''} in this
                    transaction
                </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
                <Table
                    data={items as unknown as TableSaleItem[]}
                    columns={[
                        {
                            header: 'Drug Name',
                            accessor: (item) => {
                                // Try to get name from drug object first, then fallback to item.name
                                return (
                                    (item.drug && item.drug.name) ||
                                    item.name ||
                                    'N/A'
                                );
                            },
                        },
                        {
                            header: 'Brand',
                            accessor: (item) => {
                                // Try to get brand from drug object first, then fallback to item.brand
                                return (
                                    (item.drug && item.drug.brand) ||
                                    item.brand ||
                                    '-'
                                );
                            },
                        },
                        {
                            header: 'Quantity',
                            accessor: (item) => item.quantity,
                            className: 'text-center',
                        },
                        {
                            header: 'Unit Price',
                            accessor: (item) => item.priceAtSale,
                            cell: (value) =>
                                formatGHSDisplayAmount(value as number),
                            className: 'text-right',
                        },
                        {
                            header: 'Subtotal',
                            accessor: (item) =>
                                item.quantity * item.priceAtSale,
                            cell: (value) =>
                                formatGHSDisplayAmount(value as number),
                            className: 'text-right font-medium',
                        },
                    ]}
                />

                <div className="mt-6 space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="font-medium">Subtotal:</span>
                        <span>{formatGHSDisplayAmount(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="font-medium">Tax:</span>
                        <span>{formatGHSDisplayAmount(tax)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="font-medium">Discount:</span>
                        <span>{formatGHSDisplayAmount(discount)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg pt-2 border-t">
                        <span>Total:</span>
                        <span>{formatGHSDisplayAmount(totalAmount)}</span>
                    </div>
                </div>
            </CardContent>
            <CardFooter className="flex justify-end border-t p-6">
                <div className="text-right">
                    <p className="text-sm text-muted-foreground">
                        Total Amount
                    </p>
                    <p className="text-2xl font-bold text-primary">
                        {formatGHSDisplayAmount(totalAmount)}
                    </p>
                </div>
            </CardFooter>
        </Card>
    );
};

export default ItemsTable;
