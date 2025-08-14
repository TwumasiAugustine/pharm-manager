import React from 'react';

interface FormSectionProps {
    title?: string;
    children: React.ReactNode;
    className?: string;
}

export const FormSection: React.FC<FormSectionProps> = ({
    title,
    children,
    className,
}) => (
    <div className={className || ''}>
        {title && (
            <h4 className="text-lg font-semibold mb-2 text-gray-800">
                {title}
            </h4>
        )}
        {children}
    </div>
);
