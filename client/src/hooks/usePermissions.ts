import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNotify } from './useNotify';
import * as permissionApi from '../api/permission.api';

// Hook for getting all permissions
export const useAllPermissions = () => {
    return useQuery({
        queryKey: ['permissions', 'all'],
        queryFn: permissionApi.getAllPermissions,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
};

// Hook for getting role permissions
export const useRolePermissions = (role: string) => {
    return useQuery({
        queryKey: ['permissions', 'role', role],
        queryFn: () => permissionApi.getRolePermissions(role),
        enabled: !!role,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
};

// Hook for getting current user permissions
export const useCurrentUserPermissions = () => {
    return useQuery({
        queryKey: ['permissions', 'current'],
        queryFn: permissionApi.getCurrentUserPermissions,
        staleTime: 2 * 60 * 1000, // 2 minutes
    });
};

// Hook for checking specific permission
export const usePermissionCheck = (permission: string) => {
    return useQuery({
        queryKey: ['permissions', 'check', permission],
        queryFn: () => permissionApi.checkPermission(permission),
        enabled: !!permission,
        staleTime: 2 * 60 * 1000, // 2 minutes
    });
};

// Hook for getting user permissions
export const useUserPermissions = (userId: string) => {
    return useQuery({
        queryKey: ['permissions', 'user', userId],
        queryFn: () => permissionApi.getUserPermissions(userId),
        enabled: !!userId,
        staleTime: 2 * 60 * 1000, // 2 minutes
    });
};

// Hook for managing user permissions
export const useUserPermissionManagement = () => {
    const queryClient = useQueryClient();
    const notify = useNotify();

    const updatePermissionsMutation = useMutation({
        mutationFn: ({
            userId,
            permissions,
            resetToRoleDefaults,
        }: {
            userId: string;
            permissions: string[];
            resetToRoleDefaults?: boolean;
        }) =>
            permissionApi.updateUserPermissions(
                userId,
                permissions,
                resetToRoleDefaults,
            ),
        onSuccess: (_, variables) => {
            notify.success('User permissions updated successfully');
            queryClient.invalidateQueries({
                queryKey: ['permissions', 'user', variables.userId],
            });
            queryClient.invalidateQueries({ queryKey: ['users'] });
        },
        onError: (
            error: Error & { response?: { data?: { message?: string } } },
        ) => {
            notify.error(
                error.response?.data?.message ||
                    'Failed to update user permissions',
            );
        },
    });

    const addPermissionsMutation = useMutation({
        mutationFn: ({
            userId,
            permissions,
        }: {
            userId: string;
            permissions: string[];
        }) => permissionApi.addUserPermissions(userId, permissions),
        onSuccess: (data, variables) => {
            notify.success(
                `Added ${data.addedPermissions.length} permission(s)`,
            );
            queryClient.invalidateQueries({
                queryKey: ['permissions', 'user', variables.userId],
            });
            queryClient.invalidateQueries({ queryKey: ['users'] });
        },
        onError: (
            error: Error & { response?: { data?: { message?: string } } },
        ) => {
            notify.error(
                error.response?.data?.message || 'Failed to add permissions',
            );
        },
    });

    const removePermissionsMutation = useMutation({
        mutationFn: ({
            userId,
            permissions,
        }: {
            userId: string;
            permissions: string[];
        }) => permissionApi.removeUserPermissions(userId, permissions),
        onSuccess: (data, variables) => {
            notify.success(
                `Removed ${data.removedPermissions.length} permission(s)`,
            );
            queryClient.invalidateQueries({
                queryKey: ['permissions', 'user', variables.userId],
            });
            queryClient.invalidateQueries({ queryKey: ['users'] });
        },
        onError: (
            error: Error & { response?: { data?: { message?: string } } },
        ) => {
            notify.error(
                error.response?.data?.message || 'Failed to remove permissions',
            );
        },
    });

    return {
        updatePermissions: updatePermissionsMutation.mutate,
        addPermissions: addPermissionsMutation.mutate,
        removePermissions: removePermissionsMutation.mutate,
        isUpdating: updatePermissionsMutation.isPending,
        isAdding: addPermissionsMutation.isPending,
        isRemoving: removePermissionsMutation.isPending,
        isLoading:
            updatePermissionsMutation.isPending ||
            addPermissionsMutation.isPending ||
            removePermissionsMutation.isPending,
    };
};

// Hook for permission-based access control
export const usePermissions = () => {
    const { data: userPermissions, isLoading } = useCurrentUserPermissions();

    const hasPermission = useCallback(
        (permission: string): boolean => {
            if (isLoading || !userPermissions) return false;
            return userPermissions.permissions.all.some(
                (p) => p.key === permission,
            );
        },
        [userPermissions, isLoading],
    );

    const hasAnyPermission = useCallback(
        (permissions: string[]): boolean => {
            if (isLoading || !userPermissions) return false;
            return permissions.some((permission) => hasPermission(permission));
        },
        [userPermissions, isLoading, hasPermission],
    );

    const hasAllPermissions = useCallback(
        (permissions: string[]): boolean => {
            if (isLoading || !userPermissions) return false;
            return permissions.every((permission) => hasPermission(permission));
        },
        [userPermissions, isLoading, hasPermission],
    );

    const canManageUser = useCallback(
        (targetUserRole: string): boolean => {
            if (isLoading || !userPermissions) return false;

            const currentRole = userPermissions.user.role;

            // Super admin can manage anyone
            if (currentRole === 'SUPER_ADMIN') return true;

            // Cannot manage super admin
            if (targetUserRole === 'SUPER_ADMIN') return false;

            // Admin can manage non-admin users
            if (currentRole === 'ADMIN' && targetUserRole !== 'ADMIN')
                return true;

            // Check MANAGE_PERMISSIONS permission
            return hasPermission('MANAGE_PERMISSIONS');
        },
        [userPermissions, isLoading, hasPermission],
    );

    return {
        userPermissions,
        isLoading,
        hasPermission,
        hasAnyPermission,
        hasAllPermissions,
        canManageUser,
        role: userPermissions?.user.role,
        userId: userPermissions?.user.id,
    };
};

// Permission state management hook
export const usePermissionState = () => {
    const [selectedPermissions, setSelectedPermissions] = useState<string[]>(
        [],
    );
    const [originalPermissions, setOriginalPermissions] = useState<string[]>(
        [],
    );
    const [hasChanges, setHasChanges] = useState(false);

    useEffect(() => {
        const changes =
            selectedPermissions.length !== originalPermissions.length ||
            selectedPermissions.some((p) => !originalPermissions.includes(p)) ||
            originalPermissions.some((p) => !selectedPermissions.includes(p));
        setHasChanges(changes);
    }, [selectedPermissions, originalPermissions]);

    const initializePermissions = useCallback((permissions: string[]) => {
        setSelectedPermissions([...permissions]);
        setOriginalPermissions([...permissions]);
        setHasChanges(false);
    }, []);

    const togglePermission = useCallback((permission: string) => {
        setSelectedPermissions((prev) =>
            prev.includes(permission)
                ? prev.filter((p) => p !== permission)
                : [...prev, permission],
        );
    }, []);

    const addPermissions = useCallback((permissions: string[]) => {
        setSelectedPermissions((prev) => [
            ...prev,
            ...permissions.filter((p) => !prev.includes(p)),
        ]);
    }, []);

    const removePermissions = useCallback((permissions: string[]) => {
        setSelectedPermissions((prev) =>
            prev.filter((p) => !permissions.includes(p)),
        );
    }, []);

    const resetToOriginal = useCallback(() => {
        setSelectedPermissions([...originalPermissions]);
        setHasChanges(false);
    }, [originalPermissions]);

    const resetToDefaults = useCallback((defaultPermissions: string[]) => {
        setSelectedPermissions([...defaultPermissions]);
    }, []);

    const getChangedPermissions = useCallback(() => {
        const added = selectedPermissions.filter(
            (p) => !originalPermissions.includes(p),
        );
        const removed = originalPermissions.filter(
            (p) => !selectedPermissions.includes(p),
        );
        return { added, removed };
    }, [selectedPermissions, originalPermissions]);

    return {
        selectedPermissions,
        originalPermissions,
        hasChanges,
        initializePermissions,
        togglePermission,
        addPermissions,
        removePermissions,
        resetToOriginal,
        resetToDefaults,
        getChangedPermissions,
    };
};

export default {
    useAllPermissions,
    useRolePermissions,
    useCurrentUserPermissions,
    usePermissionCheck,
    useUserPermissions,
    useUserPermissionManagement,
    usePermissions,
    usePermissionState,
};
