import { Eye, BookOpen, Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Logo e Descrição */}
          <div className="md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="relative">
                <Eye className="h-8 w-8 text-primary" />
                <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-accent animate-pulse" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gradient">A Saga de Lucian</h3>
                <p className="text-xs text-muted-foreground">Jornada Épica de Fantasia</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-4 max-w-md">
              Acompanhe a jornada épica de Lucian, um jovem com um destino extraordinário que pode 
              mudar o mundo. Uma história de mistério, descoberta e equilíbrio.
            </p>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Heart className="h-4 w-4 text-accent" />
              <span>Feito com paixão para leitores de fantasia épica</span>
            </div>
          </div>

          {/* Links Rápidos */}
          <div>
            <h4 className="font-semibold mb-4 text-foreground">Navegação</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-primary transition-colors">Início</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Sobre a Obra</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Capítulos</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Sobre o Autor</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Comentários</a></li>
            </ul>
          </div>

          {/* Informações */}
          <div>
            <h4 className="font-semibold mb-4 text-foreground">A Saga</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center space-x-2">
                <BookOpen className="h-4 w-4" />
                <span>Livro 1: Em Desenvolvimento</span>
              </li>
              <li className="flex items-center space-x-2">
                <BookOpen className="h-4 w-4" />
                <span>Livro 2: Planejado</span>
              </li>
              <li className="flex items-center space-x-2">
                <BookOpen className="h-4 w-4" />
                <span>Livro 3: Planejado</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Linha de Separação */}
        <div className="border-t mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-sm text-muted-foreground">
              © 2025 A Saga de Lucian. Todos os direitos reservados.
            </div>
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <span>Versão 1.2</span>
              <span>•</span>
              <span>Atualizado em Agosto 2025</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

