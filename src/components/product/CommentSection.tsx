import { useState, useEffect, useCallback, forwardRef, useRef } from 'react';
import { useAuth } from '@/core/application/hooks/useAuth';
import { container } from '@/core/infrastructure/container';
import { ManageCommentUseCase } from '@/core/application/use-cases/ManageCommentUseCase';
import { Comment } from '@/core/domain/entities/Comment';
import { Button } from '@/components/ui/data-display/button';
import { Textarea } from '@/components/ui/forms/textarea';
import { Input } from '@/components/ui/forms/input';
import { useToast } from '@/hooks/ui/use-toast';
import { Card, CardContent } from '@/components/ui/data-display/card';
import { Instagram, User, Star } from 'lucide-react';

// Use Case instanciado via container (IoC)
const commentUseCase = new ManageCommentUseCase(container.getCommentRepository());

interface CommentSectionProps {
  productId: string;
}

export const CommentSection = forwardRef<HTMLDivElement, CommentSectionProps>(({ productId }, ref) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [instagramHandle, setInstagramHandle] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedRating, setSelectedRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalComments, setTotalComments] = useState(0);
  const commentsPerPage = 5;
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user?.user_metadata.username) {
      setAuthorName(user.user_metadata.username);
    }
  }, [user]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasLoadedOnce) {
          setIsVisible(true);
          setHasLoadedOnce(true);
        }
      },
      { threshold: 0.1, rootMargin: '100px' }
    );
    const currentRef = sectionRef.current;
    if (currentRef) observer.observe(currentRef);
    return () => { if (currentRef) observer.unobserve(currentRef); };
  }, [hasLoadedOnce]);

  const fetchComments = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const { comments: data, total } = await commentUseCase.getByProductId(productId, page, commentsPerPage);
      setTotalComments(total);
      if (page === 1) {
        setComments(data);
      } else {
        setComments(prev => [...prev, ...data]);
      }
    } catch (error) {
      console.error('Erro ao carregar comentários:', error);
      toast({ variant: 'destructive', title: 'Erro ao carregar comentários.' });
    } finally {
      setLoading(false);
    }
  }, [productId, toast]);

  useEffect(() => {
    if (isVisible) fetchComments();
  }, [isVisible]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmitComment = async () => {
    if (newComment.trim() === '') {
      toast({ title: 'Por favor, escreva um comentário.' });
      return;
    }
    if (!user && authorName.trim() === '') {
      toast({ title: 'Por favor, insira seu nome.' });
      return;
    }
    setLoading(true);
    try {
      await commentUseCase.create({
        product_id: productId,
        comment: newComment,
        author_name: authorName,
        instagram_handle: instagramHandle,
        image_url: null,
        rating: selectedRating,
      });
      setNewComment('');
      setInstagramHandle('');
      setSelectedRating(5);
      if (!user) setAuthorName('');
      toast({ title: 'Comentário enviado!', description: 'Seu comentário está aguardando aprovação.' });
      setCurrentPage(1);
      fetchComments(1);
    } catch (error) {
      console.error('Erro ao enviar comentário:', error);
      toast({ variant: 'destructive', title: 'Erro ao enviar comentário.' });
    } finally {
      setLoading(false);
    }
  };

  const loadMoreComments = () => {
    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);
    fetchComments(nextPage);
  };

  const hasMoreComments = comments.length < totalComments;

  return (
    <div ref={ref} className="space-y-6">
      <div ref={sectionRef}>
        <h3 className="text-xl font-bold font-title">Comentários e Avaliações</h3>
      </div>

      {!isVisible ? (
        <div className="text-center py-8">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-48 mx-auto mb-4"></div>
            <div className="h-3 bg-gray-200 rounded w-32 mx-auto"></div>
          </div>
        </div>
      ) : (
        <>
          <Card>
            <CardContent className="p-4">
              <div className="space-y-4">
                <Textarea
                  placeholder="Deixe seu comentário..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  disabled={loading}
                  className="bg-white"
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {!user && (
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Seu nome"
                        value={authorName}
                        onChange={(e) => setAuthorName(e.target.value)}
                        disabled={loading}
                        className="pl-10 bg-white"
                      />
                    </div>
                  )}
                  <div className="relative">
                    <Instagram className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <div className="absolute left-10 top-1/2 -translate-y-1/2 text-muted-foreground text-sm pointer-events-none">@</div>
                    <Input
                      placeholder="seu_instagram"
                      value={instagramHandle}
                      onChange={(e) => setInstagramHandle(e.target.value.replace(/@/g, ''))}
                      disabled={loading}
                      className="pl-14 bg-white"
                    />
                  </div>
                  <div className="relative md:col-span-2">
                    <label className="block text-sm font-medium text-muted-foreground mb-1">Sua avaliação (estrelas):</label>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, index) => {
                        const ratingValue = index + 1;
                        return (
                          <Star
                            key={ratingValue}
                            className={`cursor-pointer h-6 w-6 transition-colors duration-200 ${ratingValue <= (hoverRating || selectedRating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                            onClick={() => setSelectedRating(ratingValue)}
                            onMouseEnter={() => setHoverRating(ratingValue)}
                            onMouseLeave={() => setHoverRating(0)}
                          />
                        );
                      })}
                      {selectedRating > 0 && (
                        <span className="ml-2 text-sm font-semibold text-yellow-600">
                          {selectedRating} Estrela{selectedRating > 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <Button onClick={handleSubmitComment} disabled={loading} className="w-full">
                  {loading ? 'Enviando...' : 'Enviar Comentário'}
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            {comments.map((comment) => (
              <Card key={comment.id}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      {comment.instagram_handle && (
                        <a href={`https://instagram.com/${comment.instagram_handle}`} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-pink-600 hover:text-pink-700 hover:underline">
                          @{comment.instagram_handle}
                        </a>
                      )}
                      {comment.author_name && !comment.instagram_handle && (
                        <span className="text-sm font-medium text-gray-700">{comment.author_name}</span>
                      )}
                      <div className="flex">
                        {[...Array(comment.rating)].map((_, i) => (
                          <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        ))}
                        {[...Array(5 - comment.rating)].map((_, i) => (
                          <Star key={i + comment.rating} className="h-4 w-4 text-gray-300" />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {new Date(comment.created_at).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <p className="text-sm text-gray-800">{comment.comment}</p>
                </CardContent>
              </Card>
            ))}
            {comments.length === 0 && !loading && (
              <p className="text-sm text-muted-foreground">Nenhum comentário ainda. Seja o primeiro a comentar!</p>
            )}
            {hasMoreComments && comments.length > 0 && (
              <div className="text-center pt-4">
                <Button variant="outline" onClick={loadMoreComments} disabled={loading} className="w-full sm:w-auto">
                  {loading ? 'Carregando...' : `Carregar mais comentários (${totalComments - comments.length} restantes)`}
                </Button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
});