import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/core/infrastructure/supabase/client';
import { useToast } from '@/hooks/ui/use-toast';
import { useUser } from '@/core/application/hooks/useUser';
import { container } from '@/core/infrastructure/container';
import { ManageProductAnalyticsUseCase, ProductAnalyticsWithLike } from '@/core/application/use-cases/ManageProductAnalyticsUseCase';

interface UseProductAnalyticsReturn {
    analytics: ProductAnalyticsWithLike;
    loading: boolean;
    toggleLike: () => Promise<void>;
    trackShare: (shareType: string, pageSource?: string) => Promise<void>;
    trackClick: (clickType: string, pageSource?: string) => Promise<void>;
}

const DEFAULT_ANALYTICS: ProductAnalyticsWithLike = {
    total_likes: 0,
    total_shares: 0,
    total_clicks: 0,
    is_liked: false,
};

const CACHE_DURATION = 30000;

export const useProductAnalytics = (productId: string): UseProductAnalyticsReturn => {
    const { toast } = useToast();
    const [analytics, setAnalytics] = useState<ProductAnalyticsWithLike>(DEFAULT_ANALYTICS);
    const [loading, setLoading] = useState(true);
    const [sessionId] = useState(() => {
        let sessionId = localStorage.getItem('session_id');
        if (!sessionId) {
            sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            localStorage.setItem('session_id', sessionId);
        }
        return sessionId;
    });

    const { getCurrentUser, getUserIP, getUserAgent } = useUser();

    const analyticsUseCase = useMemo(() =>
        new ManageProductAnalyticsUseCase(container.getProductAnalyticsRepository()),
    []);

    const fetchAnalytics = useCallback(async () => {
        try {
            setLoading(true);
            const currentUser = await getCurrentUser();
            const data = await analyticsUseCase.getAnalytics(
                productId,
                currentUser?.id || null,
                sessionId
            );
            setAnalytics(data);
        } catch (error) {
            console.error('Error fetching analytics:', error);
            setAnalytics(DEFAULT_ANALYTICS);
        } finally {
            setLoading(false);
        }
    }, [productId, sessionId, getCurrentUser, analyticsUseCase]);

    const toggleLike = useCallback(async () => {
        try {
            const currentUser = await getCurrentUser();
            const ip = await getUserIP();

            const success = await analyticsUseCase.toggleLike(
                productId,
                currentUser?.id || null,
                sessionId,
                ip
            );

            setAnalytics(prev => ({
                ...prev,
                is_liked: success,
                total_likes: success ? prev.total_likes + 1 : prev.total_likes - 1,
            }));

            toast({
                title: success ? 'Produto curtido!' : 'Curtida removida',
                description: success ? 'Você curtiu este produto.' : 'Você removeu a curtida deste produto.',
            });
        } catch (error) {
            console.error('Error toggling like:', error);
            toast({
                title: 'Erro',
                description: 'Não foi possível processar sua curtida. Tente novamente.',
                variant: 'destructive',
            });
        }
    }, [productId, sessionId, getCurrentUser, getUserIP, analyticsUseCase, toast]);

    const trackShare = useCallback(async (shareType: string, pageSource?: string) => {
        try {
            const currentUser = await getCurrentUser();
            const ip = await getUserIP();
            const userAgent = getUserAgent();

            await analyticsUseCase.trackShare(
                productId,
                shareType,
                pageSource || window.location.pathname,
                currentUser?.id || null,
                currentUser ? null : sessionId,
                ip,
                userAgent
            );

            setAnalytics(prev => ({
                ...prev,
                total_shares: prev.total_shares + 1,
            }));
        } catch (error) {
            console.error('Error tracking share:', error);
        }
    }, [productId, sessionId, getCurrentUser, getUserIP, getUserAgent, analyticsUseCase]);

    const trackClick = useCallback(async (clickType: string, pageSource?: string) => {
        try {
            const currentUser = await getCurrentUser();
            const ip = await getUserIP();
            const userAgent = getUserAgent();

            await analyticsUseCase.trackClick(
                productId,
                clickType,
                pageSource || window.location.pathname,
                currentUser?.id || null,
                currentUser ? null : sessionId,
                ip,
                userAgent
            );

            setAnalytics(prev => ({
                ...prev,
                total_clicks: prev.total_clicks + 1,
            }));
        } catch (error) {
            console.error('Error tracking click:', error);
        }
    }, [productId, sessionId, getCurrentUser, getUserIP, getUserAgent, analyticsUseCase]);

    useEffect(() => {
        if (!productId) return;
        
        fetchAnalytics();

        const analyticsSubscription = supabase
            .channel(`product_analytics_${productId}`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'product_analytics',
                    filter: `product_id=eq.${productId}`,
                },
                () => fetchAnalytics()
            )
            .subscribe();

        const likesSubscription = supabase
            .channel(`product_likes_${productId}`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'product_likes',
                    filter: `product_id=eq.${productId}`,
                },
                () => fetchAnalytics()
            )
            .subscribe();

        const sharesSubscription = supabase
            .channel(`product_shares_${productId}`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'product_shares',
                    filter: `product_id=eq.${productId}`,
                },
                () => fetchAnalytics()
            )
            .subscribe();

        return () => {
            analyticsSubscription.unsubscribe();
            likesSubscription.unsubscribe();
            sharesSubscription.unsubscribe();
        };
    }, [productId, fetchAnalytics]);

    return {
        analytics,
        loading,
        toggleLike,
        trackShare,
        trackClick,
    };
};
