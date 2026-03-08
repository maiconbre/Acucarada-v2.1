import { IAppSettingsRepository, AppSetting, AppSettings, DEFAULT_APP_SETTINGS } from '@/core/domain/repositories/IAppSettingsRepository';

export class ManageAppSettingsUseCase {
    constructor(private settingsRepository: IAppSettingsRepository) { }

    async getPublicSettings(): Promise<AppSettings> {
        try {
            const data = await this.settingsRepository.getPublicSettings();
            return this.convertToAppSettings(data);
        } catch (error) {
            console.error('Error getting public settings:', error);
            return DEFAULT_APP_SETTINGS;
        }
    }

    async getAllSettings(): Promise<{ settings: AppSettings; allSettings: AppSetting[] }> {
        try {
            const allSettings = await this.settingsRepository.getAllSettings();
            const settings = this.convertToAppSettings(allSettings);
            return { settings, allSettings };
        } catch (error) {
            console.error('Error getting all settings:', error);
            return { settings: DEFAULT_APP_SETTINGS, allSettings: [] };
        }
    }

    async updateSetting(key: string, value: string): Promise<boolean> {
        return this.settingsRepository.updateSetting(key, value);
    }

    private convertToAppSettings(data: AppSetting[]): AppSettings {
        const settingsObj = data.reduce((acc: Record<string, string>, setting: AppSetting) => {
            acc[setting.key] = setting.value;
            return acc;
        }, {} as Record<string, string>);

        return {
            whatsapp_number: settingsObj.whatsapp_number || DEFAULT_APP_SETTINGS.whatsapp_number,
            whatsapp_message: settingsObj.whatsapp_message || DEFAULT_APP_SETTINGS.whatsapp_message,
            site_name: settingsObj.site_name || DEFAULT_APP_SETTINGS.site_name,
            site_description: settingsObj.site_description || DEFAULT_APP_SETTINGS.site_description,
            maintenance_mode: settingsObj.maintenance_mode || DEFAULT_APP_SETTINGS.maintenance_mode,
            analytics_enabled: settingsObj.analytics_enabled || DEFAULT_APP_SETTINGS.analytics_enabled,
        };
    }
}
