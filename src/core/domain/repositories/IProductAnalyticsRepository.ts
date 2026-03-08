export interface ProductAnalytics {
    total_likes: number;
    total_shares: number;
    total_clicks: number;
}

export interface LikeStatus {
    is_liked: boolean;
    like_id?: string;
}

export interface IProductAnalyticsRepository {
    getAnalytics(productId: string): Promise<ProductAnalytics | null>;
    checkLikeStatus(productId: string, userId: string | null, sessionId: string): Promise<LikeStatus>;
    toggleLike(productId: string, userId: string | null, sessionId: string, ipAddress: unknown): Promise<boolean>;
    trackShare(productId: string, shareType: string, pageSource: string | null, userId: string | null, sessionId: string | null, ipAddress: unknown, userAgent: string | null): Promise<boolean>;
    trackClick(productId: string, clickType: string, pageSource: string | null, userId: string | null, sessionId: string | null, ipAddress: unknown, userAgent: string | null): Promise<boolean>;
}
