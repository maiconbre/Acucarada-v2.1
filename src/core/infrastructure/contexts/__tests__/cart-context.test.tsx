import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { CartProvider, useCart } from '@/core/infrastructure/contexts/cart-context';
import { ReactNode } from 'react';

// Mock useToast
vi.mock('@/hooks/ui/use-toast', () => ({
    useToast: () => ({
        toast: vi.fn(),
    }),
}));

const wrapper = ({ children }: { children: ReactNode }) => (
    <CartProvider>{children}</CartProvider>
);

describe('CartContext', () => {
    beforeEach(() => {
        localStorage.clear();
        vi.clearAllMocks();
    });

    it('addItem deve adicionar novo item ao carrinho', () => {
        const { result } = renderHook(() => useCart(), { wrapper });

        act(() => {
            result.current.addItem({ id: '1', name: 'Bolo', price: 10, image_url: 'url' });
        });

        expect(result.current.items).toHaveLength(1);
        expect(result.current.items[0].quantity).toBe(1);
        expect(result.current.totalItems).toBe(1);
        expect(result.current.totalPrice).toBe(10);
    });

    it('addItem deve incrementar quantidade de item existente', () => {
        const { result } = renderHook(() => useCart(), { wrapper });

        act(() => {
            result.current.addItem({ id: '1', name: 'Bolo', price: 10 });
            result.current.addItem({ id: '1', name: 'Bolo', price: 10 });
        });

        expect(result.current.items).toHaveLength(1);
        expect(result.current.items[0].quantity).toBe(2);
        expect(result.current.totalItems).toBe(2);
    });

    it('addItem com sabor diferente deve adicionar como novo item', () => {
        const { result } = renderHook(() => useCart(), { wrapper });

        act(() => {
            result.current.addItem({ id: '1', name: 'Bolo', price: 10, flavor: 'Chocolate' });
            result.current.addItem({ id: '1', name: 'Bolo', price: 10, flavor: 'Morango' });
        });

        expect(result.current.items).toHaveLength(2);
    });

    it('removeItem deve remover item do carrinho', () => {
        const { result } = renderHook(() => useCart(), { wrapper });

        act(() => {
            result.current.addItem({ id: '1', name: 'Bolo', price: 10 });
            result.current.removeItem('1');
        });

        expect(result.current.items).toHaveLength(0);
    });

    it('updateQuantity deve alterar quantidade', () => {
        const { result } = renderHook(() => useCart(), { wrapper });

        act(() => {
            result.current.addItem({ id: '1', name: 'Bolo', price: 10 });
            result.current.updateQuantity('1', 5);
        });

        expect(result.current.items[0].quantity).toBe(5);
        expect(result.current.totalPrice).toBe(50);
    });

    it('updateQuantity com 0 ou menos deve remover item', () => {
        const { result } = renderHook(() => useCart(), { wrapper });

        act(() => {
            result.current.addItem({ id: '1', name: 'Bolo', price: 10 });
            result.current.updateQuantity('1', 0);
        });

        expect(result.current.items).toHaveLength(0);
    });

    it('clearCart deve esvaziar carrinho', () => {
        const { result } = renderHook(() => useCart(), { wrapper });

        act(() => {
            result.current.addItem({ id: '1', name: 'Bolo', price: 10 });
            result.current.clearCart();
        });

        expect(result.current.items).toHaveLength(0);
    });

    it('getCartMessage com carrinho vazio deve retornar mensagem default', () => {
        const { result } = renderHook(() => useCart(), { wrapper });
        expect(result.current.getCartMessage()).toContain('fazer um pedido');
    });

    it('getCartMessage com itens deve formatar mensagem para WhatsApp', () => {
        const { result } = renderHook(() => useCart(), { wrapper });

        act(() => {
            result.current.addItem({ id: '1', name: 'Bolo', price: 10, flavor: 'Chocolate' });
        });

        const message = result.current.getCartMessage();
        // Verificamos partes essenciais da mensagem formatada
        expect(message).toContain('Bolo');
        expect(message).toContain('Chocolate');
        expect(message).toContain('10,00');
    });

    it('deve persistir no localStorage quando itens mudam', () => {
        const { result } = renderHook(() => useCart(), { wrapper });

        act(() => {
            result.current.addItem({ id: '1', name: 'Bolo', price: 10 });
        });

        const saved = JSON.parse(localStorage.getItem('acucarada_cart') || '[]');
        expect(saved).toHaveLength(1);
        expect(saved[0].id).toBe('1');
    });
});
