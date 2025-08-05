import React, { createContext, useState } from 'react';
import type { ReactNode } from 'react';

interface DisplayContextType {
    isExportMode: boolean;
    setExportMode: (isExport: boolean) => void;
}

export const DisplayContext = createContext<DisplayContextType | undefined>(
    undefined,
);

export const DisplayProvider: React.FC<{ children: ReactNode }> = ({
    children,
}) => {
    const [isExportMode, setIsExportMode] = useState(false);

    const setExportMode = (isExport: boolean) => {
        setIsExportMode(isExport);
    };

    return (
        <DisplayContext.Provider value={{ isExportMode, setExportMode }}>
            {children}
        </DisplayContext.Provider>
    );
};
