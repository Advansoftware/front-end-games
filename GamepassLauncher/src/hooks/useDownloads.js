import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';

const DownloadsContext = createContext();

export const useDownloads = () => {
  const context = useContext(DownloadsContext);
  if (!context) {
    throw new Error('useDownloads must be used within a DownloadsProvider');
  }
  return context;
};

export const DownloadsProvider = ({ children }) => {
  const [activeDownloads, setActiveDownloads] = useState(new Map());
  const [downloadHistory, setDownloadHistory] = useState([]);
  const intervalRefs = useRef(new Map());

  // Limpeza quando o componente é desmontado
  useEffect(() => {
    return () => {
      intervalRefs.current.forEach(interval => clearInterval(interval));
      intervalRefs.current.clear();
    };
  }, []);

  // Função para criar item de download com validação
  const createDownloadItem = useCallback((game, priority = 'normal') => {
    // Validações mais robustas
    if (!game || !game.id || !game.title) {
      console.error('❌ Dados do jogo inválidos para download:', game);
      return null;
    }

    // Tamanhos mais consistentes baseados no tipo de jogo
    const getSizeByGameType = (game) => {
      const { genre, platform, title } = game;

      // Tamanhos baseados no gênero e plataforma
      if (platform === 'Switch' || platform === 'Nintendo Switch') {
        // Jogos Switch são geralmente menores
        if (genre?.includes('Indie') || title?.includes('2D')) {
          return Math.random() * 2 + 0.5; // 0.5-2.5 GB
        }
        return Math.random() * 8 + 4; // 4-12 GB
      }

      if (genre?.includes('AAA') || genre?.includes('Action') || genre?.includes('RPG')) {
        return Math.random() * 40 + 20; // 20-60 GB
      }

      if (genre?.includes('Indie') || genre?.includes('Puzzle')) {
        return Math.random() * 3 + 1; // 1-4 GB
      }

      // Padrão
      return Math.random() * 15 + 5; // 5-20 GB
    };

    const totalSize = getSizeByGameType(game);

    // Garantir que totalSize é um número válido
    if (isNaN(totalSize) || totalSize <= 0) {
      console.warn('⚠️ Tamanho inválido calculado, usando padrão:', totalSize);
      const defaultSize = 8; // 8 GB padrão
      return {
        id: game.id,
        name: game.title,
        image: game.image || '/assets/images/default-game.jpg',
        progress: 0,
        speed: '0 MB/s',
        eta: 'Calculando...',
        size: `${defaultSize.toFixed(1)} GB`,
        downloaded: '0 GB',
        status: 'waiting',
        priority,
        startTime: new Date().toISOString(),
        totalBytes: defaultSize * 1024 * 1024 * 1024,
        downloadedBytes: 0,
        game
      };
    }

    return {
      id: game.id,
      name: game.title,
      image: game.image || '/assets/images/default-game.jpg',
      progress: 0,
      speed: '0 MB/s',
      eta: 'Calculando...',
      size: `${totalSize.toFixed(1)} GB`,
      downloaded: '0 GB',
      status: 'waiting',
      priority,
      startTime: new Date().toISOString(),
      totalBytes: totalSize * 1024 * 1024 * 1024,
      downloadedBytes: 0,
      game
    };
  }, []);

  // Função para iniciar download
  const startDownload = useCallback((game, priority = 'normal', onGameInstalled) => {
    if (!game || !game.id) {
      console.error('❌ Jogo inválido para download:', game);
      return false;
    }

    // Verificar se já está baixando
    if (activeDownloads.has(game.id)) {
      console.warn(`⚠️ Jogo ${game.title} já está sendo baixado`);
      return false;
    }

    const downloadItem = createDownloadItem(game, priority);
    if (!downloadItem) {
      console.error('❌ Erro ao criar item de download');
      return false;
    }

    console.log(`📥 Iniciando download: ${game.title}`);

    // Adicionar aos downloads ativos
    setActiveDownloads(prev => new Map(prev.set(game.id, downloadItem)));

    // Simular progresso de download
    let progress = 0;
    let downloadedBytes = 0;
    const totalBytes = downloadItem.totalBytes;
    const baseSpeed = 25 + Math.random() * 45; // 25-70 MB/s base

    const interval = setInterval(() => {
      // Verificar se o download ainda existe
      setActiveDownloads(currentDownloads => {
        const current = currentDownloads.get(game.id);
        if (!current || current.status === 'cancelled') {
          clearInterval(interval);
          intervalRefs.current.delete(game.id);
          return currentDownloads;
        }

        if (current.status === 'paused') {
          return currentDownloads;
        }

        // Simular variação na velocidade
        const currentSpeed = Math.max(5, baseSpeed + (Math.random() - 0.5) * 25);
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

        if (progress >= 100) {
          clearInterval(interval);
          intervalRefs.current.delete(game.id);

          // Chamar callback para marcar jogo como instalado
          if (onGameInstalled) {
            onGameInstalled(game.id);
          }

          // Mover para histórico após 3 segundos
          setTimeout(() => {
            setDownloadHistory(prev => [updatedItem, ...prev]);
            setActiveDownloads(prev => {
              const newMap = new Map(prev);
              newMap.delete(game.id);
              return newMap;
            });
          }, 3000);

          console.log(`✅ Download concluído: ${game.title}`);
        }

        return new Map(currentDownloads.set(game.id, updatedItem));
      });
    }, 1000);

    // Armazenar referência do interval
    intervalRefs.current.set(game.id, interval);

    return true;
  }, [activeDownloads, createDownloadItem]);

  // Função para pausar download
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

  // Função para retomar download
  const resumeDownload = useCallback((gameId, onGameInstalled) => {
    const download = activeDownloads.get(gameId);
    if (download && download.status === 'paused') {
      // Continuar do ponto onde parou
      let { downloadedBytes, totalBytes } = download;
      const baseSpeed = 25 + Math.random() * 45;

      const interval = setInterval(() => {
        setActiveDownloads(currentDownloads => {
          const current = currentDownloads.get(gameId);
          if (!current || current.status === 'cancelled') {
            clearInterval(interval);
            intervalRefs.current.delete(gameId);
            return currentDownloads;
          }

          if (current.status === 'paused') {
            return currentDownloads;
          }

          const currentSpeed = Math.max(5, baseSpeed + (Math.random() - 0.5) * 25);
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

          if (progress >= 100) {
            clearInterval(interval);
            intervalRefs.current.delete(gameId);

            if (onGameInstalled) {
              onGameInstalled(gameId);
            }

            setTimeout(() => {
              setDownloadHistory(prev => [updatedItem, ...prev]);
              setActiveDownloads(prev => {
                const newMap = new Map(prev);
                newMap.delete(gameId);
                return newMap;
              });
            }, 3000);
          }

          return new Map(currentDownloads.set(gameId, updatedItem));
        });
      }, 1000);

      intervalRefs.current.set(gameId, interval);

      // Atualizar status para downloading
      setActiveDownloads(prev => new Map(prev.set(gameId, {
        ...download,
        status: 'downloading'
      })));

      console.log(`▶️ Download retomado: ${download.name}`);
    }
  }, [activeDownloads]);

  // Função para cancelar download
  const cancelDownload = useCallback((gameId) => {
    const download = activeDownloads.get(gameId);
    if (download) {
      // Limpar interval se existir
      const interval = intervalRefs.current.get(gameId);
      if (interval) {
        clearInterval(interval);
        intervalRefs.current.delete(gameId);
      }

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

  // Função para tentar novamente
  const retryDownload = useCallback((gameId, onGameInstalled) => {
    const historyItem = downloadHistory.find(item => item.id === gameId);
    if (historyItem && historyItem.game) {
      // Remove do histórico
      setDownloadHistory(prev => prev.filter(item => item.id !== gameId));
      // Inicia novamente
      startDownload(historyItem.game, 'high', onGameInstalled);
    }
  }, [downloadHistory, startDownload]);

  // Função para obter estatísticas
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
      totalSpeed: totalSpeed,
      activeDownloads: downloadsArray,
      downloadHistory
    };
  }, [activeDownloads, downloadHistory]);

  const contextValue = {
    activeDownloads,
    downloadHistory,
    startDownload,
    pauseDownload,
    resumeDownload,
    cancelDownload,
    retryDownload,
    getDownloadStats
  };

  return (
    <DownloadsContext.Provider value={contextValue}>
      {children}
    </DownloadsContext.Provider>
  );
};