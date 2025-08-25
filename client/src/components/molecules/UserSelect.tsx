import { useUsers } from '../../hooks/useUsers';
import type { IUser } from '../../types/user.types';

export function UserSelect({
    value,
    onChange,
    label = 'Manager',
    required = false,
    disabled = false,
}: {
    value?: string;
    onChange: (id: string) => void;
    label?: string;
    required?: boolean;
    disabled?: boolean;
}) {
    const { data, isLoading } = useUsers({ limit: 100 });
    return (
        <div className="relative">
            <label htmlFor='user-select' className="block text-sm font-medium text-gray-700 mb-1">
                {label}
            </label>
            <select
                id="user-select"
                value={value || ''}
                onChange={(e) => onChange(e.target.value)}
                required={required}
                disabled={disabled || isLoading}
                className="block w-full rounded-lg border border-gray-300 bg-white py-2 px-3 pr-8 text-gray-700 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all appearance-none"
            >
                <option value="">Select {label}</option>
                {isLoading ? (
                    <option>Loading...</option>
                ) : (
                    data?.users.map((user: IUser) => (
                        <option key={user._id} value={user._id}>
                            {user.name} ({user.email})
                        </option>
                    ))
                )}
            </select>
            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400">
                <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19 9l-7 7-7-7"
                    />
                </svg>
            </span>
        </div>
    );
}
