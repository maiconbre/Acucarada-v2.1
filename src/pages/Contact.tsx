import { useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { Contact as ContactSection } from "@/components/home/Contact";
import { Footer } from "@/components/layout/Footer";

const ContactPage = () => {
  // Scroll automático para o topo ao carregar a página
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="pt-16 md:pt-20">
        <ContactSection />
      </div>
      <Footer />
    </div>
  );
};

export default ContactPage;