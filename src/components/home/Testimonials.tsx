import { useState, useEffect, useRef } from 'react';
import { Star, Quote } from "lucide-react";
import { Card, CardContent } from "@/components/ui/data-display/card";
import { supabase } from "@/core/infrastructure/supabase/client";
import { Database } from "@/core/infrastructure/supabase/types";

type Feedback = Database['public']['Tables']['feedbacks']['Row'];

interface MockFeedback {
  id: string;
  customer_name: string;
  feedback_text: string;
  image_url: string | null;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

// Dados mockados como fallback
const mockFeedbacks: MockFeedback[] = [
  {
    id: 'mock-1',
    customer_name: 'Maria Silva',
    feedback_text: 'Os doces são simplesmente incríveis! Encomendei para o aniversário da minha filha e todos elogiaram. Chegou tudo perfeito e o sabor é maravilhoso! 🎂✨',
    image_url: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=400&h=600&fit=crop&fm=webp&q=80',
    is_active: true,
    display_order: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'mock-2',
    customer_name: 'João Santos',
    feedback_text: 'Qualidade excepcional! Os brigadeiros gourmet são os melhores que já provei. Recomendo de olhos fechados! 🍫👌',
    image_url: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=600&fit=crop&fm=webp&q=80',
    is_active: true,
    display_order: 2,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'mock-3',
    customer_name: 'Ana Costa',
    feedback_text: 'Atendimento perfeito e doces maravilhosos! Fizeram tudo com muito carinho para o meu casamento. Superou minhas expectativas! 💕',
    image_url: 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=400&h=600&fit=crop&fm=webp&q=80',
    is_active: true,
    display_order: 3,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'mock-4',
    customer_name: 'Carlos Oliveira',
    feedback_text: 'Sabor incrível e apresentação impecável! Sempre peço para eventos da empresa. Nunca decepciona! 🏢⭐',
    image_url: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400&h=600&fit=crop&fm=webp&q=80',
    is_active: true,
    display_order: 4,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'mock-5',
    customer_name: 'Fernanda Lima',
    feedback_text: 'Doces artesanais de primeira qualidade! O carinho e dedicação em cada doce é visível. Virei cliente fiel! 🥰',
    image_url: null,
    is_active: true,
    display_order: 5,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export function Testimonials() {
  const [feedbacks, setFeedbacks] = useState<(Feedback | MockFeedback)[]>([]);
  const [loading, setLoading] = useState(true);

  // Carregar feedbacks do Supabase com fallback para dados mockados
  useEffect(() => {
    const loadFeedbacks = async () => {
      try {
        const { data: realFeedbacks, error } = await supabase
          .from('feedbacks')
          .select('*')
          .eq('is_active', true)
          .order('display_order', { ascending: true });

        if (error) {
          console.warn('Erro ao carregar feedbacks do Supabase, usando dados mockados:', error);
          setFeedbacks(mockFeedbacks);
        } else if (realFeedbacks && realFeedbacks.length > 0) {
          // Se há feedbacks reais, usar apenas eles
          setFeedbacks(realFeedbacks);
        } else {
          // Se não há feedbacks reais, usar dados mockados
          setFeedbacks(mockFeedbacks);
        }
      } catch (error) {
        console.warn('Erro ao conectar com Supabase, usando dados mockados:', error);
        setFeedbacks(mockFeedbacks);
      } finally {
        setLoading(false);
      }
    };

    loadFeedbacks();
  }, []);

  if (loading) {
    return (
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 font-title">
              Feedbacks dos Clientes
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto font-text">
              Carregando depoimentos...
            </p>
          </div>
        </div>
      </section>
    );
  }

  if (feedbacks.length === 0) {
    return (
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 font-title">
              Feedbacks dos Clientes
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto font-text">
              Em breve teremos depoimentos de nossos clientes!
            </p>
          </div>
        </div>
      </section>
    );
  }

  // Garante que temos um número mínimo de feedbacks para preencher a tela inteira
  // antes de aplicar o efeito de loop, evitando espaços vazios no final da animação.
  let baseFeedbacks = [...feedbacks];
  while (baseFeedbacks.length > 0 && baseFeedbacks.length < 10) {
    baseFeedbacks = [...baseFeedbacks, ...feedbacks];
  }

  // Duplicar o set base 4 vezes. Como o CSS movimenta em -25% (1/4 do tamanho total),
  // a animação volta para o início exatamente quando o segundo set assume a posição do primeiro,
  // criando um loop perfeito e invisível ao olho humano.
  const extendedFeedbacks = [...baseFeedbacks, ...baseFeedbacks, ...baseFeedbacks, ...baseFeedbacks];

  return (
    <section className="py-16 lg:py-24 overflow-hidden relative" style={{ backgroundColor: '#fdf8f6' }}>
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center p-2 bg-rose-100 rounded-full mb-4">
            <Star className="w-5 h-5 text-rose-primary fill-rose-primary" />
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-brown-900 mb-4 font-title">
            O que dizem nossos clientes
          </h2>
          <p className="text-lg text-brown-600 max-w-2xl mx-auto font-text">
            A satisfação de quem prova nossos doces é o nosso maior orgulho.
            Confira algumas experiências!
          </p>
        </div>
      </div>

      <div className="relative w-full overflow-hidden flex flex-col items-center">
        {/* Gradientes transparentes nas laterais para esconder a entrada/saída dos cards */}
        <div className="hidden md:block absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-[#fdf8f6] to-transparent z-10 pointer-events-none"></div>
        <div className="hidden md:block absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-[#fdf8f6] to-transparent z-10 pointer-events-none"></div>

        {/* Container da animação Marquee */}
        <div className="flex w-max hover:[animation-play-state:paused] animate-marquee">
          {extendedFeedbacks.map((feedback, index) => (
            <div
              key={`${feedback.id}-${index}`}
              className="px-4 md:px-6 w-[300px] md:w-[360px] flex-shrink-0"
            >
              <Card className="h-full overflow-hidden rounded-3xl border-0 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 bg-white group">
                <CardContent className="p-0 h-full flex flex-col">
                  {feedback.image_url ? (
                    // Feedback com imagem
                    <div className="relative h-full flex flex-col">
                      <div className="relative h-[420px] md:h-[460px] w-full overflow-hidden bg-rose-50/50">
                        <img
                          src={feedback.image_url}
                          alt={`Feedback de ${feedback.customer_name}`}
                          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                          loading={index < 3 ? "eager" : "lazy"}
                          decoding="async"
                        />
                        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none"></div>
                      </div>

                      <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 flex flex-col justify-end">
                        <Quote className="w-8 h-8 text-white/30 mb-3" />
                        <p className="text-white/95 text-sm md:text-base line-clamp-4 mb-5 font-text font-medium leading-relaxed drop-shadow-md">
                          "{feedback.feedback_text}"
                        </p>
                        <div className="flex items-center justify-between mt-auto">
                          <span className="text-white font-bold text-base md:text-lg drop-shadow-md">
                            {feedback.customer_name}
                          </span>
                          <div className="flex gap-0.5">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    // Feedback apenas texto
                    <div className="p-8 h-[420px] md:h-[460px] flex flex-col bg-white">
                      <div className="flex-grow">
                        <Quote className="w-10 h-10 text-rose-primary/20 mb-6" />
                        <p className="text-brown-700 text-base md:text-lg leading-relaxed mb-6 font-text italic">
                          "{feedback.feedback_text}"
                        </p>
                      </div>

                      <div className="flex items-center justify-between mt-auto pt-6 border-t border-rose-50">
                        <div>
                          <p className="font-bold text-brown-900 text-base md:text-lg">
                            {feedback.customer_name}
                          </p>
                          <p className="text-brown-500 text-sm mt-0.5 font-text">Cliente verificado</p>
                        </div>
                        <div className="flex gap-0.5">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}