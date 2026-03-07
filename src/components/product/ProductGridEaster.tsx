import { useState, useEffect, useRef } from "react";
import { supabase } from "@/core/infrastructure/supabase/client";
import ProductCard from "./ProductCard";
import { Button } from "@/components/ui/data-display/button";
import { Egg, Grid3X3, List } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/ui/use-mobile";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  category: string;
  is_featured: boolean;
  is_active: boolean;
  is_on_promotion?: boolean;
  promotional_price?: number;
  promotion_start_date?: string;
  promotion_end_date?: string;
}

const easterProductCache = {
  data: null as Product[] | null,
  timestamp: 0,
  ttl: 5 * 60 * 1000
};

export const ProductGridEaster = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isMobile = useIsMobile();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(isMobile ? 'list' : 'grid');
  const navigate = useNavigate();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setViewMode(isMobile ? 'list' : 'grid');
  }, [isMobile]);

  useEffect(() => {
    fetchEasterProducts();
  }, []);

  const fetchEasterProducts = async () => {
    try {
      setError(null);
      
      const now = Date.now();
      if (easterProductCache.data && (now - easterProductCache.timestamp) < easterProductCache.ttl) {
        setProducts(easterProductCache.data);
        setLoading(false);
        return;
      }

      timeoutRef.current = setTimeout(() => {
        setLoading(false);
        setError("Tempo limite excedido.");
      }, 10000);

      const { data, error: fetchError } = await supabase
        .from("products")
        .select("id, name, description, price, image_url, category, is_featured, is_on_promotion, promotional_price, promotion_start_date, promotion_end_date")
        .eq("is_active", true)
        .eq("is_easter_product", true)
        .order("created_at", { ascending: false })
        .limit(6);

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }

      if (fetchError) throw fetchError;

      const productsData: Product[] = (data || []).map(p => ({
        ...p,
        is_active: true,
        is_on_promotion: p.is_on_promotion ?? false,
        promotional_price: p.promotional_price ?? undefined,
        promotion_start_date: p.promotion_start_date ?? undefined,
        promotion_end_date: p.promotion_end_date ?? undefined,
      }));
      setProducts(productsData);
      easterProductCache.data = productsData;
      easterProductCache.timestamp = now;

    } catch (err) {
      console.error("Error fetching easter products:", err);
      setError("Erro ao carregar produtos.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="py-12 bg-gradient-to-b from-rose-50/50 to-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold font-title mb-2">
              Doces de <span className="text-rose-primary">Páscoa</span>
            </h2>
            <p className="text-muted-foreground text-sm md:text-base">
              Descubra nossas delícias exclusivas para esta data especial!
            </p>
          </div>
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-primary"></div>
          </div>
        </div>
      </section>
    );
  }

  if (error || products.length === 0) {
    return null;
  }

  return (
    <section className="py-12 bg-gradient-to-b from-rose-50/50 to-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold font-title mb-2">
            Doces de <span className="text-rose-primary">Páscoa</span>
          </h2>
          <p className="text-muted-foreground text-sm md:text-base">
            Descubra nossas delícias exclusivas para esta data especial!
          </p>
        </div>

        <div className="flex justify-center gap-2 mb-6">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
            className="md:hidden"
          >
            <Grid3X3 className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
            className="md:hidden"
          >
            <List className="h-4 w-4" />
          </Button>
        </div>

        <div className={viewMode === 'grid' 
          ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-6' 
          : 'flex flex-col gap-4 max-w-2xl mx-auto'
        }>
          {products.map((product) => (
            <ProductCard
              key={product.id}
              id={product.id}
              name={product.name}
              description={product.description || ""}
              price={product.price}
              image_url={product.image_url || ""}
              category={product.category}
              is_featured={product.is_featured}
              is_on_promotion={product.is_on_promotion}
              promotional_price={product.promotional_price}
              promotion_start_date={product.promotion_start_date}
              promotion_end_date={product.promotion_end_date}
            />
          ))}
        </div>

        <div className="text-center mt-8">
          <Button
            variant="easter"
            size="lg"
            onClick={() => navigate('/catalog/easter')}
            className="px-8"
          >
            <Egg className="h-5 w-5 mr-2" />
            Ver Catálogo Completo
          </Button>
        </div>
      </div>
    </section>
  );
};
