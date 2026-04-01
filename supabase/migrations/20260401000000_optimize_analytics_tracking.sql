-- Migração de Otimização: Remoção de tabelas de tracking em linha
-- Criada em 01/04/2026 para salvar espaço no banco de dados (Substituindo logs densos por contadores)

BEGIN;

-- 1. Remover Triggers Antigas primeiro para evitar travamentos
DROP TRIGGER IF EXISTS trigger_clicks_analytics ON public.product_clicks CASCADE;
DROP TRIGGER IF EXISTS trigger_likes_analytics ON public.product_likes CASCADE;
DROP TRIGGER IF EXISTS trigger_update_analytics_on_share ON public.product_shares CASCADE;
DROP TRIGGER IF EXISTS trigger_update_analytics_on_click ON public.product_clicks CASCADE;

-- 2. Remover Funções de Trigger Antigas
DROP FUNCTION IF EXISTS public.trigger_update_analytics() CASCADE;
DROP FUNCTION IF EXISTS public.update_product_analytics_on_activity() CASCADE;

-- 3. DROP DEFINITIVO DE TABELAS PESADAS
-- Isso liberará centenas/milhares de megabytes do banco de dados e seus indexes
DROP TABLE IF EXISTS public.product_clicks CASCADE;
DROP TABLE IF EXISTS public.product_shares CASCADE;

-- Opcional: A tabela product_views já foi removida em 20250124000000, 
-- mas garantimos sua ausência aqui de forma verbosa
DROP TABLE IF EXISTS public.product_views CASCADE;

-- 4. Re-criar as funções RPC chamadas pelo frontend para que atualizem APENAS o contador

-- 4.0 Remover versões antigas duplicadas (onde haviam divergências entre tipos TEXT e VARCHAR)
DROP FUNCTION IF EXISTS public.track_product_click(UUID, TEXT, TEXT, UUID, TEXT, INET, TEXT) CASCADE;
DROP FUNCTION IF EXISTS public.track_product_share(UUID, TEXT, TEXT, UUID, TEXT, INET, TEXT) CASCADE;

-- 4.1. Clicks 
CREATE OR REPLACE FUNCTION public.track_product_click(
  p_product_id UUID,
  p_click_type VARCHAR(50) DEFAULT NULL,
  p_page_source VARCHAR(255) DEFAULT NULL,
  p_user_id UUID DEFAULT NULL,
  p_session_id VARCHAR(255) DEFAULT NULL,
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Insert initial counter if product not in analytics, else update total_clicks.
  -- No heavy row inserted! This saves millions of rows over time.
  INSERT INTO public.product_analytics (product_id, total_clicks, last_updated)
  VALUES (p_product_id, 1, now())
  ON CONFLICT (product_id)
  DO UPDATE SET 
    total_clicks = COALESCE(public.product_analytics.total_clicks, 0) + 1,
    last_updated = now();
  
  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$$;

-- 4.2. Shares
CREATE OR REPLACE FUNCTION public.track_product_share(
  p_product_id UUID,
  p_share_type VARCHAR(50),
  p_page_source VARCHAR(255) DEFAULT NULL,
  p_user_id UUID DEFAULT NULL,
  p_session_id VARCHAR(255) DEFAULT NULL,
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Insert initial counter if product not in analytics, else update total_shares.
  INSERT INTO public.product_analytics (product_id, total_shares, last_updated)
  VALUES (p_product_id, 1, now())
  ON CONFLICT (product_id)
  DO UPDATE SET 
    total_shares = COALESCE(public.product_analytics.total_shares, 0) + 1,
    last_updated = now();
  
  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$$;

-- 5. Atualizar função genérica de agrupar analytics (agora só analisa likes, que continuam existindo pro usuário descurtir)
CREATE OR REPLACE FUNCTION public.update_product_analytics(p_product_id UUID)
RETURNS void AS $$
BEGIN
  -- Apenas contamos os likes, pois clicks e shares agora são contadores isolados e definitivos
  UPDATE public.product_analytics pa
  SET
    total_likes = COALESCE((
      SELECT COUNT(*) 
      FROM public.product_likes 
      WHERE product_id = p_product_id
    ), 0),
    last_updated = now()
  WHERE pa.product_id = p_product_id;
END;
$$ LANGUAGE plpgsql;

-- 6. Adicionar trigger exclusiva e limpa para Likes
CREATE OR REPLACE FUNCTION public.trigger_update_likes_analytics()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM public.update_product_analytics(NEW.product_id);
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    PERFORM public.update_product_analytics(OLD.product_id);
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_likes_analytics_optimized
  AFTER INSERT OR DELETE ON public.product_likes
  FOR EACH ROW EXECUTE FUNCTION public.trigger_update_likes_analytics();

-- 7. Documentar otimizações
COMMENT ON FUNCTION public.track_product_click(UUID, VARCHAR, VARCHAR, UUID, VARCHAR, INET, TEXT) IS 'Otimizado em 01-Abr-2026: Conta apenas métricas sem gerar log pesado para cada clique em banco.';
COMMENT ON FUNCTION public.track_product_share(UUID, VARCHAR, VARCHAR, UUID, VARCHAR, INET, TEXT) IS 'Otimizado em 01-Abr-2026: Conta apenas métricas sem gerar log pesado para cada share em banco.';

COMMIT;
