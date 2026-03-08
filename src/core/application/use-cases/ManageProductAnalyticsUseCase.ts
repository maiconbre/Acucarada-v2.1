import { IProductAnalyticsRepository, ProductAnalytics } from '@/core/domain/repositories/IProductAnalyticsRepository';

export interface ProductAnalyticsWithLike extends ProductAnalytics {
    is_liked: boolean;
}

export class ManageProductAnalyticsUseCase {
    constructor(private analyticsRepository: IProductAnalyticsRepository) { }

    async getAnalytics(productId: string, userId: string | null, sessionId: string): Promise<ProductAnalyticsWithLike> {
        const [analytics, likeStatus] = await Promise.all([
            this.analyticsRepository.getAnalytics(productId),
            this.analyticsRepository.checkLikeStatus(productId, userId, sessionId)
        ]);

        return {
            total_likes: analytics?.total_likes || 0,
            total_shares: analytics?.total_shares || 0,
            total_clicks: analytics?.total_clicks || 0,
            is_liked: likeStatus.is_liked,
        };
    }

    async toggleLike(productId: string, userId: string | null, sessionId: string, ipAddress: unknown): Promise<boolean> {
        return this.analyticsRepository.toggleLike(productId, userId, sessionId, ipAddress);
    }

    async trackShare(
        productId: string,
        shareType: string,
        pageSource: string | null,
        userId: string | null,
        sessionId: string | null,
        ipAddress: unknown,
        userAgent: string | null
    ): Promise<boolean> {
        return this.analyticsRepository.trackShare(
            productId, shareType, pageSource, userId, sessionId, ipAddress, userAgent
        );
    }

    async trackClick(
        productId: string,
        clickType: string,
        pageSource: string | null,
        userId: string | null,
        sessionId: string | null,
        ipAddress: unknown,
        userAgent: string | null
    ): Promise<boolean> {
        return this.analyticsRepository.trackClick(
            productId, clickType, pageSource, userId, sessionId, ipAddress, userAgent
        );
    }
}
