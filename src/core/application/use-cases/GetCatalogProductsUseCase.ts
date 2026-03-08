import { Product } from '@/core/domain/entities/Product';
import { IProductRepository, ProductFilters } from '@/core/domain/repositories/IProductRepository';

export class GetCatalogProductsUseCase {
    constructor(private productRepository: IProductRepository) { }

    async execute(): Promise<Product[]> {
        const filters: ProductFilters = {
            is_active: true,
            include_deleted: false
        };
        return this.productRepository.findAll(filters);
    }
}
