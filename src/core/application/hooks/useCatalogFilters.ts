import { useState, useMemo, useEffect } from 'react';
import { Product } from '@/core/domain/entities/Product';

interface UseCatalogFiltersProps {
    products: Product[];
    pageSize?: number;
}

export const useCatalogFilters = ({ products, pageSize = 12 }: UseCatalogFiltersProps) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [priceRange, setPriceRange] = useState("all");
    const [showReadyDelivery, setShowReadyDelivery] = useState(false);
    const [sortBy, setSortBy] = useState("newest");
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [currentPage, setCurrentPage] = useState(0);

    const filteredProducts = useMemo(() => {
        let filtered = products;

        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();
            filtered = filtered.filter(
                (product) =>
                    product.name.toLowerCase().includes(searchLower) ||
                    product.description?.toLowerCase().includes(searchLower)
            );
        }

        if (selectedCategory !== "all") {
            filtered = filtered.filter((product) => product.category === selectedCategory);
        }

        if (priceRange !== "all") {
            switch (priceRange) {
                case "0-10":
                    filtered = filtered.filter((product) => product.price <= 10);
                    break;
                case "10-25":
                    filtered = filtered.filter((product) => product.price > 10 && product.price <= 25);
                    break;
                case "25-50":
                    filtered = filtered.filter((product) => product.price > 25 && product.price <= 50);
                    break;
                case "50+":
                    filtered = filtered.filter((product) => product.price > 50);
                    break;
            }
        }

        if (showReadyDelivery) {
            filtered = filtered.filter((product) => product.is_featured);
        }

        const sortWithPromotionAndFeaturedFirst = (a: Product, b: Product, secondarySort: (a: Product, b: Product) => number) => {
            if (a.is_on_promotion && !b.is_on_promotion) return -1;
            if (!a.is_on_promotion && b.is_on_promotion) return 1;

            if (a.is_featured && !b.is_featured) return -1;
            if (!a.is_featured && b.is_featured) return 1;

            return secondarySort(a, b);
        };

        const sorted = [...filtered];

        switch (sortBy) {
            case "newest":
                sorted.sort((a, b) => sortWithPromotionAndFeaturedFirst(a, b, () => 0));
                break;
            case "price-low":
                sorted.sort((a, b) => sortWithPromotionAndFeaturedFirst(a, b, (a, b) => {
                    const priceA = a.is_on_promotion && a.promotional_price ? a.promotional_price : a.price;
                    const priceB = b.is_on_promotion && b.promotional_price ? b.promotional_price : b.price;
                    return priceA - priceB;
                }));
                break;
            case "price-high":
                sorted.sort((a, b) => sortWithPromotionAndFeaturedFirst(a, b, (a, b) => {
                    const priceA = a.is_on_promotion && a.promotional_price ? a.promotional_price : a.price;
                    const priceB = b.is_on_promotion && b.promotional_price ? b.promotional_price : b.price;
                    return priceB - priceA;
                }));
                break;
            case "name":
                sorted.sort((a, b) => sortWithPromotionAndFeaturedFirst(a, b, (a, b) => a.name.localeCompare(b.name)));
                break;
        }

        return sorted;
    }, [products, searchTerm, selectedCategory, priceRange, showReadyDelivery, sortBy]);

    // Paginação local em cima dos produtos filtrados
    const totalItems = filteredProducts.length;
    const totalPages = Math.ceil(totalItems / pageSize);
    const currentItems = filteredProducts.slice(
        currentPage * pageSize,
        (currentPage + 1) * pageSize
    );

    const nextPage = () => setCurrentPage((p) => Math.min(p + 1, totalPages - 1));
    const prevPage = () => setCurrentPage((p) => Math.max(p - 1, 0));
    const setPage = (page: number) => setCurrentPage(Math.min(Math.max(page, 0), totalPages - 1));

    // Reset page when filters change
    useEffect(() => {
        setCurrentPage(0);
    }, [searchTerm, selectedCategory, priceRange, showReadyDelivery, sortBy]);

    return {
        searchTerm,
        setSearchTerm,
        selectedCategory,
        setSelectedCategory,
        priceRange,
        setPriceRange,
        showReadyDelivery,
        setShowReadyDelivery,
        sortBy,
        setSortBy,
        viewMode,
        setViewMode,

        // Derived state
        filteredProducts: currentItems,
        pagination: {
            currentPage,
            totalPages,
            totalItems,
            nextPage,
            prevPage,
            setPage,
            hasNextPage: currentPage < totalPages - 1,
            hasPrevPage: currentPage > 0,
        }
    };
};
