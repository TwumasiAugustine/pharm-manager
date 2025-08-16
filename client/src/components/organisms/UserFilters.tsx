import React from 'react';
import { SearchBar } from '../molecules/SearchBar';

interface UserFiltersProps {
    searchTerm: string;
    onSearch: (q: string) => void;
}

const UserFilters: React.FC<UserFiltersProps> = ({ searchTerm, onSearch }) => (
    <div className="bg-white p-4 rounded-lg shadow-sm">
        <SearchBar
            placeholder="Search users..."
            onSearch={onSearch}
            className="w-full md:w-80"
            initialValue={searchTerm}
        />
    </div>
);

export default UserFilters;
