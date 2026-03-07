import { Category } from '@/core/domain/entities/Category';
import { ICategoryRepository } from '@/core/domain/repositories/ICategoryRepository';

export class ManageCategoryUseCase {
    constructor(private categoryRepository: ICategoryRepository) { }

    async getAll(activeOnly: boolean = true): Promise<Category[]> {
        return this.categoryRepository.findAll(activeOnly);
    }

    async getById(id: string): Promise<Category | null> {
        return this.categoryRepository.findById(id);
    }
}
