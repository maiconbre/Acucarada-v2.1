import { supabase } from '@/core/infrastructure/supabase/client';
import { Product } from '../../domain/entities/Product';
import {
    IProductRepository,
    PaginationParams,
    PaginatedResult,
    ProductFilters,
    CreateProductInput,
    UpdateProductInput
} from '../../domain/repositories/IProductRepository';

export class SupabaseProductRepository implements IProductRepository {
    private readonly tableName = 'products';

    async findById(id: string): Promise<Product | null> {
        const { data, error } = await supabase
            .from(this.tableName)
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null; // Not found
            throw new Error(`Erro ao buscar produto: ${error.message}`);
        }

        return data as Product;
    }

    async findAll(filters?: ProductFilters): Promise<Product[]> {
        let query = supabase.from(this.tableName).select('*').order('name');

        if (filters) {
            if (filters.search) {
                query = query.ilike('name', `%${filters.search}%`);
            }
            if (filters.category && filters.category !== 'all' && filters.category !== 'Todos') {
                query = query.eq('category', filters.category);
            }
            if (filters.is_featured !== undefined) {
                query = query.eq('is_featured', filters.is_featured);
            }
            if (filters.is_active !== undefined) {
                query = query.eq('is_active', filters.is_active);
            }
            if (filters.include_deleted === false || filters.include_deleted === undefined) {
                query = query.is('deleted_at', null); // Soft delete protection
            }
        } else {
            query = query.is('deleted_at', null);
        }

        const { data, error } = await query;

        if (error) {
            throw new Error(`Erro ao buscar produtos: ${error.message}`);
        }

        return data as Product[];
    }

    async findPaginated(params: PaginationParams, filters?: ProductFilters): Promise<PaginatedResult<Product>> {
        const { page, limit } = params;
        const from = (page - 1) * limit;
        const to = from + limit - 1;

        let query = supabase
            .from(this.tableName)
            .select('*', { count: 'exact' });

        if (filters) {
            if (filters.search) {
                query = query.ilike('name', `%${filters.search}%`);
            }
            if (filters.category && filters.category !== 'all' && filters.category !== 'Todos') {
                query = query.eq('category', filters.category);
            }
            if (filters.is_featured !== undefined) {
                query = query.eq('is_featured', filters.is_featured);
            }
            if (filters.is_active !== undefined) {
                query = query.eq('is_active', filters.is_active);
            }
            if (filters.include_deleted === false || filters.include_deleted === undefined) {
                query = query.is('deleted_at', null);
            }
        } else {
            query = query.is('deleted_at', null);
        }

        const { data, error, count } = await query.order('name').range(from, to);

        if (error) {
            throw new Error(`Erro ao buscar produtos paginados: ${error.message}`);
        }

        const totalCount = count || 0;
        const totalPages = Math.ceil(totalCount / limit);

        return {
            data: data as Product[],
            count: totalCount,
            totalPages,
            currentPage: page,
            hasNextPage: page < totalPages,
            hasPreviousPage: page > 1,
        };
    }

    async create(product: CreateProductInput): Promise<Product> {
        const { data, error } = await supabase
            .from(this.tableName)
            .insert([product])
            .select()
            .single();

        if (error) {
            throw new Error(`Erro ao criar produto: ${error.message}`);
        }

        return data as Product;
    }

    async update(id: string, product: UpdateProductInput): Promise<Product> {
        const { data, error } = await supabase
            .from(this.tableName)
            .update(product)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            throw new Error(`Erro ao atualizar produto: ${error.message}`);
        }

        return data as Product;
    }

    async softDelete(id: string): Promise<void> {
        const { error } = await supabase
            .from(this.tableName)
            .update({
                is_active: false,
                deleted_at: new Date().toISOString()
            })
            .eq('id', id);

        if (error) {
            throw new Error(`Erro ao mover produto para lixeira: ${error.message}`);
        }
    }

    async hardDelete(id: string): Promise<void> {
        const { error } = await supabase
            .from(this.tableName)
            .delete()
            .eq('id', id);

        if (error) {
            throw new Error(`Erro ao excluir produto permanentemente: ${error.message}`);
        }
    }

    async toggleActive(id: string, currentStatus: boolean): Promise<Product> {
        const { data, error } = await supabase
            .from(this.tableName)
            .update({ is_active: !currentStatus })
            .eq('id', id)
            .select()
            .single();

        if (error) {
            throw new Error(`Erro ao alterar status do produto: ${error.message}`);
        }

        return data as Product;
    }
}
