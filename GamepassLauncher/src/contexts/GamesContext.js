import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import GamesAPIService from '../services/GamesAPIService';
import CacheService from '../services/CacheService';
import { useDownloads } from '../hooks/useDownloads';

const GamesContext = createContext();

export const useGames = () => {
  const context = useContext(GamesContext);
  if (!context) {
    throw new Error('useGames must be used within a GamesProvider');
  }
  return context;
};

export const GamesProvider = ({ children }) => {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updateProgress, setUpdateProgress] = useState({});
  const [lastPlayedGame, setLastPlayedGame] = useState(null);
  const [apiGames, setApiGames] = useState([]);
  const [useLocalData, setUseLocalData] = useState(false);
  const [apiStatus, setApiStatus] = useState({ online: false, lastCheck: null });
  const [selectedGame, setSelectedGame] = useState(null);

  // Usar o contexto de downloads compartilhado
  const downloads = useDownloads();

  // Configurações padrão da API
  const API_CONFIG = {
    gamesApi: 'https://api.gamepass.com/games',
    yuzuDownload: 'https://github.com/yuzu-emu/yuzu-mainline/releases/latest/download/yuzu-windows-msvc.zip',
    firmwareDownload: 'https://archive.org/download/nintendo-switch-global-firmwares',
    searchApi: 'https://api.gamepass.com/search',
    detailsApi: 'https://api.gamepass.com/details'
  };

  // Função para sincronizar com API remota
  const syncWithRemoteAPI = useCallback(async () => {
    try {
      console.log('🔄 Sincronizando com API remota...');
      setApiStatus({ online: true, lastCheck: new Date().toISOString() });

      // Simular sincronização
      await new Promise(resolve => setTimeout(resolve, 2000));

      console.log('✅ Sincronização concluída');
      return true;
    } catch (error) {
      console.error('❌ Erro na sincronização:', error);
      setApiStatus({ online: false, lastCheck: new Date().toISOString() });
      return false;
    }
  }, []);

  // Carregar jogos locais do games.json na inicialização
  useEffect(() => {
    const loadLocalGames = async () => {
      try {
        setLoading(true);
        console.log('🎮 Carregando jogos do arquivo local...');

        // Sempre carregar do games.json para a tela inicial
        const gamesData = await GamesAPIService.loadGames();

        if (gamesData?.length > 0) {
          setGames(gamesData);
          console.log(`📋 ${gamesData.length} jogos carregados do games.json`);

          // Determinar último jogo jogado
          const savedLastPlayed = localStorage.getItem('gamepass-last-played');
          if (savedLastPlayed) {
            const lastGame = gamesData.find(game => game.id.toString() === savedLastPlayed);
            if (lastGame) {
              setLastPlayedGame(lastGame);
            }
          }

          // Se não há último jogo, usar o primeiro da lista
          if (!savedLastPlayed && gamesData.length > 0) {
            const recentGame = gamesData.find(game => game.installed) || gamesData[0];
            if (recentGame) {
              setLastPlayedGame(recentGame);
              localStorage.setItem('gamepass-last-played', recentGame.id.toString());
            }
          }
        }

      } catch (error) {
        console.error('❌ Erro ao carregar jogos locais:', error);
        setError('Erro ao carregar a biblioteca de jogos');
        setGames([]);
      } finally {
        setLoading(false);
      }
    };

    loadLocalGames();
  }, []);

  // Carregar jogos com sistema de cache melhorado
  const loadGames = useCallback(async () => {
    try {
      setLoading(true);
      console.log('🎮 Recarregando jogos...');

      // Sempre carregar dados básicos primeiro
      const gamesData = await GamesAPIService.loadGames();

      if (gamesData?.length > 0) {
        setGames(gamesData);
        console.log(`📋 ${gamesData.length} jogos recarregados`);
      }

    } catch (error) {
      console.error('Erro ao carregar jogos:', error);
      setError('Erro ao carregar a biblioteca de jogos');
    } finally {
      setLoading(false);
    }
  }, []);

  // Método atualizado para enriquecer jogos individuais
  const enrichGameWithAPI = useCallback(async (gameId) => {
    try {
      const game = games.find(g => g.id === gameId);
      if (!game) return;

      console.log(`🌐 Enriquecendo ${game.title} via contexto...`);

      // Usar o novo método do CacheService
      const enrichedData = await CacheService.enrichAndCacheGameData(
        gameId,
        game.title,
        game.platform,
        game
      );

      // Atualizar o jogo na lista
      setGames(prevGames =>
        prevGames.map(g =>
          g.id === gameId ? enrichedData : g
        )
      );

      return enrichedData;

    } catch (error) {
      console.error(`❌ Erro ao enriquecer jogo ${gameId}:`, error);
      return game;
    }
  }, [games]);

  // Método para cache em lote com progresso
  const cacheAllGamesData = useCallback(async () => {
    try {
      if (!CacheService.isElectronMode()) {
        console.warn('⚠️ Cache em lote só funciona no modo Electron');
        return false;
      }

      console.log('🚀 Iniciando cache em lote de todos os jogos...');

      const results = await CacheService.cacheGamesBatch(games);

      if (results) {
        console.log('✅ Cache em lote concluído');
        return true;
      }

      return false;

    } catch (error) {
      console.error('❌ Erro no cache em lote:', error);
      return false;
    }
  }, [games]);

  // Método para obter estatísticas do cache
  const getCacheStats = useCallback(async () => {
    try {
      return await CacheService.getSimpleStats();
    } catch (error) {
      console.error('❌ Erro ao obter estatísticas do cache:', error);
      return null;
    }
  }, []);

  // Método para limpar cache
  const clearCache = useCallback(async (type = 'all') => {
    try {
      const success = await CacheService.clearCache(type);

      if (success) {
        console.log(`🧹 Cache ${type} limpo com sucesso`);

        // Se limpou tudo, recarregar dados básicos
        if (type === 'all') {
          await loadGames();
        }
      }

      return success;
    } catch (error) {
      console.error('❌ Erro ao limpar cache:', error);
      return false;
    }
  }, [loadGames]);

  // Função para baixar um jogo - agora usando o hook
  const downloadGame = useCallback((gameId, priority = 'normal') => {
    const game = games.find(g => g.id === gameId);
    if (!game) {
      console.error(`❌ Jogo ${gameId} não encontrado`);
      return false;
    }

    // Callback para marcar jogo como instalado quando download terminar
    const onGameInstalled = (installedGameId) => {
      setGames(prevGames =>
        prevGames.map(g =>
          g.id === installedGameId ? { ...g, installed: true } : g
        )
      );
    };

    return downloads.startDownload(game, priority, onGameInstalled);
  }, [games, downloads]);

  // Funções de controle de download - delegando para o hook
  const pauseDownload = useCallback((gameId) => {
    return downloads.pauseDownload(gameId);
  }, [downloads]);

  const resumeDownload = useCallback((gameId) => {
    const onGameInstalled = (installedGameId) => {
      setGames(prevGames =>
        prevGames.map(g =>
          g.id === installedGameId ? { ...g, installed: true } : g
        )
      );
    };

    return downloads.resumeDownload(gameId, onGameInstalled);
  }, [downloads]);

  const cancelDownload = useCallback((gameId) => {
    return downloads.cancelDownload(gameId);
  }, [downloads]);

  const retryDownload = useCallback((gameId) => {
    const onGameInstalled = (installedGameId) => {
      setGames(prevGames =>
        prevGames.map(g =>
          g.id === installedGameId ? { ...g, installed: true } : g
        )
      );
    };

    return downloads.retryDownload(gameId, onGameInstalled);
  }, [downloads]);

  // Obter estatísticas de downloads - delegando para o hook
  const getDownloadStats = useCallback(() => {
    return downloads.getDownloadStats();
  }, [downloads]);

  // Função para atualizar um jogo
  const updateGame = useCallback((gameId) => {
    console.log(`🔄 Iniciando atualização do jogo ${gameId}`);

    // Simular progresso de atualização
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 15;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);

        // Remover progresso
        setUpdateProgress(prev => {
          const newProgress = { ...prev };
          delete newProgress[gameId];
          return newProgress;
        });

        console.log(`✅ Atualização do jogo ${gameId} concluída`);
      }

      setUpdateProgress(prev => ({
        ...prev,
        [gameId]: Math.min(progress, 100)
      }));
    }, 800);
  }, []);

  // Função para executar um jogo
  const launchGame = useCallback((gameId) => {
    const game = games.find(g => g.id === gameId);
    if (!game) return;

    console.log(`🚀 Executando jogo: ${game.title}`);

    // Atualizar último jogo jogado
    const updatedGame = {
      ...game,
      lastPlayed: new Date().toISOString()
    };

    setGames(prevGames =>
      prevGames.map(g =>
        g.id === gameId ? updatedGame : g
      )
    );

    setLastPlayedGame(updatedGame);
    localStorage.setItem('gamepass-last-played', gameId.toString());

    // Se estiver no Electron, tentar executar o jogo
    if (window.electronAPI) {
      // Simular execução - você pode implementar a lógica real aqui
      console.log(`🎮 Executando ${game.title} via Electron`);
    }
  }, [games]);

  // Função para buscar jogos
  const searchGames = useCallback((query) => {
    if (!query || query.trim() === '') {
      return games;
    }

    const lowerQuery = query.toLowerCase();
    return games.filter(game =>
      game.title.toLowerCase().includes(lowerQuery) ||
      game.genre?.toLowerCase().includes(lowerQuery) ||
      game.developer?.toLowerCase().includes(lowerQuery) ||
      game.tags?.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
  }, [games]);

  const contextValue = {
    games,
    loading,
    error,
    selectedGame,
    setSelectedGame,
    refreshGames: loadGames,
    enrichGameWithAPI,
    cacheAllGamesData,
    getCacheStats,
    clearCache,
    updateProgress,
    lastPlayedGame,
    downloadGame,
    pauseDownload,
    resumeDownload,
    cancelDownload,
    retryDownload,
    getDownloadStats,
    activeDownloads: downloads.activeDownloads,
    downloadHistory: downloads.downloadHistory,
    updateGame,
    launchGame,
    searchGames,
    toggleDataSource: () => { }, // Manter por compatibilidade
    useLocalData,
    apiStatus,
    apiGames,
    API_CONFIG, // Adicionando configurações da API
    syncWithRemoteAPI, // Adicionando função de sincronização
    getGameById: (id) => games.find(game => game.id === id),
    getFeaturedGame: () => {
      if (lastPlayedGame) {
        return lastPlayedGame;
      }

      if (games.length > 0) {
        const randomIndex = Math.floor(Math.random() * games.length);
        return games[randomIndex];
      }

      return null;
    },

    // Verificar se está no modo Electron
    isElectronMode: CacheService.isElectronMode(),
  };

  return (
    <GamesContext.Provider value={contextValue}>
      {children}
    </GamesContext.Provider>
  );
};