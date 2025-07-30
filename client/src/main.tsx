import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import './styles/notifications.css';
import './styles/notification-colors.css';
import App from './App.tsx';
import { QueryProvider } from './utils/query-provider';

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <QueryProvider>
            <App />
        </QueryProvider>
    </StrictMode>,
);
