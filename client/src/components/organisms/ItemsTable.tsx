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
import type { SaleItem } from '../../types/sale.types';
import { formatGHSDisplayAmount } from '../../utils/currency';

// Create a type that extends SaleItem with an optional id property
type TableSaleItem = SaleItem & { id?: string | number };

interface ItemsTableProps {
    items: SaleItem[];
    subtotal: number;
    tax: number;
    discount: number;
    totalAmount: number;
}

const ItemsTable: React.FC<ItemsTableProps> = ({
    items,
    subtotal,
    tax,
    discount,
    totalAmount,
}) => {
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
                            accessor: (item) => item.name || 'N/A',
                        },
                        {
                            header: 'Brand',
                            accessor: (item) => item.brand || '-',
                        },
                        {
                            header: 'Quantity',
                            accessor: (item) => item.quantity,
                            className: 'text-center',
                        },
                        {
                            header: 'Unit Price',
                            accessor: (item) => item.priceAtSale,
                            cell: (value) => formatGHSDisplayAmount(value),
                            className: 'text-right',
                        },
                        {
                            header: 'Subtotal',
                            accessor: (item) =>
                                item.quantity * item.priceAtSale,
                            cell: (value) => formatGHSDisplayAmount(value),
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
