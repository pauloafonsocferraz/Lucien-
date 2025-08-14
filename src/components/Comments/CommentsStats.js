import React, { useState } from 'react';

const CommentsStats = ({ stats, className = "" }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!stats) {
    return null;
  }

  // Validar e extrair dados com valores padrão seguros
  const {
    total = 0,
    approved = 0,
    pending = 0,
    today = 0,
    thisWeek = 0,
    thisMonth = 0
  } = stats;

  // Garantir que todos os valores são números válidos
  const safeTotal = Math.max(0, Number(total) || 0);
  const safeApproved = Math.max(0, Number(approved) || 0);
  const safePending = Math.max(0, Number(pending) || 0);
  const safeToday = Math.max(0, Number(today) || 0);
  const safeThisWeek = Math.max(0, Number(thisWeek) || 0);
  const safeThisMonth = Math.max(0, Number(thisMonth) || 0);

  // Cálculos seguros
  const approvalRate = safeTotal > 0 
    ? Math.round((safeApproved / safeTotal) * 100) 
    : 0;

  // Média diária baseada na semana atual
  const dailyAverage = safeThisWeek > 0 
    ? Math.round((safeThisWeek / 7) * 10) / 10
    : 0;

  // Média mensal (assumindo 30 dias)
  const monthlyAverage = safeThisMonth > 0 
    ? Math.round((safeThisMonth / 30) * 10) / 10
    : 0;

  // Taxa de crescimento semanal vs mensal
  const weeklyGrowthRate = safeThisMonth > 0 && safeThisWeek > 0
    ? Math.round(((safeThisWeek / safeThisMonth) * 100) * 10) / 10
    : 0;

  return (
    <div className={`comments-stats ${className}`}>
      {/* Estatísticas principais */}
      <div className="stats-main">
        <div className="stat-item primary">
          <span className="stat-number">{safeTotal}</span>
          <span className="stat-label">
            comentário{safeTotal !== 1 ? 's' : ''} total
          </span>
        </div>

        <div className="stat-item">
          <span className="stat-number">{safeApproved}</span>
          <span className="stat-label">aprovados</span>
        </div>

        {safePending > 0 && (
          <div className="stat-item pending">
            <span className="stat-number">{safePending}</span>
            <span className="stat-label">pendentes</span>
          </div>
        )}

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="stats-toggle"
          title={isExpanded ? 'Ocultar detalhes' : 'Ver mais estatísticas'}
          type="button"
        >
          {isExpanded ? '📊 Menos' : '📊 Mais'}
        </button>
      </div>

      {/* Estatísticas expandidas */}
      {isExpanded && (
        <div className="stats-expanded">
          <div className="stats-row">
            <div className="stat-group">
              <h4>📅 Período</h4>
              <div className="stat-item">
                <span className="stat-number">{safeToday}</span>
                <span className="stat-label">hoje</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">{safeThisWeek}</span>
                <span className="stat-label">esta semana</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">{safeThisMonth}</span>
                <span className="stat-label">este mês</span>
              </div>
            </div>

            <div className="stat-group">
              <h4>📈 Métricas</h4>
              <div className="stat-item">
                <span className="stat-number">{approvalRate}%</span>
                <span className="stat-label">taxa de aprovação</span>
              </div>
              
              <div className="stat-item">
                <span className="stat-number">
                  {dailyAverage > 0 ? dailyAverage : '—'}
                </span>
                <span className="stat-label">média diária</span>
              </div>
              
              <div className="stat-item">
                <span className="stat-number">
                  {monthlyAverage > 0 ? monthlyAverage : '—'}
                </span>
                <span className="stat-label">média por dia (mês)</span>
              </div>

              {/* Métrica adicional de engajamento */}
              {safeTotal > 0 && (
                <div className="stat-item">
                  <span className="stat-number">
                    {weeklyGrowthRate > 0 ? `${weeklyGrowthRate}%` : '—'}
                  </span>
                  <span className="stat-label">atividade semanal</span>
                </div>
              )}
            </div>
          </div>

          {/* Barra de progresso visual */}
          <div className="approval-progress">
            <div className="progress-label">
              Taxa de Aprovação: {approvalRate}%
            </div>
            <div className="progress-bar">
              <div 
                className="progress-fill"
                style={{ 
                  width: `${approvalRate}%`,
                  transition: 'width 0.3s ease'
                }}
                role="progressbar"
                aria-valuenow={approvalRate}
                aria-valuemin="0"
                aria-valuemax="100"
              />
            </div>
          </div>

          {/* Indicadores de tendência */}
          {safeTotal > 10 && (
            <div className="trend-indicators">
              <div className="trend-item">
                <span className="trend-icon">
                  {safeToday > dailyAverage ? '📈' : safeToday < dailyAverage ? '📉' : '➡️'}
                </span>
                <span className="trend-text">
                  {safeToday > dailyAverage 
                    ? 'Acima da média hoje'
                    : safeToday < dailyAverage 
                    ? 'Abaixo da média hoje'
                    : 'Na média hoje'
                  }
                </span>
              </div>

              {approvalRate >= 80 && (
                <div className="trend-item positive">
                  <span className="trend-icon">✨</span>
                  <span className="trend-text">Excelente taxa de aprovação!</span>
                </div>
              )}

              {safePending > safeApproved * 0.5 && (
                <div className="trend-item warning">
                  <span className="trend-icon">⚠️</span>
                  <span className="trend-text">Muitos comentários pendentes</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CommentsStats;
