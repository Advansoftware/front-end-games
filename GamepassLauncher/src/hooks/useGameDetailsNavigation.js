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
  const { debounce: debounceAction } = useGamepadDebounce(400);

  // Debounce mais rápido para navegação direcional - TAMBÉM AUMENTADO
  const { debounce: debounceNavigation } = useGamepadDebounce(180);

  const gamepad = useGamepad();

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

      // Scroll para o botão focado com delay reduzido
      const timeoutId = setTimeout(() => {
        const element = buttonRefs.current[newIndex];
        if (element) {
          scrollToElement(element);
        }
      }, 50);

      // Cleanup para evitar memory leaks
      return () => clearTimeout(timeoutId);
    });

    if (!executed) {
      console.log('⏱️ Navegação ignorada devido ao debounce');
    }
  }, [currentButtonIndex, availableButtons.length, debounceNavigation, scrollToElement]);

  // Efeito principal para escutar inputs do gamepad - CORRIGIDO
  useEffect(() => {
    if (!gamepad.gamepadConnected) return;

    // Obter navegação uma única vez para evitar múltiplas chamadas
    const navigation = gamepad.getNavigationInput();

    // Navegação direcional
    if (navigation.left) {
      navigateButtons('left');
    } else if (navigation.right) {
      navigateButtons('right');
    } else if (navigation.up) {
      navigateButtons('up');
    } else if (navigation.down) {
      navigateButtons('down');
    }

    // Ações
    if (navigation.confirm) {
      confirmAction();
    } else if (navigation.cancel) {
      cancelAction();
    } else if (navigation.menu) {
      cancelAction();
    }

  }, [
    gamepad.gamepadConnected,
    // REMOVIDO: navigation - isso causava o loop infinito
    // REMOVIDO: navigateButtons, confirmAction, cancelAction - dependências circulares
  ]);

  // Reset do foco quando os botões disponíveis mudam - MELHORADO
  useEffect(() => {
    if (availableButtons.length > 0 && currentButtonIndex >= availableButtons.length) {
      setCurrentButtonIndex(0);
    }
  }, [availableButtons.length]); // REMOVIDO currentButtonIndex da dependência

  // Auto-focus no primeiro botão - MELHORADO
  useEffect(() => {
    if (availableButtons.length > 0) {
      const timeoutId = setTimeout(() => {
        const firstButton = buttonRefs.current[0];
        if (firstButton) {
          scrollToElement(firstButton);
        }
      }, 300);

      return () => clearTimeout(timeoutId);
    }
  }, [availableButtons.length, scrollToElement]);

  // Efeito separado para monitorar mudanças de gamepad - NOVO
  useEffect(() => {
    let animationFrameId;

    const checkGamepadInput = () => {
      if (!gamepad.gamepadConnected) {
        animationFrameId = requestAnimationFrame(checkGamepadInput);
        return;
      }

      const navigation = gamepad.getNavigationInput();

      // Navegação direcional
      if (navigation.left) {
        navigateButtons('left');
      } else if (navigation.right) {
        navigateButtons('right');
      } else if (navigation.up) {
        navigateButtons('up');
      } else if (navigation.down) {
        navigateButtons('down');
      }

      // Ações
      if (navigation.confirm) {
        confirmAction();
      } else if (navigation.cancel || navigation.menu) {
        cancelAction();
      }

      animationFrameId = requestAnimationFrame(checkGamepadInput);
    };

    animationFrameId = requestAnimationFrame(checkGamepadInput);

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [navigateButtons, confirmAction, cancelAction, gamepad]);

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