import { describe, it, expect } from 'vitest';
import { Product } from '../Product';

describe('Product Entity', () => {
    it('should create a valid Product object with basic properties', () => {
        const product: Product = {
            id: 'prod-1',
            name: 'Bolo de Morango',
            description: 'Bolo fresco',
            price: 85.00,
            image_url: 'http://example.com/imagem.jpg',
            category: 'Bolos',
            is_featured: true,
            is_easter_product: false,
            is_active: true,
        };

        expect(product.id).toBe('prod-1');
        expect(product.price).toBe(85.00);
        expect(product.is_active).toBe(true);
    });

    it('should be able to represent a product on promotion', () => {
        const product: Product = {
            id: 'prod-2',
            name: 'Ovo de Páscoa',
            description: 'Ovo artesanal',
            price: 120.00,
            image_url: 'http://example.com/ovo.jpg',
            category: 'Páscoa',
            is_featured: false,
            is_easter_product: true,
            is_active: true,
            is_on_promotion: true,
            promotional_price: 99.90,
        };

        expect(product.is_on_promotion).toBe(true);
        expect(product.promotional_price).toBeLessThan(product.price);
    });

    it('should handle complex optional fields like sabor_images', () => {
        const product: Product = {
            id: 'prod-3',
            name: 'Caixa de Trufas',
            description: 'Trufas variadas',
            price: 45.00,
            image_url: 'http://example.com/trufas.jpg',
            category: 'Doces',
            sabores: ['Morango', 'Limão'],
            sabor_images: { 'Morango': 'url_morango', 'Limão': 'url_limao' },
            is_featured: false,
            is_easter_product: false,
            is_active: true,
        };

        expect(product.sabores).toContain('Limão');
        expect(product.sabor_images?.['Morango']).toBe('url_morango');
    });
});
