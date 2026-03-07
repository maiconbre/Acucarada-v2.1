import { z } from 'zod';

export const ProductSchema = z.object({
    name: z.string().min(1, 'Nome do produto é obrigatório'),
    description: z.string().optional().default(''),
    price: z.number().positive('Preço deve ser maior que zero'),
    image_url: z.string().url('URL da imagem inválida').or(z.literal('')),
    category: z.string().min(1, 'Selecione uma categoria'),
    ingredientes: z.string().nullable().optional(),
    validade_armazenamento_dias: z.number().nullable().optional(),
    sabores: z.array(z.string()).nullable().optional(),
    sabor_images: z.record(z.string()).nullable().optional(),
    sabor_descriptions: z.record(z.string()).nullable().optional(),
    is_featured: z.boolean().default(false),
    is_easter_product: z.boolean().default(false),
    is_active: z.boolean().default(true),
    is_on_promotion: z.boolean().default(false),
    promotional_price: z.number().nullable().optional(),
    promotion_start_date: z.string().nullable().optional(),
    promotion_end_date: z.string().nullable().optional(),
}).refine(data => {
    // Validação cruzada para promoções
    if (data.is_on_promotion) {
        if (!data.promotional_price || data.promotional_price <= 0) {
            return false;
        }
        if (data.promotional_price >= data.price) {
            return false;
        }
    }
    return true;
}, {
    message: "Preço promocional inválido (deve ser maior que zero e menor que o preço original)",
    path: ["promotional_price"]
});

export type CreateProductDTO = z.infer<typeof ProductSchema>;
export type UpdateProductDTO = Partial<CreateProductDTO>;
