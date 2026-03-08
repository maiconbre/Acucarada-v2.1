import { Header } from "@/components/layout/Header";
import { Hero } from "@/components/home/Hero";
import { Footer } from "@/components/layout/Footer";
import { useEffect } from "react";
import { ProductGrid } from "@/components/product/ProductGrid";
import { ProductGridEncomenda } from "@/components/product/ProductGridEncomenda";
import { ProductGridEaster } from "@/components/product/ProductGridEaster";
import { Testimonials } from "@/components/home/Testimonials";
import ErrorBoundary from "@/components/common/ErrorBoundary";



export default function Index() {
  // Scroll automático para o topo ao carregar a página
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="pt-16 md:pt-20">
        <Hero />
      </div>

      <ErrorBoundary>
        <ProductGridEaster />
      </ErrorBoundary>

      <ErrorBoundary>
        <ProductGrid />
      </ErrorBoundary>

      <ErrorBoundary>
        <ProductGridEncomenda />
      </ErrorBoundary>

      <ErrorBoundary>
        <Testimonials />
      </ErrorBoundary>

      <Footer />
    </div>
  );
}
