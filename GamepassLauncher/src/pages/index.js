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
import { useHomeConsoleNavigation } from '../hooks/useHomeConsoleNavigation';
import GameCard from '../components/GameCard';
import HeroSection from '../components/HeroSection';
import Sidebar from '../components/Sidebar';
import GenreFilters from '../components/GenreFilters';

const HomePage = () => {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('all');
  const [sidebarOpen, setSidebarOpen] = useState(false); // Mover para cima

  const {
    games,
    loading,
    apiStatus,
    selectedGame,
    setSelectedGame
  } = useGames();

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

  // Hook de navegação console para homepage
  const {
    focusMode,
    currentGameIndex,
    currentHeroButton,
    sidebarOpen: hookSidebarOpen,
    selectedGame: currentGame,
    featuredGame,
    registerHeroButtonRef,
    registerGameCardRef,
    setSidebarOpen: setHookSidebarOpen,
    navigationInfo,
    getGameCardProps,
    getHeroButtonProps
  } = useHomeConsoleNavigation({
    games: filteredGames,
    onGameSelect: handleGameSelect,
    onSidebarToggle: setSidebarOpen,
    router
  });

  // Sincronizar estado do sidebar
  useEffect(() => {
    setSidebarOpen(hookSidebarOpen);
  }, [hookSidebarOpen]);

  // Organizar jogos para exibição
  const gameCards = filteredGames.filter(game => game.id !== featuredGame?.id);

  if (!mounted) {
    return null;
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
            {navigationInfo.gamepadConnected && (
              <Chip
                icon={<GamepadIcon />}
                label={`${focusMode} ${focusMode === 'games' ? currentGameIndex + 1 : currentHeroButton + 1}`}
                size="small"
                color="primary"
                variant="outlined"
                sx={{
                  ml: 1,
                  borderColor: 'primary.main'
                }}
              />
            )}
          </Box>

          {/* Busca central */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              bgcolor: 'rgba(255,255,255,0.1)',
              borderRadius: 25,
              px: 2,
              py: 0.5,
              minWidth: 300,
              backdropFilter: 'blur(10px)',
              border: '1px solid transparent',
              transition: 'all 0.3s ease'
            }}
          >
            <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />
            <InputBase
              placeholder="Buscar jogos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{
                color: 'text.primary',
                flex: 1,
                '& ::placeholder': {
                  color: 'text.secondary',
                  opacity: 0.8
                }
              }}
            />
          </Box>

          {/* Ações do usuário */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton sx={{ color: 'text.primary' }}>
              <Badge badgeContent={3} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
            <Avatar sx={{ width: 32, height: 32 }}>
              <ProfileIcon />
            </Avatar>
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
          pb: 4,
          px: 4,
          minHeight: 'calc(100vh - 80px)'
        }}
      >
        {/* Hero Section - Ignorar imagem, focar apenas nos botões */}
        {featuredGame && (
          <Box sx={{ mb: 6 }}>
            <HeroSection
              featuredGame={featuredGame}
              onGameSelect={handleGameSelect}
              heroGames={games.slice(0, 5)}
              // Passar props para controle de foco
              heroButtonProps={getHeroButtonProps}
              focusMode={focusMode}
              currentHeroButton={currentHeroButton}
            />
          </Box>
        )}

        {/* Filtros de gênero */}
        <Box sx={{ mb: 6 }}>
          <GenreFilters
            selectedGenre={selectedGenre}
            onGenreChange={setSelectedGenre}
            genres={['all', 'action', 'adventure', 'rpg', 'strategy', 'simulation', 'racing']}
          />
        </Box>

        {/* Grade de jogos navegável */}
        <Box>
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
            🎮 Biblioteca de Jogos
          </Typography>

          {gameCards.length > 0 ? (
            <Grid container spacing={2}>
              {gameCards.map((game, index) => (
                <Grid item xs={12} sm={6} md={4} lg={2} key={game.id}>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{
                      duration: 0.4,
                      delay: index * 0.05,
                      ease: 'easeOut'
                    }}
                  >
                    <GameCard
                      game={game}
                      onSelect={() => handleGameSelect(game.id)}
                      // Props para controle de foco
                      {...getGameCardProps(index)}
                      sx={{
                        // Estilo visual para elemento focado
                        border: focusMode === 'games' && currentGameIndex === index
                          ? '3px solid rgba(25, 118, 210, 0.8)'
                          : '1px solid rgba(255,255,255,0.1)',
                        transform: focusMode === 'games' && currentGameIndex === index
                          ? 'scale(1.05)'
                          : 'scale(1)',
                        transition: 'all 0.3s ease',
                        boxShadow: focusMode === 'games' && currentGameIndex === index
                          ? '0 8px 25px rgba(25, 118, 210, 0.4)'
                          : 'none'
                      }}
                    />
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          ) : (
            // Estado vazio
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

        {/* Dica de controles (apenas quando gamepad conectado) */}
        {navigationInfo.gamepadConnected && (
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
              ↕️ ↔️ Navegar • A Selecionar • B Voltar • Start Menu
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.primary', display: 'block' }}>
              Modo: {focusMode} | Posição: {focusMode === 'games' ? currentGameIndex + 1 : currentHeroButton + 1}
            </Typography>
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default HomePage;