import { useState, useEffect, useCallback, useRef } from 'react';
import { useGamepad } from './useGamepad';
import { useGamepadDebounce } from './gamepad/useGamepadDebounce';

// Hook específico para navegação complexa na tela de downloads
export const useDownloadsNavigation = ({
  onBack,
  router,
  downloads = [], // Lista de downloads filtrados
  filters = [], // Lista de filtros disponíveis
  currentFilter = 'all', // Filtro atual selecionado
  onFilterChange = () => { }, // Callback para mudança de filtro
  // Estados de modais/overlays para navegação gradual
  modalsOpen = {},
  onCloseModals = {}
}) => {
  // Estados de navegação
  const [focusMode, setFocusMode] = useState('filters'); // 'filters', 'downloads', 'actions'
  const [currentFilterIndex, setCurrentFilterIndex] = useState(0);
  const [currentDownloadIndex, setCurrentDownloadIndex] = useState(0);
  const [currentActionIndex, setCurrentActionIndex] = useState(0);

  // Refs para elementos focáveis
  const filterRefs = useRef([]);
  const downloadRefs = useRef([]);
  const actionRefs = useRef([]);

  // Debounce para ações
  const { debounce: debounceAction } = useGamepadDebounce(400);
  const { debounce: debounceNavigation } = useGamepadDebounce(180);

  const gamepad = useGamepad();
  const navigation = gamepad.getNavigationInput();

  // Ações disponíveis por download (baseado no status)
  const getAvailableActions = useCallback((download) => {
    if (!download) return [];

    const actions = [];

    switch (download.status) {
      case 'downloading':
        actions.push('pause', 'cancel', 'details');
        break;
      case 'paused':
        actions.push('resume', 'cancel', 'details');
        break;
      case 'failed':
        actions.push('retry', 'cancel', 'details');
        break;
      case 'completed':
        actions.push('details');
        break;
      default:
        actions.push('details');
    }

    return actions;
  }, []);

  // Registrar refs dos elementos
  const registerFilterRef = useCallback((index, element) => {
    filterRefs.current[index] = element;
  }, []);

  const registerDownloadRef = useCallback((index, element) => {
    downloadRefs.current[index] = element;
  }, []);

  const registerActionRef = useCallback((downloadIndex, actionIndex, element) => {
    if (!actionRefs.current[downloadIndex]) {
      actionRefs.current[downloadIndex] = [];
    }
    actionRefs.current[downloadIndex][actionIndex] = element;
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

  // Navegação entre filtros
  const navigateFilters = useCallback((direction) => {
    const executed = debounceNavigation(() => {
      if (filters.length === 0) return;

      let newIndex = currentFilterIndex;

      switch (direction) {
        case 'left':
          newIndex = currentFilterIndex > 0 ? currentFilterIndex - 1 : filters.length - 1;
          break;
        case 'right':
          newIndex = currentFilterIndex < filters.length - 1 ? currentFilterIndex + 1 : 0;
          break;
        case 'down':
          // Ir para downloads se houver
          if (downloads.length > 0) {
            setFocusMode('downloads');
            setCurrentDownloadIndex(0);
            setTimeout(() => scrollToElement(downloadRefs.current[0]), 50);
            return;
          }
          break;
      }

      setCurrentFilterIndex(newIndex);
      setTimeout(() => scrollToElement(filterRefs.current[newIndex]), 50);
    });

    if (!executed) {
      console.log('⏱️ Downloads: Navegação filtros ignorada devido ao debounce');
    }
  }, [currentFilterIndex, filters.length, downloads.length, debounceNavigation, scrollToElement]);

  // Navegação entre downloads
  const navigateDownloads = useCallback((direction) => {
    const executed = debounceNavigation(() => {
      if (downloads.length === 0) return;

      let newIndex = currentDownloadIndex;

      switch (direction) {
        case 'up':
          if (currentDownloadIndex === 0) {
            // Voltar para filtros
            setFocusMode('filters');
            setTimeout(() => scrollToElement(filterRefs.current[currentFilterIndex]), 50);
            return;
          }
          newIndex = currentDownloadIndex - 1;
          break;
        case 'down':
          newIndex = currentDownloadIndex < downloads.length - 1 ? currentDownloadIndex + 1 : currentDownloadIndex;
          break;
        case 'right':
          // Ir para ações do download atual
          const currentDownload = downloads[currentDownloadIndex];
          const availableActions = getAvailableActions(currentDownload);
          if (availableActions.length > 0) {
            setFocusMode('actions');
            setCurrentActionIndex(0);
            setTimeout(() => {
              const actionElement = actionRefs.current[currentDownloadIndex]?.[0];
              if (actionElement) scrollToElement(actionElement);
            }, 50);
            return;
          }
          break;
      }

      setCurrentDownloadIndex(newIndex);
      setTimeout(() => scrollToElement(downloadRefs.current[newIndex]), 50);
    });

    if (!executed) {
      console.log('⏱️ Downloads: Navegação downloads ignorada devido ao debounce');
    }
  }, [currentDownloadIndex, downloads.length, currentFilterIndex, getAvailableActions, debounceNavigation, scrollToElement]);

  // Navegação entre ações
  const navigateActions = useCallback((direction) => {
    const executed = debounceNavigation(() => {
      const currentDownload = downloads[currentDownloadIndex];
      const availableActions = getAvailableActions(currentDownload);

      if (availableActions.length === 0) return;

      let newIndex = currentActionIndex;

      switch (direction) {
        case 'up':
          newIndex = currentActionIndex > 0 ? currentActionIndex - 1 : availableActions.length - 1;
          break;
        case 'down':
          newIndex = currentActionIndex < availableActions.length - 1 ? currentActionIndex + 1 : 0;
          break;
        case 'left':
          // Voltar para downloads
          setFocusMode('downloads');
          setTimeout(() => scrollToElement(downloadRefs.current[currentDownloadIndex]), 50);
          return;
      }

      setCurrentActionIndex(newIndex);
      setTimeout(() => {
        const actionElement = actionRefs.current[currentDownloadIndex]?.[newIndex];
        if (actionElement) scrollToElement(actionElement);
      }, 50);
    });

    if (!executed) {
      console.log('⏱️ Downloads: Navegação ações ignorada devido ao debounce');
    }
  }, [currentActionIndex, currentDownloadIndex, downloads, getAvailableActions, debounceNavigation, scrollToElement]);

  // Ação de confirmação (botão A)
  const confirmAction = useCallback(() => {
    const executed = debounceAction(() => {
      console.log('🎮 Downloads: Botão A pressionado - Modo:', focusMode);

      if (focusMode === 'filters') {
        // Selecionar filtro
        const selectedFilter = filters[currentFilterIndex];
        if (selectedFilter) {
          console.log('🔍 Downloads: Selecionando filtro:', selectedFilter.id);
          onFilterChange(selectedFilter.id);

          // Se houver downloads, ir para eles
          if (downloads.length > 0) {
            setFocusMode('downloads');
            setCurrentDownloadIndex(0);
            setTimeout(() => scrollToElement(downloadRefs.current[0]), 100);
          }
        }
      } else if (focusMode === 'downloads') {
        // Ir para ações do download
        const currentDownload = downloads[currentDownloadIndex];
        const availableActions = getAvailableActions(currentDownload);
        if (availableActions.length > 0) {
          setFocusMode('actions');
          setCurrentActionIndex(0);
          setTimeout(() => {
            const actionElement = actionRefs.current[currentDownloadIndex]?.[0];
            if (actionElement) scrollToElement(actionElement);
          }, 100);
        }
      } else if (focusMode === 'actions') {
        // Executar ação
        const actionElement = actionRefs.current[currentDownloadIndex]?.[currentActionIndex];
        if (actionElement) {
          console.log('✅ Downloads: Clicando na ação via ref');
          actionElement.click();
        }
      }

      gamepad.navigationVibrate('confirm');
    });

    if (!executed) {
      console.log('⏱️ Downloads: Ação A ignorada devido ao debounce');
    }
  }, [focusMode, currentFilterIndex, currentDownloadIndex, currentActionIndex, filters, downloads, getAvailableActions, onFilterChange, gamepad, debounceAction, scrollToElement]);

  // Ação de cancelar GRADUAL (botão B)
  const cancelAction = useCallback(() => {
    const executed = debounceAction(() => {
      console.log('🎮 Downloads: Botão B pressionado - Modo:', focusMode);

      // 1. PRIMEIRO: Verificar se há modais abertos
      const openModal = Object.keys(modalsOpen).find(modal => modalsOpen[modal]);
      if (openModal && onCloseModals[openModal]) {
        console.log(`📱 Downloads: Fechando modal: ${openModal}`);
        onCloseModals[openModal]();
        gamepad.navigationVibrate('cancel');
        return;
      }

      // 2. SEGUNDO: Navegação gradual baseada no modo atual
      if (focusMode === 'actions') {
        // Voltar para downloads
        console.log('📱 Downloads: Voltando das ações para downloads');
        setFocusMode('downloads');
        setTimeout(() => scrollToElement(downloadRefs.current[currentDownloadIndex]), 100);
        gamepad.navigationVibrate('cancel');
        return;
      }

      if (focusMode === 'downloads') {
        // Voltar para filtros
        console.log('📱 Downloads: Voltando dos downloads para filtros');
        setFocusMode('filters');
        setTimeout(() => scrollToElement(filterRefs.current[currentFilterIndex]), 100);
        gamepad.navigationVibrate('cancel');
        return;
      }

      if (focusMode === 'filters') {
        // Se não estiver no filtro padrão (todos), voltar para ele
        if (currentFilter !== 'all') {
          console.log('📱 Downloads: Voltando para filtro "Todos"');
          const allFilterIndex = filters.findIndex(f => f.id === 'all');
          if (allFilterIndex >= 0) {
            setCurrentFilterIndex(allFilterIndex);
            onFilterChange('all');
            setTimeout(() => scrollToElement(filterRefs.current[allFilterIndex]), 100);
            gamepad.navigationVibrate('cancel');
            return;
          }
        }

        // Se já está no filtro "todos", voltar para tela inicial
        console.log('🏠 Downloads: Voltando para tela inicial');
        if (onBack) {
          onBack();
        } else {
          router.push('/');
        }
        gamepad.navigationVibrate('cancel');
      }
    });

    if (!executed) {
      console.log('⏱️ Downloads: Ação B ignorada devido ao debounce');
    }
  }, [focusMode, currentFilter, currentFilterIndex, currentDownloadIndex, filters, modalsOpen, onCloseModals, onFilterChange, onBack, router, gamepad, debounceAction, scrollToElement]);

  // Efeito principal para escutar inputs do gamepad
  useEffect(() => {
    if (!gamepad.gamepadConnected) return;

    // Navegação direcional baseada no modo atual
    if (navigation.up) {
      if (focusMode === 'downloads') {
        navigateDownloads('up');
      } else if (focusMode === 'actions') {
        navigateActions('up');
      }
    }

    if (navigation.down) {
      if (focusMode === 'filters') {
        navigateFilters('down');
      } else if (focusMode === 'downloads') {
        navigateDownloads('down');
      } else if (focusMode === 'actions') {
        navigateActions('down');
      }
    }

    if (navigation.left) {
      if (focusMode === 'filters') {
        navigateFilters('left');
      } else if (focusMode === 'actions') {
        navigateActions('left');
      }
    }

    if (navigation.right) {
      if (focusMode === 'filters') {
        navigateFilters('right');
      } else if (focusMode === 'downloads') {
        navigateDownloads('right');
      }
    }

    // Ações
    if (navigation.confirm) {
      confirmAction();
    }

    if (navigation.cancel) {
      cancelAction();
    }

    // Menu/Start também executa ação de cancelar
    if (navigation.menu) {
      cancelAction();
    }

  }, [
    navigation,
    gamepad.gamepadConnected,
    focusMode,
    navigateFilters,
    navigateDownloads,
    navigateActions,
    confirmAction,
    cancelAction
  ]);

  // Sincronizar filtro atual com o índice
  useEffect(() => {
    const filterIndex = filters.findIndex(f => f.id === currentFilter);
    if (filterIndex >= 0 && filterIndex !== currentFilterIndex) {
      setCurrentFilterIndex(filterIndex);
    }
  }, [currentFilter, filters, currentFilterIndex]);

  // Resetar índices quando downloads mudam
  useEffect(() => {
    if (downloads.length === 0 && focusMode === 'downloads') {
      setFocusMode('filters');
    }
    if (currentDownloadIndex >= downloads.length) {
      setCurrentDownloadIndex(Math.max(0, downloads.length - 1));
    }
  }, [downloads.length, focusMode, currentDownloadIndex]);

  return {
    // Estados de navegação
    focusMode,
    currentFilterIndex,
    currentDownloadIndex,
    currentActionIndex,

    // Funções de registro
    registerFilterRef,
    registerDownloadRef,
    registerActionRef,

    // Informações de navegação
    navigationInfo: {
      focusMode,
      currentFilterIndex,
      currentDownloadIndex,
      currentActionIndex,
      totalFilters: filters.length,
      totalDownloads: downloads.length,
      gamepadConnected: gamepad.gamepadConnected,
      controllerType: gamepad.controllerType
    },

    // Funções para obter props dos elementos
    getFilterProps: (index) => ({
      'data-focused': focusMode === 'filters' && currentFilterIndex === index,
      'data-filter-index': index,
      ref: (el) => registerFilterRef(index, el),
      tabIndex: focusMode === 'filters' && currentFilterIndex === index ? 0 : -1,
      sx: {
        border: focusMode === 'filters' && currentFilterIndex === index
          ? '3px solid rgba(25, 118, 210, 0.8)'
          : 'transparent',
        transform: focusMode === 'filters' && currentFilterIndex === index
          ? 'scale(1.05)'
          : 'scale(1)',
        transition: 'all 0.3s ease',
        boxShadow: focusMode === 'filters' && currentFilterIndex === index
          ? '0 8px 25px rgba(25, 118, 210, 0.4)'
          : 'none'
      }
    }),

    getDownloadProps: (index) => ({
      'data-focused': focusMode === 'downloads' && currentDownloadIndex === index,
      'data-download-index': index,
      ref: (el) => registerDownloadRef(index, el),
      tabIndex: focusMode === 'downloads' && currentDownloadIndex === index ? 0 : -1,
      sx: {
        border: focusMode === 'downloads' && currentDownloadIndex === index
          ? '3px solid rgba(25, 118, 210, 0.8)'
          : 'transparent',
        transform: focusMode === 'downloads' && currentDownloadIndex === index
          ? 'scale(1.02)'
          : 'scale(1)',
        transition: 'all 0.3s ease',
        boxShadow: focusMode === 'downloads' && currentDownloadIndex === index
          ? '0 8px 25px rgba(25, 118, 210, 0.4)'
          : 'none'
      }
    }),

    getActionProps: (downloadIndex, actionIndex) => ({
      'data-focused': focusMode === 'actions' &&
        currentDownloadIndex === downloadIndex &&
        currentActionIndex === actionIndex,
      'data-action-index': `${downloadIndex}-${actionIndex}`,
      ref: (el) => registerActionRef(downloadIndex, actionIndex, el),
      tabIndex: focusMode === 'actions' &&
        currentDownloadIndex === downloadIndex &&
        currentActionIndex === actionIndex ? 0 : -1,
      sx: {
        border: focusMode === 'actions' &&
          currentDownloadIndex === downloadIndex &&
          currentActionIndex === actionIndex
          ? '3px solid rgba(25, 118, 210, 0.8)'
          : 'transparent',
        transform: focusMode === 'actions' &&
          currentDownloadIndex === downloadIndex &&
          currentActionIndex === actionIndex
          ? 'scale(1.1)'
          : 'scale(1)',
        transition: 'all 0.3s ease',
        boxShadow: focusMode === 'actions' &&
          currentDownloadIndex === downloadIndex &&
          currentActionIndex === actionIndex
          ? '0 8px 25px rgba(25, 118, 210, 0.4)'
          : 'none'
      }
    })
  };
};