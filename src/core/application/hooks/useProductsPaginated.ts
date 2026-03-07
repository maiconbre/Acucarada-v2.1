import { useState, useCallback, useEffect } from 'react';
import { SupabaseProductRepository } from '@/core/data/repositories/SupabaseProductRepository';
import { Product } from '@/core/domain/entities/Product';
import { ProductFilters, PaginatedResult } from '@/core/domain/repositories/IProductRepository';
import { useToast } from '@/hooks/ui/use-toast';

export const useProductsPaginated = (initialLimit = 12) => {
    const [data, setData] = useState<PaginatedResult<Product> | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const { toast } = useToast();
    const productRepository = new SupabaseProductRepository();

    const fetchProducts = useCallback(async (page: number, filters?: ProductFilters) => {
        setLoading(true);
        setError(null);
        try {
            const result = await productRepository.findPaginated(
                { page, limit: initialLimit },
                filters
            );
            setData(result);
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar produtos';
            setError(errorMessage);
            toast({
                variant: 'destructive',
                title: 'Falha na busca',
                description: errorMessage,
            });
        } finally {
            setLoading(false);
        }
    }, [initialLimit, toast]);

    return {
        data,
        loading,
        error,
        fetchProducts,
    };
};
