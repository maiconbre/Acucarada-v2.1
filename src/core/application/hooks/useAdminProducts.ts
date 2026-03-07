import { useState, useEffect, useMemo } from 'react';
import { useToast } from '@/hooks/ui/use-toast';
import { container } from '@/core/infrastructure/container';
import { ManageProductUseCase, CreateProductDTO, ProductActionType } from '@/core/application/use-cases/ManageProductUseCase';
import { ManageCategoryUseCase } from '@/core/application/use-cases/ManageCategoryUseCase';
import { ProductSchema } from '@/core/application/dtos/product.schema';
import { Product } from '@/core/domain/entities/Product';
import { Category } from '@/core/domain/entities/Category';
import { z } from 'zod';

export type ViewMode = 'list' | 'grid';

export interface ConfirmDialogState {
    isOpen: boolean;
    type: 'toggle' | 'soft_delete' | 'hard_delete';
    product: Product | null;
}

export const useAdminProducts = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    const [isOpen, setIsOpen] = useState(false);
    const [viewMode, setViewMode] = useState<ViewMode>('list');
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);

    const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogState>({
        isOpen: false,
        type: 'toggle',
        product: null
    });

    const { toast } = useToast();

    const productUseCase = useMemo(() => new ManageProductUseCase(container.getProductRepository()), []);
    const categoryUseCase = useMemo(() => new ManageCategoryUseCase(container.getCategoryRepository()), []);

    const fetchCategories = async () => {
        try {
            const data = await categoryUseCase.getAll(true);
            setCategories(data);
        } catch (error) {
            console.error("Error fetching categories:", error);
        }
    };

    const fetchProducts = async () => {
        try {
            const data = await productUseCase.getAll();
            setProducts(data);
        } catch (error) {
            console.error("Error fetching products:", error);
            toast({
                variant: "destructive",
                title: "Erro ao carregar produtos",
                description: "Não foi possível carregar a lista de produtos.",
            });
        }
    };

    useEffect(() => {
        fetchCategories();
        fetchProducts();
    }, []);

    const handleEdit = (product: Product) => {
        setEditingProduct(product);
        setIsOpen(true);
    };

    const handleSaveProduct = async (productData: CreateProductDTO, editingId?: string): Promise<boolean> => {
        setLoading(true);
        try {
            const validatedData = ProductSchema.parse(productData);

            if (editingId) {
                await productUseCase.update(editingId, validatedData as unknown as Partial<CreateProductDTO>);
                toast({
                    title: "Produto atualizado!",
                    description: "As alterações foram salvas com sucesso.",
                });
            } else {
                await productUseCase.create(validatedData as unknown as CreateProductDTO);
                toast({
                    title: "Produto criado!",
                    description: "O novo produto foi adicionado ao catálogo.",
                });
            }

            fetchProducts();
            return true;
        } catch (error: unknown) {
            let errorMessage = "Erro desconhecido";

            if (error instanceof z.ZodError) {
                errorMessage = error.errors.map(err => err.message).join(", ");
            } else if (error instanceof Error) {
                errorMessage = error.message;
            }

            toast({
                variant: "destructive",
                title: "Erro de Validação",
                description: errorMessage,
            });
            return false;
        } finally {
            setLoading(false);
        }
    };

    const openConfirmDialog = (type: ProductActionType, product: Product) => {
        setConfirmDialog({ isOpen: true, type, product });
    };

    const handleConfirmAction = async () => {
        if (!confirmDialog.product) return;

        const { id, is_active } = confirmDialog.product;
        setActionLoading(id);

        try {
            if (confirmDialog.type === 'toggle') {
                await productUseCase.executeAction(id, 'toggle', is_active);
                toast({ title: is_active ? "Produto ocultado" : "Produto exibido" });
            } else if (confirmDialog.type === 'soft_delete') {
                await productUseCase.executeAction(id, 'soft_delete');
                toast({ title: "Produto movido para lixeira!" });
            } else if (confirmDialog.type === 'hard_delete') {
                await productUseCase.executeAction(id, 'hard_delete');
                toast({ title: "Produto excluído permanentemente!" });
            }
            setConfirmDialog({ isOpen: false, type: 'toggle', product: null });
            fetchProducts();
        } catch (error: unknown) {
            const msg = error instanceof Error ? error.message : "Erro desconhecido";
            toast({ variant: "destructive", title: "Erro na operação", description: msg });
        } finally {
            setActionLoading(null);
        }
    };

    return {
        products,
        categories,
        loading,
        actionLoading,
        isOpen,
        setIsOpen,
        editingProduct,
        setEditingProduct,
        viewMode,
        setViewMode,
        confirmDialog,
        setConfirmDialog,
        handleEdit,
        openConfirmDialog,
        handleConfirmAction,
        handleSaveProduct,
    };
};
