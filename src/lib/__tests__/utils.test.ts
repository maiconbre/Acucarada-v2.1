import { describe, it, expect } from 'vitest';
import { cn, formatBytes, formatDate } from '@/lib/utils';

describe('Utils', () => {
    describe('cn', () => {
        it('deve combinar classes CSS simples', () => {
            expect(cn('class1', 'class2')).toBe('class1 class2');
        });

        it('deve lidar com condições booleanas', () => {
            const isActive = true;
            const isHidden = false;
            expect(cn('base', isActive && 'active', isHidden && 'hidden')).toBe('base active');
        });

        it('deve resolver conflitos de Tailwind via twMerge', () => {
            // px-2 e px-4 conflitam, o último deve prevalecer no twMerge
            const result = cn('px-2', 'px-4');
            expect(result).toBe('px-4');
        });
    });

    describe('formatBytes', () => {
        it('deve retornar "0 Bytes" para entrada 0', () => {
            expect(formatBytes(0)).toBe('0 Bytes');
        });

        it('deve formatar 1024 bytes como "1 KB"', () => {
            expect(formatBytes(1024)).toBe('1 KB');
        });

        it('deve formatar MB corretamente', () => {
            expect(formatBytes(1048576)).toBe('1 MB');
        });

        it('deve respeitar as casas decimais', () => {
            expect(formatBytes(1500, 1)).toBe('1.5 KB');
            expect(formatBytes(1500, 2)).toBe('1.46 KB'); // 1500 / 1024 = 1.4648...
        });
    });

    describe('formatDate', () => {
        it('deve formatar um objeto Date corretamente', () => {
            const date = new Date(2024, 4, 20); // 20/05/2024
            const result = formatDate(date);
            // Verificamos partes da data que são independentes de fuso horário para este input
            expect(result).toContain('2024');
            expect(result).toContain('20');
        });

        it('deve formatar uma string ISO corretamente', () => {
            const iso = '2024-05-20T15:00:00.000Z';
            const result = formatDate(iso);
            expect(result).toContain('2024');
            // Como o fuso horário pode mudar (ex: 15h UTC -> 12h no Brasil), 
            // validamos apenas que é uma data válida formatada
            expect(result).not.toBe('Data inválida');
        });

        it('deve retornar "Data inválida" para entradas mal formatadas', () => {
            expect(formatDate('not-a-date')).toBe('Data inválida');
        });
    });
});
