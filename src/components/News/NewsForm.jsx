import React, { useState, useEffect } from 'react';
import './NewsForm.css';

const NewsForm = ({ news, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    summary: '',
    content: '',
    category: 'geral',
    author: '',
    image: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = [
    'geral', 'tecnologia', 'esportes', 
    'entretenimento', 'política', 'economia'
  ];

  // Preencher formulário se estiver editando
  useEffect(() => {
    if (news) {
      setFormData({
        title: news.title || '',
        summary: news.summary || '',
        content: news.content || '',
        category: news.category || 'geral',
        author: news.author || '',
        image: news.image || ''
      });
    }
  }, [news]);

  // Validar campos
  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Título é obrigatório';
    } else if (formData.title.length < 10) {
      newErrors.title = 'Título deve ter pelo menos 10 caracteres';
    }

    if (!formData.summary.trim()) {
      newErrors.summary = 'Resumo é obrigatório';
    } else if (formData.summary.length < 20) {
      newErrors.summary = 'Resumo deve ter pelo menos 20 caracteres';
    }

    if (!formData.content.trim()) {
      newErrors.content = 'Conteúdo é obrigatório';
    } else if (formData.content.length < 50) {
      newErrors.content = 'Conteúdo deve ter pelo menos 50 caracteres';
    }

    if (!formData.author.trim()) {
      newErrors.author = 'Autor é obrigatório';
    }

    // Validar URL da imagem se preenchida
    if (formData.image && !isValidUrl(formData.image)) {
      newErrors.image = 'URL da imagem inválida';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Verificar se URL é válida
  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  // Atualizar campo
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Limpar erro do campo quando usuário começar a digitar
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Enviar formulário
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Simular delay de envio
      await new Promise(resolve => setTimeout(resolve, 500));
      
      onSubmit(formData);
      
      // Limpar formulário se não estiver editando
      if (!news) {
        setFormData({
          title: '',
          summary: '',
          content: '',
          category: 'geral',
          author: '',
          image: ''
        });
      }
    } catch (error) {
      console.error('Erro ao salvar notícia:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="news-form-overlay">
      <div className="news-form-container">
        <div className="news-form-header">
          <h3>
            {news ? '✏️ Editar Notícia' : '➕ Nova Notícia'}
          </h3>
          <button 
            className="btn-close"
            onClick={onCancel}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="news-form">
          {/* Título */}
          <div className="form-group">
            <label htmlFor="title">Título *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className={errors.title ? 'error' : ''}
              placeholder="Digite o título da notícia..."
              maxLength="150"
            />
            {errors.title && <span className="error-message">{errors.title}</span>}
            <small className="char-count">{formData.title.length}/150</small>
          </div>

          {/* Categoria e Autor */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="category">Categoria *</label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="author">Autor *</label>
              <input
                type="text"
                id="author"
                name="author"
                value={formData.author}
                onChange={handleChange}
                className={errors.author ? 'error' : ''}
                placeholder="Nome do autor..."
              />
              {errors.author && <span className="error-message">{errors.author}</span>}
            </div>
          </div>

          {/* Resumo */}
          <div className="form-group">
            <label htmlFor="summary">Resumo *</label>
            <textarea
              id="summary"
              name="summary"
              value={formData.summary}
              onChange={handleChange}
              className={errors.summary ? 'error' : ''}
              placeholder="Escreva um resumo da notícia..."
              rows="3"
              maxLength="300"
            />
            {errors.summary && <span className="error-message">{errors.summary}</span>}
            <small className="char-count">{formData.summary.length}/300</small>
          </div>

          {/* Imagem */}
          <div className="form-group">
            <label htmlFor="image">URL da Imagem</label>
            <input
              type="url"
              id="image"
              name="image"
              value={formData.image}
              onChange={handleChange}
              className={errors.image ? 'error' : ''}
              placeholder="https://exemplo.com/imagem.jpg"
            />
            {errors.image && <span className="error-message">{errors.image}</span>}
            {formData.image && !errors.image && (
              <div className="image-preview">
                <img 
                  src={formData.image} 
                  alt="Preview" 
                  onError={(e) => {
                    e.target.style.display = 'none';
                    setErrors(prev => ({
                      ...prev,
                      image: 'Não foi possível carregar a imagem'
                    }));
                  }}
                />
              </div>
            )}
          </div>

          {/* Conteúdo */}
          <div className="form-group">
            <label htmlFor="content">Conteúdo *</label>
            <textarea
              id="content"
              name="content"
              value={formData.content}
              onChange={handleChange}
              className={errors.content ? 'error' : ''}
              placeholder="Escreva o conteúdo completo da notícia..."
              rows="8"
              maxLength="5000"
            />
            {errors.content && <span className="error-message">{errors.content}</span>}
            <small className="char-count">{formData.content.length}/5000</small>
          </div>

          {/* Botões */}
          <div className="form-actions">
            <button 
              type="button" 
              className="btn-cancel"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className="btn-submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="spinner"></span>
                  {news ? 'Salvando...' : 'Publicando...'}
                </>
              ) : (
                news ? '💾 Salvar Alterações' : '🚀 Publicar Notícia'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewsForm;
