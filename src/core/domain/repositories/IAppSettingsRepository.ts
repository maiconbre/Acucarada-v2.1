export interface AppSetting {
    key: string;
    value: string;
    description: string;
    category: string;
}

export interface AppSettings {
    whatsapp_number: string;
    whatsapp_message: string;
    site_name: string;
    site_description: string;
    maintenance_mode: string;
    analytics_enabled: string;
}

export const DEFAULT_APP_SETTINGS: AppSettings = {
    whatsapp_number: '5511999999999',
    whatsapp_message: 'Olá! Gostaria de fazer um pedido dos seus doces artesanais.',
    site_name: 'Açucarada Doces',
    site_description: 'Doces artesanais feitos com amor e carinho',
    maintenance_mode: 'false',
    analytics_enabled: 'true'
};

export interface IAppSettingsRepository {
    getPublicSettings(): Promise<AppSetting[]>;
    getAllSettings(): Promise<AppSetting[]>;
    updateSetting(key: string, value: string): Promise<boolean>;
}
