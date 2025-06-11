export interface AppConfig {
    API_URL: string;
    API_KEY: string;
    ENABLE_UPLOAD_FILE: boolean;
    ENABLE_SELECT_MODE: boolean;
}

const API_CONFIG_KEY = 'CHAT_API_CONFIG';

export async function fetchConfig(): Promise<AppConfig> {
    try {
        const localConfig = getConfig();
        if (localConfig) return localConfig;

        const response = await fetch(`/config.json?version=${Date.now()}`);
        const config = await response.json();
        setConfig(config);
        return config;
    } catch (error) {
        console.error('Failed to load config, using defaults', error);
        // 返回默认配置
        return {
            API_URL: 'http://dev.dtai.dtstack.cn/api/dtai/v1',
            API_KEY: '',
            ENABLE_UPLOAD_FILE: true,
            ENABLE_SELECT_MODE: true,
        };
    }
}

export const getConfig = (): AppConfig | null => {
    try {
        const config = localStorage.getItem(API_CONFIG_KEY);
        return config ? JSON.parse(config) : null;
    } catch (error) {
        return null;
    }
};

export const setConfig = (config: AppConfig) => {
    localStorage.setItem(API_CONFIG_KEY, JSON.stringify(config));
};
