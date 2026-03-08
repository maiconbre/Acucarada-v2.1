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
      <section className="py-20 bg-gradient-to-b from-rose-50/50 to-background">
        <div className="container mx-auto px-4">
          {/* Section Header Skeleton */}
          <div className="text-center mb-16">
            <div className="h-12 bg-muted/50 rounded-lg w-64 mx-auto mb-6 animate-pulse" />
            <div className="h-6 bg-muted/30 rounded w-96 mx-auto animate-pulse" />
          </div>

          {/* Products Grid Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-card rounded-2xl p-6 shadow-soft animate-pulse">
                <div className="h-48 bg-muted/50 rounded-xl mb-4" />
                <div className="h-6 bg-muted/40 rounded w-3/4 mb-2" />
                <div className="h-4 bg-muted/30 rounded w-full mb-2" />
                <div className="h-4 bg-muted/30 rounded w-2/3 mb-4" />
                <div className="h-6 bg-muted/40 rounded w-1/3" />
              </div>
            ))}
          </div>

          <div className="text-center mt-16">
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <Egg className="h-5 w-5 animate-pulse text-rose-primary" />
              <span>Preparando nossas delícias saborosas...</span>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (error || products.length === 0) {
    return null;
  }

  return (
    <section className="py-12 md:py-20 bg-gradient-to-b from-rose-50/50 to-background">
      <div className="container mx-auto px-4">
        {/* Section Header with animation */}
        <div className="text-center mb-8 md:mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold mb-4 md:mb-6">
            Doces de <span className="text-rose-primary">Páscoa</span>
          </h2>
          <p className="text-sm md:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed px-4 md:px-0">
            Descubra nossas delícias exclusivas para esta data especial!
          </p>

          {/* View Mode Toggle */}
          <div className="flex justify-center mt-4 md:mt-8">
            <div className="flex items-center gap-1 border rounded-md p-1 bg-background/50 backdrop-blur-sm transition-all duration-300 ease-in-out hover:bg-background/70">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="px-2 md:px-3 order-2 md:order-1 transition-all duration-300 ease-in-out hover:scale-105"
              >
                <Grid3X3 className="h-3 w-3 md:h-4 md:w-4 transition-transform duration-300 ease-in-out" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="px-2 md:px-3 order-1 md:order-2 transition-all duration-300 ease-in-out hover:scale-105"
              >
                <List className="h-3 w-3 md:h-4 md:w-4 transition-transform duration-300 ease-in-out" />
              </Button>
            </div>
          </div>
        </div>

        {/* Products Grid/List with staggered animation */}
        <div className={`${viewMode === 'grid'
            ? 'grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6 lg:gap-8'
            : 'flex flex-col gap-4 max-w-2xl mx-auto'
          }`}>
          {products.map((product, index) => (
            <div
              key={product.id}
              className={`transition-all duration-300 ${viewMode === 'grid' ? 'hover:scale-105' : 'hover:shadow-lg'
                }`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <ProductCard
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
                is_easter_product={true}
              />
            </div>
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
