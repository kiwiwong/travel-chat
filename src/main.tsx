import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/es/locale/zh_CN';
import App from './App.tsx';
import 'antd/dist/antd.css';

import './index.css';

async function initializeApp() {
    createRoot(document.getElementById('root')!).render(
        <StrictMode>
            <ConfigProvider locale={zhCN}>
                <App />
            </ConfigProvider>
        </StrictMode>
    );
}

initializeApp();
