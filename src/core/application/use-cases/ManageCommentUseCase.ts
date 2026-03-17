import { Comment, CreateCommentInput } from '@/core/domain/entities/Comment';
import { ICommentRepository, CommentFilter } from '@/core/domain/repositories/ICommentRepository';

export class ManageCommentUseCase {
    constructor(private commentRepository: ICommentRepository) {}

    async getByProductId(
        productId: string,
        page: number = 1,
        limit: number = 5
    ): Promise<{ comments: Comment[]; total: number; hasMore: boolean }> {
        const { data, count } = await this.commentRepository.findByProductId(productId, page, limit);
        return {
            comments: data,
            total: count,
            hasMore: data.length < count,
        };
    }

    async getAll(filter: CommentFilter = 'pending'): Promise<Comment[]> {
        return this.commentRepository.findAll(filter);
    }

    async create(input: CreateCommentInput): Promise<void> {
        return this.commentRepository.create(input);
    }

    async toggleApproval(id: string, currentStatus: boolean): Promise<void> {
        return this.commentRepository.toggleApproval(id, currentStatus);
    }

    async delete(id: string): Promise<void> {
        return this.commentRepository.delete(id);
    }
}
