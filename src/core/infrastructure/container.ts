import { IProductRepository } from '@/core/domain/repositories/IProductRepository';
import { ICategoryRepository } from '@/core/domain/repositories/ICategoryRepository';
import { IAppSettingsRepository } from '@/core/domain/repositories/IAppSettingsRepository';
import { IProductAnalyticsRepository } from '@/core/domain/repositories/IProductAnalyticsRepository';
import { ICommentRepository } from '@/core/domain/repositories/ICommentRepository';
import { SupabaseProductRepository } from '@/core/data/repositories/SupabaseProductRepository';
import { SupabaseCategoryRepository } from '@/core/data/repositories/SupabaseCategoryRepository';
import { SupabaseAppSettingsRepository } from '@/core/data/repositories/SupabaseAppSettingsRepository';
import { SupabaseProductAnalyticsRepository } from '@/core/data/repositories/SupabaseProductAnalyticsRepository';
import { SupabaseCommentRepository } from '@/core/data/repositories/SupabaseCommentRepository';

class Container {
    private static instance: Container;
    private productRepository: IProductRepository | null = null;
    private categoryRepository: ICategoryRepository | null = null;
    private appSettingsRepository: IAppSettingsRepository | null = null;
    private productAnalyticsRepository: IProductAnalyticsRepository | null = null;
    private commentRepository: ICommentRepository | null = null;

    private constructor() { }

    static getInstance(): Container {
        if (!Container.instance) {
            Container.instance = new Container();
        }
        return Container.instance;
    }

    getProductRepository(): IProductRepository {
        if (!this.productRepository) {
            this.productRepository = new SupabaseProductRepository();
        }
        return this.productRepository;
    }

    getCategoryRepository(): ICategoryRepository {
        if (!this.categoryRepository) {
            this.categoryRepository = new SupabaseCategoryRepository();
        }
        return this.categoryRepository;
    }

    getAppSettingsRepository(): IAppSettingsRepository {
        if (!this.appSettingsRepository) {
            this.appSettingsRepository = new SupabaseAppSettingsRepository();
        }
        return this.appSettingsRepository;
    }

    getProductAnalyticsRepository(): IProductAnalyticsRepository {
        if (!this.productAnalyticsRepository) {
            this.productAnalyticsRepository = new SupabaseProductAnalyticsRepository();
        }
        return this.productAnalyticsRepository;
    }

    getCommentRepository(): ICommentRepository {
        if (!this.commentRepository) {
            this.commentRepository = new SupabaseCommentRepository();
        }
        return this.commentRepository;
    }
}

export const container = Container.getInstance();
