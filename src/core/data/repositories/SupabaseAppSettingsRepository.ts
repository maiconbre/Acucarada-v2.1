import { supabase } from '@/core/infrastructure/supabase/client';
import { IAppSettingsRepository, AppSetting } from '../../domain/repositories/IAppSettingsRepository';

export class SupabaseAppSettingsRepository implements IAppSettingsRepository {
    async getPublicSettings(): Promise<AppSetting[]> {
        const { data, error } = await supabase.rpc('get_public_settings');
        
        if (error) {
            console.error('Error loading public settings:', error);
            throw new Error(`Erro ao carregar configurações públicas: ${error.message}`);
        }

        return data as AppSetting[];
    }

    async getAllSettings(): Promise<AppSetting[]> {
        const { data, error } = await supabase
            .from('app_settings')
            .select('key, value, description, category')
            .order('category', { ascending: true })
            .order('key', { ascending: true });
        
        if (error) {
            console.error('Error loading all settings:', error);
            throw new Error(`Erro ao carregar configurações: ${error.message}`);
        }

        return data as AppSetting[];
    }

    async updateSetting(key: string, value: string): Promise<boolean> {
        const { data, error } = await supabase.rpc('update_app_setting', {
            setting_key: key,
            setting_value: value
        });
        
        if (error) {
            console.error('Error updating setting:', error);
            throw new Error(`Erro ao atualizar configuração: ${error.message}`);
        }

        return data === true;
    }
}
