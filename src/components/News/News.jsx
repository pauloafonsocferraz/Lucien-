import { useState } from 'react';

const News = () => {
  const [news, setNews] = useState([
    {
      id: 1,
      title: "Novo Capítulo em Breve!",
      content: "Até quinta (14/08/2025) teremos o capítulo 3 para vocês. Preparem-se para mais aventuras de Lucian!",
      date: "2025-08-13",
      time: "19:04"
    },
    {
      id: 2,
      title: "Capítulos 1 e 2 Disponíveis",
      content: "Já podem conferir os dois primeiros capítulos da saga. Uma jornada épica está apenas começando!",
      date: "2025-08-10",
      time: "15:30"
    }
  ]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 text-center">📰 Notícias</h1>
        <p className="text-gray-600 text-center">Últimas atualizações sobre A Saga de Lucian</p>
      </div>

      <div className="space-y-6">
        {news.map((item) => (
          <div key={item.id} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
            <h2 className="text-2xl font-bold mb-3 text-blue-800">{item.title}</h2>
            <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
              <span className="flex items-center">
                📅 {formatDate(item.date)}
              </span>
              <span className="flex items-center">
                ⏰ {item.time}
              </span>
            </div>
            <p className="text-lg leading-relaxed text-gray-700">{item.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default News;
