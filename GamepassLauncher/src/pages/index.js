import { useEffect, useState } from 'react';
import { Box, Container, AppBar, Toolbar, IconButton, Badge, Avatar, InputBase, Chip, Tooltip, Typography, Grid } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home as HomeIcon,
  Settings as SettingsIcon,
  SportsEsports as GamepadIcon,
  Minimize as MinimizeIcon,
  CropSquare as MaximizeIcon,
  Close as CloseIcon,
  Search as SearchIcon,
  AccountCircle as ProfileIcon,
  Notifications as NotificationsIcon,
  CloudDone as ApiIcon,
  CloudOff as OfflineIcon,
  Download as DownloadIcon
} from '@mui/icons-material';
import { useRouter } from 'next/router';

import { useGames } from '../contexts/GamesContext';
import { useGamepad } from '../hooks/useGamepad';
import { useHomePageNavigation } from '../hooks/useHomePageNavigation';
import GameCard from '../components/GameCard';
import HeroSection from '../components/HeroSection';
import Sidebar from '../components/Sidebar';
import GenreFilters from '../components/GenreFilters';

const HomePage = () => {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('all');

  const {
    games,
    loading,
    apiStatus,
    selectedGame,
    setSelectedGame
  } = useGames();

  const gamepad = useGamepad();

  // Aguardar hidratação
  useEffect(() => {
    setMounted(true);
  }, []);

  // Filtrar jogos baseado na busca e gênero
  const filteredGames = games.filter(game => {
    const matchesSearch = game.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGenre = selectedGenre === 'all' ||
      game.genre?.toLowerCase().includes(selectedGenre.toLowerCase());
    return matchesSearch && matchesGenre;
  });

  const featuredGame = games.find(game => game.id === 8) || games[0]; // Hades como featured

  // Navegação para detalhes do jogo
  const handleGameSelect = (gameId) => {
    const game = games.find(g => g.id === gameId);
    if (game) {
      router.push(`/detalhes/${game.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`);
    }
  };

  // Navegação para outras páginas
  const handleViewChange = (view) => {
    switch (view) {
      case 'settings':
        router.push('/configuracoes');
        break;
      case 'downloads':
        router.push('/downloads');
        break;
      default:
        break;
    }
  };

  // Hook de navegação com gamepad para homepage
  const {
    currentSection,
    currentIndex,
    isNavigating,
    gamesBySection,
    heroRef,
    searchRef,
    filtersRef,
    navigationInfo
  } = useHomePageNavigation({
    games,
    filteredGames,
    onGameSelect: handleGameSelect,
    onViewChange: handleViewChange,
    router,
    setSidebarOpen,
    setSearchQuery,
    selectedGenre,
    setSelectedGenre
  });

  // Detectar se é Electron apenas após hidratação
  const isElectron = mounted && typeof window !== 'undefined' && window.electronAPI;

  // Renderizar loading durante hidratação
  if (!mounted) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #0a0e1a 0%, #1a1a2e 50%, #16213e 100%)',
          color: 'text.primary',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        >
          <GamepadIcon sx={{ fontSize: 48, color: 'primary.main' }} />
        </motion.div>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0a0e1a 0%, #1a1a2e 50%, #16213e 100%)',
        color: 'text.primary',
        overflow: 'auto'
      }}
    >
      {/* Header com navegação */}
      <AppBar
        position="fixed"
        sx={{
          bgcolor: 'rgba(0, 0, 0, 0.9)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          zIndex: 1300
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          {/* Logo e menu */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton
              onClick={() => setSidebarOpen(true)}
              sx={{ color: 'text.primary' }}
            >
              <GamepadIcon />
            </IconButton>

            <Chip
              icon={apiStatus.online ? <ApiIcon /> : <OfflineIcon />}
              label={apiStatus.online ? 'Online' : 'Offline'}
              size="small"
              color={apiStatus.online ? 'success' : 'warning'}
              sx={{ ml: 1 }}
            />

            {/* Indicador de navegação com gamepad */}
            {gamepad.gamepadConnected && (
              <Chip
                icon={<GamepadIcon />}
                label={`${currentSection} ${currentIndex + 1}/${navigationInfo.totalInSection}`}
                size="small"
                color="primary"
                variant="outlined"
                sx={{
                  ml: 1,
                  opacity: isNavigating ? 1 : 0.7,
                  transition: 'opacity 0.3s ease',
                  borderColor: isNavigating ? 'primary.main' : 'rgba(255,255,255,0.3)'
                }}
              />
            )}
          </Box>

          {/* Busca central */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              bgcolor: currentSection === 'search' && gamepad.gamepadConnected ?
                'rgba(25, 118, 210, 0.2)' : 'rgba(255,255,255,0.1)',
              borderRadius: 25,
              px: 2,
              py: 0.5,
              minWidth: 300,
              backdropFilter: 'blur(10px)',
              border: currentSection === 'search' && gamepad.gamepadConnected ?
                '2px solid rgba(25, 118, 210, 0.5)' : '1px solid transparent',
              transition: 'all 0.3s ease'
            }}
          >
            <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />
            <InputBase
              ref={searchRef}
              placeholder="Buscar jogos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{
                color: 'text.primary',
                flex: 1,
                '& ::placeholder': {
                  color: 'text.secondary',
                  opacity: 0.7
                }
              }}
            />
          </Box>

          {/* Controles e perfil */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Tooltip title="Downloads">
              <IconButton
                onClick={() => router.push('/downloads')}
                sx={{ color: 'text.secondary' }}
              >
                <Badge badgeContent={0} color="primary">
                  <DownloadIcon />
                </Badge>
              </IconButton>
            </Tooltip>

            <Tooltip title="Configurações">
              <IconButton
                onClick={() => router.push('/configuracoes')}
                sx={{ color: 'text.secondary' }}
              >
                <SettingsIcon />
              </IconButton>
            </Tooltip>

            {/* Controles de janela (apenas no Electron após hidratação) */}
            {isElectron && (
              <Box sx={{ display: 'flex', ml: 2 }}>
                <IconButton
                  onClick={() => window.electronAPI.minimizeWindow()}
                  size="small"
                  sx={{ color: 'text.secondary' }}
                >
                  <MinimizeIcon fontSize="small" />
                </IconButton>
                <IconButton
                  onClick={() => window.electronAPI.maximizeWindow()}
                  size="small"
                  sx={{ color: 'text.secondary' }}
                >
                  <MaximizeIcon fontSize="small" />
                </IconButton>
                <IconButton
                  onClick={() => window.electronAPI.closeWindow()}
                  size="small"
                  sx={{
                    color: 'text.secondary',
                    '&:hover': { bgcolor: 'rgba(244, 67, 54, 0.8)' }
                  }}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Box>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      {/* Sidebar */}
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        currentView="home"
        onViewChange={handleViewChange}
      />

      {/* Conteúdo principal */}
      <Container
        maxWidth={false}
        sx={{
          pt: 10,
          pb: 8,
          px: 3,
          minHeight: 'calc(100vh - 80px)'
        }}
      >
        {/* Hero Section */}
        {featuredGame && (
          <Box
            ref={heroRef}
            tabIndex={0}
            sx={{
              outline: 'none',
              borderRadius: 2,
              border: currentSection === 'hero' && gamepad.gamepadConnected ?
                '3px solid rgba(25, 118, 210, 0.7)' : '3px solid transparent',
              transition: 'border-color 0.3s ease',
              mb: 6
            }}
          >
            <HeroSection
              featuredGame={featuredGame}
              onGameSelect={handleGameSelect}
              heroGames={games.slice(0, 5)}
            />
          </Box>
        )}

        {/* Filtros de gênero */}
        <Box
          sx={{
            mb: 6,
            p: 2,
            borderRadius: 2,
            border: currentSection === 'filters' && gamepad.gamepadConnected ?
              '3px solid rgba(25, 118, 210, 0.7)' : '3px solid transparent',
            transition: 'border-color 0.3s ease'
          }}
        >
          <GenreFilters
            selectedGenre={selectedGenre}
            onGenreChange={setSelectedGenre}
            games={games}
            gamepadFocus={currentSection === 'filters' && gamepad.gamepadConnected}
            focusIndex={currentIndex}
          />
        </Box>

        {/* Seções de Jogos */}
        <Box sx={{ mt: 6 }}>
          {/* Jogos em Destaque */}
          <Box
            sx={{
              mb: 8,
              p: 2,
              borderRadius: 2,
              border: currentSection === 'featured' && gamepad.gamepadConnected ?
                '3px solid rgba(25, 118, 210, 0.7)' : '3px solid transparent',
              transition: 'border-color 0.3s ease'
            }}
          >
            <Typography
              variant="h4"
              sx={{
                mb: 4,
                fontWeight: 700,
                color: 'text.primary',
                display: 'flex',
                alignItems: 'center',
                gap: 2
              }}
            >
              🎮 Jogos em Destaque
            </Typography>

            <Grid container spacing={1} sx={{ mx: '-0.5rem' }} data-game-section="featured">
              {gamesBySection.featured?.map((game, index) => (
                <Grid item xs={2} key={`featured-${game.id}`} sx={{ px: '0.5rem' }}>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{
                      duration: 0.4,
                      delay: index * 0.1,
                      ease: 'easeOut'
                    }}
                  >
                    <GameCard
                      game={game}
                      onSelect={handleGameSelect}
                      isSelected={selectedGame?.id === game.id}
                      gamepadFocus={currentSection === 'featured' && currentIndex === index && gamepad.gamepadConnected}
                      tabIndex={0}
                      data-game-card
                    />
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          </Box>

          {/* Jogos Recentes */}
          <Box
            sx={{
              mb: 8,
              p: 2,
              borderRadius: 2,
              border: currentSection === 'recent' && gamepad.gamepadConnected ?
                '3px solid rgba(25, 118, 210, 0.7)' : '3px solid transparent',
              transition: 'border-color 0.3s ease'
            }}
          >
            <Typography
              variant="h4"
              sx={{
                mb: 4,
                fontWeight: 700,
                color: 'text.primary',
                display: 'flex',
                alignItems: 'center',
                gap: 2
              }}
            >
              🆕 Adicionados Recentemente
            </Typography>

            <Grid container spacing={1} sx={{ mx: '-0.5rem' }} data-game-section="recent">
              {gamesBySection.recent?.map((game, index) => (
                <Grid item xs={2} key={`recent-${game.id}`} sx={{ px: '0.5rem' }}>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{
                      duration: 0.4,
                      delay: index * 0.1,
                      ease: 'easeOut'
                    }}
                  >
                    <GameCard
                      game={game}
                      onSelect={handleGameSelect}
                      isSelected={selectedGame?.id === game.id}
                      gamepadFocus={currentSection === 'recent' && currentIndex === index && gamepad.gamepadConnected}
                      tabIndex={0}
                      data-game-card
                    />
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          </Box>

          {/* Jogos de Ação */}
          <Box
            sx={{
              mb: 8,
              p: 2,
              borderRadius: 2,
              border: currentSection === 'action' && gamepad.gamepadConnected ?
                '3px solid rgba(25, 118, 210, 0.7)' : '3px solid transparent',
              transition: 'border-color 0.3s ease'
            }}
          >
            <Typography
              variant="h4"
              sx={{
                mb: 4,
                fontWeight: 700,
                color: 'text.primary',
                display: 'flex',
                alignItems: 'center',
                gap: 2
              }}
            >
              ⚔️ Jogos de Ação
            </Typography>

            <Grid container spacing={1} sx={{ mx: '-0.5rem' }} data-game-section="action">
              {gamesBySection.action?.map((game, index) => (
                <Grid item xs={2} key={`action-${game.id}`} sx={{ px: '0.5rem' }}>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{
                      duration: 0.4,
                      delay: index * 0.1,
                      ease: 'easeOut'
                    }}
                  >
                    <GameCard
                      game={game}
                      onSelect={handleGameSelect}
                      isSelected={selectedGame?.id === game.id}
                      gamepadFocus={currentSection === 'action' && currentIndex === index && gamepad.gamepadConnected}
                      tabIndex={0}
                      data-game-card
                    />
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          </Box>

          {/* Todos os Jogos */}
          <Box
            sx={{
              mb: 8,
              p: 2,
              borderRadius: 2,
              border: currentSection === 'all' && gamepad.gamepadConnected ?
                '3px solid rgba(25, 118, 210, 0.7)' : '3px solid transparent',
              transition: 'border-color 0.3s ease'
            }}
          >
            <Typography
              variant="h4"
              sx={{
                mb: 4,
                fontWeight: 700,
                color: 'text.primary',
                display: 'flex',
                alignItems: 'center',
                gap: 2
              }}
            >
              📚 Todos os Jogos
            </Typography>

            <Grid container spacing={1} sx={{ mx: '-0.5rem' }} data-game-section="all">
              {gamesBySection.all?.map((game, index) => (
                <Grid item xs={2} key={`all-${game.id}`} sx={{ px: '0.5rem' }}>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{
                      duration: 0.4,
                      delay: (index % 20) * 0.05,
                      ease: 'easeOut'
                    }}
                  >
                    <GameCard
                      game={game}
                      onSelect={handleGameSelect}
                      isSelected={selectedGame?.id === game.id}
                      gamepadFocus={currentSection === 'all' && currentIndex === index && gamepad.gamepadConnected}
                      tabIndex={0}
                      data-game-card
                    />
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          </Box>

          {/* Loading state */}
          {loading && (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              >
                <GamepadIcon sx={{ fontSize: 48, color: 'primary.main' }} />
              </motion.div>
            </Box>
          )}

          {/* Empty state */}
          {!loading && filteredGames.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Typography variant="h6" sx={{ color: 'text.secondary', mb: 2 }}>
                Nenhum jogo encontrado
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Tente ajustar os filtros ou buscar por outro termo
              </Typography>
            </Box>
          )}
        </Box>

        {/* Dica de controles (apenas quando gamepad conectado) */}
        {gamepad.gamepadConnected && (
          <Box
            sx={{
              position: 'fixed',
              bottom: 20,
              right: 20,
              bgcolor: 'rgba(0, 0, 0, 0.8)',
              backdropFilter: 'blur(10px)',
              borderRadius: 2,
              p: 2,
              border: '1px solid rgba(255,255,255,0.1)',
              zIndex: 1000
            }}
          >
            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 1 }}>
              Controles do Gamepad:
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.primary', display: 'block' }}>
              ↕️ Seções • ↔️ Navegação • A Selecionar • B Voltar
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.primary', display: 'block' }}>
              LB/RB Páginas • Menu Sidebar • Start Configurações
            </Typography>
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default HomePage;