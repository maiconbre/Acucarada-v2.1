import { describe, it, expect } from 'vitest';
import { ProductSchema } from '@/core/application/dtos/product.schema';

describe('ProductSchema', () => {
    const validData = {
        name: 'Produto Teste',
        price: 50,
        image_url: 'http://image.com/img.jpg',
        category: 'cat-id',
        is_active: true
    };

    it('deve validar um objeto válido com dados mínimos', () => {
        const result = ProductSchema.safeParse(validData);
        expect(result.success).toBe(true);
    });

    it('deve validar um objeto completo com todos os campos', () => {
        const fullData = {
            ...validData,
            description: 'Descrição longa',
            ingredientes: 'Açúcar, farinha',
            validade_armazenamento_dias: 15,
            sabores: ['Morango', 'Chocolate'],
            is_featured: true,
            is_easter_product: true,
            is_on_promotion: true,
            promotional_price: 40,
            promotion_start_date: '2024-01-01',
            promotion_end_date: '2024-12-31'
        };
        const result = ProductSchema.safeParse(fullData);
        expect(result.success).toBe(true);
    });

    it('deve rejeitar nome vazio', () => {
        const result = ProductSchema.safeParse({ ...validData, name: '' });
        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.error.issues[0].message).toBe('Nome do produto é obrigatório');
        }
    });

    it('deve rejeitar preço negativo ou zero', () => {
        const resultZero = ProductSchema.safeParse({ ...validData, price: 0 });
        const resultNeg = ProductSchema.safeParse({ ...validData, price: -1 });
        expect(resultZero.success).toBe(false);
        expect(resultNeg.success).toBe(false);
    });

    it('deve rejeitar categoria vazia', () => {
        const result = ProductSchema.safeParse({ ...validData, category: '' });
        expect(result.success).toBe(false);
    });

    it('deve rejeitar promoção sem preço promocional', () => {
        const result = ProductSchema.safeParse({ 
            ...validData, 
            is_on_promotion: true, 
            promotional_price: null 
        });
        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.error.issues[0].message).toContain('promocional');
        }
    });

    it('deve rejeitar preço promocional maior ou igual ao preço original', () => {
        const result = ProductSchema.safeParse({ 
            ...validData, 
            price: 50,
            is_on_promotion: true, 
            promotional_price: 50 
        });
        expect(result.success).toBe(false);
    });

    it('deve aceitar promoção com preço válido', () => {
        const result = ProductSchema.safeParse({ 
            ...validData, 
            price: 50,
            is_on_promotion: true, 
            promotional_price: 40 
        });
        expect(result.success).toBe(true);
    });

    it('deve transformar data vazia em null', () => {
        const result = ProductSchema.safeParse({ 
            ...validData, 
            promotion_start_date: '' 
        });
        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data.promotion_start_date).toBeNull();
        }
    });

    it('deve aplicar valores default corretamente', () => {
        const result = ProductSchema.safeParse({
            name: 'P',
            price: 1,
            image_url: 'u',
            category: 'c'
        });
        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data.is_featured).toBe(false);
            expect(result.data.is_active).toBe(true);
            expect(result.data.description).toBe('');
        }
    });
});
