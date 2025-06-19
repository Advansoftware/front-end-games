import { useState, useEffect, useCallback, useRef } from 'react';
import { useGamepad } from './useGamepad';
import { useGamepadDebounce } from './gamepad/useGamepadDebounce';
import { useTheme } from '@mui/material/styles';
import { themeColors } from '../contexts/ThemeContext';

// Hook para navegação dentro do conteúdo das tabs do modal
export const useGameInfoContentNavigation = ({
  activeTab = 'overview',
  isContentFocused = false,
  onExitContent = () => { }
}) => {
  const [currentElementIndex, setCurrentElementIndex] = useState(0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0); // Para galeria
  const [currentActionIndex, setCurrentActionIndex] = useState(0); // Para ações

  const theme = useTheme();
  const gamepad = useGamepad();
  const navigation = gamepad.getNavigationInput();

  // Obter tema atual do contexto
  const currentTheme = theme.palette.mode === 'dark' ?
    (theme.palette.primary.main === '#107C10' ? 'xbox' :
      theme.palette.primary.main === '#0070F3' ? 'ps5' : 'switch') : 'xbox';

  const currentColors = themeColors[currentTheme];

  // Refs para elementos focáveis
  const elementRefs = useRef([]);
  const imageRefs = useRef([]);
  const actionRefs = useRef([]);

  // Debounce para navegação
  const { debounce: debounceNavigation } = useGamepadDebounce(200);

  // Reset índices quando tab muda ou foco muda
  useEffect(() => {
    if (isContentFocused) {
      setCurrentElementIndex(0);
      setCurrentImageIndex(0);
      setCurrentActionIndex(0);
    }
  }, [activeTab, isContentFocused]);

  // Função para rolar elemento para visualização
  const scrollToElement = useCallback((element) => {
    if (element && element.scrollIntoView) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'nearest'
      });
    }
  }, []);

  // Navegação dentro do conteúdo
  const navigateContent = useCallback((direction) => {
    const executed = debounceNavigation(() => {
      if (!isContentFocused) return;

      switch (activeTab) {
        case 'overview':
          // Navegação na tab Overview (tags, informações)
          const overviewElements = elementRefs.current.filter(el => el);
          if (overviewElements.length === 0) return;

          let newOverviewIndex = currentElementIndex;
          if (direction === 'down' && currentElementIndex < overviewElements.length - 1) {
            newOverviewIndex = currentElementIndex + 1;
          } else if (direction === 'up' && currentElementIndex > 0) {
            newOverviewIndex = currentElementIndex - 1;
          } else if (direction === 'up' && currentElementIndex === 0) {
            // Sair do conteúdo e voltar para navegação de tabs
            onExitContent();
            return;
          }

          if (newOverviewIndex !== currentElementIndex) {
            setCurrentElementIndex(newOverviewIndex);
            scrollToElement(overviewElements[newOverviewIndex]);
            gamepad.navigationVibrate('navigate');
          }
          break;

        case 'gallery':
          // Navegação na galeria de imagens
          const images = imageRefs.current.filter(img => img);
          if (images.length === 0) {
            // Se não há imagens, sair do conteúdo
            if (direction === 'up') {
              onExitContent();
            }
            return;
          }

          let newImageIndex = currentImageIndex;
          const imagesPerRow = 3; // 3 colunas
          const totalRows = Math.ceil(images.length / imagesPerRow);
          const currentRow = Math.floor(currentImageIndex / imagesPerRow);
          const currentCol = currentImageIndex % imagesPerRow;

          switch (direction) {
            case 'up':
              if (currentRow > 0) {
                newImageIndex = Math.max(0, currentImageIndex - imagesPerRow);
              } else {
                // Primeira linha, sair do conteúdo
                onExitContent();
                return;
              }
              break;
            case 'down':
              if (currentRow < totalRows - 1) {
                newImageIndex = Math.min(images.length - 1, currentImageIndex + imagesPerRow);
              }
              break;
            case 'left':
              if (currentCol > 0) {
                newImageIndex = currentImageIndex - 1;
              }
              break;
            case 'right':
              if (currentCol < imagesPerRow - 1 && currentImageIndex < images.length - 1) {
                newImageIndex = currentImageIndex + 1;
              }
              break;
          }

          if (newImageIndex !== currentImageIndex) {
            setCurrentImageIndex(newImageIndex);
            scrollToElement(images[newImageIndex]);
            gamepad.navigationVibrate('navigate');
          }
          break;

        case 'specs':
          // Navegação nas especificações (requisitos mínimos/recomendados)
          const specElements = elementRefs.current.filter(el => el);
          if (specElements.length === 0) return;

          let newSpecIndex = currentElementIndex;
          if (direction === 'down' && currentElementIndex < specElements.length - 1) {
            newSpecIndex = currentElementIndex + 1;
          } else if (direction === 'up' && currentElementIndex > 0) {
            newSpecIndex = currentElementIndex - 1;
          } else if (direction === 'left' || direction === 'right') {
            // Navegação horizontal entre mínimos e recomendados
            newSpecIndex = currentElementIndex === 0 ? 1 : 0;
          } else if (direction === 'up' && currentElementIndex === 0) {
            onExitContent();
            return;
          }

          if (newSpecIndex !== currentElementIndex) {
            setCurrentElementIndex(newSpecIndex);
            scrollToElement(specElements[newSpecIndex]);
            gamepad.navigationVibrate('navigate');
          }
          break;

        case 'actions':
          // Navegação nos botões de ação - pular botões desabilitados
          const actions = actionRefs.current.filter(action => action);
          if (actions.length === 0) return;

          // Função para verificar se um botão está desabilitado
          const isButtonDisabled = (index) => {
            const button = actions[index];
            if (!button) return true;

            // Verificar se o elemento ou seu botão filho está desabilitado
            const actualButton = button.querySelector('button') || button;
            return actualButton && (
              actualButton.disabled ||
              actualButton.hasAttribute('disabled') ||
              actualButton.getAttribute('aria-disabled') === 'true' ||
              actualButton.classList.contains('Mui-disabled')
            );
          };

          let newActionIndex = currentActionIndex;
          let attempts = 0;
          const maxAttempts = actions.length;

          if (direction === 'right') {
            do {
              newActionIndex = newActionIndex < actions.length - 1 ? newActionIndex + 1 : 0;
              attempts++;
            } while (isButtonDisabled(newActionIndex) && attempts < maxAttempts);
          } else if (direction === 'left') {
            do {
              newActionIndex = newActionIndex > 0 ? newActionIndex - 1 : actions.length - 1;
              attempts++;
            } while (isButtonDisabled(newActionIndex) && attempts < maxAttempts);
          } else if (direction === 'up' && currentActionIndex === 0) {
            onExitContent();
            return;
          }

          // Se todos os botões estão desabilitados, não fazer nada
          if (attempts >= maxAttempts && isButtonDisabled(newActionIndex)) {
            return;
          }

          if (newActionIndex !== currentActionIndex) {
            setCurrentActionIndex(newActionIndex);
            scrollToElement(actions[newActionIndex]);
            gamepad.navigationVibrate('navigate');
          }
          break;
      }
    });
  }, [
    activeTab,
    isContentFocused,
    currentElementIndex,
    currentImageIndex,
    currentActionIndex,
    debounceNavigation,
    scrollToElement,
    gamepad,
    onExitContent
  ]);

  // Ação de confirmar no conteúdo
  const confirmAction = useCallback(() => {
    if (!isContentFocused) return;

    switch (activeTab) {
      case 'gallery':
        // Expandir imagem ou visualizar em tamanho maior
        const images = imageRefs.current.filter(img => img);
        if (images[currentImageIndex]) {
          gamepad.navigationVibrate('confirm');
        }
        break;

      case 'actions':
        // Executar ação do botão focado
        const actions = actionRefs.current.filter(action => action);

        if (actions[currentActionIndex]) {
          const actionButton = actions[currentActionIndex];

          // Método melhorado para clicar no botão
          if (actionButton.click) {
            actionButton.click();
          } else {
            // Buscar o botão dentro do Box container
            const button = actionButton.querySelector('button') ||
              actionButton.querySelector('[role="button"]') ||
              actionButton.querySelector('.MuiButton-root');

            if (button) {
              button.click();
            } else {
              // Último recurso: disparar evento de clique
              const clickEvent = new MouseEvent('click', {
                bubbles: true,
                cancelable: true,
                view: window
              });
              actionButton.dispatchEvent(clickEvent);
            }
          }

          gamepad.navigationVibrate('confirm');
        }
        break;

      default:
        // Para outras tabs, só feedback
        gamepad.navigationVibrate('confirm');
        break;
    }
  }, [activeTab, isContentFocused, currentImageIndex, currentActionIndex, gamepad]);

  // Escutar inputs do gamepad
  useEffect(() => {
    if (!gamepad.gamepadConnected || !isContentFocused) return;

    // Navegação direcional
    if (navigation.up) {
      navigateContent('up');
    }
    if (navigation.down) {
      navigateContent('down');
    }
    if (navigation.left) {
      navigateContent('left');
    }
    if (navigation.right) {
      navigateContent('right');
    }

    // Ação de confirmar
    if (navigation.confirm) {
      confirmAction();
    }

  }, [navigation, isContentFocused, navigateContent, confirmAction, gamepad.gamepadConnected]);

  // Funções para registrar elementos focáveis
  const registerElement = useCallback((index) => (element) => {
    if (element) {
      elementRefs.current[index] = element;
    }
  }, []);

  const registerImage = useCallback((index) => (element) => {
    if (element) {
      imageRefs.current[index] = element;
    }
  }, []);

  const registerAction = useCallback((index) => (element) => {
    if (element) {
      actionRefs.current[index] = element;
    }
  }, []);

  // Props para elementos focáveis com estilo correto do padrão estabelecido
  const getElementProps = useCallback((index) => ({
    ref: registerElement(index),
    'data-focused': isContentFocused && currentElementIndex === index,
    tabIndex: isContentFocused && currentElementIndex === index ? 0 : -1,
    sx: {
      // Usar o mesmo padrão da tela de detalhes - mais sutil
      border: isContentFocused && currentElementIndex === index
        ? '3px solid rgba(25, 118, 210, 0.8)'
        : 'none',
      borderRadius: 2,
      transform: isContentFocused && currentElementIndex === index
        ? 'scale(1.05)'
        : 'scale(1)',
      boxShadow: isContentFocused && currentElementIndex === index
        ? '0 8px 25px rgba(25, 118, 210, 0.4)'
        : 'none',
      transition: 'all 0.3s ease'
    }
  }), [isContentFocused, currentElementIndex, registerElement]);

  const getImageProps = useCallback((index) => ({
    ref: registerImage(index),
    'data-focused': isContentFocused && activeTab === 'gallery' && currentImageIndex === index,
    tabIndex: isContentFocused && activeTab === 'gallery' && currentImageIndex === index ? 0 : -1,
    sx: {
      // Usar o mesmo padrão da tela de detalhes - mais sutil
      border: isContentFocused && activeTab === 'gallery' && currentImageIndex === index
        ? '3px solid rgba(25, 118, 210, 0.8)'
        : '2px solid transparent',
      borderRadius: 2,
      transform: isContentFocused && activeTab === 'gallery' && currentImageIndex === index
        ? 'scale(1.05)'
        : 'scale(1)',
      boxShadow: isContentFocused && activeTab === 'gallery' && currentImageIndex === index
        ? '0 8px 25px rgba(25, 118, 210, 0.4)'
        : 'none',
      transition: 'all 0.3s ease',
      cursor: 'pointer'
    }
  }), [isContentFocused, activeTab, currentImageIndex, registerImage]);

  const getActionProps = useCallback((index, isDisabled = false) => ({
    ref: registerAction(index),
    'data-focused': isContentFocused && activeTab === 'actions' && currentActionIndex === index && !isDisabled,
    tabIndex: isContentFocused && activeTab === 'actions' && currentActionIndex === index && !isDisabled ? 0 : -1,
    sx: {
      // Usar o mesmo padrão da tela de detalhes - mais sutil
      border: isContentFocused && activeTab === 'actions' && currentActionIndex === index && !isDisabled
        ? '3px solid rgba(25, 118, 210, 0.8)'
        : 'none',
      borderRadius: 3,
      transform: isContentFocused && activeTab === 'actions' && currentActionIndex === index && !isDisabled
        ? 'scale(1.05)'
        : 'scale(1)',
      boxShadow: isContentFocused && activeTab === 'actions' && currentActionIndex === index && !isDisabled
        ? '0 8px 25px rgba(25, 118, 210, 0.4)'
        : 'none',
      transition: 'all 0.3s ease',
      // Botões desabilitados ficam com opacidade reduzida e sem pointer events
      opacity: isDisabled ? 0.5 : 1,
      pointerEvents: isDisabled ? 'none' : 'auto'
    }
  }), [isContentFocused, activeTab, currentActionIndex, registerAction]);

  return {
    // Estados de navegação
    currentElementIndex,
    currentImageIndex,
    currentActionIndex,

    // Funções para registrar elementos
    registerElement,
    registerImage,
    registerAction,

    // Props para elementos
    getElementProps,
    getImageProps,
    getActionProps,

    // Informações de navegação
    navigationInfo: {
      activeTab,
      isContentFocused,
      currentElementIndex,
      currentImageIndex,
      currentActionIndex
    }
  };
};