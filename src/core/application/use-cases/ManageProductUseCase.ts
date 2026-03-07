import { Product } from '@/core/domain/entities/Product';
import { IProductRepository, CreateProductInput, UpdateProductInput } from '@/core/domain/repositories/IProductRepository';

export interface CreateProductDTO {
    name: string;
    description?: string;
    price: number;
    image_url: string;
    category: string;
    ingredientes?: string | null;
    validade_armazenamento_dias?: number | null;
    sabores?: string[] | null;
    sabor_images?: Record<string, string> | null;
    sabor_descriptions?: Record<string, string> | null;
    is_featured?: boolean;
    is_easter_product?: boolean;
    is_active?: boolean;
    is_on_promotion?: boolean;
    promotional_price?: number | null;
    promotion_start_date?: string | null;
    promotion_end_date?: string | null;
}

export interface UpdateProductDTO extends Partial<CreateProductDTO> { }

export type ProductActionType = 'toggle' | 'soft_delete' | 'hard_delete';

export class ManageProductUseCase {
    constructor(private productRepository: IProductRepository) { }

    async getAll(): Promise<Product[]> {
        return this.productRepository.findAll({});
    }

    async getById(id: string): Promise<Product | null> {
        return this.productRepository.findById(id);
    }

    async create(data: CreateProductDTO): Promise<Product> {
        const input: CreateProductInput = {
            name: data.name,
            description: data.description || '',
            price: data.price,
            image_url: data.image_url,
            category: data.category,
            ingredientes: data.ingredientes || null,
            validade_armazenamento_dias: data.validade_armazenamento_dias || null,
            sabores: data.sabores || null,
            sabor_images: data.sabor_images || null,
            sabor_descriptions: data.sabor_descriptions || null,
            is_featured: data.is_featured || false,
            is_easter_product: data.is_easter_product || false,
            is_active: data.is_active !== undefined ? data.is_active : true,
            is_on_promotion: data.is_on_promotion || false,
            promotional_price: data.promotional_price || null,
            promotion_start_date: data.promotion_start_date || null,
            promotion_end_date: data.promotion_end_date || null,
        };
        return this.productRepository.create(input);
    }

    async update(id: string, data: UpdateProductDTO): Promise<Product> {
        return this.productRepository.update(id, data);
    }

    async executeAction(id: string, action: ProductActionType, currentStatus?: boolean): Promise<void | Product> {
        switch (action) {
            case 'toggle':
                if (currentStatus === undefined) {
                    throw new Error('currentStatus é obrigatório para toggle');
                }
                return this.productRepository.toggleActive(id, currentStatus);
            case 'soft_delete':
                return this.productRepository.softDelete(id);
            case 'hard_delete':
                return this.productRepository.hardDelete(id);
            default:
                throw new Error('Ação inválida');
        }
    }
}
