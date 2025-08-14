const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const path = require('path');
const fs = require('fs-extra');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Criar diretório de dados se não existir
const dataDir = path.join(__dirname, 'data');
fs.ensureDirSync(dataDir);

// Arquivo de banco de dados
const dbPath = path.join(dataDir, 'database.json');

// Inicializar banco de dados
const initDB = async () => {
  try {
    const exists = await fs.pathExists(dbPath);
    if (!exists) {
      const initialData = {
        visits: {
          total: 0,
          coverPage: 0,
          daily: {},
          lastUpdate: new Date().toISOString()
        },
        news: [
          {
            id: 1,
            title: "Bem-vindos ao site oficial de O Terceiro Olho!",
            content: "Acompanhe aqui todas as novidades sobre o livro, votações de capas, e muito mais.",
            category: "Geral",
            date: new Date().toISOString(),
            author: "Paulo",
            featured: true
          }
        ],
        comments: [],
        votes: {
          cover1: 45,
          cover2: 32,
          cover3: 23
        }
      };
      await fs.writeJson(dbPath, initialData, { spaces: 2 });
      console.log('✅ Banco de dados inicializado');
    }
  } catch (error) {
    console.error('❌ Erro ao inicializar banco de dados:', error);
  }
};

// Função para ler dados
const readDB = async () => {
  try {
    return await fs.readJson(dbPath);
  } catch (error) {
    console.error('❌ Erro ao ler banco de dados:', error);
    return null;
  }
};

// Função para escrever dados
const writeDB = async (data) => {
  try {
    await fs.writeJson(dbPath, data, { spaces: 2 });
    return true;
  } catch (error) {
    console.error('❌ Erro ao escrever banco de dados:', error);
    return false;
  }
};

// ========== ROTAS DE VISITAS ==========

// Incrementar contador de visitas
app.post('/api/visits/increment', async (req, res) => {
  try {
    const { page = 'total' } = req.body;
    const data = await readDB();
    
    if (!data) {
      return res.status(500).json({ error: 'Erro ao acessar banco de dados' });
    }

    // Incrementar contador
    if (page === 'total') {
      data.visits.total += 1;
    } else if (page === 'cover') {
      data.visits.coverPage += 1;
    }

    // Contador diário
    const today = new Date().toISOString().split('T')[0];
    if (!data.visits.daily[today]) {
      data.visits.daily[today] = 0;
    }
    data.visits.daily[today] += 1;
    
    data.visits.lastUpdate = new Date().toISOString();

    const success = await writeDB(data);
    if (success) {
      res.json({ 
        success: true, 
        visits: data.visits 
      });
    } else {
      res.status(500).json({ error: 'Erro ao salvar dados' });
    }
  } catch (error) {
    console.error('❌ Erro ao incrementar visitas:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Obter contadores
app.get('/api/visits', async (req, res) => {
  try {
    const data = await readDB();
    if (!data) {
      return res.status(500).json({ error: 'Erro ao acessar banco de dados' });
    }
    
    res.json(data.visits);
  } catch (error) {
    console.error('❌ Erro ao obter visitas:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// ========== ROTAS DE NOTÍCIAS ==========

// Obter todas as notícias
app.get('/api/news', async (req, res) => {
  try {
    const data = await readDB();
    if (!data) {
      return res.status(500).json({ error: 'Erro ao acessar banco de dados' });
    }
    
    // Ordenar por data (mais recentes primeiro)
    const sortedNews = data.news.sort((a, b) => new Date(b.date) - new Date(a.date));
    res.json(sortedNews);
  } catch (error) {
    console.error('❌ Erro ao obter notícias:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Adicionar nova notícia
app.post('/api/news', async (req, res) => {
  try {
    const { title, content, category, author, featured = false } = req.body;
    
    if (!title || !content) {
      return res.status(400).json({ error: 'Título e conteúdo são obrigatórios' });
    }

    const data = await readDB();
    if (!data) {
      return res.status(500).json({ error: 'Erro ao acessar banco de dados' });
    }

    const newNews = {
      id: Math.max(...data.news.map(n => n.id), 0) + 1,
      title,
      content,
      category: category || 'Geral',
      author: author || 'Administrador',
      date: new Date().toISOString(),
      featured
    };

    data.news.push(newNews);
    
    const success = await writeDB(data);
    if (success) {
      res.json({ success: true, news: newNews });
    } else {
      res.status(500).json({ error: 'Erro ao salvar notícia' });
    }
  } catch (error) {
    console.error('❌ Erro ao adicionar notícia:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// ========== ROTAS DE COMENTÁRIOS ==========

// Obter comentários
app.get('/api/comments', async (req, res) => {
  try {
    const data = await readDB();
    if (!data) {
      return res.status(500).json({ error: 'Erro ao acessar banco de dados' });
    }
    
    // Ordenar por data (mais recentes primeiro)
    const sortedComments = data.comments.sort((a, b) => new Date(b.date) - new Date(a.date));
    res.json(sortedComments);
  } catch (error) {
    console.error('❌ Erro ao obter comentários:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Adicionar comentário
app.post('/api/comments', async (req, res) => {
  try {
    const { name, email, message, page = 'geral' } = req.body;
    
    if (!name || !message) {
      return res.status(400).json({ error: 'Nome e mensagem são obrigatórios' });
    }

    const data = await readDB();
    if (!data) {
      return res.status(500).json({ error: 'Erro ao acessar banco de dados' });
    }

    const newComment = {
      id: Math.max(...data.comments.map(c => c.id || 0), 0) + 1,
      name,
      email: email || '',
      message,
      page,
      date: new Date().toISOString(),
      approved: true // Auto-aprovar por enquanto
    };

    data.comments.push(newComment);
    
    const success = await writeDB(data);
    if (success) {
      console.log(`📝 Novo comentário de ${name} na página ${page}`);
      res.json({ success: true, comment: newComment });
    } else {
      res.status(500).json({ error: 'Erro ao salvar comentário' });
    }
  } catch (error) {
    console.error('❌ Erro ao adicionar comentário:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// ========== ROTAS DE VOTOS ==========

// Obter votos das capas
app.get('/api/votes', async (req, res) => {
  try {
    const data = await readDB();
    if (!data) {
      return res.status(500).json({ error: 'Erro ao acessar banco de dados' });
    }
    
    res.json(data.votes);
  } catch (error) {
    console.error('❌ Erro ao obter votos:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Votar em capa
app.post('/api/votes', async (req, res) => {
  try {
    const { coverId } = req.body;
    
    if (!coverId || !['cover1', 'cover2', 'cover3'].includes(coverId)) {
      return res.status(400).json({ error: 'ID de capa inválido' });
    }

    const data = await readDB();
    if (!data) {
      return res.status(500).json({ error: 'Erro ao acessar banco de dados' });
    }

    data.votes[coverId] = (data.votes[coverId] || 0) + 1;
    
    const success = await writeDB(data);
    if (success) {
      res.json({ success: true, votes: data.votes });
    } else {
      res.status(500).json({ error: 'Erro ao salvar voto' });
    }
  } catch (error) {
    console.error('❌ Erro ao votar:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota de teste
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'Backend do Terceiro Olho funcionando!', 
    timestamp: new Date().toISOString() 
  });
});

// Inicializar servidor
const startServer = async () => {
  await initDB();
  
  app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
    console.log(`📊 API disponível em: http://localhost:${PORT}/api`);
    console.log(`🧪 Teste: http://localhost:${PORT}/api/test`);
  });
};

startServer();
