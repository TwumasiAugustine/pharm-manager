import React from 'react';
import {
    Card,
    CardContent,
    CardHeader,
} from '../../molecules/Card';

export const PharmacySetupLoadingSkeleton: React.FC = () => {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {[1, 2, 3, 4].map((i) => (
                <Card key={i} className="animate-pulse">
                    <CardHeader>
                        <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="h-10 bg-gray-200 rounded"></div>
                        <div className="h-10 bg-gray-200 rounded"></div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
};
