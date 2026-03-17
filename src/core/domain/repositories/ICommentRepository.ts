import { Comment, CreateCommentInput } from '../entities/Comment';

export type CommentFilter = 'all' | 'pending' | 'approved';

export interface ICommentRepository {
    findByProductId(productId: string, page: number, limit: number): Promise<{ data: Comment[]; count: number }>;
    findAll(filter: CommentFilter): Promise<Comment[]>;
    create(input: CreateCommentInput): Promise<void>;
    toggleApproval(id: string, currentStatus: boolean): Promise<void>;
    delete(id: string): Promise<void>;
}
