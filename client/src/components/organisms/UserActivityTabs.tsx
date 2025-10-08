import React from 'react';
import type { IconType } from 'react-icons';

interface Tab {
    id: 'activities' | 'analytics' | 'sessions' | 'summary';
    label: string;
    icon: IconType;
}

interface UserActivityTabsProps {
    tabs: readonly Tab[];
    activeTab: 'activities' | 'analytics' | 'sessions' | 'summary';
    onTabChange: (tabId: 'activities' | 'analytics' | 'sessions' | 'summary') => void;
}

export const UserActivityTabs: React.FC<UserActivityTabsProps> = ({
    tabs,
    activeTab,
    onTabChange,
}) => {
    return (
        <div className="mb-6">
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-2 sm:space-x-8 overflow-x-auto">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => onTabChange(tab.id)}
                                className={`${
                                    activeTab === tab.id
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}
                            >
                                <Icon className="w-4 h-4" />
                                <span className="hidden sm:inline">{tab.label}</span>
                                <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
                            </button>
                        );
                    })}
                </nav>
            </div>
        </div>
    );
};
