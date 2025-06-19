import { useState, useEffect, useCallback, useRef } from 'react';
import { useGamepad } from './useGamepad';
import { useGamepadDebounce } from './gamepad/useGamepadDebounce';

// Hook específico para navegação na tela de detalhes
export const useGameDetailsNavigation = ({
  onBack,
  router,
  availableButtons = [],
  // Estados de modais/overlays para navegação gradual
  modalsOpen = {
    trailer: false,
    info: false,
    // outros modais...
  },
  onCloseModals = {} // Funções para fechar cada modal
}) => {
  const [currentButtonIndex, setCurrentButtonIndex] = useState(0);
  const [navigationCooldown, setNavigationCooldown] = useState(0);

  // Refs para elementos focáveis
  const buttonRefs = useRef([]);

  // Constante para cooldown de navegação
  const NAVIGATION_COOLDOWN = 180;

  // Debounce para ações (B, A, etc) - AUMENTADO PARA CONSISTÊNCIA
  const { debounce: debounceAction } = useGamepadDebounce(400); // ✅ Aumentado para 400ms

  // Debounce mais rápido para navegação direcional - TAMBÉM AUMENTADO
  const { debounce: debounceNavigation } = useGamepadDebounce(180); // ✅ Aumentado para 180ms

  const gamepad = useGamepad();
  const navigation = gamepad.getNavigationInput();

  // Função para verificar cooldown
  const canNavigate = useCallback(() => {
    const now = Date.now();
    return now - navigationCooldown > NAVIGATION_COOLDOWN;
  }, [navigationCooldown]);

  // Função para atualizar cooldown
  const updateNavigationCooldown = useCallback(() => {
    setNavigationCooldown(Date.now());
  }, []);

  // Registrar refs dos botões
  const registerButtonRef = useCallback((index, element) => {
    buttonRefs.current[index] = element;
  }, []);

  // Scroll para o elemento focado
  const scrollToElement = useCallback((elementRef) => {
    if (!elementRef) return;

    elementRef.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
      inline: 'center'
    });

    elementRef.focus?.();
  }, []);

  // Ação de cancelar GRADUAL (botão B)
  const cancelAction = useCallback(() => {
    const executed = debounceAction(() => {
      console.log('🎮 Botão B pressionado - verificando modais...');

      // 1. PRIMEIRO: Verificar se há modais abertos
      if (modalsOpen.trailer && onCloseModals.trailer) {
        console.log('🎬 Fechando modal de trailer');
        onCloseModals.trailer();
        gamepad.navigationVibrate('cancel');
        return;
      }

      if (modalsOpen.info && onCloseModals.info) {
        console.log('ℹ️ Fechando modal de informações');
        onCloseModals.info();
        gamepad.navigationVibrate('cancel');
        return;
      }

      // Verificar outros modais dinamicamente
      const openModal = Object.keys(modalsOpen).find(modal => modalsOpen[modal]);
      if (openModal && onCloseModals[openModal]) {
        console.log(`📱 Fechando modal: ${openModal}`);
        onCloseModals[openModal]();
        gamepad.navigationVibrate('cancel');
        return;
      }

      // 2. SEGUNDO: Se não há modais abertos, voltar para tela inicial
      console.log('🏠 Nenhum modal aberto, voltando para tela inicial');

      if (onBack) {
        onBack();
      } else {
        // Fallback - navegar para home
        router.push('/');
      }

      // Feedback háptico
      gamepad.navigationVibrate('cancel');
    });

    if (!executed) {
      console.log('⏱️ Ação B ignorada devido ao debounce');
    }
  }, [modalsOpen, onCloseModals, onBack, router, gamepad, debounceAction]);

  // Ação de confirmação com debounce (botão A)
  const confirmAction = useCallback(() => {
    const executed = debounceAction(() => {
      console.log('🎮 Botão A pressionado na tela de detalhes - Índice:', currentButtonIndex);

      const currentButton = buttonRefs.current[currentButtonIndex];
      if (currentButton) {
        console.log('✅ Clicando no botão via ref');
        currentButton.click();
      } else {
        // Fallback: buscar por atributo
        const element = document.querySelector(`[data-detail-button-index="${currentButtonIndex}"]`);
        if (element) {
          console.log('✅ Elemento encontrado por data attribute, clicando');
          element.click();
        } else {
          console.log('❌ Nenhum elemento encontrado para clicar');
        }
      }

      // Feedback háptico
      gamepad.navigationVibrate('confirm');
    });

    if (!executed) {
      console.log('⏱️ Ação A ignorada devido ao debounce');
    }
  }, [currentButtonIndex, gamepad, debounceAction]);

  // Navegação entre botões com debounce
  const navigateButtons = useCallback((direction) => {
    const executed = debounceNavigation(() => {
      if (availableButtons.length === 0) return;

      let newIndex = currentButtonIndex;

      switch (direction) {
        case 'left':
          newIndex = currentButtonIndex > 0 ? currentButtonIndex - 1 : availableButtons.length - 1;
          break;
        case 'right':
          newIndex = currentButtonIndex < availableButtons.length - 1 ? currentButtonIndex + 1 : 0;
          break;
        case 'up':
        case 'down':
          // Para navegação vertical, pode alternar entre primeiro e último
          newIndex = currentButtonIndex === 0 ? availableButtons.length - 1 : 0;
          break;
      }

      setCurrentButtonIndex(newIndex);

      // Scroll para o botão focado
      setTimeout(() => {
        const element = buttonRefs.current[newIndex];
        if (element) {
          scrollToElement(element);
        }
      }, 50);
    });

    if (!executed) {
      console.log('⏱️ Navegação ignorada devido ao debounce');
    }
  }, [currentButtonIndex, availableButtons.length, debounceNavigation]);

  // Efeito principal para escutar inputs do gamepad
  useEffect(() => {
    if (!gamepad.gamepadConnected) return;

    // Navegação direcional
    if (navigation.left) {
      navigateButtons('left');
    }

    if (navigation.right) {
      navigateButtons('right');
    }

    if (navigation.up) {
      navigateButtons('up');
    }

    if (navigation.down) {
      navigateButtons('down');
    }

    // Ações
    if (navigation.confirm) {
      confirmAction();
    }

    if (navigation.cancel) {
      cancelAction();
    }

    // Menu/Start também volta
    if (navigation.menu) {
      cancelAction();
    }

  }, [
    navigation,
    gamepad.gamepadConnected,
    navigateButtons,
    confirmAction,
    cancelAction
  ]);

  // Reset do foco quando os botões disponíveis mudam
  useEffect(() => {
    if (availableButtons.length > 0 && currentButtonIndex >= availableButtons.length) {
      setCurrentButtonIndex(0);
    }
  }, [availableButtons.length, currentButtonIndex]);

  // Auto-focus no primeiro botão
  useEffect(() => {
    if (availableButtons.length > 0 && buttonRefs.current[0]) {
      setTimeout(() => scrollToElement(buttonRefs.current[0]), 300);
    }
  }, [availableButtons.length, scrollToElement]);

  return {
    // Estados de navegação
    currentButtonIndex,

    // Funções de registro
    registerButtonRef,

    // Informações de navegação
    navigationInfo: {
      currentButtonIndex,
      totalButtons: availableButtons.length,
      gamepadConnected: gamepad.gamepadConnected,
      controllerType: gamepad.controllerType
    },

    // Função para obter props do botão
    getButtonProps: (index) => ({
      'data-focused': currentButtonIndex === index,
      'data-detail-button-index': index,
      ref: (el) => registerButtonRef(index, el),
      tabIndex: currentButtonIndex === index ? 0 : -1,
      sx: {
        // Estilo visual para elemento focado
        border: currentButtonIndex === index
          ? '3px solid rgba(25, 118, 210, 0.8)'
          : 'none',
        transform: currentButtonIndex === index
          ? 'scale(1.05)'
          : 'scale(1)',
        transition: 'all 0.3s ease',
        boxShadow: currentButtonIndex === index
          ? '0 8px 25px rgba(25, 118, 210, 0.4)'
          : 'none'
      }
    })
  };
};