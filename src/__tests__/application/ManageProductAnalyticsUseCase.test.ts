import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ManageProductAnalyticsUseCase } from '@/core/application/use-cases/ManageProductAnalyticsUseCase';
import { createMockProductAnalyticsRepository, mockProductAnalytics, mockLikeStatus } from '@/__tests__/mocks/repositories';

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
});
