import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { Product } from "@/core/domain/entities/Product";
import { Category } from "@/core/domain/entities/Category";
import { container } from "@/core/infrastructure/container";
import { GetCatalogProductsUseCase } from "@/core/application/use-cases/GetCatalogProductsUseCase";
import { ManageCategoryUseCase } from "@/core/application/use-cases/ManageCategoryUseCase";

const catalogCache = {
    products: { data: null as Product[] | null, timestamp: 0, ttl: 3 * 60 * 1000 },
    categories: { data: null as Category[] | null, timestamp: 0, ttl: 10 * 60 * 1000 }
};

export const useCatalogProducts = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [categoriesLoading, setCategoriesLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const productUseCase = useMemo(() => new GetCatalogProductsUseCase(container.getProductRepository()), []);
    const categoryUseCase = useMemo(() => new ManageCategoryUseCase(container.getCategoryRepository()), []);

    const fetchCategories = useCallback(async () => {
        try {
            const now = Date.now();
            if (catalogCache.categories.data && (now - catalogCache.categories.timestamp) < catalogCache.categories.ttl) {
                setCategories(catalogCache.categories.data);
                setCategoriesLoading(false);
                return;
            }
            const data = await categoryUseCase.getAll(true);
            setCategories(data);
            catalogCache.categories.data = data;
            catalogCache.categories.timestamp = now;
        } catch (error) {
            console.error("Error fetching categories:", error);
        } finally {
            setCategoriesLoading(false);
        }
    }, [categoryUseCase]);

    const fetchAllProducts = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const now = Date.now();
            if (catalogCache.products.data && (now - catalogCache.products.timestamp) < catalogCache.products.ttl) {
                setProducts(catalogCache.products.data);
                setLoading(false);
                return;
            }

            fetchTimeoutRef.current = setTimeout(() => {
                setLoading(false);
                setError("Tempo limite excedido. Tente recarregar a página.");
            }, 15000);

            const data = await productUseCase.execute();

            if (fetchTimeoutRef.current) {
                clearTimeout(fetchTimeoutRef.current);
                fetchTimeoutRef.current = null;
            }

            setProducts(data);
            catalogCache.products.data = data;
            catalogCache.products.timestamp = Date.now();
        } catch (err) {
            console.error("Error fetching products:", err);
            setError("Erro ao carregar produtos. Tente novamente.");
        } finally {
            setLoading(false);
        }
    }, [productUseCase]);

    useEffect(() => {
        fetchCategories();
        fetchAllProducts();
        return () => {
            if (fetchTimeoutRef.current) clearTimeout(fetchTimeoutRef.current);
        };
    }, [fetchCategories, fetchAllProducts]);

    return {
        products,
        categories,
        loading,
        categoriesLoading,
        error,
        refetch: fetchAllProducts
    };
};
