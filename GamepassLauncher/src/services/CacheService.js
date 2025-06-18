// Cache Service - Sistema inteligente de cache para Electron
class CacheService {
  constructor() {
    this.isElectron = typeof window !== 'undefined' && window.electronAPI;
    this.cachingQueue = new Map(); // Fila de cache em progresso
    this.progressCallbacks = new Set();

    if (this.isElectron) {
      console.log('🖥️ Modo Electron detectado - usando cache nativo');
      this.initElectronCache();
    } else {
      console.log('🌐 Modo navegador detectado - funcionalidade limitada');
    }
  }

  // Inicializar cache do Electron
  async initElectronCache() {
    if (this.isElectron) {
      // Configurar listener de progresso
      window.electronAPI.cache.onProgress((progress) => {
        this.notifyProgress(progress);
      });
    }
  }

  // Notificar progresso para todos os callbacks registrados
  notifyProgress(progress) {
    this.progressCallbacks.forEach(callback => {
      try {
        callback(progress);
      } catch (error) {
        console.warn('Erro no callback de progresso:', error);
      }
    });
  }

  // ==================== MÉTODOS PRINCIPAIS ====================

  /**
   * Carregar dados de um jogo específico (MÉTODO PRINCIPAL)
   * Estratégia: Cache first, depois API, depois salva no cache
   */
  async loadGameFromCache(gameId) {
    if (!this.isElectron) {
      console.warn('⚠️ Cache não disponível no modo navegador');
      return null;
    }

    try {
      console.log(`🔍 Verificando cache para jogo ${gameId}...`);

      // 1. Primeiro, tentar carregar do cache
      const cachedData = await this.getGameDataFromCache(gameId);

      if (cachedData) {
        console.log(`📦 Dados encontrados no cache para jogo ${gameId}`);
        return cachedData;
      }

      console.log(`📭 Nenhum cache encontrado para jogo ${gameId}`);
      return null;

    } catch (error) {
      console.error(`❌ Erro ao carregar cache do jogo ${gameId}:`, error);
      return null;
    }
  }

  /**
   * Enriquecer e cachear dados de um jogo da API
   * Este método é chamado quando não há cache ou quando queremos atualizar
   */
  async enrichAndCacheGameData(gameId, gameTitle, gamePlatform, baseGameData) {
    if (!this.isElectron) {
      console.warn('⚠️ Cache não disponível no modo navegador');
      return baseGameData;
    }

    // Verificar se já está sendo processado
    if (this.cachingQueue.has(gameId)) {
      console.log(`⏳ Jogo ${gameId} já está sendo processado, aguardando...`);
      return await this.cachingQueue.get(gameId);
    }

    // Criar promise para o processamento
    const cachePromise = this.processGameEnrichment(gameId, gameTitle, gamePlatform, baseGameData);
    this.cachingQueue.set(gameId, cachePromise);

    try {
      const result = await cachePromise;
      return result;
    } finally {
      // Remover da fila quando concluído
      this.cachingQueue.delete(gameId);
    }
  }

  /**
   * Processar enriquecimento dos dados do jogo
   */
  async processGameEnrichment(gameId, gameTitle, gamePlatform, baseGameData) {
    try {
      console.log(`🌐 Enriquecendo dados para: ${gameTitle}`);

      // Importar GamesAPIService dinamicamente para evitar dependência circular
      const { default: GamesAPIService } = await import('./GamesAPIService');

      // Buscar dados da API
      const apiData = await GamesAPIService.enrichGameDetails(gameTitle, gamePlatform);

      if (!apiData) {
        console.log(`📱 API não retornou dados para ${gameTitle}, usando dados base`);
        return baseGameData;
      }

      // Mesclar dados base com dados da API
      const enrichedData = {
        ...baseGameData,
        ...apiData,
        // Manter dados essenciais locais
        id: baseGameData.id,
        title: baseGameData.title,
        installed: baseGameData.installed,
        downloadSize: baseGameData.downloadSize,
        downloadProgress: baseGameData.downloadProgress,
        // Metadados do cache
        cachedAt: new Date().toISOString(),
        enrichedFromAPI: true
      };

      console.log(`✨ Dados enriquecidos para ${gameTitle}`);

      // Salvar no cache em segundo plano (não bloqueia)
      this.saveGameToCache(gameId, enrichedData).catch(error => {
        console.warn(`⚠️ Erro ao salvar ${gameTitle} no cache:`, error);
      });

      // Cachear imagens em segundo plano (não bloqueia)
      this.cacheGameImages(gameId, enrichedData).catch(error => {
        console.warn(`⚠️ Erro ao cachear imagens de ${gameTitle}:`, error);
      });

      return enrichedData;

    } catch (error) {
      console.error(`❌ Erro ao enriquecer dados do jogo ${gameId}:`, error);
      return baseGameData;
    }
  }

