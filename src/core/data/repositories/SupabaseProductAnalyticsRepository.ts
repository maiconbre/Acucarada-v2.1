import { supabase } from '@/core/infrastructure/supabase/client';
import { IProductAnalyticsRepository, ProductAnalytics, LikeStatus } from '../../domain/repositories/IProductAnalyticsRepository';

export class SupabaseProductAnalyticsRepository implements IProductAnalyticsRepository {
    async getAnalytics(productId: string): Promise<ProductAnalytics | null> {
        const { data, error } = await supabase
            .from('product_analytics')
            .select('total_likes, total_shares, total_clicks')
            .eq('product_id', productId)
            .limit(1)
            .maybeSingle();

        if (error) {
            console.warn('Error fetching analytics:', error);
            return null;
        }

        return data || null;
    }

    async checkLikeStatus(productId: string, userId: string | null, sessionId: string): Promise<LikeStatus> {
        try {
            if (userId) {
                const { data: likeData } = await supabase
                    .from('product_likes')
                    .select('id')
                    .eq('product_id', productId)
                    .eq('user_id', userId)
                    .limit(1)
                    .maybeSingle();

                return { is_liked: !!likeData, like_id: likeData?.id };
            } else {
                const { data: likeData } = await supabase
                    .from('product_likes')
                    .select('id')
                    .eq('product_id', productId)
                    .eq('session_id', sessionId)
                    .limit(1)
                    .maybeSingle();

                return { is_liked: !!likeData, like_id: likeData?.id };
            }
        } catch (error) {
            console.warn('Error checking like status:', error);
            return { is_liked: false };
        }
    }

    async toggleLike(
        productId: string,
        userId: string | null,
        sessionId: string | null,
        ipAddress: unknown
    ): Promise<boolean> {
        const { data, error } = await supabase.rpc('toggle_product_like', {
            p_product_id: productId,
            p_user_id: userId || null,
            p_session_id: userId ? null : sessionId,
            p_ip_address: ipAddress,
        });

        if (error) {
            console.error('Error toggling like:', error);
            throw new Error(`Erro ao processar curtida: ${error.message}`);
        }

        return data === true;
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
        const { data, error } = await supabase.rpc('track_product_share', {
            p_product_id: productId,
            p_share_type: shareType,
            p_page_source: pageSource,
            p_user_id: userId || null,
            p_session_id: userId ? null : sessionId,
            p_ip_address: ipAddress,
            p_user_agent: userAgent,
        });

        if (error) {
            console.error('Error tracking share:', error);
            throw new Error(`Erro ao rastrear compartilhamento: ${error.message}`);
        }

        return data === true;
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
        const { error } = await supabase.rpc('track_product_click', {
            p_product_id: productId,
            p_click_type: clickType,
            p_page_source: pageSource,
            p_user_id: userId || null,
            p_session_id: userId ? null : sessionId,
            p_ip_address: ipAddress,
            p_user_agent: userAgent,
        });

        if (error) {
            console.error('Error tracking click:', error);
            throw new Error(`Erro ao rastrear clique: ${error.message}`);
        }

        return true;
    }
}
