import React, { useState } from 'react';
import type { ReactNode } from 'react';
import { DisplayContext } from './DisplayContextBase';

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

// Re-export the context for convenience
export { DisplayContext } from './DisplayContextBase';
export type { DisplayContextType } from './DisplayContextBase';
