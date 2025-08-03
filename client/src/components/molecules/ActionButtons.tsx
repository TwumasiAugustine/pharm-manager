import React, { useState, useRef, useEffect } from 'react';
import { FiMoreVertical } from 'react-icons/fi';
import { Button } from '../atoms/Button';

export interface ActionButtonsProps {
    children: React.ReactNode;
    mobileActionsLabel?: string;
    className?: string;
}

/**
 * ActionButtons component that provides responsive action button layout
 * Shows all buttons on desktop/tablet, collapses to dropdown on mobile
 */
export const ActionButtons: React.FC<ActionButtonsProps> = ({
    children,
    mobileActionsLabel = 'Actions',
    className = '',
}) => {
    const [showMobileDropdown, setShowMobileDropdown] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node)
            ) {
                setShowMobileDropdown(false);
            }
        };

        if (showMobileDropdown) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showMobileDropdown]);

    return (
        <div className={`flex items-center gap-3 ${className}`}>
            {/* Desktop/Tablet view - show all buttons */}
            <div className="hidden sm:flex items-center gap-3 flex-wrap">
                {children}
            </div>

            {/* Mobile view - Actions dropdown */}
            <div className="sm:hidden relative" ref={dropdownRef}>
                <Button
                    variant="secondary"
                    onClick={() => setShowMobileDropdown(!showMobileDropdown)}
                >
                    <FiMoreVertical className="h-4 w-4 mr-2" />
                    {mobileActionsLabel}
                </Button>

                {/* Mobile dropdown panel */}
                {showMobileDropdown && (
                    <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-40">
                        <div className="py-1">
                            {React.Children.map(children, (child, index) => {
                                if (React.isValidElement(child)) {
                                    // Clone the child and add dropdown styling
                                    const childElement =
                                        child as React.ReactElement<{
                                            className?: string;
                                            onClick?: (
                                                e: React.MouseEvent,
                                            ) => void;
                                        }>;
                                    return React.cloneElement(childElement, {
                                        key: index,
                                        className: `${
                                            childElement.props.className || ''
                                        } btn-dropdown`,
                                        onClick: (e: React.MouseEvent) => {
                                            if (childElement.props.onClick) {
                                                childElement.props.onClick(e);
                                            }
                                            setShowMobileDropdown(false);
                                        },
                                    });
                                }
                                return child;
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export interface DropdownActionProps {
    onClick: () => void;
    icon?: React.ReactNode;
    children: React.ReactNode;
    disabled?: boolean;
}

/**
 * Individual action item for use within ActionButtons dropdown
 */
export const DropdownAction: React.FC<DropdownActionProps> = ({
    onClick,
    icon,
    children,
    disabled = false,
}) => {
    return (
        <button onClick={onClick} disabled={disabled} className="btn-dropdown">
            {icon && <span className="mr-3 flex-shrink-0">{icon}</span>}
            {children}
        </button>
    );
};
