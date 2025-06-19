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

  // Navegação para detalhes do jogo - MOUSE (navegação normal)
  const handleGameSelect = (gameId) => {
    const game = games.find(g => g.id === gameId);
    if (game) {
      console.log('🖱️ Navegação via MOUSE para:', game.title);
      router.push(`/detalhes/${game.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`);
    }
  };

  // Navegação para detalhes do jogo - CONTROLE (navegação forçada) - COM LOGS DETALHADOS
  const handleGameSelectViaController = (gameId) => {
    console.log('🎮 handleGameSelectViaController chamada com gameId:', gameId);
    console.log('🎮 Lista de jogos disponíveis:', games.map(g => ({ id: g.id, title: g.title })));

    const game = games.find(g => g.id === gameId);
    console.log('🎮 Jogo encontrado:', game);

    if (game) {
      const slug = game.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const newUrl = `/detalhes/${slug}`;

      console.log('🎮 Navegação via CONTROLE:');
      console.log('  - ID do jogo:', gameId);
      console.log('  - Título:', game.title);
      console.log('  - Slug gerado:', slug);
      console.log('  - URL atual:', window.location.href);
      console.log('  - URL destino:', newUrl);
      console.log('  - URL completa:', window.location.origin + newUrl);

      // Forçar navegação limpa - sem cache
      const fullUrl = window.location.origin + newUrl;
      console.log('🎮 Executando window.location.href =', fullUrl);
      window.location.href = fullUrl;
    } else {
      console.error('❌ Jogo não encontrado com ID:', gameId);
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

  // Hook de navegação console para homepage - APENAS QUANDO NA HOME
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
    onGameSelect: handleGameSelectViaController,
    onSidebarToggle: setSidebarOpen,
    router,
    enabled: router.pathname === '/', // ✅ APENAS ATIVAR NA HOME
    // Estados dos modais para navegação gradual
    modalsOpen: {
      sidebar: sidebarOpen
    }
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
        width: '100vw', // Garantir largura específica
        maxWidth: '100vw', // Evitar que ultrapasse viewport
        background: 'linear-gradient(135deg, #0a0e1a 0%, #1a1a2e 50%, #16213e 100%)',
        color: 'text.primary',
        overflow: 'auto',
        overflowX: 'hidden', // Remover scroll horizontal
        position: 'relative'
      }}
    >
      {/* Header com navegação */}
      <AppBar
        position="fixed"
        sx={{
          bgcolor: 'rgba(0, 0, 0, 0.9)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          zIndex: 1300,
          width: '100vw', // Garantir que não ultrapasse
          maxWidth: '100vw'
        }}
      >
        <Toolbar sx={{
          justifyContent: 'space-between',
          maxWidth: '100vw', // Limitar largura do toolbar
          px: { xs: 2, md: 3 } // Responsivo
        }}>
          {/* Logo e menu */}
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            minWidth: 0, // Permitir flexibilidade
            flex: '0 0 auto'
          }}>
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
                  borderColor: 'primary.main',
                  display: { xs: 'none', sm: 'inline-flex' } // Ocultar em telas pequenas
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
              minWidth: { xs: 200, md: 300 }, // Responsivo
              maxWidth: { xs: 250, md: 400 }, // Limitar largura máxima
              backdropFilter: 'blur(10px)',
              border: '1px solid transparent',
              transition: 'all 0.3s ease',
              flex: '1 1 auto',
              mx: 2 // Margem nas laterais
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
                minWidth: 0, // Permitir encolhimento
                '& ::placeholder': {
                  color: 'text.secondary',
                  opacity: 0.8
                }
              }}
            />
          </Box>

          {/* Ações do usuário */}
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            flex: '0 0 auto'
          }}>
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
        data-scroll-container // Atributo para identificar container de scroll
        sx={{
          pt: 10,
          pb: 4,
          px: { xs: 2, md: 4 }, // Padding responsivo
          minHeight: 'calc(100vh - 80px)',
          width: '100%',
          maxWidth: '100vw', // Garantir que não ultrapasse viewport
          boxSizing: 'border-box'
        }}
      >
        {/* Hero Section - Ignorar imagem, focar apenas nos botões */}
        {featuredGame && (
          <Box sx={{ 
            mb: 6,
            width: '100%',
            maxWidth: '100%'
          }}>
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
        <Box sx={{ 
          mb: 6,
          width: '100%',
          maxWidth: '100%'
        }}>
          <GenreFilters
            selectedGenre={selectedGenre}
            onGenreChange={setSelectedGenre}
            genres={['all', 'action', 'adventure', 'rpg', 'strategy', 'simulation', 'racing']}
          />
        </Box>

        {/* Grade de jogos navegável */}
        <Box sx={{
          width: '100%',
          maxWidth: '100%'
        }}>
          <Typography
            variant="h4"
            sx={{
              mb: 4,
              fontWeight: 700,
              color: 'text.primary',
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              fontSize: { xs: '1.75rem', md: '2.125rem' } // Responsivo
            }}
          >
            🎮 Biblioteca de Jogos
          </Typography>

          {gameCards.length > 0 ? (
            <Grid container spacing={2}>
              {gameCards.map((game, index) => {
                const gameCardProps = getGameCardProps(index);
                return (
                  <Grid item xs={12} sm={6} md={4} lg={2} key={game.id}>
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{
                        duration: 0.4,
                        delay: index * 0.05,
                        ease: 'easeOut'
                      }}
                      // Mover ref e atributos para o motion.div
                      ref={gameCardProps.ref}
                      data-game-card="true"
                      data-game-index={index}
                      style={{ 
                        width: '100%', 
                        height: '100%'
                      }}
                      onClick={() => handleGameSelect(game.id)}
                    >
                      <GameCard
                        game={game}
                        onSelect={() => handleGameSelect(game.id)}
                        // Props para controle de foco (sem ref)
                        data-focused={gameCardProps['data-focused']}
                        tabIndex={gameCardProps.tabIndex}
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
                            : 'none',
                          width: '100%',
                          maxWidth: '100%'
                        }}
                      />
                    </motion.div>
                  </Grid>
                );
              })}
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
              zIndex: 1000,
              maxWidth: '300px', // Limitar largura máxima
              wordWrap: 'break-word'
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