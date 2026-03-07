import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ManageAppSettingsUseCase } from '@/core/application/use-cases/ManageAppSettingsUseCase';
import { createMockAppSettingsRepository, mockAppSetting, mockAppSettings } from '@/__tests__/mocks/repositories';

describe('ManageAppSettingsUseCase', () => {
    let useCase: ManageAppSettingsUseCase;
    let mockRepo: any;

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
});
