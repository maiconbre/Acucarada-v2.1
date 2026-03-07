import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ManageProductUseCase, CreateProductDTO, ProductActionType } from '@/core/application/use-cases/ManageProductUseCase';
import { createMockProductRepository, mockProduct } from '@/__tests__/mocks/repositories';

describe('ManageProductUseCase', () => {
    let useCase: ManageProductUseCase;
    let mockRepo: ReturnType<typeof createMockProductRepository>;

    beforeEach(() => {
        mockRepo = createMockProductRepository();
        useCase = new ManageProductUseCase(mockRepo);
    });

    it('deve retornar todos os produtos', async () => {
        const products = await useCase.getAll();
        expect(products).toHaveLength(1);
        expect(products[0]).toEqual(mockProduct);
        expect(mockRepo.findAll).toHaveBeenCalledWith({});
    });

    it('deve retornar um produto por ID', async () => {
        const product = await useCase.getById('prod-001');
        expect(product).toEqual(mockProduct);
        expect(mockRepo.findById).toHaveBeenCalledWith('prod-001');
    });

    it('deve criar um novo produto', async () => {
        const dto: CreateProductDTO = {
            name: 'Novo Produto',
            price: 10,
            image_url: 'url',
            category: 'doces'
        };

        const result = await useCase.create(dto);
        expect(result).toEqual(mockProduct);
        expect(mockRepo.create).toHaveBeenCalled();
    });

    it('deve atualizar um produto', async () => {
        const dto = { name: 'Produto Atualizado' };
        const result = await useCase.update('prod-001', dto);
        expect(result).toEqual(mockProduct);
        expect(mockRepo.update).toHaveBeenCalledWith('prod-001', dto);
    });

    it('deve executar ação de toggle corretamente', async () => {
        await useCase.executeAction('prod-001', 'toggle', true);
        expect(mockRepo.toggleActive).toHaveBeenCalledWith('prod-001', true);
    });

    it('deve executar ação de soft_delete corretamente', async () => {
        await useCase.executeAction('prod-001', 'soft_delete');
        expect(mockRepo.softDelete).toHaveBeenCalledWith('prod-001');
    });

    it('deve executar ação de hard_delete corretamente', async () => {
        await useCase.executeAction('prod-001', 'hard_delete');
        expect(mockRepo.hardDelete).toHaveBeenCalledWith('prod-001');
    });

    it('deve lançar erro para ação inválida', async () => {
        await expect(useCase.executeAction('prod-001', 'invalid' as ProductActionType))
            .rejects.toThrow('Ação inválida');
    });

    it('deve lançar erro se currentStatus for omitido no toggle', async () => {
        await expect(useCase.executeAction('prod-001', 'toggle'))
            .rejects.toThrow('currentStatus é obrigatório para toggle');
    });
});
