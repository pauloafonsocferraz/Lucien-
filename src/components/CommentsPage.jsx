import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Send, Star, User, Calendar, Heart } from 'lucide-react';

const CommentsPage = () => {
  const [comments, setComments] = useState([
    /*{
      id: 1,
      name: "Ana Silva",
      date: "2024-12-08",
      rating: 5,
      comment: "Que história incrível! A forma como Lucian lida com seus poderes únicos é fascinante. Mal posso esperar pelo próximo capítulo!",
      likes: 12
    },
    {
      id: 2,
      name: "Carlos Mendes",
      date: "2024-12-07",
      rating: 5,
      comment: "A construção do mundo é fantástica. O sistema de magia com a dualidade das Mãos é muito bem pensado. Parabéns ao autor!",
      likes: 8
    },
    {
      id: 3,
      name: "Mariana Costa",
      date: "2024-12-06",
      rating: 4,
      comment: "Adorei a representatividade do protagonista. É ótimo ver um herói brasileiro multirracial em fantasia épica. A história tem muito potencial!",
      likes: 15
    }*/
  ])

  const [newComment, setNewComment] = useState({
    name: '',
    email: '',
    rating: 5,
    comment: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newComment.name && newComment.comment) {
      const comment = {
        id: comments.length + 1,
        name: newComment.name,
        date: new Date().toISOString().split('T')[0],
        rating: newComment.rating,
        comment: newComment.comment,
        likes: 0
      };
      setComments([comment, ...comments]);
      setNewComment({ name: '', email: '', rating: 5, comment: '' });
    }
  };

  const handleLike = (id) => {
    setComments(comments.map(comment => 
      comment.id === id 
        ? { ...comment, likes: comment.likes + 1 }
        : comment
    ));
  };

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-gradient">
            Comentários
          </h1>
          <p className="text-xl text-muted-foreground">
            Compartilhe seus pensamentos e nos ajude a criar um lugar especial
          </p>
        </div>

        {/* Estatísticas */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card className="chapter-card text-center">
            <CardContent className="p-6">
              <div className="text-3xl font-bold text-primary mb-2">{comments.length}</div>
              <div className="text-sm text-muted-foreground">Comentários</div>
            </CardContent>
          </Card>
          
          <Card className="chapter-card text-center">
            <CardContent className="p-6">
              <div className="text-3xl font-bold text-accent mb-2">
                {(comments.reduce((acc, c) => acc + c.rating, 0) / comments.length).toFixed(1)}
              </div>
              <div className="text-sm text-muted-foreground">Avaliação Média</div>
            </CardContent>
          </Card>
          
          <Card className="chapter-card text-center">
            <CardContent className="p-6">
              <div className="text-3xl font-bold text-secondary mb-2">
                {comments.reduce((acc, c) => acc + c.likes, 0)}
              </div>
              <div className="text-sm text-muted-foreground">Curtidas</div>
            </CardContent>
          </Card>
        </div>

        {/* Formulário de Novo Comentário */}
        <Card className="mb-12 chapter-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MessageCircle className="h-6 w-6 text-primary" />
              <span>Deixe seu Comentário</span>
            </CardTitle>
            <CardDescription>
              Compartilhe sua opinião sobre a saga e ajude outros leitores
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Nome *</label>
                  <Input
                    value={newComment.name}
                    onChange={(e) => setNewComment({...newComment, name: e.target.value})}
                    placeholder="Seu nome"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Email (opcional)</label>
                  <Input
                    type="email"
                    value={newComment.email}
                    onChange={(e) => setNewComment({...newComment, email: e.target.value})}
                    placeholder="seu@email.com"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Avaliação</label>
                <div className="flex space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setNewComment({...newComment, rating: star})}
                      className={`p-1 ${star <= newComment.rating ? 'text-accent' : 'text-muted-foreground'}`}
                    >
                      <Star className={`h-6 w-6 ${star <= newComment.rating ? 'fill-current' : ''}`} />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Comentário *</label>
                <Textarea
                  value={newComment.comment}
                  onChange={(e) => setNewComment({...newComment, comment: e.target.value})}
                  placeholder="Compartilhe seus pensamentos sobre a história, personagens, mundo..."
                  rows={4}
                  required
                />
              </div>

              <Button type="submit" className="w-full">
                <Send className="h-4 w-4 mr-2" />
                Enviar Comentário
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Lista de Comentários */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gradient">
            Comentários dos Leitores
          </h2>
          
          {comments.map((comment) => (
            <Card key={comment.id} className="chapter-card">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="font-semibold">{comment.name}</div>
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(comment.date).toLocaleDateString('pt-BR')}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-4 w-4 ${
                          star <= comment.rating 
                            ? 'text-accent fill-current' 
                            : 'text-muted-foreground'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                
                <p className="text-foreground/90 mb-4 leading-relaxed">
                  {comment.comment}
                </p>
                
                <div className="flex items-center justify-between">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleLike(comment.id)}
                    className="text-muted-foreground hover:text-accent"
                  >
                    <Heart className="h-4 w-4 mr-1" />
                    {comment.likes}
                  </Button>
                  
                  <Badge variant="outline">
                    {comment.rating === 5 ? 'Excelente' : 
                     comment.rating === 4 ? 'Muito Bom' : 
                     comment.rating === 3 ? 'Bom' : 
                     comment.rating === 2 ? 'Regular' : 'Ruim'}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Call to Action */}
        <Card className="mt-12 chapter-card text-center">
          <CardContent className="p-8">
            <h3 className="text-2xl font-bold mb-4 text-gradient">
              Gostou da História?
            </h3>
            <p className="text-muted-foreground mb-6">
              Ajude outros leitores a descobrir "A Magia Plena" compartilhando 
              sua experiência e deixando sua avaliação!
            </p>
            <div className="flex justify-center space-x-1 mb-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} className="h-8 w-8 text-accent fill-current" />
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              Sua opinião é muito importante para o desenvolvimento da saga
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CommentsPage;

