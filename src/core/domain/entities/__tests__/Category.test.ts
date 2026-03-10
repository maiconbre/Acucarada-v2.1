import { describe, it, expect } from 'vitest';
import { Category } from '../Category';

describe('Category Entity', () => {
    it('should be able to create a valid Category object', () => {
        const category: Category = {
            id: 'cat-123',
            name: 'Bolos',
            description: 'Bolos artesanais deliciosos',
            is_active: true,
            created_at: new Date().toISOString(),
        };

        expect(category.id).toBe('cat-123');
        expect(category.name).toBe('Bolos');
        expect(category.is_active).toBe(true);
    });

    it('should handle optional fields like description and updated_at correctly', () => {
        const category: Category = {
            id: 'cat-456',
            name: 'Doces',
            description: null,
            is_active: false,
        };

        expect(category.description).toBeNull();
        expect(category.updated_at).toBeUndefined();
    });
});
