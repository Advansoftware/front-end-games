import { useState, useEffect, useCallback, useRef } from 'react';
import { useGamepad } from './useGamepad';
import { useGamepadDebounce } from './gamepad/useGamepadDebounce';

// Hook específico para navegação na página inicial (experiência console)
export const useHomeConsoleNavigation = ({
  games = [],
  onGameSelect,
  onSidebarToggle,
  router,
  enabled = true,
  // Estados de modais/overlays para navegação gradual
  modalsOpen = {
    sidebar: false,
    // outros modais...
  }
}) => {
  // Estados de navegação
  const [currentGameIndex, setCurrentGameIndex] = useState(0);
  const [currentHeroButton, setCurrentHeroButton] = useState(0); // 0 = Play, 1 = Ver Detalhes
  const [focusMode, setFocusMode] = useState('hero'); // 'hero', 'games', 'sidebar'
  const [lastGameIndex, setLastGameIndex] = useState(0); // Para voltar após sidebar
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [navigationCooldown, setNavigationCooldown] = useState(0); // Cooldown adicional

  // Refs para elementos focáveis
  const heroButtonRefs = useRef([]);
  const gameCardRefs = useRef([]);

  // Constante para cooldown de navegação
  const NAVIGATION_COOLDOWN = 180; // 180ms entre movimentos de navegação

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

  // Função auxiliar para verificar cooldown
  const canNavigate = useCallback(() => {
    const now = Date.now();
    return now - navigationCooldown > NAVIGATION_COOLDOWN;
  }, [navigationCooldown]);

  // Função para atualizar cooldown
  const updateNavigationCooldown = useCallback(() => {
    setNavigationCooldown(Date.now());
  }, []);

  // Debounce para ações (B, A, etc) - AUMENTADO
  const { debounce: debounceAction } = useGamepadDebounce(400); // ✅ Aumentado de 250ms para 400ms

  // Debounce mais rápido para navegação direcional - TAMBÉM AUMENTADO
  const { debounce: debounceNavigation } = useGamepadDebounce(180); // ✅ Aumentado de 120ms para 180ms

  // Navegação no Hero Section com debounce
  const navigateHero = useCallback((direction) => {
    const executed = debounceNavigation(() => {
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
    });

    if (!executed) {
      console.log('⏱️ Navegação hero ignorada devido ao debounce');
    }
  }, [currentHeroButton, scrollToElement, debounceNavigation]);

  // Navegação nos Game Cards com debounce
  const navigateGames = useCallback((direction) => {
    const executed = debounceNavigation(() => {
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
      setLastGameIndex(newIndex);
      setTimeout(() => scrollToGameCard(newIndex), 100);
    });

    if (!executed) {
      console.log('⏱️ Navegação games ignorada devido ao debounce');
    }
  }, [currentGameIndex, totalGameCards, scrollToGameCard, debounceNavigation]);

  // Ação de confirmação com debounce (botão A - clique universal)
  const confirmAction = useCallback(() => {
    const executed = debounceAction(() => {
      console.log('🎮 Botão A pressionado - Modo:', focusMode);

      if (focusMode === 'hero') {
        const currentButton = heroButtonRefs.current[currentHeroButton];
        console.log('🎯 Hero button ref:', currentButton, 'Index:', currentHeroButton);

        if (currentButton) {
          console.log('✅ Clicando no botão hero via ref');
          currentButton.click();
        } else {
          console.log('⚠️ Ref não encontrado, usando fallback');
          if (currentHeroButton === 0) {
            if (featuredGame) {
              console.log('Ação no jogo:', featuredGame.title);
            }
          } else {
            if (featuredGame) {
              onGameSelect(featuredGame.id);
            }
          }
        }
      } else if (focusMode === 'games') {
        const currentGameCard = gameCardRefs.current[currentGameIndex];
        console.log('🎯 GameCard ref:', currentGameCard, 'Index:', currentGameIndex);
        console.log('🎯 Total refs registrados:', gameCardRefs.current.length);

        if (currentGameCard) {
          console.log('✅ Clicando no GameCard via ref');
          // Tentar clicar no Card ou no primeiro elemento clicável dentro dele
          const clickableElement = currentGameCard.querySelector('[role="button"], button, a') || currentGameCard;
          clickableElement.click();
        } else {
          // Estratégia mais robusta para encontrar o elemento
          console.log('⚠️ Ref não encontrado, tentando seletores alternativos...');

          // Buscar por data attribute
          let element = document.querySelector(`[data-game-index="${currentGameIndex}"]`);
          console.log('🔍 Elemento por data-game-index:', element);

          if (!element) {
            // Buscar por estrutura do grid
            const gameCards = document.querySelectorAll('[data-game-card="true"]');
            element = gameCards[currentGameIndex];
            console.log('🔍 Elemento por data-game-card:', element, 'de', gameCards.length);
          }

          if (!element) {
            // Buscar por estrutura MUI Grid
            const gridItems = document.querySelectorAll('.MuiGrid-item .MuiCard-root');
            element = gridItems[currentGameIndex];
            console.log('🔍 Elemento por MUI Grid:', element, 'de', gridItems.length);
          }

          if (element) {
            console.log('✅ Elemento encontrado, clicando:', element);
            // Tentar clicar no elemento ou no primeiro clicável dentro dele
            const clickableElement = element.querySelector('[role="button"], button, a') || element;
            clickableElement.click();
          } else {
            console.log('❌ Nenhum elemento encontrado, usando fallback manual');
            const selectedGame = gameCards[currentGameIndex];
            if (selectedGame) {
              console.log('📱 Chamando onGameSelect com:', selectedGame.id);
              onGameSelect(selectedGame.id);
            }
          }
        }
      }

      // Feedback háptico
      gamepad.navigationVibrate('confirm');
    });

    if (!executed) {
      console.log('⏱️ Ação A ignorada devido ao debounce');
    }
  }, [focusMode, currentHeroButton, currentGameIndex, featuredGame, gameCards, onGameSelect, gamepad, debounceAction]);

  // Ação de cancelar GRADUAL (botão B - voltar/fechar universal)
  const cancelAction = useCallback(() => {
    const executed = debounceAction(() => {
      console.log('🎮 Botão B pressionado - verificando modais...');

      // 1. PRIMEIRO: Verificar se sidebar está aberta
      if (sidebarOpen) {
        console.log('📱 Fechando sidebar');
        setSidebarOpen(false);
        onSidebarToggle(false);
        setFocusMode('games');
        setCurrentGameIndex(lastGameIndex);
        setTimeout(() => scrollToElement(gameCardRefs.current[lastGameIndex]), 100);
        gamepad.navigationVibrate('cancel');
        return;
      }

      // 2. SEGUNDO: Verificar outros modais
      const openModal = Object.keys(modalsOpen).find(modal => modalsOpen[modal]);
      if (openModal && openModal !== 'sidebar') {
        console.log(`📱 Modal ${openModal} detectado como aberto`);
        // Para outros modais, apenas feedback (eles devem ter seus próprios controles)
        gamepad.navigationVibrate('cancel');
        return;
      }

      // 3. TERCEIRO: Se não há modais, NÃO FAZER NADA na tela inicial
      console.log('🚫 Nenhum modal aberto na tela inicial - botão B ignorado');
      // Apenas feedback háptico leve para indicar que o botão foi pressionado mas não fez nada
      gamepad.navigationVibrate('light');
    });

    if (!executed) {
      console.log('⏱️ Ação B ignorada devido ao debounce');
    }
  }, [sidebarOpen, lastGameIndex, onSidebarToggle, scrollToElement, gamepad, modalsOpen, debounceAction]);

  // Abrir sidebar com debounce (botão Start)
  const openSidebar = useCallback(() => {
    const executed = debounceAction(() => {
      if (!sidebarOpen) {
        setLastGameIndex(currentGameIndex);
        setSidebarOpen(true);
        onSidebarToggle(true);
        setFocusMode('sidebar');
        gamepad.navigationVibrate('select');
      }
    });

    if (!executed) {
      console.log('⏱️ Abertura de sidebar ignorada devido ao debounce');
    }
  }, [sidebarOpen, currentGameIndex, onSidebarToggle, gamepad, debounceAction]);

  // Efeito principal para escutar inputs do gamepad - APENAS SE ENABLED
  useEffect(() => {
    if (!gamepad.gamepadConnected || !enabled) return;

    // Se sidebar está aberta, NÃO processar navegação aqui
    // Deixar a sidebar controlar a navegação
    if (sidebarOpen) return;

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
    enabled, // ✅ ADICIONAR ENABLED COMO DEPENDÊNCIA
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