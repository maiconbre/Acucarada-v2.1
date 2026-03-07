export interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    image_url: string;
    category: string;
    ingredientes?: string | null;
    validade_armazenamento_dias?: number | null;
    sabores?: string[] | null;
    sabor_images?: Record<string, string> | null;
    sabor_descriptions?: Record<string, string> | null;
    is_featured: boolean;
    is_easter_product: boolean;
    is_active: boolean;
    is_on_promotion?: boolean;
    promotional_price?: number | null;
    promotion_start_date?: string | null;
    promotion_end_date?: string | null;
    deleted_at?: string | null;
    created_at?: string;
    updated_at?: string;
}
