export interface Comment {
    id: string;
    product_id: string;
    comment: string;
    author_name?: string | null;
    instagram_handle?: string | null;
    image_url?: string | null;
    rating: number;
    is_approved: boolean;
    created_at: string;
    product?: {
        id: string;
        name: string;
        image_url?: string | null;
    } | null;
}

export interface CreateCommentInput {
    product_id: string;
    comment: string;
    author_name?: string | null;
    instagram_handle?: string | null;
    image_url?: string | null;
    rating: number;
}
