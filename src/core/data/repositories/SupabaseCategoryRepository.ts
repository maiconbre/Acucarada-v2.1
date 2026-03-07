import { supabase } from '@/core/infrastructure/supabase/client';
import { Category } from '../../domain/entities/Category';
import { ICategoryRepository } from '../../domain/repositories/ICategoryRepository';

export class SupabaseCategoryRepository implements ICategoryRepository {
    private readonly tableName = 'categories';

    async findAll(activeOnly: boolean = true): Promise<Category[]> {
        let query = supabase.from(this.tableName).select('*').order('name');

        if (activeOnly) {
            query = query.eq('is_active', true);
        }

        const { data, error } = await query;

        if (error) {
            throw new Error(`Erro ao buscar categorias: ${error.message}`);
        }

        return data as Category[];
    }

    async findById(id: string): Promise<Category | null> {
        const { data, error } = await supabase
            .from(this.tableName)
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null;
            throw new Error(`Erro ao buscar categoria: ${error.message}`);
        }

        return data as Category;
    }
}
