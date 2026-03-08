import { Button } from "@/components/ui/data-display/button";
import { Heart, Star, ChefHat, Egg } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAppSettings } from "@/core/application/hooks/useAppSettings";
import logoImage from "@/assets/Fundo Transparente PNGPrancheta 1.png";
import mobileBg from "/background-mobile.webp";
import desktopBg from "/background-destkop.jpg";


export const Hero = () => {
  const navigate = useNavigate();
  const { getWhatsAppLink } = useAppSettings();

  const handleOrderClick = () => {
    const customMessage = "Olá! Gostaria de fazer um pedido dos doces da Açucarada :)";
    const link = getWhatsAppLink(customMessage);
    window.open(link, '_blank');
  };

  const handleCatalogClick = () => {
    navigate('/catalog');
  };

  const handleEasterCatalogClick = () => {
    navigate('/catalog/easter');
  };

  return (
    <section className="relative min-h-screen flex items-start overflow-hidden pt-28 md:pt-32">
      {/* Background - Mobile (only on screens smaller than md) */}
      <div className="absolute inset-0 z-0 md:hidden">
        <img
          src={mobileBg}
          alt="Doces artesanais da Açucarada"
          className="w-full h-full object-cover object-center"
          width="750"
          height="1334"
          loading="eager"
          decoding="async"
        />
        <div className="absolute inset-0 bg-background/10" />
      </div>

      {/* Background - Desktop (md and above) */}
      <div className="absolute inset-0 z-0 hidden md:block">
        <img
          src={desktopBg}
          alt="Doces artesanais da Açucarada"
          className="w-full h-full object-cover object-center"
          width="1920"
          height="1080"
          loading="eager"
          decoding="async"
        />
        <div className="absolute inset-0 bg-background/25" />
      </div>



      {/* Content */}
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl md:text-left md:ml-2 lg:ml-4">
          {/* Main Title with improved mobile hierarchy */}
          <div className="flex flex-col items-center md:items-start -mt-8 md:-mt-20 pb-0 md:-ml-8 lg:-ml-12">
            <img
              src={logoImage}
              alt="Açucarada"
              className="h-auto object-contain m-0 p-0 w-[160%] max-w-xl md:w-[180%] md:max-w-2xl lg:max-w-3xl"
              width="800"
              height="400"
              loading="eager"
              decoding="async"
            />
          </div>

          <div className="md:pl-8 lg:pl-12">
            {/* Description with better mobile readability */}
            <p className="text-base md:text-lg text-muted-foreground mb-4 md:mb-6 leading-relaxed max-w-xl font-text text-center md:text-left mx-auto md:mx-0">
              Criamos doces artesanais únicos, feitos com ingredientes selecionados e muito amor.
              Cada doce é uma pequena obra de arte que desperta os sentidos.
            </p>

            {/* CTA Buttons with improved mobile design */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6 md:mb-8 w-[80%] sm:w-auto mx-auto sm:mx-0">
              <Button
                variant="hero"
                size="sm"
                onClick={handleOrderClick}
                className="text-sm px-4 py-3 sm:px-4 sm:py-2 h-auto group hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl w-full sm:w-auto"
              >
                <Heart className="h-4 w-4 fill-current group-hover:animate-pulse mr-1" />
                Fazer Pedido
              </Button>
              <Button
                variant="elegant"
                size="sm"
                onClick={handleCatalogClick}
                className="text-sm px-4 py-3 sm:px-4 sm:py-2 h-auto hover:scale-105 transition-all duration-300 w-full sm:w-auto"
              >
                <ChefHat className="h-4 w-4 mr-1" />
                Ver Catálogo
              </Button>
              <Button
                variant="easter"
                size="sm"
                onClick={handleEasterCatalogClick}
                className="text-sm px-4 py-3 sm:px-4 sm:py-2 h-auto hover:scale-105 transition-all duration-300 w-full sm:w-auto"
              >
                <Egg className="h-4 w-4 mr-1" />
                Catálogo da Páscoa
              </Button>
            </div>

            {/* Enhanced trust indicators - Mobile optimized */}
            <div className="flex justify-center sm:justify-start mt-4 sm:mt-6">
              <div className="inline-flex items-center justify-center sm:justify-start gap-2 sm:gap-2 bg-card/60 backdrop-blur-sm border border-border/50 rounded-lg px-2 py-1.5 sm:px-3 sm:py-2 hover:bg-card/80 transition-colors">
                <div className="flex shrink-0">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-2 w-2 sm:h-3 sm:w-3 fill-rose-primary text-rose-primary" />
                  ))}
                </div>
                <span className="text-xs sm:text-xs lg:text-sm font-medium text-center sm:text-left font-text whitespace-nowrap">500+ clientes satisfeitos</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};