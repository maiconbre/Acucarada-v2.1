import { vi } from 'vitest';
import { Product } from '@/core/domain/entities/Product';
import { Category } from '@/core/domain/entities/Category';
import { IProductRepository, ProductFilters, CreateProductInput, UpdateProductInput, PaginationParams, PaginatedResult } from '@/core/domain/repositories/IProductRepository';
import { ICategoryRepository } from '@/core/domain/repositories/ICategoryRepository';
import { IAppSettingsRepository, AppSetting, AppSettings } from '@/core/domain/repositories/IAppSettingsRepository';
import { IProductAnalyticsRepository, ProductAnalytics, LikeStatus } from '@/core/domain/repositories/IProductAnalyticsRepository';

export const mockProduct: Product = {
  id: 'prod-001',
  name: 'Brigadeiro Gourmet',
  description: 'Delicioso brigadeiro cremoso',
  price: 25.00,
  image_url: 'https://example.com/brigadeiro.jpg',
  category: 'brigadeiros',
  ingredientes: ' chocolate, leite condensado, cream cheese',
  validade_armazenamento_dias: 15,
  sabores: ['tradicional', 'chocolate', 'coco'],
  sabor_images: { tradicional: 'https://example.com/tradicional.jpg' },
  sabor_descriptions: { tradicional: 'Sabor clássico' },
  is_featured: true,
  is_easter_product: false,
  is_active: true,
  is_on_promotion: false,
  promotional_price: null,
  promotion_start_date: null,
  promotion_end_date: null,
  created_at: '2024-01-01T00:00:00.000Z',
  updated_at: '2024-01-01T00:00:00.000Z',
  deleted_at: null,
};

export const mockCategory: Category = {
  id: 'cat-001',
  name: 'Brigadeiros',
  description: ' brigadeiros gourmet',
  is_active: true,
  created_at: '2024-01-01T00:00:00.000Z',
  updated_at: '2024-01-01T00:00:00.000Z',
};

export const mockAppSettings: AppSettings = {
  whatsapp_number: '5511999999999',
  whatsapp_message: 'Olá! Gostaria de fazer um pedido dos seus doces artesanais.',
  site_name: 'Açucarada Doces',
  site_description: 'Doces artesanais feitos com amor e carinho',
  maintenance_mode: 'false',
  analytics_enabled: 'true',
};

export const mockAppSettingsList: AppSetting[] = [
  { key: 'whatsapp_number', value: '5511999999999', description: '', category: '' },
  { key: 'whatsapp_message', value: 'Olá! Gostaria de fazer um pedido dos seus doces artesanais.', description: '', category: '' },
  { key: 'site_name', value: 'Açucarada Doces', description: '', category: '' },
  { key: 'site_description', value: 'Doces artesanais feitos com amor e carinho', description: '', category: '' },
  { key: 'maintenance_mode', value: 'false', description: '', category: '' },
  { key: 'analytics_enabled', value: 'true', description: '', category: '' },
];

export const mockAppSetting: AppSetting = mockAppSettingsList[0];

export const mockProductAnalytics: ProductAnalytics = {
  total_likes: 100,
  total_shares: 25,
  total_clicks: 500,
};

export const mockLikeStatus: LikeStatus = {
  is_liked: true,
  like_id: 'like-001',
};

export const createMockProductRepository = (overrides?: Partial<IProductRepository>): IProductRepository => ({
  findAll: vi.fn().mockResolvedValue([mockProduct]),
  findById: vi.fn().mockResolvedValue(mockProduct),
  findPaginated: vi.fn().mockResolvedValue({
    data: [mockProduct],
    count: 1,
    totalPages: 1,
    currentPage: 1,
    hasNextPage: false,
    hasPreviousPage: false,
  }),
  create: vi.fn().mockResolvedValue(mockProduct),
  update: vi.fn().mockResolvedValue(mockProduct),
  toggleActive: vi.fn().mockResolvedValue({ ...mockProduct, is_active: false }),
  softDelete: vi.fn().mockResolvedValue(undefined),
  hardDelete: vi.fn().mockResolvedValue(undefined),
  ...overrides,
});

export const createMockCategoryRepository = (overrides?: Partial<ICategoryRepository>): ICategoryRepository => ({
  findAll: vi.fn().mockResolvedValue([mockCategory]),
  findById: vi.fn().mockResolvedValue(mockCategory),
  ...overrides,
});

export const createMockAppSettingsRepository = (overrides?: Partial<IAppSettingsRepository>): IAppSettingsRepository => ({
  getPublicSettings: vi.fn().mockResolvedValue(mockAppSettingsList),
  getAllSettings: vi.fn().mockResolvedValue(mockAppSettingsList),
  updateSetting: vi.fn().mockResolvedValue(true),
  ...overrides,
});

export const createMockProductAnalyticsRepository = (overrides?: Partial<IProductAnalyticsRepository>): IProductAnalyticsRepository => ({
  getAnalytics: vi.fn().mockResolvedValue(mockProductAnalytics),
  checkLikeStatus: vi.fn().mockResolvedValue(mockLikeStatus),
  toggleLike: vi.fn().mockResolvedValue(true),
  trackShare: vi.fn().mockResolvedValue(true),
  trackClick: vi.fn().mockResolvedValue(true),
  ...overrides,
});

export const createMockProduct = (overrides?: Partial<Product>): Product => ({
  ...mockProduct,
  ...overrides,
});

export const createMockCategory = (overrides?: Partial<Category>): Category => ({
  ...mockCategory,
  ...overrides,
});
