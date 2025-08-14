import { useState } from 'react';
import Header from './components/Header';
import HomePage from './components/HomePage';
import AboutPage from './components/AboutPage';
import ChaptersPage from './components/ChaptersPage';
import AuthorPage from './components/AuthorPage';
import CommentsPage from './components/CommentsPage';
import CoverVotePage from './components/CoverVotePage';
import Footer from './components/Footer';
import './App.css';

function App() {
  const [currentPage, setCurrentPage] = useState('home');

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage setCurrentPage={setCurrentPage} />;
      case 'about':
        return <AboutPage />;
      case 'chapters':
        return <ChaptersPage />;
      case 'author':
        return <AuthorPage setCurrentPage={setCurrentPage} />;
      case 'comments':
        return <CommentsPage />;
      case 'cover-vote':
        return <CoverVotePage />;
      default:
        return <HomePage setCurrentPage={setCurrentPage} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header currentPage={currentPage} setCurrentPage={setCurrentPage} />
      <main className="flex-1">
        {renderPage()}
      </main>
      <Footer />
    </div>
  );
}

export default App;

