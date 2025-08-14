import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Eye, BookOpen, Users, Zap, Shield, Sword } from 'lucide-react';

const AboutPage = () => {
  return (
    <div className="min-h-screen py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-gradient">
            Sobre a Obra
          </h1>
          <p className="text-xl text-muted-foreground">
            Conheça o universo épico de "O Terceiro Olho"
          </p>
        </div>

        {/* Sinopse */}
        <Card className="mb-12 chapter-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BookOpen className="h-6 w-6 text-primary" />
              <span>Sinopse</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="prose-fantasy">
            <p>
              Em um mundo onde o poder se manifesta de formas misteriosas, Lucian é uma anomalia. 
              Nascido com olhos de cores diferentes - um azul como o céu, outro castanho como a terra - 
              ele carrega dentro de si um potencial nunca antes visto.
            </p>
            <p>
              Criado na pacata vila de Millhaven por sua mãe Lyra, uma mulher de passado enigmático, 
              Lucian sempre se sentiu diferente. Mas quando seus dons finalmente despertam, ele descobre 
              que é portador de habilidades que podem tanto nutrir quanto desfazer.
            </p>
            <p>
              Esta descoberta não apenas mudará sua vida, mas abalará os fundamentos de um mundo dividido 
              entre facções que há séculos mantêm um equilíbrio precário. Lucian deve 
              aprender a controlar seus dons únicos enquanto navega por um mundo que o vê como uma 
              ameaça ou como a chave para um futuro incerto.
            </p>
          </CardContent>
        </Card>

        {/* Estrutura da Trilogia */}
        <Card className="mb-12 chapter-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Eye className="h-6 w-6 text-secondary" />
              <span>Estrutura da Trilogia</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Sword className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Livro 1</h3>
                <h4 className="font-medium text-primary mb-2">O Despertar das Marcas</h4>
                <p className="text-sm text-muted-foreground">
                  Lucian descobre seus dons e inicia sua jornada de autodescoberta.
                </p>
                <Badge variant="secondary" className="mt-2">Em Desenvolvimento</Badge>
              </div>
              
              <div className="text-center">
                <div className="h-16 w-16 rounded-full bg-secondary/10 flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-8 w-8 text-secondary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Livro 2</h3>
                <h4 className="font-medium text-secondary mb-2">A Revelação da Luz</h4>
                <p className="text-sm text-muted-foreground">
                  A compreensão do verdadeiro equilíbrio.
                </p>
                <Badge variant="outline" className="mt-2">Planejado</Badge>
              </div>
              
              <div className="text-center">
                <div className="h-16 w-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
                  <Eye className="h-8 w-8 text-accent" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Livro 3</h3>
                <h4 className="font-medium text-accent mb-2">O Terceiro Olho</h4>
                <p className="text-sm text-muted-foreground">
                  A manifestação final do poder e a batalha pelo destino do mundo.
                </p>
                <Badge variant="outline" className="mt-2">Planejado</Badge>
              </div>
            </div>
          </CardContent>
        </Card>



        {/* Mundo */}
        <Card className="chapter-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-6 w-6 text-primary" />
              <span>O Mundo de Millhaven</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="prose-fantasy">
            <p>
              A história se passa em um mundo rico e complexo, onde diferentes reinos e facções 
              mágicas coexistem em equilíbrio precário. Millhaven, a vila natal de Lucian, 
              representa a simplicidade e a paz que contrastam com os grandes centros de poder.
            </p>
            <div className="grid md:grid-cols-2 gap-6 mt-6">
              <div>
                <h4 className="font-semibold text-primary mb-2">Locais Importantes</h4>
                <ul className="text-sm space-y-1">
                  <li>• <strong>Millhaven:</strong> Vila pacata onde Lucian cresceu</li>
                  <li>• <strong>Aethelgard:</strong> Capital dos magos da Mão Direita</li>
                  <li>• <strong>Montanhas Sombrias:</strong> Refúgio dos magos da Mão Esquerda</li>
                  <li>• <strong>Greenhold:</strong> Reino central neutro</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-secondary mb-2">Características</h4>
                <ul className="text-sm space-y-1">
                  <li>• Sistema político complexo</li>
                  <li>• Magia baseada em dualidade</li>
                  <li>• Conflitos ancestrais</li>
                  <li>• Profecias e mistérios antigos</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AboutPage;

