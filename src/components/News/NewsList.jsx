import React, { useState, useEffect } from 'react';
import NewsCard from './NewsCard';
import NewsForm from './NewsForm';
import './NewsList.css';

export default function NewsList({ isAdmin = false }) {
  const [news, setNews] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingNews, setEditingNews] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [adminMode, setAdminMode] = useState(isAdmin);

  // Carregar notícias do localStorage
  useEffect(() => {
    const savedNews = localStorage.getItem('fantasy-news');
    if (savedNews) {
      setNews(JSON.parse(savedNews));
    } else {
      // Notícias de exemplo com tema épico
      const exampleNews = [
        {
          id: 1,
          title: "📜 Nova Profecia Descoberta nos Arquivos Antigos",
          content: "Estudiosos da Academia Mística descobriram uma profecia perdida que pode revelar o destino do reino...",
          category: "prophecies",
          author: "Mestre Eldric",
          date: new Date().toISOString(),
          image: null
        },
        {
          id: 2,
          title: "⚔️ Torneio dos Campeões Anunciado",
          content: "O Grande Torneio dos Campeões será realizado na próxima lua cheia. Guerreiros de todo o reino se preparam...",
          category: "events",
          author: "Herald Real",
          date: new Date(Date.now() - 86400000).toISOString(),
          image: null
        }
      ];
      setNews(exampleNews);
      localStorage.setItem('fantasy-news', JSON.stringify(exampleNews));
    }
  }, []);

  // Salvar no localStorage
  const saveNews = (newsData) => {
    localStorage.setItem('fantasy-news', JSON.stringify(newsData));
  };

  // Filtrar notícias
  const filteredNews = news.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAddNews = (newsData) => {
    const newNews = {
      id: Date.now(),
      ...newsData,
      date: new Date().toISOString()
    };
    const updatedNews = [newNews, ...news];
    setNews(updatedNews);
    saveNews(updatedNews);
    setIsFormOpen(false);
  };

  const handleEditNews = (newsData) => {
    const updatedNews = news.map(item =>
      item.id === editingNews.id ? { ...item, ...newsData } : item
    );
    setNews(updatedNews);
    saveNews(updatedNews);
    setEditingNews(null);
    setIsFormOpen(false);
  };

  const handleDeleteNews = (id) => {
    if (window.confirm('🗡️ Deseja banir esta notícia do reino?')) {
      const updatedNews = news.filter(item => item.id !== id);
      setNews(updatedNews);
      saveNews(updatedNews);
    }
  };

  const categories = [
    { value: 'all', label: '🌟 Todas as Notícias' },
    { value: 'prophecies', label: '📜 Profecias' },
    { value: 'events', label: '⚔️ Eventos' },
    { value: 'discoveries', label: '🏺 Descobertas' },
    { value: 'politics', label: '👑 Política Real' },
    { value: 'magic', label: '✨ Magia' }
  ];

  return (
    <div className="news-page-fantasy">
      <div className="news-container">
        {/* Header épico */}
        <div className="news-header-fantasy">
          <h1 className="news-title-fantasy text-gradient">
            📰 Crônicas do Reino
          </h1>
          <p className="news-subtitle-fantasy">
            As últimas notícias dos reinos místicos e terras distantes
          </p>
        </div>

        {/* Controles */}
        <div className="news-controls-fantasy">
          <div className="search-filter-section">
            <div className="search-box-fantasy">
              <input
                type="text"
                placeholder="🔍 Buscar nas crônicas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input-fantasy"
              />
            </div>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="category-select-fantasy"
            >
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          <div className="admin-controls-fantasy">
            <button
              onClick={() => setAdminMode(!adminMode)}
              className={`admin-toggle-fantasy ${adminMode ? 'active' : ''}`}
            >
              {adminMode ? '👑 Modo Rei' : '👤 Modo Súdito'}
            </button>

            {adminMode && (
              <button
                onClick={() => setIsFormOpen(true)}
                className="add-news-btn-fantasy mystical-glow"
              >
                ✨ Nova Crônica
              </button>
            )}
          </div>
        </div>

        {/* Lista de notícias */}
        <div className="news-grid-fantasy">
          {filteredNews.length > 0 ? (
            filteredNews.map(item => (
              <NewsCard
                key={item.id}
                news={item}
                isAdmin={adminMode}
                onEdit={(news) => {
                  setEditingNews(news);
                  setIsFormOpen(true);
                }}
                onDelete={handleDeleteNews}
              />
            ))
          ) : (
            <div className="no-news-fantasy">
              <div className="no-news-icon">📜</div>
              <h3>Nenhuma crônica encontrada</h3>
              <p>Os escribas ainda não registraram notícias sobre este assunto.</p>
            </div>
          )}
        </div>

        {/* Formulário */}
        {isFormOpen && (
          <NewsForm
            news={editingNews}
            onSubmit={editingNews ? handleEditNews : handleAddNews}
            onCancel={() => {
              setIsFormOpen(false);
              setEditingNews(null);
            }}
          />
        )}
      </div>
    </div>
  );
}
