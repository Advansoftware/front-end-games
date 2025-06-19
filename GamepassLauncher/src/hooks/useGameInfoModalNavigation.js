import { useState, useEffect, useCallback } from 'react';
import { useGamepad } from './useGamepad';
import { useGamepadDebounce } from './gamepad/useGamepadDebounce';

// Hook específico para navegação no modal de informações do jogo
export const useGameInfoModalNavigation = ({
  isOpen = false,
  onClose = () => { },
  tabs = ['overview', 'gallery', 'specs', 'actions'],
  initialTab = 'overview'
}) => {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [focusMode, setFocusMode] = useState('tabs'); // 'tabs' ou 'content'

  const gamepad = useGamepad();
  const navigation = gamepad.getNavigationInput();

  // Debounce mais agressivo para LB/RB
  const { debounce: debounceTabNavigation } = useGamepadDebounce(300); // 300ms para tabs
  const { debounce: debounceAction } = useGamepadDebounce(400);

  // Reset quando modal abre/fecha
  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      setFocusMode('tabs');
    }
  }, [isOpen, initialTab]);

  // Navegação entre tabs com LB/RB
  const navigateTabs = useCallback((direction) => {
    const executed = debounceTabNavigation(() => {
      const currentIndex = tabs.indexOf(activeTab);
      let newIndex = currentIndex;

      if (direction === 'left') {
        // LB: só vai para esquerda se não estiver na primeira tab
        if (currentIndex > 0) {
          newIndex = currentIndex - 1;
        } else {
          // Se já está na primeira, não faz nada
          console.log('🎮 GameInfoModal: Já está na primeira tab, LB ignorado');
          return;
        }
      } else {
        // RB: só vai para direita se não estiver na última tab
        if (currentIndex < tabs.length - 1) {
          newIndex = currentIndex + 1;
        } else {
          // Se já está na última, não faz nada
          console.log('🎮 GameInfoModal: Já está na última tab, RB ignorado');
          return;
        }
      }

      console.log(`🎮 GameInfoModal: Navegando tab ${direction} - ${tabs[currentIndex]} → ${tabs[newIndex]}`);
      setActiveTab(tabs[newIndex]);
      gamepad.navigationVibrate('navigate');
    });

    if (!executed) {
      console.log('⏱️ GameInfoModal: Navegação tabs ignorada devido ao debounce');
    }
  }, [activeTab, tabs, debounceTabNavigation, gamepad]);

  // Ação de confirmar (A)
  const confirmAction = useCallback(() => {
    const executed = debounceAction(() => {
      if (focusMode === 'tabs') {
        // Se estava navegando tabs, entrar no conteúdo
        console.log('🎮 GameInfoModal: Entrando no conteúdo da tab');
        setFocusMode('content');
        gamepad.navigationVibrate('confirm');
      } else {
        // Se estava no conteúdo, executar ação específica da tab
        // Isso será tratado pelos componentes internos
        console.log('🎮 GameInfoModal: Executando ação no conteúdo');
        gamepad.navigationVibrate('confirm');
      }
    });

    if (!executed) {
      console.log('⏱️ GameInfoModal: Ação A ignorada devido ao debounce');
    }
  }, [focusMode, debounceAction, gamepad]);

  // Ação de cancelar (B)
  const cancelAction = useCallback(() => {
    const executed = debounceAction(() => {
      if (focusMode === 'content') {
        // Se estava no conteúdo, voltar para navegação de tabs
        console.log('🎮 GameInfoModal: Voltando para navegação de tabs');
        setFocusMode('tabs');
        gamepad.navigationVibrate('cancel');
      } else {
        // Se estava nas tabs, fechar modal
        console.log('🎮 GameInfoModal: Fechando modal');
        onClose();
        gamepad.navigationVibrate('cancel');
      }
    });

    if (!executed) {
      console.log('⏱️ GameInfoModal: Ação B ignorada devido ao debounce');
    }
  }, [focusMode, onClose, debounceAction, gamepad]);

  // Efeito principal para escutar inputs do gamepad
  useEffect(() => {
    if (!gamepad.gamepadConnected || !isOpen) return;

    // LB/RB para navegação entre tabs - usar os nomes corretos dos botões
    const leftBumperName = gamepad.getLeftBumper();
    const rightBumperName = gamepad.getRightBumper();

    if (gamepad.isButtonJustPressed(leftBumperName)) {
      console.log(`🎮 GameInfoModal: ${leftBumperName} pressionado`);
      navigateTabs('left');
    }

    if (gamepad.isButtonJustPressed(rightBumperName)) {
      console.log(`🎮 GameInfoModal: ${rightBumperName} pressionado`);
      navigateTabs('right');
    }

    // Navegação direcional
    if (navigation.up || navigation.down || navigation.left || navigation.right) {
      if (focusMode === 'content') {
        // Deixar que os componentes internos tratem a navegação
        // Não fazemos nada aqui para não interferir
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
      // Menu/Start também fecha o modal
      console.log('🎮 GameInfoModal: Start/Menu pressionado - fechando modal');
      onClose();
      gamepad.navigationVibrate('cancel');
    }

  }, [
    gamepad.gamepadConnected,
    gamepad.isButtonJustPressed,
    gamepad.getLeftBumper,
    gamepad.getRightBumper,
    navigation,
    isOpen,
    focusMode,
    navigateTabs,
    confirmAction,
    cancelAction,
    onClose
  ]);

  return {
    // Estados
    activeTab,
    focusMode,

    // Funções de controle
    setActiveTab,
    setFocusMode,

    // Informações de navegação
    navigationInfo: {
      gamepadConnected: gamepad.gamepadConnected,
      controllerType: gamepad.controllerType,
      currentTabIndex: tabs.indexOf(activeTab),
      totalTabs: tabs.length,
      focusMode
    },

    // Props para componentes
    getTabProps: (tabId, index) => ({
      'data-focused': focusMode === 'tabs' && activeTab === tabId,
      'data-tab-index': index,
      tabIndex: focusMode === 'tabs' && activeTab === tabId ? 0 : -1,
      sx: {
        border: focusMode === 'tabs' && activeTab === tabId
          ? '2px solid rgba(255,255,255,0.8)'
          : '2px solid transparent',
        transform: focusMode === 'tabs' && activeTab === tabId
          ? 'scale(1.05)'
          : 'scale(1)',
        boxShadow: focusMode === 'tabs' && activeTab === tabId
          ? '0 4px 20px rgba(255,255,255,0.3)'
          : 'none',
        transition: 'all 0.3s ease'
      }
    }),

    // Indicar se o conteúdo está focado para navegação interna
    isContentFocused: focusMode === 'content'
  };
};