import React from 'react';
import './NewsCard.css';

const NewsCard = ({ news, onEdit, onDelete, isAdmin = false }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getCategoryColor = (category) => {
    const colors = {
      'geral': '#3498db',
      'tecnologia': '#9b59b6',
      'esportes': '#e74c3c',
      'entretenimento': '#f39c12',
      'política': '#34495e',
      'economia': '#27ae60'
    };
    return colors[category.toLowerCase()] || '#95a5a6';
  };

  return (
    <div className="news-card">
      <div className="news-header">
        <span 
          className="news-category"
          style={{ backgroundColor: getCategoryColor(news.category) }}
        >
          {news.category}
        </span>
        <span className="news-date">{formatDate(news.createdAt)}</span>
      </div>

      <h3 className="news-title">{news.title}</h3>
      
      {news.image && (
        <div className="news-image">
          <img src={news.image} alt={news.title} />
        </div>
      )}

      <p className="news-summary">{news.summary}</p>

      <div className="news-content">
        <p>{news.content}</p>
      </div>

      {news.author && (
        <div className="news-author">
          <small>Por: {news.author}</small>
        </div>
      )}

      {isAdmin && (
        <div className="news-actions">
          <button 
            className="btn-edit"
            onClick={() => onEdit(news)}
          >
            ✏️ Editar
          </button>
          <button 
            className="btn-delete"
            onClick={() => onDelete(news.id)}
          >
            🗑️ Deletar
          </button>
        </div>
      )}
    </div>
  );
};

export default NewsCard;
