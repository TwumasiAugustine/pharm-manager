import type { ButtonHTMLAttributes, ReactNode, CSSProperties } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger';
    isLoading?: boolean;
    children: ReactNode;
}

export const Button = ({
    variant = 'primary',
    isLoading = false,
    children,
    className = '',
    style,
    ...props
}: ButtonProps) => {
    const getStyles = (): CSSProperties => {
        const baseStyles: CSSProperties = {
            padding: '0.5rem 1rem',
            borderRadius: '0.25rem',
            fontWeight: 500,
            transition: 'background-color 150ms ease-in-out',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            ...style
        };

        if (isLoading) {
            baseStyles.opacity = 0.7;
            baseStyles.cursor = 'not-allowed';
        }

        switch (variant) {
            case 'primary':
                return {
                    ...baseStyles,
                    backgroundColor: '#2563eb',
                    color: 'white',
                };
            case 'secondary':
                return {
                    ...baseStyles,
                    backgroundColor: '#e5e7eb',
                    color: '#1f2937',
                };
            case 'danger':
                return {
                    ...baseStyles,
                    backgroundColor: '#dc2626',
                    color: 'white',
                };
            default:
                return baseStyles;
        }
    };

    return (
        <button
            className={className}
            style={getStyles()}
            disabled={isLoading || props.disabled}
            {...props}
        >
            {isLoading ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg
                        style={{
                            animation: 'spin 1s linear infinite',
                            marginLeft: '-0.25rem',
                            marginRight: '0.75rem',
                            height: '1.25rem',
                            width: '1.25rem',
                            color: 'currentColor'
                        }}
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                    >
                        <circle
                            style={{ opacity: 0.25 }}
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                        ></circle>
                        <path
                            style={{ opacity: 0.75 }}
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                    </svg>
                    <span>Loading...</span>
                </div>
            ) : (
                children
            )}
        </button>
    );
};

