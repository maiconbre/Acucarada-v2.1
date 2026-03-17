import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ManageCategoryUseCase } from '@/core/application/use-cases/ManageCategoryUseCase';
import { createMockCategoryRepository, mockCategory } from '@/core/application/__tests__/mocks/repositories';

describe('ManageCategoryUseCase', () => {
    let useCase: ManageCategoryUseCase;
    let mockRepo: ReturnType<typeof createMockCategoryRepository>;

    beforeEach(() => {
        mockRepo = createMockCategoryRepository();
        useCase = new ManageCategoryUseCase(mockRepo);
    });

    it('deve retornar todas as categorias (apenas ativas por padrão)', async () => {
        const categories = await useCase.getAll();
        expect(categories).toHaveLength(1);
        expect(categories[0]).toEqual(mockCategory);
        expect(mockRepo.findAll).toHaveBeenCalledWith(true);
    });

    it('deve retornar todas as categorias (incluindo inativas se solicitado)', async () => {
        await useCase.getAll(false);
        expect(mockRepo.findAll).toHaveBeenCalledWith(false);
    });

    it('deve retornar uma categoria por ID', async () => {
        const category = await useCase.getById('cat-001');
        expect(category).toEqual(mockCategory);
        expect(mockRepo.findById).toHaveBeenCalledWith('cat-001');
    });

    it('getById deve retornar null para ID inexistente', async () => {
        mockRepo.findById = vi.fn().mockResolvedValue(null);
        const category = await useCase.getById('nao-existe');
        expect(category).toBeNull();
    });

    it('getAll deve retornar lista vazia quando o repositório retornar vazio', async () => {
        mockRepo.findAll = vi.fn().mockResolvedValue([]);
        const categories = await useCase.getAll();
        expect(categories).toHaveLength(0);
    });
});
