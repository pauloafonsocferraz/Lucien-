import React, { useState, useCallback } from 'react';
import LoadingSpinner from '../UI/LoadingSpinner';
import ErrorMessage from '../UI/ErrorMessage';

const CommentForm = ({ 
  onSubmit, 
  isSubmitting = false, 
  isOnline = true,
  className = ""
}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(null);
  const [showForm, setShowForm] = useState(false);

  // Manipular mudanças nos campos
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Limpar erro do campo específico
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  }, [errors]);

  // Validação do formulário
  const validateForm = useCallback(() => {
    const newErrors = {};

    if (!formData.name.trim() || formData.name.trim().length < 2) {
      newErrors.name = 'Nome deve ter pelo menos 2 caracteres';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Mensagem é obrigatória';
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Mensagem deve ter pelo menos 10 caracteres';
    } else if (formData.message.length > 1000) {
      newErrors.message = 'Mensagem deve ter no máximo 1000 caracteres';
    }

    return newErrors;
  }, [formData]);

  // Enviar formulário
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    setErrors({});
    setSuccess(null);

    // Validar
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    try {
      const result = await onSubmit(formData);
      
      if (result.success) {
        setSuccess(result.message);
        setFormData({ name: '', email: '', message: '' });
        
        // Auto-hide success após 5 segundos
        setTimeout(() => {
          setSuccess(null);
          if (result.comment && result.comment.approved) {
            setShowForm(false);
          }
        }, 5000);
      } else {
        setErrors({ submit: result.message });
      }
    } catch (error) {
      setErrors({ submit: 'Erro interno. Tente novamente.' });
    }
  };

  const charactersLeft = 1000 - formData.message.length;

  return (
    <div className={`comment-form-container ${className}`}>
      {!showForm ? (
        <button 
          onClick={() => setShowForm(true)}
          className="show-form-btn"
          disabled={isSubmitting}
        >
          💬 Deixar um comentário
        </button>
      ) : (
        <div className="comment-form-wrapper">
          <div className="form-header">
            <h3>💬 Novo Comentário</h3>
            <button 
              onClick={() => setShowForm(false)}
              className="close-form-btn"
              type="button"
            >
              ✕
            </button>
          </div>

          {/* Status da conexão */}
          {!isOnline && (
            <div className="offline-notice">
              <span>📡</span>
              <span>Sem conexão - comentário será salvo localmente</span>
            </div>
          )}

          {/* Mensagem de sucesso */}
          {success && (
            <div className="success-message">
              <span>✅</span>
              <span>{success}</span>
            </div>
          )}

          {/* Erro geral */}
          {errors.submit && (
            <ErrorMessage 
              message={errors.submit}
              onDismiss={() => setErrors(prev => ({ ...prev, submit: null }))}
            />
          )}

          <form onSubmit={handleSubmit} className="comment-form">
            {/* Nome */}
            <div className="form-group">
              <label htmlFor="name">
                Nome *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Seu nome completo"
                disabled={isSubmitting}
                className={errors.name ? 'error' : ''}
                maxLength="100"
              />
              {errors.name && (
                <span className="field-error">{errors.name}</span>
              )}
            </div>

            {/* Email */}
            <div className="form-group">
              <label htmlFor="email">
                Email *
                <small>(não será publicado)</small>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="seu@email.com"
                disabled={isSubmitting}
                className={errors.email ? 'error' : ''}
                maxLength="150"
              />
              {errors.email && (
                <span className="field-error">{errors.email}</span>
              )}
            </div>

            {/* Mensagem */}
            <div className="form-group">
              <label htmlFor="message">
                Mensagem *
                <small>({charactersLeft} caracteres restantes)</small>
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Escreva seu comentário aqui..."
                disabled={isSubmitting}
                className={errors.message ? 'error' : ''}
                rows="4"
                maxLength="1000"
              />
              {errors.message && (
                <span className="field-error">{errors.message}</span>
              )}
            </div>

            {/* Botões */}
            <div className="form-actions">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="cancel-btn"
                disabled={isSubmitting}
              >
                Cancelar
              </button>
              
              <button
                type="submit"
                className="submit-btn"
                disabled={isSubmitting || !isOnline && !window.navigator.onLine}
              >
                {isSubmitting ? (
                  <>
                    <LoadingSpinner size="small" />
                    Enviando...
                  </>
                ) : (
                  'Publicar Comentário'
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default CommentForm;