  /**
   * Obter dados do cache (interno)
   */
  async getGameDataFromCache(gameId) {
    try {
      const result = await window.electronAPI.cache.loadGames();

      if (!result.success || !result.data || !result.data.games) {
        return null;
      }

      const cachedGame = result.data.games.find(game => game.id === gameId);

      if (!cachedGame) {
        return null;
      }

      // Verificar se o cache não está muito antigo (7 dias)
      const cacheAge = new Date() - new Date(cachedGame.cachedAt);
      const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 dias

      if (cacheAge > maxAge) {
        console.log(`🗓️ Cache do jogo ${gameId} expirado`);
        return null;
      }

      return cachedGame;

    } catch (error) {
      console.error(`Erro ao buscar jogo ${gameId} no cache:`, error);
      return null;
    }
  }

  /**
   * Salvar dados do jogo no cache
   */
  async saveGameToCache(gameId, gameData) {
    if (!this.isElectron) return false;

    try {
      console.log(`💾 Salvando ${gameData.title} no cache...`);

      // Carregar cache atual
      const currentCache = await window.electronAPI.cache.loadGames();
      let games = [];

      if (currentCache.success && currentCache.data && currentCache.data.games) {
        games = currentCache.data.games;
      }

      // Remover entrada existente do jogo
      games = games.filter(game => game.id !== gameId);

      // Adicionar dados atualizados
      games.push(gameData);

      // Salvar cache atualizado
      const result = await window.electronAPI.cache.saveGames(games);

      if (result.success) {
        console.log(`✅ ${gameData.title} salvo no cache com sucesso`);
        return true;
      } else {
        console.error(`❌ Erro ao salvar cache:`, result.error);
        return false;
      }

    } catch (error) {
      console.error(`❌ Erro ao salvar jogo ${gameId} no cache:`, error);
      return false;
    }
  }

  /**
   * Cachear imagens de um jogo
   */
  async cacheGameImages(gameId, gameData) {
    if (!this.isElectron) return null;

    try {
      console.log(`🖼️ Iniciando cache de imagens para: ${gameData.title}`);

      const result = await window.electronAPI.cache.cacheGameImages(gameId, gameData);

      if (result.success) {
        console.log(`✅ Imagens de ${gameData.title} cacheadas com sucesso`);
        return result.data;
      } else {
        console.warn(`⚠️ Erro ao cachear imagens:`, result.error);
        return null;
      }

    } catch (error) {
      console.error(`❌ Erro ao cachear imagens do jogo ${gameId}:`, error);
      return null;
    }
  }

  // ==================== MÉTODOS DE LOTE ====================

  /**
   * Carregar todos os jogos do cache
   */
  async loadAllGamesFromCache() {
    if (!this.isElectron) return [];

    try {
      const result = await window.electronAPI.cache.loadGames();

      if (result.success && result.data && result.data.games) {
        console.log(`📦 Carregados ${result.data.games.length} jogos do cache`);
        return result.data.games;
      }

      return [];

    } catch (error) {
      console.error('❌ Erro ao carregar jogos do cache:', error);
      return [];
    }
  }

