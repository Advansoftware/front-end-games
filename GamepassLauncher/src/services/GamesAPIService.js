// API Service para integração com RAWG
class GamesAPIService {
  constructor() {
    this.baseURL = 'https://api.rawg.io/api';
    this.apiKey = process.env.NEXT_PUBLIC_RAWG_API_KEY || '35ede4e20e9a43329f0c7c369d033874';
    this.localGamesData = null; // Cache para dados locais
  }

  // ==================== MÉTODOS PARA DADOS LOCAIS ====================

  /**
   * Carregar jogos do arquivo local games.json
   * Este é o método principal para carregar a biblioteca inicial
   */
  async loadGames() {
    try {
      console.log('📋 Carregando jogos do arquivo local...');

      // Se já carregou os dados locais, retornar do cache
      if (this.localGamesData) {
        console.log(`📦 Retornando ${this.localGamesData.length} jogos do cache local`);
        return this.localGamesData;
      }

      // Carregar dados do arquivo JSON local
      const response = await fetch('/data/games.json');

      if (!response.ok) {
        throw new Error(`Erro ao carregar games.json: ${response.status}`);
      }

      const data = await response.json();

      if (!data.games || !Array.isArray(data.games)) {
        throw new Error('Formato inválido no arquivo games.json');
      }

      // Processar e formatar dados locais
      this.localGamesData = data.games.map(game => this.formatLocalGameData(game));

      console.log(`✅ ${this.localGamesData.length} jogos carregados do arquivo local`);
      return this.localGamesData;

    } catch (error) {
      console.error('❌ Erro ao carregar jogos locais:', error);

      // Fallback: retornar array vazio ou dados de emergência
      return this.getFallbackGames();
    }
  }

  /**
   * Formatar dados do arquivo local para o formato padrão do app
   */
  formatLocalGameData(game) {
    return {
      id: game.id,
      title: game.title,
      description: game.description || '',
      image: game.image || '',
      youtubeVideoId: game.youtubeVideoId || null,
      genre: Array.isArray(game.genre) ? game.genre.join(', ') : (game.genre || ''),
      rating: game.rating || 0,
      platform: game.platform || 'Desconhecido',
      size: game.size || 'N/A',
      downloadSize: game.size || 'N/A',
      installed: game.installed || false,
      downloadUrl: game.downloadUrl || '',
      configFile: game.configFile || '',
      releaseDate: game.releaseDate || null,
      developer: game.developer || '',
      publisher: game.publisher || '',
      lastPlayed: game.lastPlayed || null,

      // Campos adicionais que podem ser enriquecidos pela API
      metacritic: null,
      screenshots: [],
      stores: [],
      tags: Array.isArray(game.genre) ? game.genre : [],
      website: null,
      playtime: null,

      // Metadados
      isLocal: true, // Indica que veio do arquivo local
      dataSource: 'local'
    };
  }

  /**
   * Dados de emergência caso o arquivo local não carregue
   */
  getFallbackGames() {
    console.log('🚨 Usando dados de emergência');
    return [
      {
        id: 1,
        title: "Jogo de Exemplo",
        description: "Um jogo de exemplo para teste do sistema.",
        image: "https://via.placeholder.com/800x600?text=Jogo+de+Exemplo",
        genre: "Teste",
        rating: 8.0,
        platform: "Todas",
        size: "1.0 GB",
        downloadSize: "1.0 GB",
        installed: false,
        downloadUrl: "",
        configFile: "",
        releaseDate: new Date().toISOString().split('T')[0],
        developer: "Desenvolvedor Teste",
        publisher: "Publisher Teste",
        lastPlayed: null,
        isLocal: true,
        dataSource: 'fallback'
      }
    ];
  }

  /**
   * Obter metadados do arquivo local
   */
  async getLocalMetadata() {
    try {
      const response = await fetch('/data/games.json');
      if (!response.ok) return null;

      const data = await response.json();
      return data.metadata || null;
    } catch (error) {
      console.error('Erro ao carregar metadados:', error);
      return null;
    }
  }

  /**
   * Filtrar jogos locais por gênero
   */
  filterLocalGamesByGenre(games, genre) {
    if (!genre || genre === 'all') return games;

    return games.filter(game => {
      const gameGenres = Array.isArray(game.genre)
        ? game.genre
        : (game.genre ? game.genre.split(', ') : []);

      return gameGenres.some(g =>
        g.toLowerCase().includes(genre.toLowerCase())
      );
    });
  }

