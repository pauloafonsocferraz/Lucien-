import React from 'react';

function HomePage({ setCurrentPage }) {
  const handleCapitulo1Click = () => {
    setCurrentPage('chapters');
    console.log("Navegando para o Capítulo 1 (ChaptersPage)...");
  };

  return (
    <div className="homepage-container">
      {/* Animated Background Elements - Enhanced (Temporariamente comentado para teste) */}
      {/*
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000" />
        <div className="absolute top-1/2 right-1/4 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000" />
        <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob" />
      </div>
      */}
      {/* Main Content - Centered and Styled */}
      {/* ALTERADO: p-8 para pt-4 pb-20 px-8 */}
      <div className="relative z-1 text-center text-white pt-0 pb-1 px-10  max-w-1xl mx-5-x5 shadow-1xl">
        {/* ALTERADO: mb-6 para mb-32 */}
        <h1 className="center text-6xl md:text-x5 font-extrabold mb-115 leading-tight tracking-tight">
          <span className="text-orange-900">Conheça o mundo de Lucian</span>
        </h1>
        {/* O parágrafo está comentado, então não afeta o espaçamento aqui */}
        {/*<p className="text-xl md:text-2xl mb-10 font-light">
          Vamos juntos construir essa aventura, conto e agradeço seus comentários!
        </p>*/}
        <button
          className="bg-orange-900 hover:bg-orange-600 text-white font-bold py-4 px-10 rounded-full text-lg transition duration-30 ease-in-out transform hover:scale-10 shadow-lg"
          onClick={handleCapitulo1Click}
        >
          Capítulo 1: Inicie sua leitura agora e deixe sua opinião
        </button>
      </div>
    </div>
  );
}

export default HomePage;
