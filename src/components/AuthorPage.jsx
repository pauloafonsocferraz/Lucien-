import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { User, BookOpen, Pen, Heart, Mail, MessageCircle } from 'lucide-react';

const AuthorPage = ({ setCurrentPage }) => {
  return (
    <div className="min-h-screen py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="h-24 w-24 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center mx-auto mb-6">
            <User className="h-12 w-12 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gradient">
            Sobre o Autor
          </h1>
          <p className="text-xl text-muted-foreground">
            Criador do universo de "O Terceiro Olho"
          </p>
        </div>

        {/* Biografia */}
        <Card className="mb-12 chapter-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Pen className="h-6 w-6 text-primary" />
              <span>Jornada Literária</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="prose-fantasy">
            <p>
              Bem-vindos ao meu universo literário! Sou um escritor apaixonado por fantasia épica, 
              inspirado pelos grandes mestres do gênero como Raymond E. Feist, Brandon Sanderson e Robert Jordan. 
              Minha jornada na escrita começou com uma simples pergunta: "E se alguém pudesse possuir 
              poderes opostos em um mundo dividido entre criação e destruição?"
            </p>
            <p>
              Essa pergunta deu origem a Lucian, um jovem brasileiro multirracial com olhos de cores 
              diferentes, que se tornou o protagonista de "O Terceiro Olho". Através de sua história, 
              exploro temas universais como identidade, pertencimento, o peso das escolhas e o 
              equilíbrio entre luz e sombra que existe em todos nós.
            </p>
            <p>
              Como escritor brasileiro, busco trazer diversidade e representatividade para o gênero 
              fantasia épica, criando personagens e mundos que reflitam a riqueza cultural do nosso país 
              e do mundo. Acredito que a fantasia é uma ferramenta poderosa para explorar questões 
              profundas da condição humana através de metáforas mágicas e aventuras épicas.
            </p>
          </CardContent>
        </Card>

        {/* Processo Criativo */}
        <Card className="mb-12 chapter-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BookOpen className="h-6 w-6 text-secondary" />
              <span>Processo Criativo</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold mb-4 text-primary">Inspirações</h3>
                <ul className="space-y-2 text-sm">
                  <li>• <strong>Literatura:</strong> Raymond E. Feist, Brandon Sanderson, Robert Jordan</li>
                  <li>• <strong>Mitologia:</strong> Tradições brasileiras e mundiais</li>
                  <li>• <strong>Filosofia:</strong> Dualidade, equilíbrio e transformação</li>
                  <li>• <strong>Cultura:</strong> Diversidade brasileira e multiculturalismo</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-4 text-secondary">Metodologia</h3>
                <ul className="space-y-2 text-sm">
                  <li>• <strong>World-building:</strong> Construção detalhada do universo</li>
                  <li>• <strong>Personagens:</strong> Desenvolvimento psicológico profundo</li>
                  <li>• <strong>Magia:</strong> Sistemas com custos e consequências</li>
                  <li>• <strong>Narrativa:</strong> Foco na jornada emocional do protagonista</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Visão da Obra */}
        <Card className="mb-12 chapter-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Heart className="h-6 w-6 text-accent" />
              <span>Visão da Obra</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="prose-fantasy">
            <p>
              "O Terceiro Olho" é mais do que uma saga de fantasia épica - é uma reflexão sobre 
              identidade, aceitação e o poder das escolhas. Através de Lucian, exploro as 
              dificuldades de crescer sendo diferente, a busca por pertencimento e a descoberta 
              de que nossa maior força pode vir justamente daquilo que nos torna únicos.
            </p>
            <p>
              A dualidade entre a Mão Direita e a Mão Esquerda representa os conflitos internos 
              que todos enfrentamos: a capacidade de criar e destruir, de curar e ferir, de 
              escolher entre a luz e a sombra. Lucian, como portador de ambos os poderes, 
              simboliza a possibilidade de transcender essas divisões e encontrar um equilíbrio 
              mais profundo.
            </p>
            <div className="bg-muted/50 p-6 rounded-lg mt-6">
              <h4 className="font-semibold text-accent mb-3">Mensagem Central</h4>
              <p className="text-sm italic">
                "Não somos definidos pelos poderes que possuímos, mas pelas escolhas que fazemos 
                com eles. A verdadeira magia está em encontrar equilíbrio entre nossas forças 
                opostas e usar essa dualidade para criar algo maior do que a soma de suas partes."
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Projetos Futuros */}
        <Card className="mb-12 chapter-card">
          <CardHeader>
            <CardTitle>Projetos Futuros</CardTitle>
            <CardDescription>
              O que está por vir no universo de "O Terceiro Olho"
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Badge variant="secondary">Em Desenvolvimento</Badge>
                <span className="font-medium">Capítulos adicionais do Livro 1</span>
              </div>
              <div className="flex items-center space-x-3">
                <Badge variant="outline">Planejado</Badge>
                <span className="font-medium">Livro 2: A Revelação da Luz</span>
              </div>
              <div className="flex items-center space-x-3">
                <Badge variant="outline">Planejado</Badge>
                <span className="font-medium">Livro 3: O Terceiro Olho</span>
              </div>
              <div className="flex items-center space-x-3">
                <Badge variant="outline">Futuro</Badge>
                <span className="font-medium">Contos paralelos do universo</span>
              </div>
              <div className="flex items-center space-x-3">
                <Badge variant="outline">Futuro</Badge>
                <span className="font-medium">Guia oficial do mundo</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Call to Action */}
        <Card className="chapter-card text-center">
          <CardContent className="p-8">
            <h3 className="text-2xl font-bold mb-4 text-gradient">
              Conecte-se Comigo
            </h3>
            <p className="text-muted-foreground mb-6">
              Gostaria de saber mais sobre a obra ou compartilhar seus pensamentos? 
              Adoraria ouvir de você!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={() => setCurrentPage('comments')}
                className="flex items-center space-x-2"
              >
                <MessageCircle className="h-4 w-4" />
                <span>Deixar Comentário</span>
              </Button>
              <Button 
                variant="outline"
                onClick={() => window.open('mailto:contato@terceiroolho.com', '_blank')}
              >
                <Mail className="h-4 w-4 mr-2" />
                Enviar Email
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AuthorPage;

