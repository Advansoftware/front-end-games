import { useState, useEffect, useCallback, useRef } from 'react';
import { useGamepad } from './useGamepad';

// Hook para navegação unificada em toda a aplicação (experiência console)
export const useConsoleNavigation = ({
  onItemSelect,
  onBack,
  onSidebarToggle,
  items = [],
  sections = [],
  enableSectionNavigation = false,
  autoScroll = true,
  hapticFeedback = true
}) => {
  // Estados de navegação
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentSection, setCurrentSection] = useState(0);
  const [isNavigating, setIsNavigating] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Refs para elementos focáveis
  const itemRefs = useRef([]);
  const sectionRefs = useRef([]);
  const containerRef = useRef(null);

  const gamepad = useGamepad();
  const navigation = gamepad.getNavigationInput();

  // Total de itens disponíveis
  const totalItems = items.length;
  const totalSections = sections.length;

  // Registrar refs de elementos
  const registerItemRef = useCallback((index, element) => {
    itemRefs.current[index] = element;
  }, []);

  const registerSectionRef = useCallback((index, element) => {
    sectionRefs.current[index] = element;
  }, []);

  // Scroll automático para o item focado
  const scrollToItem = useCallback((index) => {
    if (!autoScroll) return;

    const element = itemRefs.current[index];
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'center'
      });

      // Também scroll horizontal se necessário
      const container = element.closest('[data-section]');
      if (container) {
        const containerRect = container.getBoundingClientRect();
        const elementRect = element.getBoundingClientRect();

        if (elementRect.left < containerRect.left || elementRect.right > containerRect.right) {
          element.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest',
            inline: 'center'
          });
        }
      }

      // Foco visual
      element.focus?.();
    }
  }, [autoScroll]);

  // Navegação vertical (entre itens)
  const navigateVertical = useCallback((direction) => {
    if (totalItems === 0) return;

    let newIndex;
    if (direction === 'up') {
      newIndex = currentIndex > 0 ? currentIndex - 1 : totalItems - 1;
    } else {
      newIndex = currentIndex < totalItems - 1 ? currentIndex + 1 : 0;
    }

    setCurrentIndex(newIndex);
    setIsNavigating(true);
    scrollToItem(newIndex);

    // Feedback háptico
    if (hapticFeedback) {
      gamepad.navigationVibrate('navigate');
    }

    setTimeout(() => setIsNavigating(false), 200);
  }, [currentIndex, totalItems, scrollToItem, hapticFeedback, gamepad]);

  // Navegação horizontal (entre seções, se habilitado)
  const navigateHorizontal = useCallback((direction) => {
    if (!enableSectionNavigation || totalSections === 0) return;

    let newSection;
    if (direction === 'left') {
      newSection = currentSection > 0 ? currentSection - 1 : totalSections - 1;
    } else {
      newSection = currentSection < totalSections - 1 ? currentSection + 1 : 0;
    }

    setCurrentSection(newSection);
    setCurrentIndex(0); // Reset para primeiro item da seção

    // Feedback háptico
    if (hapticFeedback) {
      gamepad.navigationVibrate('navigate');
    }
  }, [currentSection, totalSections, enableSectionNavigation, hapticFeedback, gamepad]);

  // Confirmar seleção
  const confirmSelection = useCallback(() => {
    const selectedItem = items[currentIndex];
    if (selectedItem && onItemSelect) {
      onItemSelect(selectedItem, currentIndex);

      if (hapticFeedback) {
        gamepad.navigationVibrate('confirm');
      }
    }
  }, [currentIndex, items, onItemSelect, hapticFeedback, gamepad]);

  // Voltar/Cancelar
  const cancelAction = useCallback(() => {
    if (sidebarOpen) {
      setSidebarOpen(false);
      if (onSidebarToggle) {
        onSidebarToggle(false);
      }
    } else if (onBack) {
      onBack();
    }

    if (hapticFeedback) {
      gamepad.navigationVibrate('cancel');
    }
  }, [sidebarOpen, onBack, onSidebarToggle, hapticFeedback, gamepad]);

  // Abrir/fechar sidebar
  const toggleSidebar = useCallback(() => {
    const newState = !sidebarOpen;
    setSidebarOpen(newState);

    if (onSidebarToggle) {
      onSidebarToggle(newState);
    }

    if (hapticFeedback) {
      gamepad.navigationVibrate('select');
    }
  }, [sidebarOpen, onSidebarToggle, hapticFeedback, gamepad]);

  // Efeito para escutar inputs do gamepad
  useEffect(() => {
    if (!gamepad.gamepadConnected) return;

    // Navegação principal
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

    // Ações
    if (navigation.confirm) {
      confirmSelection();
    }

    if (navigation.cancel) {
      cancelAction();
    }

    // Menu/Sidebar (Start ou R3)
    if (navigation.menu || navigation.rightStickClick) {
      toggleSidebar();
    }

    // Navegação rápida com bumpers
    if (navigation.leftBumper) {
      navigateHorizontal('left');
    }

    if (navigation.rightBumper) {
      navigateHorizontal('right');
    }

  }, [
    navigation,
    gamepad.gamepadConnected,
    navigateVertical,
    navigateHorizontal,
    confirmSelection,
    cancelAction,
    toggleSidebar
  ]);

  // Auto-scroll inicial
  useEffect(() => {
    if (totalItems > 0 && currentIndex === 0) {
      setTimeout(() => scrollToItem(0), 100);
    }
  }, [totalItems, scrollToItem]);

  // Reset quando itens mudam
  useEffect(() => {
    if (currentIndex >= totalItems && totalItems > 0) {
      setCurrentIndex(0);
    }
  }, [totalItems, currentIndex]);

  return {
    // Estados de navegação
    currentIndex,
    currentSection,
    isNavigating,
    sidebarOpen,

    // Itens selecionados
    selectedItem: items[currentIndex],
    selectedSection: sections[currentSection],

    // Funções de registro de refs
    registerItemRef,
    registerSectionRef,
    containerRef,

    // Funções de navegação manual
    navigateToItem: (index) => {
      setCurrentIndex(Math.max(0, Math.min(index, totalItems - 1)));
      scrollToItem(index);
    },
    navigateToSection: (index) => {
      setCurrentSection(Math.max(0, Math.min(index, totalSections - 1)));
      setCurrentIndex(0);
    },

    // Controles manuais
    setSidebarOpen,
    toggleSidebar,

    // Informações de navegação
    navigationInfo: {
      currentIndex,
      currentSection,
      totalItems,
      totalSections,
      gamepadConnected: gamepad.gamepadConnected,
      controllerType: gamepad.controllerType,
      canNavigate: totalItems > 0
    }
  };
};