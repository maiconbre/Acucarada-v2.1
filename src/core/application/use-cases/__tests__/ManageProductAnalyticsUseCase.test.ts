import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ManageProductAnalyticsUseCase } from '@/core/application/use-cases/ManageProductAnalyticsUseCase';
import { createMockProductAnalyticsRepository, mockProductAnalytics, mockLikeStatus } from '@/core/application/__tests__/mocks/repositories';

describe('ManageProductAnalyticsUseCase', () => {
    let useCase: ManageProductAnalyticsUseCase;
    let mockRepo: ReturnType<typeof createMockProductAnalyticsRepository>;

    beforeEach(() => {
        mockRepo = createMockProductAnalyticsRepository();
        useCase = new ManageProductAnalyticsUseCase(mockRepo);
    });

    it('deve retornar as métricas combinadas com status de curtida', async () => {
        const analytics = await useCase.getAnalytics('prod-001', 'user-001', 'session-001');

        expect(analytics).toEqual({
            ...mockProductAnalytics,
            is_liked: mockLikeStatus.is_liked
        });
        expect(mockRepo.getAnalytics).toHaveBeenCalledWith('prod-001');
        expect(mockRepo.checkLikeStatus).toHaveBeenCalledWith('prod-001', 'user-001', 'session-001');
    });

    it('deve alternar a curtida', async () => {
        const result = await useCase.toggleLike('prod-001', 'user-001', 'session-001', '127.0.0.1');
        expect(result).toBe(true);
        expect(mockRepo.toggleLike).toHaveBeenCalledWith('prod-001', 'user-001', 'session-001', '127.0.0.1');
    });

    it('deve rastrear um compartilhamento', async () => {
        const result = await useCase.trackShare('prod-001', 'whatsapp', 'hero', 'user-001', 'session-001', '127.0.0.1', 'agent');
        expect(result).toBe(true);
        expect(mockRepo.trackShare).toHaveBeenCalled();
    });

    it('deve rastrear um clique', async () => {
        const result = await useCase.trackClick('prod-001', 'catalog', 'navbar', 'user-001', 'session-001', '127.0.0.1', 'agent');
        expect(result).toBe(true);
        expect(mockRepo.trackClick).toHaveBeenCalled();
    });

    it('getAnalytics deve lidar com retorno null do repositório', async () => {
        mockRepo.getAnalytics = vi.fn().mockResolvedValue(null);
        const analytics = await useCase.getAnalytics('prod-1', 'user-1', 'sess-1');
        expect(analytics.total_likes).toBe(0);
        expect(analytics.total_shares).toBe(0);
    });

    it('getAnalytics deve funcionar para usuário anônimo (userId null)', async () => {
        await useCase.getAnalytics('prod-1', null, 'sess-1');
        expect(mockRepo.checkLikeStatus).toHaveBeenCalledWith('prod-1', null, 'sess-1');
    });

    it('toggleLike deve funcionar para usuário anônimo', async () => {
        await useCase.toggleLike('prod-1', null, 'sess-1', '127.0.0.1');
        expect(mockRepo.toggleLike).toHaveBeenCalledWith('prod-1', null, 'sess-1', '127.0.0.1');
    });

    it('trackShare deve aceitar parâmetros opcionais como null', async () => {
        await useCase.trackShare('p-1', 'wa', null, null, null, 'ip', null);
        expect(mockRepo.trackShare).toHaveBeenCalledWith('p-1', 'wa', null, null, null, 'ip', null);
    });
});