  /**
   * Buscar jogos locais por título
   */
  searchLocalGames(games, query) {
    if (!query || query.trim() === '') return games;

    const lowerQuery = query.toLowerCase();
    return games.filter(game =>
      game.title.toLowerCase().includes(lowerQuery) ||
      game.description.toLowerCase().includes(lowerQuery) ||
      game.developer.toLowerCase().includes(lowerQuery) ||
      game.genre.toLowerCase().includes(lowerQuery)
    );
  }

  // ==================== MÉTODOS PARA ENRIQUECIMENTO VIA API ====================

  // Buscar jogos por plataforma
  async getGamesByPlatform(platform, page = 1, pageSize = 20) {
    try {
      const platformIds = {
        'switch': 7,     // Nintendo Switch
        'ps5': 187,      // PlayStation 5
        'xbox': 186,     // Xbox Series S/X
        'pc': 4,         // PC
        'ps4': 18,       // PlayStation 4
        'xbox-one': 1    // Xbox One
      };

      const response = await fetch(
        `${this.baseURL}/games?key=${this.apiKey}&platforms=${platformIds[platform]}&page=${page}&page_size=${pageSize}&ordering=-rating`
      );

      if (!response.ok) throw new Error('Erro na API');

      const data = await response.json();
      return this.formatGamesData(data.results);
    } catch (error) {
      console.error('Erro ao buscar jogos:', error);
      return [];
    }
  }

  // Buscar jogo específico
  async getGameById(gameId) {
    try {
      const response = await fetch(
        `${this.baseURL}/games/${gameId}?key=${this.apiKey}`
      );

      if (!response.ok) throw new Error('Jogo não encontrado');

      const data = await response.json();
      return this.formatGameData(data);
    } catch (error) {
      console.error('Erro ao buscar jogo:', error);
      return null;
    }
  }

  // Buscar jogos por título
  async searchGames(query, page = 1) {
    try {
      const response = await fetch(
        `${this.baseURL}/games?key=${this.apiKey}&search=${encodeURIComponent(query)}&page=${page}&page_size=20`
      );

      if (!response.ok) throw new Error('Erro na busca');

      const data = await response.json();
      return this.formatGamesData(data.results);
    } catch (error) {
      console.error('Erro na busca:', error);
      return [];
    }
  }

  // Formatar dados para o formato do projeto
  formatGamesData(games) {
    return games.map(game => this.formatGameData(game));
  }

  formatGameData(game) {
    return {
      id: game.id,
      title: game.name,
      description: game.description_raw || game.description || '',
      image: game.background_image || '',
      genre: game.genres?.map(g => g.name).join(', ') || 'Não classificado',
      rating: game.rating || Math.random() * 2 + 8, // Fallback
      platform: game.platforms?.map(p => p.platform.name).join(', ') || 'Multi-plataforma',
      size: `${Math.floor(Math.random() * 15 + 1)} GB`, // Estimativa
      releaseDate: game.released,
      metacritic: game.metacritic,
      screenshots: game.short_screenshots?.map(s => s.image) || [],
      stores: game.stores?.map(s => ({
        name: s.store.name,
        url: s.url
      })) || [],
      developers: game.developers?.map(d => d.name) || [],
      publishers: game.publishers?.map(p => p.name) || [],
      tags: game.tags?.slice(0, 5).map(t => t.name) || [],
      installed: Math.random() > 0.6, // 40% chance de estar instalado
      lastPlayed: Math.random() > 0.8 ? new Date().toISOString() : null,
      downloadSize: `${Math.floor(Math.random() * 15 + 1)} GB`
    };
  }

  // Obter jogos populares do Switch
  async getPopularSwitchGames() {
    return this.getGamesByPlatform('switch', 1, 50);
  }

  // Obter jogos recém-lançados
  async getRecentGames(platform = 'switch') {
    try {
      const lastMonth = new Date();
      lastMonth.setMonth(lastMonth.getMonth() - 1);
      const dateFilter = lastMonth.toISOString().split('T')[0];

      const response = await fetch(
        `${this.baseURL}/games?key=${this.apiKey}&dates=${dateFilter},${new Date().toISOString().split('T')[0]}&platforms=7&ordering=-added`
      );

      const data = await response.json();
      return this.formatGamesData(data.results);
    } catch (error) {
      console.error('Erro ao buscar jogos recentes:', error);
      return [];
    }
  }

