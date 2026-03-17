import { Comment, CreateCommentInput } from '../../domain/entities/Comment';
import { ICommentRepository, CommentFilter } from '../../domain/repositories/ICommentRepository';
import { supabase } from '@/core/infrastructure/supabase/client';

/**
 * Mapper: converte linha crua do Supabase para entidade de domínio Comment.
 * Garante que o Domínio nunca dependa de detalhes do banco de dados.
 */
function toDomain(row: Record<string, unknown>): Comment {
    return {
        id: row.id as string,
        product_id: row.product_id as string,
        comment: row.comment as string,
        author_name: (row.author_name as string) ?? null,
        instagram_handle: (row.instagram_handle as string) ?? null,
        image_url: (row.image_url as string) ?? null,
        rating: (row.rating as number) ?? 5,
        is_approved: (row.is_approved as boolean) ?? false,
        created_at: row.created_at as string,
        product: row.product
            ? {
                id: (row.product as Record<string, unknown>).id as string,
                name: (row.product as Record<string, unknown>).name as string,
                image_url: ((row.product as Record<string, unknown>).image_url as string) ?? null,
            }
            : null,
    };
}

export class SupabaseCommentRepository implements ICommentRepository {
    private readonly tableName = 'comments';

    async findByProductId(
        productId: string,
        page: number,
        limit: number
    ): Promise<{ data: Comment[]; count: number }> {
        const from = (page - 1) * limit;
        const to = from + limit - 1;

        const { count } = await supabase
            .from(this.tableName)
            .select('*', { count: 'exact', head: true })
            .eq('product_id', productId)
            .eq('is_approved', true);

        const { data, error } = await supabase
            .from(this.tableName)
            .select('id, comment, created_at, author_name, instagram_handle, rating')
            .eq('product_id', productId)
            .eq('is_approved', true)
            .order('created_at', { ascending: false })
            .range(from, to);

        if (error) throw new Error(`Erro ao buscar comentários: ${error.message}`);

        return {
            data: (data ?? []).map(toDomain),
            count: count ?? 0,
        };
    }

    async findAll(filter: CommentFilter): Promise<Comment[]> {
        let query = supabase
            .from(this.tableName)
            .select('*, product:products(id, name, image_url)')
            .order('created_at', { ascending: false });

        if (filter === 'pending') query = query.eq('is_approved', false);
        else if (filter === 'approved') query = query.eq('is_approved', true);

        const { data, error } = await query;

        if (error) throw new Error(`Erro ao buscar comentários: ${error.message}`);

        return (data ?? []).map(toDomain);
    }

    async create(input: CreateCommentInput): Promise<void> {
        const { error } = await supabase.from(this.tableName).insert([
            {
                product_id: input.product_id,
                comment: input.comment,
                author_name: input.author_name ?? null,
                instagram_handle: input.instagram_handle ?? null,
                image_url: input.image_url ?? null,
                rating: input.rating,
            },
        ]);

        if (error) throw new Error(`Erro ao criar comentário: ${error.message}`);
    }

    async toggleApproval(id: string, currentStatus: boolean): Promise<void> {
        const { error } = await supabase
            .from(this.tableName)
            .update({ is_approved: !currentStatus })
            .eq('id', id);

        if (error) throw new Error(`Erro ao atualizar aprovação: ${error.message}`);
    }

    async delete(id: string): Promise<void> {
        const { error } = await supabase.from(this.tableName).delete().eq('id', id);

        if (error) throw new Error(`Erro ao excluir comentário: ${error.message}`);
    }
}
