import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, BookOpen, Sparkles, ArrowRight } from 'lucide-react';

const HomePage = ({ setCurrentPage }) => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 px-4 hero-gradient text-white">
        <div className="absolute inset-0 bg-black/20" />
        <div className="container mx-auto text-center relative z-10">
          <div className="flex justify-center mb-6">
            <div className="relative mystical-glow">
              <Eye className="h-20 w-20 text-white" />
              <div className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-accent animate-pulse" />
            </div>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            A Saga de Lucian
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-white/90">
            Uma Jornada Épica de Fantasia
          </p>
          <p className="text-lg mb-12 max-w-3xl mx-auto text-white/80">
            Acompanhe a jornada de Lucian, um jovem com olhos de cores diferentes que descobre 
            um destino extraordinário capaz de mudar o mundo. Uma história de mistério, 
            descoberta e a eterna luta entre forças opostas.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              variant="secondary"
              onClick={() => setCurrentPage('chapters')}
              className="flex items-center space-x-2"
            >
              <BookOpen className="h-5 w-5" />
              <span>Começar a Ler</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => setCurrentPage('about')}
              className="bg-white/10 border-white/30 text-white hover:bg-white/20"
            >
              <Sparkles className="h-5 w-5 mr-2" />
              Sobre a Obra
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-background">
        <div className="container mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gradient">
            Uma Jornada Épica Aguarda
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="chapter-card transition-all duration-300">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Eye className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Um Destino Único</CardTitle>
                <CardDescription>
                  Descubra os mistérios do destino de Lucian, dividido entre forças opostas 
                  que moldarão o futuro do mundo.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="chapter-card transition-all duration-300">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-secondary/10 flex items-center justify-center mb-4">
                  <BookOpen className="h-6 w-6 text-secondary" />
                </div>
                <CardTitle>Mundo Rico</CardTitle>
                <CardDescription>
                  Explore o universo detalhado de Millhaven e além, com sua geografia, 
                  política e sistema mágico complexo.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="chapter-card transition-all duration-300">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                  <Sparkles className="h-6 w-6 text-accent" />
                </div>
                <CardTitle>Trilogia Épica</CardTitle>
                <CardDescription>
                  Uma saga completa em três volumes, cada um revelando novos aspectos 
                  dos poderes de Lucian e do destino do mundo.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 px-4 bg-muted/50">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6 text-gradient">
            Comece Sua Jornada Hoje
          </h2>
          <p className="text-lg mb-8 text-muted-foreground max-w-2xl mx-auto">
            Mergulhe nos primeiros capítulos e descubra o mundo de Lucian, onde cada escolha 
            pode determinar o equilíbrio entre luz e sombra.
          </p>
          <Button 
            size="lg"
            onClick={() => setCurrentPage('chapters')}
            className="flex items-center space-x-2 mx-auto"
          >
            <BookOpen className="h-5 w-5" />
            <span>Ler Capítulo 1, 2(ja disponíveis) e 3 (saindo do forno)</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </section>
    </div>
  );
};

export default HomePage;

