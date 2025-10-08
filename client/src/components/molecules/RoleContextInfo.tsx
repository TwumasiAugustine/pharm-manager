import React from 'react';
import { FaInfoCircle } from 'react-icons/fa';
import RoleHierarchyIndicator from './RoleHierarchyIndicator';
import type { UserRole } from '../../types/user.types';

interface RoleContextInfoProps {
    userRole: UserRole;
}

export const RoleContextInfo: React.FC<RoleContextInfoProps> = ({
    userRole,
}) => {
    return (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl shadow-sm p-4 sm:p-6 mb-6">
            <div className="flex items-center gap-2 mb-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                    <FaInfoCircle className="text-blue-600 h-4 w-4 sm:h-5 sm:w-5" />
                </div>
                <div>
                    <h3 className="text-base sm:text-lg font-semibold text-blue-900">
                        Role Context for Activity Tracking
                    </h3>
                    <p className="text-xs sm:text-sm text-blue-700 mt-1">
                        Understand role hierarchy and access patterns
                    </p>
                </div>
            </div>
            <p className="text-sm text-blue-700 mb-4">
                Activities are tracked and filtered by user roles. Understanding
                the role hierarchy helps interpret user actions and access
                patterns.
            </p>
            <RoleHierarchyIndicator currentUserRole={userRole} />
        </div>
    );
};
