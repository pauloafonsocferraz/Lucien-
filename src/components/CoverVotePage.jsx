import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Heart, MessageCircle, Share2, Vote } from 'lucide-react';

const CoverVotePage = () => {
  const [selectedCover, setSelectedCover] = useState(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [votes, setVotes] = useState({
    cover1: 45,
    cover2: 32,
    cover3: 23
  });

  const covers = [
    {
      id: 'cover1',
      title: 'Proposta 1 - Atmosfera Mística',
      image: '/capa_terceiro_olho_v1_prop1.png',
      description: 'Foco na atmosfera sombria e misteriosa, destacando o poder da Mão Esquerda e a dualidade dos olhos de Lucian.',
      votes: votes.cover1
    },
    {
      id: 'cover2', 
      title: 'Proposta 2 - Aventura Épica',
      image: '/capa_terceiro_olho_v1_prop2.png',
      description: 'Estilo mais aventureiro com cenário dinâmico, ruínas antigas e uma atmosfera de descoberta.',
      votes: votes.cover2
    },
    {
      id: 'cover3',
      title: 'Proposta 3 - Versão Refinada',
      image: '/capa_terceiro_olho_v2_prop1.png',
      description: 'Versão aprimorada com ambiente mais claro, olho direito azul e marca na palma da mão.',
      votes: votes.cover3
    }
  ];

  const totalVotes = Object.values(votes).reduce((sum, count) => sum + count, 0);

  const handleVote = (coverId) => {
    if (hasVoted) return;
    
    setVotes(prev => ({
      ...prev,
      [coverId]: prev[coverId] + 1
    }));
    setSelectedCover(coverId);
    setHasVoted(true);
  };

  const getPercentage = (voteCount) => {
    return totalVotes > 0 ? Math.round((voteCount / totalVotes) * 100) : 0;
  };

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center space-x-2 mb-4">
            <Vote className="h-8 w-8 text-primary" />
            <h1 className="text-4xl md:text-5xl font-bold text-gradient">
              Escolha a Capa
            </h1>
          </div>
          <p className="text-xl text-muted-foreground mb-6">
            Ajude-nos a escolher a capa perfeita para "Magia Plena: O Despertar das Marcas"
          </p>
          <div className="flex items-center justify-center space-x-6 text-sm text-muted-foreground">
            <div className="flex items-center space-x-2">
              <Heart className="h-4 w-4" />
              <span>{totalVotes} votos</span>
            </div>
            <div className="flex items-center space-x-2">
              <MessageCircle className="h-4 w-4" />
              <span>Deixe seu comentário</span>
            </div>
          </div>
        </div>

        {/* Voting Status */}
        {hasVoted && (
          <div className="mb-8 text-center">
            <Badge variant="secondary" className="text-lg px-4 py-2">
              ✓ Obrigado pelo seu voto!
            </Badge>
            <p className="text-muted-foreground mt-2">
              Você votou na {covers.find(c => c.id === selectedCover)?.title}
            </p>
          </div>
        )}

        {/* Cover Options */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {covers.map((cover) => (
            <Card 
              key={cover.id}
              className={`chapter-card cursor-pointer transition-all duration-300 ${
                selectedCover === cover.id ? 'ring-2 ring-primary' : ''
              } ${hasVoted && selectedCover !== cover.id ? 'opacity-60' : ''}`}
              onClick={() => !hasVoted && handleVote(cover.id)}
            >
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="outline">{cover.title.split(' - ')[0]}</Badge>
                  {hasVoted && (
                    <Badge variant={selectedCover === cover.id ? 'default' : 'secondary'}>
                      {getPercentage(cover.votes)}%
                    </Badge>
                  )}
                </div>
                <CardTitle className="text-lg">{cover.title.split(' - ')[1]}</CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Cover Image */}
                <div className="relative">
                  <img 
                    src={cover.image}
                    alt={cover.title}
                    className="w-full h-auto rounded-lg shadow-lg"
                  />
                  {selectedCover === cover.id && hasVoted && (
                    <div className="absolute inset-0 bg-primary/20 rounded-lg flex items-center justify-center">
                      <div className="bg-primary text-primary-foreground rounded-full p-3">
                        <Heart className="h-6 w-6 fill-current" />
                      </div>
                    </div>
                  )}
                </div>

                {/* Description */}
                <CardDescription className="text-sm">
                  {cover.description}
                </CardDescription>

                {/* Vote Progress */}
                {hasVoted && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Votos: {cover.votes}</span>
                      <span>{getPercentage(cover.votes)}%</span>
                    </div>
                    <Progress value={getPercentage(cover.votes)} className="h-2" />
                  </div>
                )}

                {/* Vote Button */}
                {!hasVoted && (
                  <Button 
                    className="w-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleVote(cover.id);
                    }}
                  >
                    <Vote className="h-4 w-4 mr-2" />
                    Votar nesta Capa
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Results Summary */}
        {hasVoted && (
          <Card className="chapter-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Vote className="h-5 w-5" />
                <span>Resultados da Votação</span>
              </CardTitle>
              <CardDescription>
                Resultados atualizados em tempo real • Total de {totalVotes} votos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {covers
                .sort((a, b) => b.votes - a.votes)
                .map((cover, index) => (
                  <div key={cover.id} className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <Badge variant={index === 0 ? 'default' : 'secondary'}>
                        #{index + 1}
                      </Badge>
                    </div>
                    <div className="flex-grow">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-medium">{cover.title}</span>
                        <span className="text-sm text-muted-foreground">
                          {cover.votes} votos ({getPercentage(cover.votes)}%)
                        </span>
                      </div>
                      <Progress value={getPercentage(cover.votes)} className="h-2" />
                    </div>
                  </div>
                ))}
            </CardContent>
          </Card>
        )}

        {/* Comments Section */}
        <div className="mt-12">
          <Card className="chapter-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MessageCircle className="h-5 w-5" />
                <span>Comentários e Sugestões</span>
              </CardTitle>
              <CardDescription>
                Compartilhe sua opinião sobre as capas ou deixe sugestões
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <textarea 
                  className="w-full p-3 border rounded-lg resize-none"
                  rows="4"
                  placeholder="Deixe seu comentário sobre as capas ou sugestões para melhorias..."
                />
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-4">
                    <Button variant="ghost" size="sm">
                      <Share2 className="h-4 w-4 mr-2" />
                      Compartilhar
                    </Button>
                  </div>
                  <Button>
                    Enviar Comentário
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CoverVotePage;

