import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, BookOpen, Clock, Eye } from 'lucide-react';
import { chapters, getChapterById } from '@/data/chapters';

const ChaptersPage = () => {
  const [selectedChapter, setSelectedChapter] = useState(null);

  if (selectedChapter) {
    return <ChapterReader chapter={selectedChapter} onBack={() => setSelectedChapter(null)} />;
  }

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-gradient">
            Capítulos
          </h1>
          <p className="text-xl text-muted-foreground">
            Acompanhe a jornada épica de Lucian
          </p>
        </div>

        {/* Books Section */}
        <div className="space-y-12">
          {/* Livro 1 */}
          <div>
            <div className="flex items-center space-x-3 mb-6">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-primary">Livro 1</h2>
                <p className="text-lg text-muted-foreground">O Despertar das Marcas</p>
              </div>
              <Badge variant="secondary">Em Desenvolvimento</Badge>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {chapters.filter(ch => ch.book === 1).map((chapter) => (
                <Card 
                  key={chapter.id} 
                  className="chapter-card cursor-pointer transition-all duration-300"
                  onClick={() => setSelectedChapter(chapter)}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="outline">Capítulo {chapter.id}</Badge>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Clock className="h-4 w-4 mr-1" />
                        ~25 min
                      </div>
                    </div>
                    <CardTitle className="text-lg">{chapter.title}</CardTitle>
                    <CardDescription className="line-clamp-3">
                      {chapter.summary}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="ghost" className="w-full justify-start">
                      <BookOpen className="h-4 w-4 mr-2" />
                      Ler Capítulo
                    </Button>
                  </CardContent>
                </Card>
              ))}

              <Card className="chapter-card opacity-60">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline">Capítulo 4</Badge>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="h-4 w-4 mr-1" />
                      Em breve
                    </div>
                  </div>
                  <CardTitle className="text-lg">Intrigas</CardTitle>
                  <CardDescription>
                     Descubra as cortes e Magos da mão
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="ghost" className="w-full justify-start" disabled>
                    <Eye className="h-4 w-4 mr-2" />
                    Em Desenvolvimento
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Livros Futuros */}
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="chapter-card opacity-60">
              <CardHeader>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="h-10 w-10 rounded-lg bg-secondary/10 flex items-center justify-center">
                    <BookOpen className="h-5 w-5 text-secondary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-secondary">Livro 2</h3>
                    <p className="text-muted-foreground">A Revelação da Luz</p>
                  </div>
                </div>
                <CardDescription>
                  A compreensão do verdadeiro equilíbrio entre forças opostas 
                  e a jornada de Lucian para dominar seu destino.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Badge variant="outline">Planejado</Badge>
              </CardContent>
            </Card>

            <Card className="chapter-card opacity-60">
              <CardHeader>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center">
                    <Eye className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-accent">Livro 3</h3>
                    <p className="text-muted-foreground">O Terceiro Olho</p>
                  </div>
                </div>
                <CardDescription>
                  A revelação final e a batalha decisiva pelo 
                  destino do mundo entre forças opostas.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Badge variant="outline">Planejado</Badge>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

const ChapterReader = ({ chapter, onBack }) => {
  return (
    <div className="min-h-screen py-8 px-4">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={onBack}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar aos Capítulos
          </Button>
          
          <div className="text-center">
            <Badge variant="outline" className="mb-2">
              Livro {chapter.book} • Capítulo {chapter.id}
            </Badge>
            <h1 className="text-3xl md:text-4xl font-bold mb-2 text-gradient">
              {chapter.title}
            </h1>
            <p className="text-muted-foreground">
              {chapter.bookTitle}
            </p>
          </div>
        </div>

        {/* Book Cover - Only for Chapter 1 */}
        {chapter.id === 1 && (
          <div className="mb-8 text-center">
            <div className="inline-block relative">
              <img 
                src="/capa_terceiro_olho_v2_prop1.png" 
                alt="Capa do Livro - O Terceiro Olho: O Despertar das Marcas"
                className="max-w-sm w-full h-auto rounded-lg shadow-2xl mx-auto"
              />
              <div className="absolute inset-0 rounded-lg bg-gradient-to-t from-black/20 to-transparent"></div>
            </div>
            <p className="text-sm text-muted-foreground mt-4 italic">
              O Terceiro Olho: O Despertar das Marcas
            </p>
          </div>
        )}

        {/* Content */}
        <Card className="chapter-card">
          <CardContent className="p-8">
            <div className="prose-fantasy max-w-none">
              {chapter.content.split('\n\n').map((paragraph, index) => {
                if (paragraph.startsWith('###')) {
                  return (
                    <h1 key={index} className="text-center mb-8">
                      {paragraph.replace('### ', '').replace('**', '').replace('**', '')}
                    </h1>
                  );
                }
                if (paragraph.startsWith('**') && paragraph.endsWith('**')) {
                  return (
                    <h2 key={index} className="text-center mb-6">
                      {paragraph.replace('**', '').replace('**', '')}
                    </h2>
                  );
                }
                if (paragraph === '***') {
                  return (
                    <div key={index} className="text-center my-8">
                      <div className="inline-flex items-center space-x-2">
                        <div className="h-1 w-8 bg-accent"></div>
                        <Eye className="h-6 w-6 text-accent" />
                        <div className="h-1 w-8 bg-accent"></div>
                      </div>
                    </div>
                  );
                }
                return (
                  <p key={index} className="mb-4 text-justify leading-relaxed">
                    {paragraph}
                  </p>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="mt-8 flex justify-between">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar aos Capítulos
          </Button>
          
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Próximo capítulo em desenvolvimento
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChaptersPage;
