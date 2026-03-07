import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/core/infrastructure/supabase/client';
import { useToast } from '@/hooks/ui/use-toast';
import { container } from '@/core/infrastructure/container';
import { ManageAppSettingsUseCase } from '@/core/application/use-cases/ManageAppSettingsUseCase';
import { AppSettings, AppSetting } from '@/core/domain/repositories/IAppSettingsRepository';

interface UseAppSettingsReturn {
    settings: AppSettings;
    publicSettings: AppSetting[];
    loading: boolean;
    error: string | null;
    updateSetting: (key: string, value: string) => Promise<boolean>;
    refreshSettings: () => Promise<void>;
    getWhatsAppLink: (customMessage?: string) => string;
}

const DEFAULT_SETTINGS: AppSettings = {
    whatsapp_number: '5511999999999',
    whatsapp_message: 'Olá! Gostaria de fazer um pedido dos seus doces artesanais.',
    site_name: 'Açucarada Doces',
    site_description: 'Doces artesanais feitos com amor e carinho',
    maintenance_mode: 'false',
    analytics_enabled: 'true'
};

export const useAppSettings = (): UseAppSettingsReturn => {
    const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
    const [publicSettings, setPublicSettings] = useState<AppSetting[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { toast } = useToast();

    const settingsUseCase = useMemo(() => 
        new ManageAppSettingsUseCase(container.getAppSettingsRepository()), 
    []);

    const loadPublicSettings = useCallback(async () => {
        try {
            const data = await settingsUseCase.getPublicSettings();
            setSettings(prev => ({ ...prev, ...data }));
        } catch (err) {
            console.error('Error loading public settings:', err);
        }
    }, [settingsUseCase]);

    const loadAllSettings = useCallback(async () => {
        try {
            const { settings: allSettings, allSettings: settingsList } = await settingsUseCase.getAllSettings();
            setSettings(allSettings);
            setPublicSettings(settingsList);
        } catch (err) {
            console.error('Error loading all settings:', err);
            await loadPublicSettings();
        }
    }, [settingsUseCase, loadPublicSettings]);

    const loadSettings = useCallback(async () => {
        setLoading(true);
        setError(null);
        
        try {
            const { data: { user } } = await supabase.auth.getUser();
            
            if (user) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('role')
                    .eq('user_id', user.id)
                    .single();
                
                if (profile?.role === 'admin') {
                    await loadAllSettings();
                } else {
                    await loadPublicSettings();
                }
            } else {
                await loadPublicSettings();
            }
        } catch (err) {
            console.error('Error checking user role:', err);
            await loadPublicSettings();
        } finally {
            setLoading(false);
        }
    }, [loadAllSettings, loadPublicSettings]);

    const updateSetting = useCallback(async (key: string, value: string): Promise<boolean> => {
        try {
            const success = await settingsUseCase.updateSetting(key, value);
            
            if (success) {
                setSettings(prev => ({ ...prev, [key]: value }));
                setPublicSettings(prev => 
                    prev.map(setting => 
                        setting.key === key ? { ...setting, value } : setting
                    )
                );
                
                toast({
                    title: 'Sucesso',
                    description: 'Configuração atualizada com sucesso'
                });
                return true;
            }
            
            return false;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar configuração';
            console.error('Error updating setting:', err);
            toast({
                variant: 'destructive',
                title: 'Erro',
                description: errorMessage
            });
            return false;
        }
    }, [settingsUseCase, toast]);

    const refreshSettings = useCallback(async () => {
        await loadSettings();
    }, [loadSettings]);

    const getWhatsAppLink = useCallback((customMessage?: string) => {
        const number = settings.whatsapp_number;
        const message = customMessage || settings.whatsapp_message;
        const encodedMessage = encodeURIComponent(message);
        return `https://wa.me/${number}?text=${encodedMessage}`;
    }, [settings.whatsapp_number, settings.whatsapp_message]);

    useEffect(() => {
        loadSettings();
    }, [loadSettings]);

    useEffect(() => {
        const subscription = supabase
            .channel('app_settings_changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'app_settings'
                },
                () => {
                    refreshSettings();
                }
            )
            .subscribe();

        return () => {
            subscription.unsubscribe();
        };
    }, [refreshSettings]);

    return {
        settings,
        publicSettings,
        loading,
        error,
        updateSetting,
        refreshSettings,
        getWhatsAppLink
    };
};

export default useAppSettings;