  // Buscar dados de um jogo específico pelo nome
  async enrichGameData(gameTitle, platformHint = null) {
    try {
      console.log(`🔍 Buscando dados para: ${gameTitle}`);

      const response = await fetch(
        `${this.baseURL}/games?key=${this.apiKey}&search=${encodeURIComponent(gameTitle)}&page_size=5`
      );

      if (!response.ok) throw new Error('Erro na API');

      const data = await response.json();
      const games = data.results;

      if (games.length === 0) {
        console.warn(`❌ Nenhum dado encontrado para: ${gameTitle}`);
        return null;
      }

      // Tentar encontrar o jogo mais relevante
      let bestMatch = games[0];

      // Se temos hint de plataforma, tentar encontrar match melhor
      if (platformHint) {
        const platformMatch = games.find(game =>
          game.platforms?.some(p =>
            p.platform.name.toLowerCase().includes(platformHint.toLowerCase())
          )
        );
        if (platformMatch) bestMatch = platformMatch;
      }

      // Buscar dados detalhados do jogo
      const detailedData = await this.getGameDetails(bestMatch.id);

      console.log(`✅ Dados encontrados para: ${gameTitle}`);
      return this.formatEnrichedGameData(detailedData || bestMatch);

    } catch (error) {
      console.error(`❌ Erro ao buscar dados para ${gameTitle}:`, error);
      return null;
    }
  }

  // Buscar detalhes completos de um jogo
  async getGameDetails(gameId) {
    try {
      const response = await fetch(
        `${this.baseURL}/games/${gameId}?key=${this.apiKey}`
      );

      if (!response.ok) return null;

      return await response.json();
    } catch (error) {
      console.error('Erro ao buscar detalhes:', error);
      return null;
    }
  }

  // Enriquecer múltiplos jogos em lote
  async enrichGamesData(localGames) {
    console.log(`🚀 Enriquecendo ${localGames.length} jogos com dados da API...`);

    const enrichedGames = [];

    for (const localGame of localGames) {
      try {
        // Aguardar um pouco entre requisições para não sobrecarregar a API
        await new Promise(resolve => setTimeout(resolve, 200));

        const apiData = await this.enrichGameData(localGame.title, localGame.platform);

        const enrichedGame = {
          ...localGame, // Manter dados locais como base
          ...this.mergeGameData(localGame, apiData) // Adicionar dados da API
        };

        enrichedGames.push(enrichedGame);

      } catch (error) {
        console.error(`Erro ao enriquecer ${localGame.title}:`, error);
        // Em caso de erro, manter dados locais
        enrichedGames.push(localGame);
      }
    }

    console.log(`✅ ${enrichedGames.length} jogos enriquecidos!`);
    return enrichedGames;
  }

  // Mesclar dados locais com dados da API
  mergeGameData(localGame, apiData) {
    if (!apiData) return {}; // Se não há dados da API, retornar vazio

    return {
      // Manter IDs e dados essenciais locais
      id: localGame.id,
      title: localGame.title,
      installed: localGame.installed,
      lastPlayed: localGame.lastPlayed,
      downloadSize: localGame.downloadSize,

      // Enriquecer com dados da API (apenas se não existirem localmente)
      description: localGame.description || apiData.description,
      image: localGame.image || apiData.image,
      genre: localGame.genre || apiData.genre,
      rating: localGame.rating || apiData.rating,
      platform: localGame.platform || apiData.platform,

      // Dados extras da API
      metacritic: apiData.metacritic,
      releaseDate: apiData.releaseDate,
      screenshots: apiData.screenshots || [],
      stores: apiData.stores || [],
      developers: apiData.developers || [],
      publishers: apiData.publishers || [],
      tags: apiData.tags || [],

      // Manter dados de tamanho locais se existirem
      size: localGame.size || apiData.size
    };
  }

  // Formatar dados da API para o formato do projeto
  formatEnrichedGameData(game) {
    return {
      description: game.description_raw || game.description || '',
      image: game.background_image || '',
      genre: game.genres?.map(g => g.name).join(', ') || '',
      rating: game.rating || (Math.random() * 2 + 8).toFixed(1),
      platform: game.platforms?.map(p => p.platform.name).join(', ') || '',
      size: `${Math.floor(Math.random() * 15 + 1)} GB`,
      releaseDate: game.released,
      metacritic: game.metacritic,
      screenshots: game.short_screenshots?.map(s => s.image) || [],
      stores: game.stores?.map(s => ({
        name: s.store.name,
        url: s.url
      })) || [],
      developers: game.developers?.map(d => d.name) || [],
      publishers: game.publishers?.map(p => p.name) || [],
      tags: game.tags?.slice(0, 5).map(t => t.name) || []
    };
  }

