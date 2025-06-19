import { useState, useEffect, useCallback, useRef } from 'react';
import { useGamepad } from './useGamepad';

export const useHomePageNavigation = ({
  games = [],
  filteredGames = [],
  onGameSelect,
  onViewChange,
  router,
  setSidebarOpen,
  setSearchQuery,
  selectedGenre,
  setSelectedGenre
}) => {
  // Estados de navegação - NAVEGAÇÃO FOCADA NOS JOGOS
  const [currentGameIndex, setCurrentGameIndex] = useState(0);
  const [isNavigating, setIsNavigating] = useState(false);
  const [currentSection, setCurrentSection] = useState('featured');

  // Refs para elementos focáveis
  const gameCardsRef = useRef([]);
  const containerRef = useRef(null);

  const gamepad = useGamepad();
  const navigation = gamepad.getNavigationInput();

  // Seções de jogos (removendo navegação por categorias)
  const sections = ['featured', 'recent', 'action', 'all'];

  // Jogos por seção com melhor organização
  const gamesBySection = {
    featured: games.filter(game => [1, 3, 8, 9].includes(game.id)).filter(game => {
      const matchesGenre = selectedGenre === 'all' ||
        game.genre?.toLowerCase().includes(selectedGenre.toLowerCase());
      return matchesGenre;
    }),
    recent: games.slice(-6).filter(game => {
      const matchesGenre = selectedGenre === 'all' ||
        game.genre?.toLowerCase().includes(selectedGenre.toLowerCase());
      return matchesGenre;
    }),
    action: games.filter(game =>
      game.genre?.toLowerCase().includes('action') ||
      game.genre?.toLowerCase().includes('ação')
    ).filter(game => {
      const matchesGenre = selectedGenre === 'all' ||
        game.genre?.toLowerCase().includes(selectedGenre.toLowerCase());
      return matchesGenre;
    }),
    all: filteredGames
  };

  // Todos os jogos em uma lista linear para navegação sequencial
  const allGamesLinear = [
    ...gamesBySection.featured,
    ...gamesBySection.recent,
    ...gamesBySection.action,
    ...gamesBySection.all
  ].filter((game, index, arr) =>
    // Remove duplicatas
    arr.findIndex(g => g.id === game.id) === index
  );

  // Scroll automático para o jogo selecionado
  const scrollToGame = useCallback((gameIndex) => {
    const gameElement = document.querySelector(`[data-game-index="${gameIndex}"]`);
    if (gameElement) {
      gameElement.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'center'
      });

      // Também scroll horizontal se necessário
      const container = gameElement.closest('[data-game-section]');
      if (container) {
        const containerRect = container.getBoundingClientRect();
        const elementRect = gameElement.getBoundingClientRect();

        if (elementRect.left < containerRect.left || elementRect.right > containerRect.right) {
          gameElement.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest',
            inline: 'center'
          });
        }
      }
    }
  }, []);

  // Navegação vertical entre jogos (experiência console)
  const navigateVertical = useCallback((direction) => {
    const totalGames = allGamesLinear.length;
    if (totalGames === 0) return;

    let newIndex;
    if (direction === 'up') {
      newIndex = currentGameIndex > 0 ? currentGameIndex - 1 : totalGames - 1;
    } else {
      newIndex = currentGameIndex < totalGames - 1 ? currentGameIndex + 1 : 0;
    }

    setCurrentGameIndex(newIndex);
    setIsNavigating(true);

    // Scroll automático
    scrollToGame(newIndex);

    // Vibração suave
    gamepad.vibrate('short', 0.3);

    // Remove indicador de navegação
    setTimeout(() => setIsNavigating(false), 200);
  }, [currentGameIndex, allGamesLinear.length, scrollToGame, gamepad]);

  // Navegação horizontal dentro da seção atual
  const navigateHorizontal = useCallback((direction) => {
    const currentGame = allGamesLinear[currentGameIndex];
    if (!currentGame) return;

    // Encontrar seção atual do jogo
    let currentSectionName = 'featured';
    let sectionGames = [];
    let gameIndexInSection = 0;

    for (const [sectionName, games] of Object.entries(gamesBySection)) {
      const indexInSection = games.findIndex(g => g.id === currentGame.id);
      if (indexInSection !== -1) {
        currentSectionName = sectionName;
        sectionGames = games;
        gameIndexInSection = indexInSection;
        break;
      }
    }

    if (sectionGames.length <= 1) return;

    let newIndexInSection;
    if (direction === 'left') {
      newIndexInSection = gameIndexInSection > 0 ? gameIndexInSection - 1 : sectionGames.length - 1;
    } else {
      newIndexInSection = gameIndexInSection < sectionGames.length - 1 ? gameIndexInSection + 1 : 0;
    }

    const newGame = sectionGames[newIndexInSection];
    const newGlobalIndex = allGamesLinear.findIndex(g => g.id === newGame.id);

    if (newGlobalIndex !== -1) {
      setCurrentGameIndex(newGlobalIndex);
      setIsNavigating(true);
      scrollToGame(newGlobalIndex);
      gamepad.vibrate('short', 0.2);
      setTimeout(() => setIsNavigating(false), 200);
    }
  }, [currentGameIndex, allGamesLinear, gamesBySection, scrollToGame, gamepad]);

  // Confirmar seleção do jogo
  const confirmSelection = useCallback(() => {
    const selectedGame = allGamesLinear[currentGameIndex];
    if (selectedGame) {
      onGameSelect(selectedGame.id);
      gamepad.vibrate('medium', 0.5);
    }
  }, [currentGameIndex, allGamesLinear, onGameSelect, gamepad]);

  // Voltar/Cancelar
  const cancelAction = useCallback(() => {
    // Voltar para o primeiro jogo
    setCurrentGameIndex(0);
    scrollToGame(0);
    gamepad.vibrate('short', 0.3);
  }, [scrollToGame, gamepad]);

  // Abrir sidebar com R3
  const openSidebar = useCallback(() => {
    setSidebarOpen(true);
    gamepad.vibrate('medium', 0.4);
  }, [setSidebarOpen, gamepad]);

  // Navegação rápida com bumpers
  const quickNavigation = useCallback((direction) => {
    if (direction === 'left') {
      onViewChange('settings');
    } else {
      onViewChange('downloads');
    }
    gamepad.vibrate('short', 0.4);
  }, [onViewChange, gamepad]);

  // Trocar seção com triggers
  const changeSectionFilter = useCallback((direction) => {
    const genres = ['all', 'action', 'adventure', 'rpg', 'strategy', 'simulation', 'racing'];
    const currentGenreIndex = genres.indexOf(selectedGenre);

    let newGenreIndex;
    if (direction === 'left') {
      newGenreIndex = currentGenreIndex > 0 ? currentGenreIndex - 1 : genres.length - 1;
    } else {
      newGenreIndex = currentGenreIndex < genres.length - 1 ? currentGenreIndex + 1 : 0;
    }

    setSelectedGenre(genres[newGenreIndex]);
    setCurrentGameIndex(0); // Reset para primeiro jogo
    gamepad.vibrate('pulse', 0.3);
  }, [selectedGenre, setSelectedGenre, gamepad]);

  // Efeito para escutar inputs do gamepad
  useEffect(() => {
    if (!gamepad.gamepadConnected) return;

    // Navegação principal (experiência console)
    if (navigation.up) {
      navigateVertical('up');
    }

    if (navigation.down) {
      navigateVertical('down');
    }

    if (navigation.left) {
      navigateHorizontal('left');
    }

    if (navigation.right) {
      navigateHorizontal('right');
    }

    if (navigation.confirm) {
      confirmSelection();
    }

    if (navigation.cancel) {
      cancelAction();
    }

    if (navigation.menu) {
      openSidebar(); // Menu também abre sidebar
    }

    // R3 para abrir sidebar (nova funcionalidade)
    if (navigation.rightStickClick) {
      openSidebar();
    }

    if (navigation.leftBumper) {
      quickNavigation('left');
    }

    if (navigation.rightBumper) {
      quickNavigation('right');
    }

  }, [
    navigation,
    gamepad.gamepadConnected,
    navigateVertical,
    navigateHorizontal,
    confirmSelection,
    cancelAction,
    openSidebar,
    quickNavigation
  ]);

  // Focar no jogo atual quando a navegação muda
  useEffect(() => {
    if (gamepad.gamepadConnected && allGamesLinear.length > 0) {
      const currentGame = allGamesLinear[currentGameIndex];
      if (currentGame) {
        const gameElement = document.querySelector(`[data-game-id="${currentGame.id}"]`);
        if (gameElement && isNavigating) {
          gameElement.focus();
        }
      }
    }
  }, [currentGameIndex, allGamesLinear, gamepad.gamepadConnected, isNavigating]);

  // Auto-scroll inicial
  useEffect(() => {
    if (allGamesLinear.length > 0 && currentGameIndex === 0) {
      setTimeout(() => scrollToGame(0), 100);
    }
  }, [allGamesLinear.length, scrollToGame]);

  return {
    // Estados principais
    currentGameIndex,
    currentGame: allGamesLinear[currentGameIndex],
    isNavigating,
    gamesBySection,
    allGamesLinear,

    // Refs
    containerRef,
    gameCardsRef,

    // Funções
    scrollToGame,

    // Informações de navegação
    navigationInfo: {
      gameIndex: currentGameIndex,
      totalGames: allGamesLinear.length,
      currentGame: allGamesLinear[currentGameIndex],
      gamepadConnected: gamepad.gamepadConnected,
      controllerType: gamepad.controllerType,
      canNavigate: allGamesLinear.length > 0
    }
  };
};