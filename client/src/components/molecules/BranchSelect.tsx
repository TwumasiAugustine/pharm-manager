import { useBranches } from '../../hooks/useBranches';

export function BranchSelect({
    value,
    onChange,
}: {
    value?: string;
    onChange: (id: string) => void;
}) {
    const { data: branches, isLoading } = useBranches();
    if (isLoading)
        return (
            <select disabled aria-label="Select Branch">
                <option>Loading...</option>
            </select>
        );
    return (
        <select
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            required
            aria-label="Select Branch"
        >
            <option value="">Select Branch</option>
            {branches?.map((branch: { id: string; name: string }) => (
                <option key={branch.id} value={branch.id}>
                    {branch.name}
                </option>
            ))}
        </select>
    );
}
