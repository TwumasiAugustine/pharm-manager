import { createContext } from 'react';

export interface DisplayContextType {
    isExportMode: boolean;
    setExportMode: (isExport: boolean) => void;
}

export const DisplayContext = createContext<DisplayContextType | undefined>(
    undefined,
);
