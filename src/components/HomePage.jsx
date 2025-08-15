import React from 'react';

function HomePage({ setCurrentPage }) {
  const handleCapitulo1Click = () => {
    setCurrentPage('chapters');
  };

  return (
    <div className="homepage-container">
      {/* Conteúdo principal centralizado */}
      <div className="relative z-1 text-center text-white pt-0 pb-1 px-10 max-w-1xl mx-5-x5 shadow-1xl">
        <h1 className="center text-6xl md:text-x5 font-extrabold mb-115 leading-tight tracking-tight">
          {/* Título visível só no desktop e tablets grandes */}
          <span className="text-orange-900 hidden md:inline">
            Conheça o mundo de Lucian
          </span>
        </h1>
        {/* Parágrafo comentado para possível uso futuro */}
        {/*
        <p className="text-xl md:text-2xl mb-10 font-light">
          Vamos juntos construir essa aventura, conto e agradeço seus comentários!
        </p>
        */}
      </div>

      {/* Botão fixo no rodapé para todas as telas */}
      <button
        className="btn-capitulo "
        onClick={handleCapitulo1Click}
      >
        Capítulo 3 Disponível
      </button>
    </div>
  );
}

export default HomePage;