  // Buscar dados de um jogo específico (para usar na busca)
  async searchSingleGame(query) {
    try {
      const response = await fetch(
        `${this.baseURL}/games?key=${this.apiKey}&search=${encodeURIComponent(query)}&page_size=1`
      );

      if (!response.ok) throw new Error('Erro na busca');

      const data = await response.json();
      if (data.results.length === 0) return null;

      return this.formatEnrichedGameData(data.results[0]);
    } catch (error) {
      console.error('Erro na busca:', error);
      return null;
    }
  }

  // ==================== MÉTODO PRINCIPAL PARA ENRIQUECIMENTO ====================

  /**
   * Enriquecer dados de um jogo específico para a tela de detalhes
   * Usado pelo CacheService quando não há cache disponível
   */
  async enrichGameDetails(gameTitle, platformHint = null) {
    try {
      console.log(`🔍 Buscando detalhes completos para: ${gameTitle}`);

      const response = await fetch(
        `${this.baseURL}/games?key=${this.apiKey}&search=${encodeURIComponent(gameTitle)}&page_size=3`
      );

      if (!response.ok) throw new Error('Erro na API');

      const data = await response.json();
      const games = data.results;

      if (games.length === 0) {
        console.warn(`❌ Nenhum detalhe encontrado para: ${gameTitle}`);
        return null;
      }

      // Encontrar o melhor match
      let bestMatch = games[0];

      if (platformHint) {
        const platformMatch = games.find(game =>
          game.platforms?.some(p =>
            p.platform.name.toLowerCase().includes(platformHint.toLowerCase())
          )
        );
        if (platformMatch) bestMatch = platformMatch;
      }

      // Buscar detalhes completos incluindo screenshots
      const detailedResponse = await fetch(
        `${this.baseURL}/games/${bestMatch.id}?key=${this.apiKey}`
      );

      if (!detailedResponse.ok) {
        console.warn('Erro ao buscar detalhes completos, usando dados básicos');
        return this.formatEnrichedGameData(bestMatch);
      }

      const detailedData = await detailedResponse.json();

      // Buscar screenshots adicionais
      const screenshotsResponse = await fetch(
        `${this.baseURL}/games/${bestMatch.id}/screenshots?key=${this.apiKey}`
      );

      let screenshots = [];
      if (screenshotsResponse.ok) {
        const screenshotsData = await screenshotsResponse.json();
        screenshots = screenshotsData.results?.map(s => s.image) || [];
      }

      console.log(`✅ Detalhes completos encontrados para: ${gameTitle}`);
      return this.formatDetailedGameData(detailedData, screenshots);

    } catch (error) {
      console.error(`❌ Erro ao buscar detalhes para ${gameTitle}:`, error);
      return null;
    }
  }

  // Formatar dados detalhados para a tela de detalhes
  formatDetailedGameData(game, additionalScreenshots = []) {
    const baseScreenshots = game.short_screenshots?.map(s => s.image) || [];
    const allScreenshots = [...baseScreenshots, ...additionalScreenshots];

    return {
      description: this.cleanDescription(game.description_raw || game.description || ''),
      image: game.background_image || '',
      genre: game.genres?.map(g => g.name).join(', ') || '',
      rating: game.rating || (Math.random() * 2 + 8).toFixed(1),
      platform: game.platforms?.map(p => p.platform.name).join(', ') || '',
      size: `${Math.floor(Math.random() * 15 + 1)} GB`,
      releaseDate: game.released,
      metacritic: game.metacritic,
      screenshots: allScreenshots.filter(Boolean), // Remove valores vazios
      stores: game.stores?.map(s => ({
        name: s.store.name,
        url: s.url
      })) || [],
      developers: game.developers?.map(d => d.name) || [],
      publishers: game.publishers?.map(p => p.name) || [],
      tags: game.tags?.slice(0, 8).map(t => t.name) || [], // Mais tags para detalhes
      esrbRating: game.esrb_rating?.name || null,
      website: game.website || null,
      playtime: game.playtime || null
    };
  }

  // Limpar descrição HTML
  cleanDescription(description) {
    if (!description) return '';

    // Remover tags HTML básicas
    return description
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .trim();
  }

  /**
   * Recarregar dados locais (útil para testes ou atualizações)
   */
  async reloadLocalGames() {
    this.localGamesData = null; // Limpar cache
    return await this.loadGames();
  }

  /**
   * Verificar se um jogo está na biblioteca local
   */
  isGameInLocalLibrary(gameId) {
    if (!this.localGamesData) return false;
    return this.localGamesData.some(game => game.id === gameId);
  }

  /**
   * Obter jogo local por ID
   */
  getLocalGameById(gameId) {
    if (!this.localGamesData) return null;
    return this.localGamesData.find(game => game.id === gameId) || null;
  }
}

export default new GamesAPIService();