  /**
   * Cachear jogos em lote (com progresso)
   */
  async cacheGamesBatch(games) {
    if (!this.isElectron) return false;

    try {
      console.log(`🚀 Iniciando cache em lote de ${games.length} jogos`);

      const result = await window.electronAPI.cache.cacheImagesBatch(games);

      if (result.success) {
        console.log(`✅ Cache em lote concluído`);
        return result.results;
      } else {
        console.error(`❌ Erro no cache em lote:`, result.error);
        return false;
      }

    } catch (error) {
      console.error('❌ Erro no cache em lote:', error);
      return false;
    }
  }

  // ==================== MÉTODOS DE STATUS E LIMPEZA ====================

  /**
   * Obter status do cache
   */
  async getCacheStatus() {
    if (!this.isElectron) {
      return {
        exists: false,
        games: 0,
        size: 0,
        images: { count: 0, sizeMB: 0 }
      };
    }

    try {
      const result = await window.electronAPI.cache.getStatus();

      if (result.success) {
        return result;
      } else {
        console.error('Erro ao obter status do cache:', result.error);
        return { exists: false, games: 0, size: 0 };
      }

    } catch (error) {
      console.error('❌ Erro ao obter status do cache:', error);
      return { exists: false, games: 0, size: 0 };
    }
  }

  /**
   * Limpar cache
   */
  async clearCache(type = 'all') {
    if (!this.isElectron) return false;

    try {
      const result = await window.electronAPI.cache.clear(type);

      if (result.success) {
        console.log(`🧹 Cache ${type} limpo com sucesso`);
        return true;
      } else {
        console.error('Erro ao limpar cache:', result.error);
        return false;
      }

    } catch (error) {
      console.error('❌ Erro ao limpar cache:', error);
      return false;
    }
  }

  /**
   * Limpar cache de um jogo específico
   */
  async clearGameCache(gameId) {
    if (!this.isElectron) return false;

    try {
      // Carregar cache atual
      const currentCache = await window.electronAPI.cache.loadGames();

      if (currentCache.success && currentCache.data && currentCache.data.games) {
        // Remover o jogo específico
        const filteredGames = currentCache.data.games.filter(game => game.id !== gameId);

        // Salvar cache atualizado
        const result = await window.electronAPI.cache.saveGames(filteredGames);

        if (result.success) {
          console.log(`🗑️ Cache do jogo ${gameId} removido`);
          return true;
        }
      }

      return false;

    } catch (error) {
      console.error(`❌ Erro ao remover cache do jogo ${gameId}:`, error);
      return false;
    }
  }

  // ==================== MÉTODOS DE CALLBACK ====================

  /**
   * Configurar callback de progresso
   */
  onProgress(callback) {
    if (typeof callback === 'function') {
      this.progressCallbacks.add(callback);
    }
  }

  /**
   * Remover callback de progresso
   */
  removeProgressListener(callback) {
    if (callback) {
      this.progressCallbacks.delete(callback);
    } else {
      this.progressCallbacks.clear();
    }

    if (this.isElectron) {
      window.electronAPI.cache.removeProgressListener();
    }
  }

  // ==================== MÉTODOS UTILITÁRIOS ====================

  /**
   * Verificar se está no modo Electron
   */
  isElectronMode() {
    return this.isElectron;
  }

  /**
   * Verificar se um jogo está em processo de cache
   */
  isGameBeingCached(gameId) {
    return this.cachingQueue.has(gameId);
  }

  /**
   * Aguardar conclusão do cache de um jogo
   */
  async waitForGameCache(gameId) {
    if (this.cachingQueue.has(gameId)) {
      return await this.cachingQueue.get(gameId);
    }
    return null;
  }

  /**
   * Formatar tamanho em bytes para formato legível
   */
  formatSize(bytes) {
    if (bytes === 0) return '0 B';

    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Obter estatísticas simplificadas
   */
  async getSimpleStats() {
    const status = await this.getCacheStatus();

    return {
      totalGames: status.games || 0,
      totalSize: this.formatSize(status.size || 0),
      imagesCount: status.images?.count || 0,
      imagesSize: this.formatSize((status.images?.sizeMB || 0) * 1024 * 1024),
      lastUpdate: status.lastUpdate || null
    };
  }
}

export default new CacheService();