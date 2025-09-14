import { useBranches } from '../../hooks/useBranches';

export function BranchSelect({
    value,
    onChange,
    required = true,
}: {
    value?: string;
    onChange: (id: string) => void;
    required?: boolean;
}) {
    const { data: branches, isLoading } = useBranches();
    if (isLoading)
        return (
            <div className="relative">
                <select
                    disabled
                    aria-label="Select Branch"
                    className="block w-full rounded-md border border-gray-300 bg-gray-100 text-sm font-semibold py-2 px-3 pr-8 text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all appearance-none"
                >
                    <option>Loading...</option>
                </select>
                <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-gray-300">
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
    return (
        <div className="relative">
            <select
                value={value || ''}
                onChange={(e) => onChange(e.target.value)}
                required={required}
                aria-label="Select Branch"
                className="block w-full rounded-md border border-gray-300 bg-white text-sm font-semibold py-2 px-3 pr-8 text-gray-700  focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all appearance-none"
            >
                <option value="">Select Branch</option>
                {branches?.map((branch: { id: string; name: string }) => (
                    <option key={branch.id} value={branch.id}>
                        {branch.name}
                    </option>
                ))}
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
