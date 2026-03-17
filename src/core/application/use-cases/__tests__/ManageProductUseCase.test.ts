import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ManageProductUseCase, CreateProductDTO, ProductActionType } from '@/core/application/use-cases/ManageProductUseCase';
import { createMockProductRepository, mockProduct } from '@/core/application/__tests__/mocks/repositories';

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

    it('getById deve retornar null para ID inexistente', async () => {
        mockRepo.findById = vi.fn().mockResolvedValue(null);
        const product = await useCase.getById('nao-existe');
        expect(product).toBeNull();
    });

    it('create deve popular defaults corretamente para campos opcionais', async () => {
        const dto: CreateProductDTO = {
            name: 'Produto Minimal',
            price: 5,
            image_url: 'url',
            category: 'cat'
        };

        await useCase.create(dto);
        
        expect(mockRepo.create).toHaveBeenCalledWith(expect.objectContaining({
            description: '',
            is_featured: false,
            is_active: true,
            ingredientes: null
        }));
    });

    it('create deve aceitar todos os campos opcionais preenchidos', async () => {
        const dto: CreateProductDTO = {
            name: 'Produto Full',
            price: 100,
            image_url: 'url',
            category: 'cat',
            description: 'Desc',
            is_on_promotion: true,
            promotional_price: 80,
            sabores: ['Morango'],
            validade_armazenamento_dias: 30
        };

        await useCase.create(dto);
        expect(mockRepo.create).toHaveBeenCalledWith(expect.objectContaining({
            promotional_price: 80,
            is_on_promotion: true,
            validade_armazenamento_dias: 30
        }));
    });

    it('update deve aceitar dados parciais', async () => {
        const dto = { is_active: false };
        await useCase.update('prod-1', dto);
        expect(mockRepo.update).toHaveBeenCalledWith('prod-1', { is_active: false });
    });

    it('executeAction deve funcionar com toggle e currentStatus = false', async () => {
        await useCase.executeAction('prod-001', 'toggle', false);
        expect(mockRepo.toggleActive).toHaveBeenCalledWith('prod-001', false);
    });
});
