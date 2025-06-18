import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

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
  const [loading, setLoading] = useState(false);
  const [selectedGame, setSelectedGame] = useState(null);
  const [downloadProgress, setDownloadProgress] = useState({});
  const [installedGames, setInstalledGames] = useState([]);

  // API Mock URLs - configuráveis
  const API_CONFIG = {
    gamesApi: 'http://localhost:3001/api/games',
    yuzuDownload: 'https://github.com/yuzu-emu/yuzu-mainline/releases/latest/download/yuzu-windows-msvc.zip',
    firmwareDownload: 'https://github.com/THZoria/NX_Firmware/releases/latest/download/Firmware_15.0.1.zip',
    prodKeysDownload: 'https://github.com/Ryujinx/Ryujinx/wiki/Ryujinx-Setup-&-Configuration-Guide'
  };

  // Carregar jogos do banco local e sincronizar com API
  useEffect(() => {
    loadLocalGames();
    syncWithRemoteAPI();
  }, []);

  const loadLocalGames = async () => {
    try {
      const localData = localStorage.getItem('gamepass-games');
      if (localData) {
        const parsedGames = JSON.parse(localData);
        setGames(parsedGames);
      }
    } catch (error) {
      console.error('Erro ao carregar jogos locais:', error);
    }
  };

  const syncWithRemoteAPI = async () => {
    setLoading(true);
    try {
      // Tentar conectar com API mock
      const response = await axios.get(API_CONFIG.gamesApi, { timeout: 5000 });
      const remoteGames = response.data;

      // Atualizar jogos locais com dados remotos
      setGames(remoteGames);
      localStorage.setItem('gamepass-games', JSON.stringify(remoteGames));
    } catch (error) {
      console.warn('API remota indisponível, usando dados locais:', error.message);
      // Usar dados mock se API não estiver disponível
      useMockData();
    } finally {
      setLoading(false);
    }
  };

  const useMockData = () => {
    const mockGames = [
      {
        id: 1,
        title: "The Legend of Zelda: Breath of the Wild",
        description: "Explore um vasto mundo aberto em uma aventura épica.",
        image: "/assets/images/games/zelda-botw.jpg",
        video: "/assets/videos/zelda-botw-preview.mp4",
        size: "13.4 GB",
        platform: "Nintendo Switch",
        genre: ["Aventura", "Ação"],
        rating: 9.7,
        installed: false,
        downloadUrl: "https://example.com/zelda-botw.zip",
        configFile: "zelda-botw-config.json"
      },
      {
        id: 2,
        title: "Super Mario Odyssey",
        description: "Junte-se ao Mario em uma aventura 3D sandbox.",
        image: "/assets/images/games/mario-odyssey.jpg",
        video: "/assets/videos/mario-odyssey-preview.mp4",
        size: "5.7 GB",
        platform: "Nintendo Switch",
        genre: ["Plataforma", "Aventura"],
        rating: 9.5,
        installed: false,
        downloadUrl: "https://example.com/mario-odyssey.zip",
        configFile: "mario-odyssey-config.json"
      },
      {
        id: 3,
        title: "Pokémon Sword",
        description: "Capture, treine e batalhe com Pokémon na região de Galar.",
        image: "/assets/images/games/pokemon-sword.jpg",
        video: "/assets/videos/pokemon-sword-preview.mp4",
        size: "10.3 GB",
        platform: "Nintendo Switch",
        genre: ["RPG", "Aventura"],
        rating: 8.9,
        installed: true,
        downloadUrl: "https://example.com/pokemon-sword.zip",
        configFile: "pokemon-sword-config.json"
      },
      {
        id: 4,
        title: "Animal Crossing: New Horizons",
        description: "Crie sua ilha perfeita em um mundo relaxante.",
        image: "/assets/images/games/animal-crossing.jpg",
        video: "/assets/videos/animal-crossing-preview.mp4",
        size: "6.2 GB",
        platform: "Nintendo Switch",
        genre: ["Simulação", "Social"],
        rating: 9.1,
        installed: false,
        downloadUrl: "https://example.com/animal-crossing.zip",
        configFile: "animal-crossing-config.json"
      }
    ];

    setGames(mockGames);
    localStorage.setItem('gamepass-games', JSON.stringify(mockGames));
  };

  const downloadGame = async (gameId) => {
    const game = games.find(g => g.id === gameId);
    if (!game) return;

    setDownloadProgress(prev => ({ ...prev, [gameId]: 0 }));

    try {
      // Simular download com progresso
      for (let progress = 0; progress <= 100; progress += 10) {
        await new Promise(resolve => setTimeout(resolve, 500));
        setDownloadProgress(prev => ({ ...prev, [gameId]: progress }));
      }

      // Marcar como instalado
      const updatedGames = games.map(g =>
        g.id === gameId ? { ...g, installed: true } : g
      );
      setGames(updatedGames);
      localStorage.setItem('gamepass-games', JSON.stringify(updatedGames));

      // Aplicar configurações do jogo
      await applyGameConfig(game);

      setDownloadProgress(prev => {
        const { [gameId]: removed, ...rest } = prev;
        return rest;
      });

    } catch (error) {
      console.error('Erro no download:', error);
      setDownloadProgress(prev => {
        const { [gameId]: removed, ...rest } = prev;
        return rest;
      });
    }
  };

  const applyGameConfig = async (game) => {
    try {
      const configPath = `/configs/${game.configFile}`;
      // Aqui seria aplicada a configuração específica do jogo no Yuzu
      console.log(`Aplicando configuração para ${game.title}:`, configPath);
    } catch (error) {
      console.error('Erro ao aplicar configuração:', error);
    }
  };

  const launchGame = async (gameId) => {
    const game = games.find(g => g.id === gameId);
    if (!game || !game.installed) return;

    try {
      // Verificar se Yuzu está instalado
      const yuzuInstalled = await checkYuzuInstallation();
      if (!yuzuInstalled) {
        await downloadYuzu();
      }

      // Lançar o jogo via Yuzu
      if (window.electronAPI) {
        await window.electronAPI.runProcess('yuzu', [game.romPath]);
      }
    } catch (error) {
      console.error('Erro ao lançar jogo:', error);
    }
  };

  const checkYuzuInstallation = async () => {
    // Verificar se Yuzu está instalado
    return new Promise(resolve => {
      // Simular verificação
      setTimeout(() => resolve(false), 1000);
    });
  };

  const downloadYuzu = async () => {
    try {
      console.log('Baixando Yuzu...');
      // Aqui seria feito o download real do Yuzu
      const savePath = './emulators/yuzu.zip';

      if (window.electronAPI) {
        await window.electronAPI.downloadFile(API_CONFIG.yuzuDownload, savePath);
      }
    } catch (error) {
      console.error('Erro ao baixar Yuzu:', error);
    }
  };

  const value = {
    games,
    loading,
    selectedGame,
    setSelectedGame,
    downloadProgress,
    installedGames,
    downloadGame,
    launchGame,
    syncWithRemoteAPI,
    API_CONFIG
  };

  return (
    <GamesContext.Provider value={value}>
      {children}
    </GamesContext.Provider>
  );
};