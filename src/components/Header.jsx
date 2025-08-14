import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Menu, X, Eye, BookOpen, User, MessageCircle, Vote, Newspaper } from 'lucide-react';

const Header = ({ currentPage, setCurrentPage }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navigation = [
    { name: 'Início', id: 'home', icon: Eye },
    { name: 'Sobre a Obra', id: 'about', icon: BookOpen },
    { name: 'Capítulos', id: 'chapters', icon: BookOpen },
    { name: 'Escolha a Capa', id: 'cover-vote', icon: Vote },
    { name: 'Sobre o Autor', id: 'author', icon: User },
    { name: 'Comentários', id: 'comments', icon: MessageCircle },
    { name: 'Notícias', id: 'news', icon: Newspaper }, // 📰 NOVA OPÇÃO ADICIONADA
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div
            className="flex items-center space-x-2 cursor-pointer"
            onClick={() => setCurrentPage('home')}
          >
            <div className="relative">
              <Eye className="h-8 w-8 text-primary" />
              <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-accent animate-pulse" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gradient">A Saga de Lucian</h1>
              <p className="text-xs text-muted-foreground">Jornada Épica de Fantasia</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Button
                  key={item.id}
                  variant={currentPage === item.id ? "default" : "ghost"}
                  onClick={() => {
                    console.log('🔥 Clicou em:', item.name, '| ID:', item.id);
                    setCurrentPage(item.id);
                  }}
                  className="flex items-center space-x-2"
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </Button>
              );
            })}
          </nav>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t bg-background/95 backdrop-blur">
            <nav className="flex flex-col space-y-2 p-4">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Button
                    key={item.id}
                    variant={currentPage === item.id ? "default" : "ghost"}
                    onClick={() => {
                      console.log('🔥 Mobile - Clicou em:', item.name, '| ID:', item.id);
                      setCurrentPage(item.id);
                      setIsMenuOpen(false);
                    }}
                    className="flex items-center justify-start space-x-2 w-full"
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </Button>
                );
              })}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
