import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GetCatalogProductsUseCase } from '@/core/application/use-cases/GetCatalogProductsUseCase';
import { createMockProductRepository, mockProduct } from '@/__tests__/mocks/repositories';

describe('GetCatalogProductsUseCase', () => {
    let useCase: GetCatalogProductsUseCase;
    let mockRepo: ReturnType<typeof createMockProductRepository>;

    beforeEach(() => {
        mockRepo = createMockProductRepository();
        useCase = new GetCatalogProductsUseCase(mockRepo);
    });

    it('deve retornar apenas produtos ativos e não deletados', async () => {
        const products = await useCase.execute();

        expect(products).toHaveLength(1);
        expect(products[0]).toEqual(mockProduct);
        expect(mockRepo.findAll).toHaveBeenCalledWith({
            is_active: true,
            include_deleted: false
        });
    });
});
