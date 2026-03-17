import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ManageAppSettingsUseCase } from '@/core/application/use-cases/ManageAppSettingsUseCase';
import { createMockAppSettingsRepository, mockAppSetting, mockAppSettings } from '@/core/application/__tests__/mocks/repositories';

describe('ManageAppSettingsUseCase', () => {
    let useCase: ManageAppSettingsUseCase;
    let mockRepo: ReturnType<typeof createMockAppSettingsRepository>;

    beforeEach(() => {
        mockRepo = createMockAppSettingsRepository();
        useCase = new ManageAppSettingsUseCase(mockRepo);
    });

    it('deve retornar as configurações públicas convertidas', async () => {
        const settings = await useCase.getPublicSettings();
        expect(settings).toEqual(mockAppSettings);
        expect(mockRepo.getPublicSettings).toHaveBeenCalled();
    });

    it('deve retornar todas as configurações e o objeto convertido', async () => {
        const result = await useCase.getAllSettings();
        expect(result.settings).toEqual(mockAppSettings);
        expect(result.allSettings).toHaveLength(6);
        expect(result.allSettings[0]).toEqual(mockAppSetting);
        expect(mockRepo.getAllSettings).toHaveBeenCalled();
    });

    it('deve atualizar uma configuração', async () => {
        const result = await useCase.updateSetting('key', 'value');
        expect(result).toBe(true);
        expect(mockRepo.updateSetting).toHaveBeenCalledWith('key', 'value');
    });

    it('getPublicSettings deve retornar defaults quando repositório falha', async () => {
        vi.spyOn(console, 'error').mockImplementation(() => {});
        mockRepo.getPublicSettings = vi.fn().mockRejectedValue(new Error('DB error'));
        const settings = await useCase.getPublicSettings();
        expect(settings).toEqual({
            whatsapp_number: '5511999999999',
            whatsapp_message: 'Olá! Gostaria de fazer um pedido dos seus doces artesanais.',
            site_name: 'Açucarada Doces',
            site_description: 'Doces artesanais feitos com amor e carinho',
            maintenance_mode: 'false',
            analytics_enabled: 'true'
        });
    });

    it('getAllSettings deve retornar objeto vazio/default quando repositório falha', async () => {
        vi.spyOn(console, 'error').mockImplementation(() => {});
        mockRepo.getAllSettings = vi.fn().mockRejectedValue(new Error('DB error'));
        const result = await useCase.getAllSettings();
        expect(result.allSettings).toHaveLength(0);
        expect(result.settings.site_name).toBe('Açucarada Doces');
    });

    it('convertToAppSettings deve lidar com lista parcial de configurações', async () => {
        const partialList = [{ key: 'site_name', value: 'Novo Nome', description: '', category: '' }];
        mockRepo.getPublicSettings = vi.fn().mockResolvedValue(partialList);
        const settings = await useCase.getPublicSettings();
        expect(settings.site_name).toBe('Novo Nome');
        expect(settings.whatsapp_number).toBe('5511999999999'); // Fallback
    });

    it('updateSetting deve retornar false quando falha', async () => {
        mockRepo.updateSetting = vi.fn().mockResolvedValue(false);
        const result = await useCase.updateSetting('key', 'val');
        expect(result).toBe(false);
    });
});
