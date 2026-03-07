import { useState, useEffect, useMemo, useRef } from "react";
import { supabase } from "@/core/infrastructure/supabase/client";
import ProductCard from "@/components/product/ProductCard";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Input } from "@/components/ui/forms/input";
import { Button } from "@/components/ui/data-display/button";
import { Search, Filter, Grid3X3, List, Star, TrendingUp, Egg } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/forms/select";
import { useNavigate } from "react-router-dom";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  category: string;
  ingredientes?: string;
  validade_armazenamento_dias?: number;
  sabores?: string[];
  sabor_images?: Record<string, string>;
  is_featured: boolean;
  is_active: boolean;
  is_on_promotion?: boolean;
  promotional_price?: number;
  promotion_start_date?: string;
  promotion_end_date?: string;
}

interface Category {
  id: string;
  name: string;
  description: string | null;
  is_active: boolean;
}

const easterCatalogCache = {
  products: { data: null as Product[] | null, timestamp: 0, ttl: 3 * 60 * 1000 },
  categories: { data: null as Category[] | null, timestamp: 0, ttl: 10 * 60 * 1000 }
};

const EasterCatalog = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const [page, setPage] = useState(0);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fetchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [priceRange, setPriceRange] = useState("all");
  const [showReadyDelivery, setShowReadyDelivery] = useState(false);
  const [sortBy, setSortBy] = useState("newest");
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      if (searchTerm || selectedCategory !== 'all' || priceRange !== 'all' || showReadyDelivery) {
        setPage(0);
        setHasMore(true);
      }
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchTerm, selectedCategory, priceRange, showReadyDelivery]);

  const fetchProducts = async (pageNum = 0, append = false) => {
    try {
      if (!append) {
        setLoading(true);
        setError(null);

        const now = Date.now();
        if (pageNum === 0 && easterCatalogCache.products.data &&
          (now - easterCatalogCache.products.timestamp) < easterCatalogCache.products.ttl) {
          setProducts(easterCatalogCache.products.data);
          setLoading(false);
          return;
        }

        fetchTimeoutRef.current = setTimeout(() => {
          setLoading(false);
          setError("Tempo limite excedido. Tente recarregar a página.");
        }, 15000);
      }

      const pageSize = 20;
      const { data, error } = await supabase
        .from("products")
        .select("id, name, description, price, image_url, category, is_featured, is_easter_product, is_on_promotion, promotional_price, promotion_start_date, promotion_end_date")
        .eq("is_active", true)
        .eq("is_easter_product", true)
        .order("created_at", { ascending: false })
        .range(pageNum * pageSize, (pageNum + 1) * pageSize - 1);

      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
        fetchTimeoutRef.current = null;
      }

      if (error) throw error;

      const newProducts: Product[] = (data || []).map(p => ({
        ...p,
        is_active: true,
        is_on_promotion: p.is_on_promotion ?? false,
        promotional_price: p.promotional_price ?? undefined,
        promotion_start_date: p.promotion_start_date ?? undefined,
        promotion_end_date: p.promotion_end_date ?? undefined,
      }));
      setHasMore(newProducts.length === pageSize);

      if (append) {
        setProducts(prev => [...prev, ...newProducts]);
      } else {
        setProducts(newProducts);
        if (pageNum === 0) {
          easterCatalogCache.products.data = newProducts;
          easterCatalogCache.products.timestamp = Date.now();
        }
      }

      setPage(pageNum);
    } catch (error) {
      console.error("Error fetching products:", error);
      if (!append) {
        setError("Erro ao carregar produtos. Tente novamente.");
      }
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
        fetchTimeoutRef.current = null;
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const now = Date.now();
      if (easterCatalogCache.categories.data &&
        (now - easterCatalogCache.categories.timestamp) < easterCatalogCache.categories.ttl) {
        setCategories(easterCatalogCache.categories.data);
        return;
      }

      const { data, error } = await supabase
        .from("categories")
        .select("id, name, description, is_active")
        .eq("is_active", true)
        .order("name", { ascending: true });

      if (error) throw error;

      const categoriesData: Category[] = data || [];
      setCategories(categoriesData);
      easterCatalogCache.categories.data = categoriesData;
      easterCatalogCache.categories.timestamp = now;

    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const filteredProducts = useMemo(() => {
    let filtered = products;

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(searchLower) ||
          product.description?.toLowerCase().includes(searchLower)
      );
    }

    if (selectedCategory !== "all") {
      filtered = filtered.filter((product) => product.category === selectedCategory);
    }

    if (priceRange !== "all") {
      switch (priceRange) {
        case "0-10":
          filtered = filtered.filter((product) => product.price <= 10);
          break;
        case "10-25":
          filtered = filtered.filter((product) => product.price > 10 && product.price <= 25);
          break;
        case "25-50":
          filtered = filtered.filter((product) => product.price > 25 && product.price <= 50);
          break;
        case "50+":
          filtered = filtered.filter((product) => product.price > 50);
          break;
      }
    }

    if (showReadyDelivery) {
      filtered = filtered.filter((product) => product.is_featured);
    }

    const sorted = [...filtered];

    const sortWithPromotionAndFeaturedFirst = (a: Product, b: Product, secondarySort: (a: Product, b: Product) => number) => {
      if (a.is_on_promotion && !b.is_on_promotion) return -1;
      if (!a.is_on_promotion && b.is_on_promotion) return 1;
      if (a.is_featured && !b.is_featured) return -1;
      if (!a.is_featured && b.is_featured) return 1;
      return secondarySort(a, b);
    };

    switch (sortBy) {
      case "newest":
        sorted.sort((a, b) => sortWithPromotionAndFeaturedFirst(a, b, () => 0));
        break;
      case "price-low":
        sorted.sort((a, b) => sortWithPromotionAndFeaturedFirst(a, b, (a, b) => {
          const priceA = a.is_on_promotion && a.promotional_price ? a.promotional_price : a.price;
          const priceB = b.is_on_promotion && b.promotional_price ? b.promotional_price : b.price;
          return priceA - priceB;
        }));
        break;
      case "price-high":
        sorted.sort((a, b) => sortWithPromotionAndFeaturedFirst(a, b, (a, b) => {
          const priceA = a.is_on_promotion && a.promotional_price ? a.promotional_price : a.price;
          const priceB = b.is_on_promotion && b.promotional_price ? b.promotional_price : b.price;
          return priceB - priceA;
        }));
        break;
      case "name":
        sorted.sort((a, b) => sortWithPromotionAndFeaturedFirst(a, b, (a, b) => a.name.localeCompare(b.name)));
        break;
    }

    return sorted;
  }, [products, searchTerm, selectedCategory, priceRange, showReadyDelivery, sortBy]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-rose-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen gradient-soft">
        <Header />
        <div className="container mx-auto px-4 py-20">
          <div className="text-center">
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-8 max-w-md mx-auto">
              <TrendingUp className="h-12 w-12 text-destructive mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-destructive mb-2">Erro ao carregar catálogo</h3>
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button
                onClick={() => {
                  setError(null);
                  setLoading(true);
                  fetchProducts();
                }}
                variant="outline"
                className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
              >
                Tentar novamente
              </Button>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-soft">
      <Header />
      <div className="bg-card/80 backdrop-blur-sm border-b border-border/50 pt-24 md:pt-28 md:mt-8">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center mb-6 md:mb-8">
            <h1 className="text-2xl md:text-4xl lg:text-5xl font-title font-bold mb-2 md:mb-4 px-4">
              Catálogo de <span className="gradient-primary bg-clip-text text-transparent">Páscoa</span>
            </h1>
            <p className="text-sm md:text-xl text-muted-foreground max-w-2xl mx-auto font-text px-4">
              Descubra nossasdelícias exclusivas para esta época mágica do ano
            </p>
          </div>

          <div className="space-y-4">
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar produtos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="flex flex-col gap-3 w-full sm:hidden">
                <div className="flex items-center gap-2">
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="flex-1">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.name}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={priceRange} onValueChange={setPriceRange}>
                    <SelectTrigger className="flex-1">
                      <TrendingUp className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Preço" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os preços</SelectItem>
                      <SelectItem value="0-10">Até R$ 10</SelectItem>
                      <SelectItem value="10-25">R$ 10 - R$ 25</SelectItem>
                      <SelectItem value="25-50">R$ 25 - R$ 50</SelectItem>
                      <SelectItem value="50+">Acima de R$ 50</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                    className="px-3"
                  >
                    {viewMode === 'grid' ? <List className="h-4 w-4" /> : <Grid3X3 className="h-4 w-4" />}
                  </Button>
                </div>

                <div className="flex items-center gap-2">
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Ordenar" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Mais recentes</SelectItem>
                      <SelectItem value="name">Por nome (A-Z)</SelectItem>
                      <SelectItem value="price-low">Por preço (menor)</SelectItem>
                      <SelectItem value="price-high">Por preço (maior)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="hidden sm:flex flex-row gap-3 w-auto">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-full sm:w-40">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.name}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={priceRange} onValueChange={setPriceRange}>
                  <SelectTrigger className="w-full sm:w-40">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Preço" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os preços</SelectItem>
                    <SelectItem value="0-10">Até R$ 10</SelectItem>
                    <SelectItem value="10-25">R$ 10 - R$ 25</SelectItem>
                    <SelectItem value="25-50">R$ 25 - R$ 50</SelectItem>
                    <SelectItem value="50+">Acima de R$ 50</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-full sm:w-40">
                    <SelectValue placeholder="Ordenar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Mais recentes</SelectItem>
                    <SelectItem value="name">Por nome (A-Z)</SelectItem>
                    <SelectItem value="price-low">Por preço (menor)</SelectItem>
                    <SelectItem value="price-high">Por preço (maior)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="hidden sm:flex items-center gap-1 border rounded-md p-1">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="px-3"
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="px-3"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-20">
            <Egg className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-2xl font-semibold mb-4">Nenhum produto de Páscoa encontrado</h3>
            <p className="text-muted-foreground mb-6">
              Em breve teremos deliciosos produtos de Páscoa!
            </p>
            <Button
              variant="elegant"
              onClick={() => navigate('/catalog')}
              className="mt-4"
            >
              Ver Catálogo Completo
            </Button>
          </div>
        ) : (
          <div className={`${viewMode === 'grid'
            ? 'grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6'
            : 'flex flex-col gap-4'
            }`}>
            {filteredProducts.map((product) => (
              <div key={product.id} className={viewMode === 'list' ? 'w-full' : ''}>
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
                />
              </div>
            ))}
          </div>
        )}

        {filteredProducts.length > 0 && hasMore && (
          <div className="text-center mt-8">
            <Button
              onClick={() => fetchProducts(page + 1, true)}
              disabled={loading}
              variant="outline"
              className="px-8 py-2"
            >
              {loading ? "Carregando..." : "Carregar Mais"}
            </Button>
          </div>
        )}
      </div>

      <div className="container mx-auto px-4 pb-12">
        <div className="text-center">
          <Button
            variant="outline"
            size="lg"
            onClick={() => navigate("/catalog")}
          >
            Ver Catálogo Completo
          </Button>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default EasterCatalog;
