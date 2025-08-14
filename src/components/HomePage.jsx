import React from 'react';

// HomePage agora recebe 'setCurrentPage' como uma prop
function HomePage({ setCurrentPage }) {
  // Função que será chamada quando o botão for clicado
  const handleCapitulo1Click = () => {
    // Usamos setCurrentPage para mudar o estado em App.jsx para 'chapters'
    setCurrentPage('chapters');
    console.log("Navegando para o Capítulo 1 (ChaptersPage)...");
  };

  return (
    <div className="relative min-h-screen bg-gray-900 overflow-hidden flex items-center justify-center">
      {/* Animated Background Elements - Enhanced */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000" />
        <div className="absolute top-1/2 right-1/4 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000" />
        <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob" />
      </div>
      {/* Main Content - Centered and Styled */}
      <div className="relative z-10 text-center text-white p-8 max-w-4xl mx-auto bg-black bg-opacity-40 rounded-xl shadow-2xl backdrop-filter backdrop-blur-lg">
        <h1 className="text-6xl md:text-7xl font-extrabold mb-6 leading-tight tracking-tight">
         <span className="text-orange-400">Conheça o mundo de Lucian</span>
        </h1>
        <p className="text-xl md:text-2xl mb-10 font-light opacity-90">
          Vamos juntos construir essa aventura, conto e agradeço seus comentários!
        </p>
        <button
          className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 px-10 rounded-full text-lg transition duration-300 ease-in-out transform hover:scale-105 shadow-lg"
          onClick={handleCapitulo1Click} // Chama a função que usa setCurrentPage
        >
          Capítulo 1: Inicie sua leitura agora e deixe sua opinião
        </button>
      </div>
    </div>
  );
}

export default HomePage;
