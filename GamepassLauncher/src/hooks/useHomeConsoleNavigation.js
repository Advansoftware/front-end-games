import { useState, useEffect, useCallback, useRef } from 'react';
import { useGamepad } from './useGamepad';

// Hook específico para navegação na página inicial (experiência console)
export const useHomeConsoleNavigation = ({
  games = [],
  onGameSelect,
  onSidebarToggle,
  router
}) => {
  // Estados de navegação
  const [currentGameIndex, setCurrentGameIndex] = useState(0);
  const [currentHeroButton, setCurrentHeroButton] = useState(0); // 0 = Play, 1 = Ver Detalhes
  const [focusMode, setFocusMode] = useState('hero'); // 'hero', 'games', 'sidebar'
  const [lastGameIndex, setLastGameIndex] = useState(0); // Para voltar após sidebar
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Refs para elementos focáveis
  const heroButtonRefs = useRef([]);
  const gameCardRefs = useRef([]);

  const gamepad = useGamepad();
  const navigation = gamepad.getNavigationInput();

  // Filtrar e organizar jogos
  const featuredGame = games.find(game => game.id === 8) || games[0];
  const gameCards = games.filter(game => game.id !== featuredGame?.id);
  const totalGameCards = gameCards.length;

  // Registrar refs dos elementos
  const registerHeroButtonRef = useCallback((index, element) => {
    heroButtonRefs.current[index] = element;
  }, []);

  const registerGameCardRef = useCallback((index, element) => {
    gameCardRefs.current[index] = element;
  }, []);

  // Scroll automático para o elemento focado - VERSÃO MELHORADA
  const scrollToElement = useCallback((elementRef) => {
    if (!elementRef) return;

    // Scroll com mais opções para garantir que funcione
    elementRef.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
      inline: 'center'
    });

    // Backup: forçar scroll se o elemento não estiver visível
    setTimeout(() => {
      const rect = elementRef.getBoundingClientRect();
      const isVisible = rect.top >= 0 && rect.bottom <= window.innerHeight;

      if (!isVisible) {
        elementRef.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest'
        });
      }
    }, 100);

    // Adicionar foco visual
    elementRef.focus?.();
  }, []);

  // Scroll específico para game cards com seletor mais robusto
  const scrollToGameCard = useCallback((index) => {
    // Tentar múltiplas estratégias para encontrar o elemento
    let element = gameCardRefs.current[index];

    if (!element) {
      // Backup: buscar por atributo data
      element = document.querySelector(`[data-game-index="${index}"]`);
    }

    if (!element) {
      // Backup: buscar por estrutura do grid
      const gameCards = document.querySelectorAll('[data-game-card="true"]');
      element = gameCards[index];
    }

    if (element) {
      scrollToElement(element);

      // Garantir que o container principal também faça scroll se necessário
      const container = element.closest('[data-scroll-container]') ||
        element.closest('.MuiContainer-root') ||
        document.documentElement;

      if (container && container !== document.documentElement) {
        const containerRect = container.getBoundingClientRect();
        const elementRect = element.getBoundingClientRect();

        // Se o elemento está fora da view do container
        if (elementRect.top < containerRect.top || elementRect.bottom > containerRect.bottom) {
          container.scrollTop += (elementRect.top - containerRect.top) - (containerRect.height / 2);
        }
      }
    }
  }, [scrollToElement]);

  // Navegação no Hero Section (apenas botões)
  const navigateHero = useCallback((direction) => {
    if (direction === 'down') {
      // Sair do hero e ir para os games
      setFocusMode('games');
      setCurrentGameIndex(0);
      setTimeout(() => scrollToElement(gameCardRefs.current[0]), 100);
    } else if (direction === 'left') {
      setCurrentHeroButton(prev => prev > 0 ? prev - 1 : 1);
    } else if (direction === 'right') {
      setCurrentHeroButton(prev => prev < 1 ? prev + 1 : 0);
    }

    // Scroll para o botão focado
    setTimeout(() => scrollToElement(heroButtonRefs.current[currentHeroButton]), 50);
  }, [currentHeroButton, scrollToElement]);

  // Navegação nos Game Cards - USANDO SCROLL MELHORADO
  const navigateGames = useCallback((direction) => {
    if (totalGameCards === 0) return;

    let newIndex = currentGameIndex;

    switch (direction) {
      case 'up':
        if (currentGameIndex < 6) {
          // Se está na primeira linha, volta para hero
          setFocusMode('hero');
          setCurrentHeroButton(0);
          setTimeout(() => scrollToElement(heroButtonRefs.current[0]), 100);
          return;
        } else {
          // Move para linha acima (6 cards por linha)
          newIndex = Math.max(0, currentGameIndex - 6);
        }
        break;
      case 'down':
        newIndex = Math.min(totalGameCards - 1, currentGameIndex + 6);
        break;
      case 'left':
        newIndex = currentGameIndex > 0 ? currentGameIndex - 1 : totalGameCards - 1;
        break;
      case 'right':
        newIndex = currentGameIndex < totalGameCards - 1 ? currentGameIndex + 1 : 0;
        break;
    }

    setCurrentGameIndex(newIndex);
    setLastGameIndex(newIndex); // Salvar para voltar do sidebar
    setTimeout(() => scrollToGameCard(newIndex), 100); // Usar função melhorada
  }, [currentGameIndex, totalGameCards, scrollToGameCard]);

  // Ação de confirmação (botão A - clique universal)
  const confirmAction = useCallback(() => {
    if (focusMode === 'hero') {
      // Clique no botão do hero
      if (currentHeroButton === 0) {
        // Botão "Jogar/Download"
        if (featuredGame) {
          // Aqui você pode adicionar lógica de download/play
          console.log('Ação no jogo:', featuredGame.title);
        }
      } else {
        // Botão "Ver Detalhes"
        if (featuredGame) {
          onGameSelect(featuredGame.id);
        }
      }
    } else if (focusMode === 'games') {
      // Clique no game card (navegar para detalhes)
      const selectedGame = gameCards[currentGameIndex];
      if (selectedGame) {
        onGameSelect(selectedGame.id);
      }
    }

    // Feedback háptico
    gamepad.navigationVibrate('confirm');
  }, [focusMode, currentHeroButton, currentGameIndex, featuredGame, gameCards, onGameSelect, gamepad]);

  // Ação de cancelar (botão B - voltar/fechar universal)
  const cancelAction = useCallback(() => {
    if (sidebarOpen) {
      // Fechar sidebar e voltar para último jogo focado
      setSidebarOpen(false);
      onSidebarToggle(false);
      setFocusMode('games');
      setCurrentGameIndex(lastGameIndex);
      setTimeout(() => scrollToElement(gameCardRefs.current[lastGameIndex]), 100);
    } else {
      // Voltar para página anterior ou sair da aplicação
      if (typeof window !== 'undefined' && window.history.length > 1) {
        router.back();
      } else {
        // Fechar aplicação ou ir para tela inicial
        console.log('Voltar para tela inicial ou fechar app');
      }
    }

    // Feedback háptico
    gamepad.navigationVibrate('cancel');
  }, [sidebarOpen, lastGameIndex, onSidebarToggle, router, scrollToElement, gamepad]);

  // Abrir sidebar (botão Start)
  const openSidebar = useCallback(() => {
    if (!sidebarOpen) {
      // Salvar posição atual antes de abrir sidebar
      setLastGameIndex(currentGameIndex);
      setSidebarOpen(true);
      onSidebarToggle(true);
      setFocusMode('sidebar');

      // Feedback háptico
      gamepad.navigationVibrate('select');
    }
  }, [sidebarOpen, currentGameIndex, onSidebarToggle, gamepad]);

  // Efeito principal para escutar inputs do gamepad
  useEffect(() => {
    if (!gamepad.gamepadConnected) return;

    // Navegação direcional
    if (navigation.up) {
      if (focusMode === 'hero') {
        navigateHero('up');
      } else if (focusMode === 'games') {
        navigateGames('up');
      }
    }

    if (navigation.down) {
      if (focusMode === 'hero') {
        navigateHero('down');
      } else if (focusMode === 'games') {
        navigateGames('down');
      }
    }

    if (navigation.left) {
      if (focusMode === 'hero') {
        navigateHero('left');
      } else if (focusMode === 'games') {
        navigateGames('left');
      }
    }

    if (navigation.right) {
      if (focusMode === 'hero') {
        navigateHero('right');
      } else if (focusMode === 'games') {
        navigateGames('right');
      }
    }

    // Ações
    if (navigation.confirm) {
      confirmAction();
    }

    if (navigation.cancel) {
      cancelAction();
    }

    if (navigation.menu) {
      openSidebar();
    }

  }, [
    navigation,
    gamepad.gamepadConnected,
    focusMode,
    navigateHero,
    navigateGames,
    confirmAction,
    cancelAction,
    openSidebar
  ]);

  // Auto-scroll inicial para o primeiro elemento
  useEffect(() => {
    if (focusMode === 'hero' && heroButtonRefs.current[0]) {
      setTimeout(() => scrollToElement(heroButtonRefs.current[0]), 100);
    }
  }, [scrollToElement]);

  return {
    // Estados de navegação
    focusMode,
    currentGameIndex,
    currentHeroButton,
    sidebarOpen,
    lastGameIndex,

    // Elementos selecionados
    selectedGame: gameCards[currentGameIndex],
    featuredGame,

    // Funções de registro de refs
    registerHeroButtonRef,
    registerGameCardRef,

    // Controles manuais
    setSidebarOpen,
    setFocusMode,

    // Informações de navegação
    navigationInfo: {
      focusMode,
      currentGameIndex,
      currentHeroButton,
      totalGameCards,
      gamepadConnected: gamepad.gamepadConnected,
      controllerType: gamepad.controllerType
    },

    // Funções para elementos focáveis
    getGameCardProps: (index) => ({
      'data-focused': focusMode === 'games' && currentGameIndex === index,
      ref: (el) => registerGameCardRef(index, el),
      tabIndex: focusMode === 'games' && currentGameIndex === index ? 0 : -1
    }),

    getHeroButtonProps: (index) => ({
      'data-focused': focusMode === 'hero' && currentHeroButton === index,
      ref: (el) => registerHeroButtonRef(index, el),
      tabIndex: focusMode === 'hero' && currentHeroButton === index ? 0 : -1
    })
  };
};