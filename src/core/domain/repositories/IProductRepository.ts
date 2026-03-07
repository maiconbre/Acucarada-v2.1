import { Product } from '../entities/Product';

export interface PaginationParams {
    page: number;
    limit: number;
}

export interface PaginatedResult<T> {
    data: T[];
    count: number;
    totalPages: number;
    currentPage: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
}

export interface ProductFilters {
    search?: string;
    category?: string;
    is_featured?: boolean;
    is_active?: boolean;
    include_deleted?: boolean;
}

export interface CreateProductInput extends Omit<Product, 'id' | 'created_at' | 'updated_at' | 'deleted_at'> { }

export interface UpdateProductInput extends Partial<CreateProductInput> { }

export interface IProductRepository {
    findById(id: string): Promise<Product | null>;
    findAll(filters?: ProductFilters): Promise<Product[]>;
    findPaginated(params: PaginationParams, filters?: ProductFilters): Promise<PaginatedResult<Product>>;
    create(product: CreateProductInput): Promise<Product>;
    update(id: string, product: UpdateProductInput): Promise<Product>;
    softDelete(id: string): Promise<void>;
    hardDelete(id: string): Promise<void>;
    toggleActive(id: string, currentStatus: boolean): Promise<Product>;
}
