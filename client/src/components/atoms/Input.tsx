import type { InputHTMLAttributes, CSSProperties } from 'react';
import { forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ label, error, className = '', style, ...props }, ref) => {
        const inputStyle: CSSProperties = {
            width: '100%',
            padding: '0.5rem 0.75rem',
            borderWidth: '1px',
            borderStyle: 'solid',
            borderColor: error ? '#ef4444' : '#d1d5db',
            borderRadius: '0.375rem',
            boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
            ...style,
        };

        const labelStyle: CSSProperties = {
            display: 'block',
            marginBottom: '0.25rem',
            fontSize: '0.875rem',
            fontWeight: 500,
            color: '#374151',
        };

        const errorStyle: CSSProperties = {
            marginTop: '0.25rem',
            fontSize: '0.875rem',
            color: '#ef4444',
        };

        const containerStyle: CSSProperties = {
            marginBottom: '1rem',
        };

        return (
            <div style={containerStyle}>
                {label && (
                    <label htmlFor={props.id} style={labelStyle}>
                        {label}
                    </label>
                )}
                <input
                    ref={ref}
                    className={className}
                    style={inputStyle}
                    {...props}
                />
                {error && <p style={errorStyle}>{error}</p>}
            </div>
        );
    },
);
