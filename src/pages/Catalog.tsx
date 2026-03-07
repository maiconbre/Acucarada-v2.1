import { useEffect } from "react";
import ProductCard from "@/components/product/ProductCard";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Input } from "@/components/ui/forms/input";
import { Button } from "@/components/ui/data-display/button";
import { Search, Filter, Grid3X3, List, Star, TrendingUp, ChevronLeft, ChevronRight } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/forms/select";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useCatalogProducts } from "@/core/application/hooks/useCatalogProducts";
import { useCatalogFilters } from "@/core/application/hooks/useCatalogFilters";

const Catalog = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const { products, categories, loading, error, refetch } = useCatalogProducts();

  const {
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    priceRange,
    setPriceRange,
    showReadyDelivery,
    setShowReadyDelivery,
    sortBy,
    setSortBy,
    viewMode,
    setViewMode,
    filteredProducts,
    pagination,
  } = useCatalogFilters({ products, pageSize: 12 });

  // Scroll automático para o topo ao carregar a página
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    const searchQuery = searchParams.get('search');
    if (searchQuery) {
      setSearchTerm(searchQuery);
    }
  }, [searchParams, setSearchTerm]);

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
                onClick={refetch}
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
      {/* Header */}
      <div className="bg-card/80 backdrop-blur-sm border-b border-border/50 pt-24 md:pt-28 md:mt-8">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center mb-6 md:mb-8">
            <h1 className="text-2xl md:text-4xl lg:text-5xl font-title font-bold mb-2 md:mb-4 px-4">
              Nosso <span className="gradient-primary bg-clip-text text-transparent">Catálogo</span>
            </h1>
            <p className="text-sm md:text-xl text-muted-foreground max-w-2xl mx-auto font-text px-4">
              Explore nossa deliciosa seleção de doces artesanais
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
                      <SelectItem value="newest">Pronta entrega primeiro</SelectItem>
                      <SelectItem value="name">Por nome (A-Z)</SelectItem>
                      <SelectItem value="price-low">Por preço (menor)</SelectItem>
                      <SelectItem value="price-high">Por preço (maior)</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button
                    variant={showReadyDelivery ? "default" : "outline"}
                    onClick={() => setShowReadyDelivery(!showReadyDelivery)}
                    className="flex-1"
                  >
                    <Star className={`h-4 w-4 mr-2 ${showReadyDelivery ? 'fill-current' : ''}`} />
                    Pronta entrega
                  </Button>
                </div>
              </div>

              {/* Desktop Filters */}
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
                    <SelectItem value="newest">Pronta entrega primeiro</SelectItem>
                    <SelectItem value="name">Por nome (A-Z)</SelectItem>
                    <SelectItem value="price-low">Por preço (menor)</SelectItem>
                    <SelectItem value="price-high">Por preço (maior)</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  variant={showReadyDelivery ? "default" : "outline"}
                  onClick={() => setShowReadyDelivery(!showReadyDelivery)}
                  className="w-full sm:w-auto"
                >
                  <Star className={`h-4 w-4 mr-2 ${showReadyDelivery ? 'fill-current' : ''}`} />
                  Pronta entrega
                </Button>
              </div>

              {/* Desktop View Mode Toggle */}
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
            <h3 className="text-2xl font-semibold mb-4">Nenhum produto encontrado</h3>
            <p className="text-muted-foreground">
              Tente ajustar os filtros ou termo de busca
            </p>
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

        {/* Pagination UI */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 mt-12">
            <Button
              onClick={pagination.prevPage}
              disabled={!pagination.hasPrevPage}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <ChevronLeft className="h-4 w-4" /> Anterior
            </Button>

            <div className="flex items-center gap-2">
              {[...Array(pagination.totalPages)].map((_, idx) => (
                <Button
                  key={idx}
                  onClick={() => pagination.setPage(idx)}
                  variant={idx === pagination.currentPage ? "default" : "ghost"}
                  size="sm"
                  className={`w-8 h-8 p-0 ${idx === pagination.currentPage ? "bg-rose-primary" : ""}`}
                >
                  {idx + 1}
                </Button>
              ))}
            </div>

            <Button
              onClick={pagination.nextPage}
              disabled={!pagination.hasNextPage}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              Próxima <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      <div className="container mx-auto px-4 pb-12">
        <div className="text-center">
          <Button
            variant="outline"
            size="lg"
            onClick={() => navigate("/")}
          >
            Voltar ao Início
          </Button>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Catalog;