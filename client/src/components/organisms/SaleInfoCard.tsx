import React from 'react';
import {
    Card,
    CardHeader,
    CardContent,
    CardTitle,
    CardDescription,
} from '../molecules/Card';
import {
    FaIdCard,
    FaCalendarAlt,
    FaCheckCircle,
    FaUserAlt,
    FaShoppingBag,
    FaStore
} from 'react-icons/fa';
import { format } from 'date-fns';
import type { Sale } from '../../types/sale.types';

interface SaleInfoCardProps {
    sale: Sale;
}

const SaleInfoCard: React.FC<SaleInfoCardProps> = ({ sale }) => {
    return (
        <Card>
            <CardHeader className="border-b bg-muted/40">
                <CardTitle className="text-xl">
                    Transaction Information
                </CardTitle>
                <CardDescription>
                    Sale completed successfully on{' '}
                    {sale.date
                        ? format(new Date(sale.date), 'PPP')
                        : 'Unknown date'}{' '}
                    at {format(new Date(sale.createdAt), 'p')}
                </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
                {/* Transaction Info Column */}
                <div className="space-y-4">
                    <h4 className="font-medium text-sm text-muted-foreground mb-2 border-b pb-1">
                        Transaction Information
                    </h4>

                    <div className="flex items-start space-x-3">
                        <FaIdCard className="h-5 w-5 text-primary mt-0.5" />
                        <div>
                            <div className="font-medium">Transaction ID</div>
                            <div className="text-sm text-muted-foreground">
                                {sale.id}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-start space-x-3">
                        <FaCalendarAlt className="h-5 w-5 text-primary mt-0.5" />
                        <div>
                            <div className="font-medium">Date & Time</div>
                            <div className="text-sm text-muted-foreground">
                                {sale.date
                                    ? format(new Date(sale.date), 'PPP')
                                    : 'Unknown date'}{' '}
                                at{' '}
                                {sale.date
                                    ? format(new Date(sale.date), 'p')
                                    : 'Unknown time'}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-start space-x-3">
                        <FaCheckCircle className="h-5 w-5 text-primary mt-0.5" />
                        <div>
                            <div className="font-medium">Status</div>
                            <div className="text-sm">
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    Completed
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-start space-x-3">
                        <FaUserAlt className="h-5 w-5 text-primary mt-0.5" />
                        <div>
                            <div className="font-medium">Sold By</div>
                            <div className="text-sm text-muted-foreground">
                                {typeof sale.soldBy === 'object' &&
                                sale.soldBy?.name
                                    ? sale.soldBy.name
                                    : typeof sale.soldBy === 'string'
                                    ? sale.soldBy
                                    : 'N/A'}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-start space-x-3">
                        <FaShoppingBag className="h-5 w-5 text-primary mt-0.5" />
                        <div>
                            <div className="font-medium">Items</div>
                            <div className="text-sm text-muted-foreground">
                                {sale.items.length} item
                                {sale.items.length !== 1 ? 's' : ''}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Customer Info Column */}
                <div className="space-y-4">
                    <h4 className="font-medium text-sm text-muted-foreground mb-2 border-b pb-1">
                        Customer Information
                    </h4>
                    <div className="flex items-start space-x-3">
                        <FaStore className="h-5 w-5 text-primary mt-0.5" />
                        <div>
                            <div className="font-medium">Customer</div>
                            <div className="text-sm text-muted-foreground">
                                Walk-in Customer
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default SaleInfoCard;
