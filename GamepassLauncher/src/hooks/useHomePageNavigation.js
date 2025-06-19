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
  // Estados de navegação
  const [currentSection, setCurrentSection] = useState('hero'); // hero, search, filters, featured, recent, action, all
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isNavigating, setIsNavigating] = useState(false);

  // Refs para elementos focáveis
  const heroRef = useRef(null);
  const searchRef = useRef(null);
  const filtersRef = useRef(null);
  const sectionsRefs = useRef({
    featured: [],
    recent: [],
    action: [],
    all: []
  });

  const gamepad = useGamepad();
  const navigation = gamepad.getNavigationInput();

  // Seções disponíveis
  const sections = ['hero', 'search', 'filters', 'featured', 'recent', 'action', 'all'];

  // Jogos por seção
  const gamesBySection = {
    featured: games.filter(game => [1, 3, 8, 9].includes(game.id)).filter(game => {
      const matchesSearch = true; // Hero não filtra por busca
      const matchesGenre = selectedGenre === 'all' ||
        game.genre?.toLowerCase().includes(selectedGenre.toLowerCase());
      return matchesSearch && matchesGenre;
    }),
    recent: games.slice(-6).filter(game => {
      const matchesSearch = true; // Hero não filtra por busca
      const matchesGenre = selectedGenre === 'all' ||
        game.genre?.toLowerCase().includes(selectedGenre.toLowerCase());
      return matchesSearch && matchesGenre;
    }),
    action: games.filter(game =>
      game.genre?.toLowerCase().includes('action') ||
      game.genre?.toLowerCase().includes('ação')
    ).filter(game => {
      const matchesSearch = true; // Hero não filtra por busca
      const matchesGenre = selectedGenre === 'all' ||
        game.genre?.toLowerCase().includes(selectedGenre.toLowerCase());
      return matchesSearch && matchesGenre;
    }),
    all: filteredGames
  };

  // Gêneros disponíveis
  const genres = ['all', 'action', 'adventure', 'rpg', 'strategy', 'simulation', 'racing'];

  // Função para focar elemento atual
  const focusCurrentElement = useCallback(() => {
    setIsNavigating(true);

    switch (currentSection) {
      case 'hero':
        if (heroRef.current) {
          heroRef.current.focus();
        }
        break;

      case 'search':
        if (searchRef.current) {
          searchRef.current.focus();
        }
        break;

      case 'filters':
        const filterElements = document.querySelectorAll('[data-genre-filter]');
        if (filterElements[currentIndex]) {
          filterElements[currentIndex].focus();
        }
        break;

      case 'featured':
      case 'recent':
      case 'action':
      case 'all':
        const sectionElements = document.querySelectorAll(`[data-game-section="${currentSection}"] [data-game-card]`);
        if (sectionElements[currentIndex]) {
          sectionElements[currentIndex].focus();
        }
        break;
    }

    // Remover indicador de navegação após um tempo
    setTimeout(() => setIsNavigating(false), 100);
  }, [currentSection, currentIndex]);

  // Navegar entre seções (vertical)
  const navigateSection = useCallback((direction) => {
    const currentSectionIndex = sections.indexOf(currentSection);
    let newSectionIndex;

    if (direction === 'up') {
      newSectionIndex = currentSectionIndex > 0 ? currentSectionIndex - 1 : sections.length - 1;
    } else {
      newSectionIndex = currentSectionIndex < sections.length - 1 ? currentSectionIndex + 1 : 0;
    }

    const newSection = sections[newSectionIndex];
    setCurrentSection(newSection);

    // Resetar índice para nova seção
    if (['featured', 'recent', 'action', 'all'].includes(newSection)) {
      const maxIndex = gamesBySection[newSection]?.length - 1 || 0;
      setCurrentIndex(Math.min(currentIndex, maxIndex));
    } else if (newSection === 'filters') {
      setCurrentIndex(Math.min(currentIndex, genres.length - 1));
    } else {
      setCurrentIndex(0);
    }

    // Vibração suave
    gamepad.vibrate('short', 0.3);
  }, [currentSection, currentIndex, gamesBySection, gamepad, sections]);

  // Navegar dentro da seção (horizontal)
  const navigateWithinSection = useCallback((direction) => {
    let maxIndex = 0;

    switch (currentSection) {
      case 'filters':
        maxIndex = genres.length - 1;
        break;

      case 'featured':
      case 'recent':
      case 'action':
      case 'all':
        maxIndex = (gamesBySection[currentSection]?.length - 1) || 0;
        break;

      default:
        return; // Hero e search não têm navegação horizontal
    }

    if (direction === 'left') {
      setCurrentIndex(currentIndex > 0 ? currentIndex - 1 : maxIndex);
    } else {
      setCurrentIndex(currentIndex < maxIndex ? currentIndex + 1 : 0);
    }

    // Vibração suave
    gamepad.vibrate('short', 0.2);
  }, [currentSection, currentIndex, gamesBySection]);

  // Confirmar seleção
  const confirmSelection = useCallback(() => {
    switch (currentSection) {
      case 'hero':
        // Selecionar jogo em destaque
        const featuredGame = games.find(game => game.id === 8) || games[0];
        if (featuredGame) {
          onGameSelect(featuredGame.id);
        }
        break;

      case 'search':
        // Focar no campo de busca
        if (searchRef.current) {
          searchRef.current.focus();
        }
        break;

      case 'filters':
        // Alterar filtro de gênero
        const selectedGenreValue = genres[currentIndex];
        setSelectedGenre(selectedGenreValue);
        break;

      case 'featured':
      case 'recent':
      case 'action':
      case 'all':
        // Selecionar jogo
        const selectedGame = gamesBySection[currentSection][currentIndex];
        if (selectedGame) {
          onGameSelect(selectedGame.id);
        }
        break;
    }

    // Vibração de confirmação
    gamepad.vibrate('medium', 0.5);
  }, [currentSection, currentIndex, games, gamesBySection, onGameSelect, setSelectedGenre]);

  // Voltar/Cancelar
  const cancelAction = useCallback(() => {
    if (currentSection === 'search') {
      // Limpar busca
      setSearchQuery('');
      searchRef.current?.blur();
    } else {
      // Voltar para hero
      setCurrentSection('hero');
      setCurrentIndex(0);
    }

    gamepad.vibrate('short', 0.3);
  }, [currentSection, setSearchQuery]);

  // Abrir menu
  const openMenu = useCallback(() => {
    setSidebarOpen(true);
    gamepad.vibrate('medium', 0.4);
  }, [setSidebarOpen, gamepad]);

  // Navegação rápida com bumpers
  const quickNavigation = useCallback((direction) => {
    if (direction === 'left') {
      // Página anterior ou configurações
      onViewChange('settings');
    } else {
      // Próxima página ou downloads
      onViewChange('downloads');
    }
  }, [onViewChange]);

  // Efeito para escutar inputs do gamepad
  useEffect(() => {
    if (!gamepad.gamepadConnected) return;

    if (navigation.up) {
      navigateSection('up');
    }

    if (navigation.down) {
      navigateSection('down');
    }

    if (navigation.left) {
      navigateWithinSection('left');
    }

    if (navigation.right) {
      navigateWithinSection('right');
    }

    if (navigation.confirm) {
      confirmSelection();
    }

    if (navigation.cancel) {
      cancelAction();
    }

    if (navigation.menu) {
      openMenu();
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
    navigateSection,
    navigateWithinSection,
    confirmSelection,
    cancelAction,
    openMenu,
    quickNavigation
  ]);

  // Focar elemento quando navegação muda
  useEffect(() => {
    if (gamepad.gamepadConnected && (navigation.up || navigation.down || navigation.left || navigation.right)) {
      focusCurrentElement();
    }
  }, [currentSection, currentIndex, gamepad.gamepadConnected, navigation, focusCurrentElement]);

  // Auto-scroll para elemento focado
  useEffect(() => {
    if (isNavigating) {
      const focusedElement = document.activeElement;
      if (focusedElement) {
        focusedElement.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
          inline: 'nearest'
        });
      }
    }
  }, [isNavigating, currentSection, currentIndex]);

  return {
    // Estados
    currentSection,
    currentIndex,
    isNavigating,
    gamesBySection,

    // Refs
    heroRef,
    searchRef,
    filtersRef,
    sectionsRefs,

    // Funções
    focusCurrentElement,

    // Informações de navegação
    navigationInfo: {
      section: currentSection,
      index: currentIndex,
      totalInSection: currentSection === 'filters' ? genres.length :
        (gamesBySection[currentSection]?.length || 1),
      gamepadConnected: gamepad.gamepadConnected,
      controllerType: gamepad.controllerType
    }
  };
};