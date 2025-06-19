import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import GamesAPIService from '../services/GamesAPIService';
import CacheService from '../services/CacheService';

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
  const [downloadProgress, setDownloadProgress] = useState({});
  const [updateProgress, setUpdateProgress] = useState({});
  const [activeDownloads, setActiveDownloads] = useState(new Map());
  const [downloadQueue, setDownloadQueue] = useState([]);
  const [downloadHistory, setDownloadHistory] = useState([]);
  const [lastPlayedGame, setLastPlayedGame] = useState(null);
  const [apiGames, setApiGames] = useState([]);
  const [useLocalData, setUseLocalData] = useState(false);
  const [apiStatus, setApiStatus] = useState({ online: false, lastCheck: null });
  const [selectedGame, setSelectedGame] = useState(null);

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

  // Sistema avançado de downloads
  const createDownloadItem = useCallback((game, priority = 'normal') => {
    const sizes = {
      'small': Math.random() * 2 + 1, // 1-3 GB
      'medium': Math.random() * 8 + 5, // 5-13 GB
      'large': Math.random() * 15 + 15 // 15-30 GB
    };

    const gameSize = game.size || (Math.random() > 0.5 ? 'large' : Math.random() > 0.5 ? 'medium' : 'small');
    const totalSize = sizes[gameSize];

    return {
      id: game.id,
      name: game.title,
      image: game.image,
      progress: 0,
      speed: '0 MB/s',
      eta: 'Calculando...',
      size: `${totalSize.toFixed(1)} GB`,
      downloaded: '0 GB',
      status: 'waiting', // waiting, downloading, paused, completed, failed, cancelled
      priority,
      startTime: new Date().toISOString(),
      totalBytes: totalSize * 1024 * 1024 * 1024,
      downloadedBytes: 0,
      game
    };
  }, []);

  // Função melhorada para baixar um jogo
  const downloadGame = useCallback((gameId, priority = 'normal') => {
    const game = games.find(g => g.id === gameId);
    if (!game) {
      console.error(`❌ Jogo ${gameId} não encontrado`);
      return false;
    }

    // Verificar se já está baixando
    if (activeDownloads.has(gameId)) {
      console.warn(`⚠️ Jogo ${game.title} já está sendo baixado`);
      return false;
    }

    console.log(`📥 Iniciando download: ${game.title}`);

    const downloadItem = createDownloadItem(game, priority);

    // Adicionar aos downloads ativos
    setActiveDownloads(prev => new Map(prev.set(gameId, downloadItem)));

    // Simular progresso de download
    let progress = 0;
    let downloadedBytes = 0;
    const totalBytes = downloadItem.totalBytes;
    const baseSpeed = 30 + Math.random() * 50; // 30-80 MB/s base

    const interval = setInterval(() => {
      // Simular variação na velocidade
      const currentSpeed = baseSpeed + (Math.random() - 0.5) * 20;
      const bytesThisSecond = currentSpeed * 1024 * 1024; // MB para bytes

      downloadedBytes = Math.min(downloadedBytes + bytesThisSecond, totalBytes);
      progress = (downloadedBytes / totalBytes) * 100;

      // Calcular ETA
      const remainingBytes = totalBytes - downloadedBytes;
      const etaSeconds = remainingBytes / (currentSpeed * 1024 * 1024);
      const etaFormatted = etaSeconds > 60
        ? `${Math.ceil(etaSeconds / 60)}m ${Math.ceil(etaSeconds % 60)}s`
        : `${Math.ceil(etaSeconds)}s`;

      const updatedItem = {
        ...downloadItem,
        progress: Math.min(progress, 100),
        speed: `${currentSpeed.toFixed(1)} MB/s`,
        eta: progress >= 100 ? 'Concluído' : etaFormatted,
        downloaded: `${(downloadedBytes / (1024 * 1024 * 1024)).toFixed(1)} GB`,
        downloadedBytes,
        status: progress >= 100 ? 'completed' : 'downloading'
      };

      setActiveDownloads(prev => new Map(prev.set(gameId, updatedItem)));

      if (progress >= 100) {
        clearInterval(interval);

        // Marcar jogo como instalado
        setGames(prevGames =>
          prevGames.map(g =>
            g.id === gameId ? { ...g, installed: true } : g
          )
        );

        // Mover para histórico após 3 segundos
        setTimeout(() => {
          setDownloadHistory(prev => [updatedItem, ...prev]);
          setActiveDownloads(prev => {
            const newMap = new Map(prev);
            newMap.delete(gameId);
            return newMap;
          });
        }, 3000);

        console.log(`✅ Download concluído: ${game.title}`);
      }
    }, 1000);

    return true;
  }, [games, activeDownloads, createDownloadItem]);

  // Pausar download
  const pauseDownload = useCallback((gameId) => {
    const download = activeDownloads.get(gameId);
    if (download && download.status === 'downloading') {
      const updatedItem = {
        ...download,
        status: 'paused',
        speed: '0 MB/s',
        eta: 'Pausado'
      };
      setActiveDownloads(prev => new Map(prev.set(gameId, updatedItem)));
      console.log(`⏸️ Download pausado: ${download.name}`);
    }
  }, [activeDownloads]);

  // Retomar download
  const resumeDownload = useCallback((gameId) => {
    const download = activeDownloads.get(gameId);
    if (download && download.status === 'paused') {
      // Reiniciar o download do ponto onde parou
      const updatedItem = {
        ...download,
        status: 'downloading'
      };
      setActiveDownloads(prev => new Map(prev.set(gameId, updatedItem)));

      // Continuar simulação de download
      let { downloadedBytes, totalBytes } = download;
      const baseSpeed = 30 + Math.random() * 50;

      const interval = setInterval(() => {
        const currentSpeed = baseSpeed + (Math.random() - 0.5) * 20;
        const bytesThisSecond = currentSpeed * 1024 * 1024;

        downloadedBytes = Math.min(downloadedBytes + bytesThisSecond, totalBytes);
        const progress = (downloadedBytes / totalBytes) * 100;

        const remainingBytes = totalBytes - downloadedBytes;
        const etaSeconds = remainingBytes / (currentSpeed * 1024 * 1024);
        const etaFormatted = etaSeconds > 60
          ? `${Math.ceil(etaSeconds / 60)}m ${Math.ceil(etaSeconds % 60)}s`
          : `${Math.ceil(etaSeconds)}s`;

        const updatedItem = {
          ...download,
          progress: Math.min(progress, 100),
          speed: `${currentSpeed.toFixed(1)} MB/s`,
          eta: progress >= 100 ? 'Concluído' : etaFormatted,
          downloaded: `${(downloadedBytes / (1024 * 1024 * 1024)).toFixed(1)} GB`,
          downloadedBytes,
          status: progress >= 100 ? 'completed' : 'downloading'
        };

        setActiveDownloads(prev => new Map(prev.set(gameId, updatedItem)));

        if (progress >= 100) {
          clearInterval(interval);

          setGames(prevGames =>
            prevGames.map(g =>
              g.id === gameId ? { ...g, installed: true } : g
            )
          );

          setTimeout(() => {
            setDownloadHistory(prev => [updatedItem, ...prev]);
            setActiveDownloads(prev => {
              const newMap = new Map(prev);
              newMap.delete(gameId);
              return newMap;
            });
          }, 3000);
        }
      }, 1000);

      console.log(`▶️ Download retomado: ${download.name}`);
    }
  }, [activeDownloads]);

  // Cancelar download
  const cancelDownload = useCallback((gameId) => {
    const download = activeDownloads.get(gameId);
    if (download) {
      const cancelledItem = {
        ...download,
        status: 'cancelled',
        speed: '0 MB/s',
        eta: 'Cancelado'
      };

      setDownloadHistory(prev => [cancelledItem, ...prev]);
      setActiveDownloads(prev => {
        const newMap = new Map(prev);
        newMap.delete(gameId);
        return newMap;
      });

      console.log(`❌ Download cancelado: ${download.name}`);
    }
  }, [activeDownloads]);

  // Tentar novamente download falho
  const retryDownload = useCallback((gameId) => {
    // Remove do histórico se estiver lá e tenta novamente
    setDownloadHistory(prev => prev.filter(item => item.id !== gameId));
    downloadGame(gameId, 'high');
    console.log(`🔄 Tentando download novamente: ${gameId}`);
  }, [downloadGame]);

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

  // Obter estatísticas de downloads
  const getDownloadStats = useCallback(() => {
    const downloadsArray = Array.from(activeDownloads.values());
    const downloading = downloadsArray.filter(d => d.status === 'downloading');
    const totalSpeed = downloading.reduce((sum, d) => {
      const speed = parseFloat(d.speed.replace(' MB/s', '')) || 0;
      return sum + speed;
    }, 0);

    return {
      total: downloadsArray.length,
      downloading: downloading.length,
      paused: downloadsArray.filter(d => d.status === 'paused').length,
      completed: downloadsArray.filter(d => d.status === 'completed').length,
      failed: downloadsArray.filter(d => d.status === 'failed').length,
      totalSpeed: totalSpeed.toFixed(1),
      activeDownloads: downloadsArray,
      downloadHistory
    };
  }, [activeDownloads, downloadHistory]);

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
    downloadProgress,
    updateProgress,
    lastPlayedGame,
    downloadGame,
    pauseDownload,
    resumeDownload,
    cancelDownload,
    retryDownload,
    getDownloadStats,
    activeDownloads,
    downloadHistory,
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