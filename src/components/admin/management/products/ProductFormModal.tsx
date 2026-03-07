import { useState } from "react";
import { Product } from "@/core/domain/entities/Product";
import { Category } from "@/core/domain/entities/Category";
import { CreateProductDTO, UpdateProductDTO } from "@/core/application/dtos/product.schema";
import { Button } from "@/components/ui/data-display/button";
import { Input } from "@/components/ui/forms/input";
import { Label } from "@/components/ui/forms/label";
import { Textarea } from "@/components/ui/forms/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/forms/select";
import { Switch } from "@/components/ui/forms/switch";
import { ImageUpload } from "@/components/ui/data-display/image-upload";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/overlays/dialog";
import { ProductFlavorManager } from "@/components/admin/management/products/ProductFlavorManager";

export interface FlavorData {
    id: string;
    name: string;
    image: string;
    description: string;
}

interface ProductFormModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    product: Product | null;
    categories: Category[];
    onSave: (data: CreateProductDTO | UpdateProductDTO, editingId?: string) => Promise<boolean>;
    loading: boolean;
}

export const ProductFormModal = ({
    isOpen,
    onOpenChange,
    product,
    categories,
    onSave,
    loading
}: ProductFormModalProps) => {
    const [formData, setFormData] = useState({
        name: product?.name || "",
        description: product?.description || "",
        price: product?.price?.toString() || "",
        image_url: product?.image_url || "",
        category: product?.category || "Outros",
        ingredientes: product?.ingredientes || "",
        validade_armazenamento_dias: product?.validade_armazenamento_dias?.toString() || "",
        is_featured: product?.is_featured || false,
        is_easter_product: product?.is_easter_product || false,
        is_active: product?.is_active ?? true,
        is_on_promotion: product?.is_on_promotion || false,
        promotional_price: product?.promotional_price?.toString() || "",
        promotion_start_date: product?.promotion_start_date?.split('T')[0] || "",
        promotion_end_date: product?.promotion_end_date?.split('T')[0] || "",
    });

    const generateInitialFlavors = () => {
        if (product?.sabores && product.sabores.length > 0) {
            return product.sabores.map((flavor, index) => ({
                id: `flavor-${index}`,
                name: flavor,
                image: product.sabor_images?.[flavor] || "",
                description: product.sabor_descriptions?.[flavor] || ""
            }));
        }
        return [];
    };

    const [flavors, setFlavors] = useState<FlavorData[]>(generateInitialFlavors());

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Transformar flavors no formato da entity
        const saboresArray = flavors.map(f => f.name);
        const saborImages = flavors.reduce((acc, f) => {
            if (f.image) acc[f.name] = f.image;
            return acc;
        }, {} as Record<string, string>);

        const saborDescriptions = flavors.reduce((acc, f) => {
            if (f.description) acc[f.name] = f.description;
            return acc;
        }, {} as Record<string, string>);

        const payload = {
            ...formData,
            price: parseFloat(formData.price || '0'),
            promotional_price: formData.is_on_promotion && formData.promotional_price ? parseFloat(formData.promotional_price) : null,
            validade_armazenamento_dias: formData.validade_armazenamento_dias ? parseInt(formData.validade_armazenamento_dias) : null,
            sabores: saboresArray.length > 0 ? saboresArray : null,
            sabor_images: Object.keys(saborImages).length > 0 ? saborImages : null,
            sabor_descriptions: Object.keys(saborDescriptions).length > 0 ? saborDescriptions : null,
        };

        const success = await onSave(payload, product?.id);
        if (success) {
            onOpenChange(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-lg sm:text-xl">
                        {product ? "Editar Produto" : "Novo Produto"}
                    </DialogTitle>
                    <DialogDescription className="text-sm">
                        {product
                            ? "Atualize as informações do produto"
                            : "Preencha os dados para criar um novo produto"
                        }
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Nome *</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="price">Preço (R$) *</Label>
                            <Input
                                id="price"
                                type="number"
                                step="0.01"
                                value={formData.price}
                                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Seção Promoção */}
                    <div className="space-y-4 p-4 border rounded-lg bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="promotion-toggle" className="text-base font-medium flex items-center gap-2">
                                🏷️ Produto em Promoção
                            </Label>
                            <Switch
                                id="promotion-toggle"
                                checked={formData.is_on_promotion}
                                onCheckedChange={(checked) => setFormData({ ...formData, is_on_promotion: checked })}
                            />
                        </div>
                        {formData.is_on_promotion && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="promotional_price">Preço Promocional (R$) *</Label>
                                    <Input
                                        id="promotional_price"
                                        type="number"
                                        step="0.01"
                                        value={formData.promotional_price}
                                        onChange={(e) => setFormData({ ...formData, promotional_price: e.target.value })}
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Descrição</Label>
                        <Textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            rows={3}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Imagem do Produto</Label>
                        <ImageUpload
                            value={formData.image_url}
                            onChange={(url) => setFormData({ ...formData, image_url: url })}
                            bucketName="product-images"
                            folder="products"
                            showPreview={true}
                            showMetadata={false}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="category">Categoria</Label>
                        <Select
                            value={formData.category}
                            onValueChange={(value) => setFormData({ ...formData, category: value })}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {categories.map(category => (
                                    <SelectItem key={category.id} value={category.name}>
                                        {category.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="ingredientes">Ingredientes (opcional)</Label>
                        <Textarea
                            id="ingredientes"
                            value={formData.ingredientes}
                            onChange={(e) => setFormData({ ...formData, ingredientes: e.target.value })}
                            rows={2}
                        />
                    </div>

                    <ProductFlavorManager flavors={flavors} setFlavors={setFlavors} />

                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? "Salvando..." : "Salvar Produto"}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
};
