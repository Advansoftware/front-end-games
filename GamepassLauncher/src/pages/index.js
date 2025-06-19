import { useEffect, useState } from 'react';
import { Box, Container, Typography, AppBar, Toolbar, IconButton, Badge, Avatar, InputBase, Chip, Tooltip } from '@mui/material';
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
  CloudOff as OfflineIcon
} from '@mui/icons-material';

import { useGames } from '../contexts/GamesContext';
import { useGamepad } from '../hooks/useGamepad';
import GameGrid from '../components/GameGrid';
import GameDetails from '../components/GameDetails';
import Sidebar from '../components/Sidebar';
import SettingsPanel from '../components/SettingsPanel';

const HomePage = () => {
  const [currentView, setCurrentView] = useState('home');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedGameId, setSelectedGameId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const gamepad = useGamepad();
  const { apiStatus } = useGames();

  // Navegação com gamepad
  useEffect(() => {
    const handleGamepadNavigation = () => {
      const nav = gamepad.getNavigationInput();

      if (nav.menu) {
        setSidebarOpen(prev => !prev);
      }

      if (nav.back) {
        if (selectedGameId) {
          setSelectedGameId(null);
        } else if (sidebarOpen) {
          setSidebarOpen(false);
        }
      }
    };

    if (gamepad.gamepadConnected) {
      const interval = setInterval(handleGamepadNavigation, 100);
      return () => clearInterval(interval);
    }
  }, [gamepad, selectedGameId, sidebarOpen]);

  // Controles de janela
  const handleMinimize = () => {
    if (window.electronAPI) {
      window.electronAPI.minimizeWindow();
    }
  };

  const handleMaximize = () => {
    if (window.electronAPI) {
      window.electronAPI.maximizeWindow();
    }
  };

  const handleClose = () => {
    if (window.electronAPI) {
      window.electronAPI.closeWindow();
    }
  };

  return (
    <Box sx={{ height: '100vh', overflow: 'hidden', position: 'relative' }}>
      {/* Barra superior estilo Xbox Gamepass - ESCONDER quando GameDetails estiver ativo */}
      {!selectedGameId && (
        <AppBar
          position="fixed"
          sx={{
            background: 'rgba(12, 22, 24, 0.95)',
            backdropFilter: 'blur(20px)',
            borderBottom: '1px solid rgba(255,255,255,0.1)',
            WebkitAppRegion: 'drag',
            zIndex: 1400
          }}
          elevation={0}
        >
          <Toolbar sx={{ justifyContent: 'space-between', minHeight: '56px !important', px: 2 }}>
            {/* Lado esquerdo - Logo e navegação */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, WebkitAppRegion: 'no-drag' }}>
              {/* Botão do menu lateral */}
              <IconButton
                onClick={() => setSidebarOpen(!sidebarOpen)}
                sx={{
                  color: 'primary.main',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }
                }}
              >
                <HomeIcon />
              </IconButton>

              {/* Logo Xbox inspirado */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Avatar
                  sx={{
                    bgcolor: 'primary.main',
                    width: 32,
                    height: 32,
                    fontSize: '1rem'
                  }}
                >
                  <GamepadIcon sx={{ fontSize: 18 }} />
                </Avatar>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    color: 'primary.main',
                    fontSize: '1.1rem',
                    letterSpacing: '-0.01em'
                  }}
                >
                  Gamepass
                </Typography>
              </Box>
            </Box>

            {/* Centro - Barra de pesquisa */}
            <Box sx={{
              display: 'flex',
              alignItems: 'center',
              bgcolor: 'rgba(255,255,255,0.1)',
              borderRadius: 2,
              px: 2,
              py: 0.5,
              minWidth: 300,
              WebkitAppRegion: 'no-drag'
            }}>
              <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />
              <InputBase
                placeholder="Pesquisar jogos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                sx={{
                  color: 'text.primary',
                  flex: 1,
                  '& input::placeholder': {
                    color: 'text.secondary',
                    opacity: 1
                  }
                }}
              />
            </Box>

            {/* Lado direito - Status e controles */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {/* Status do gamepad */}
              {gamepad.gamepadConnected && (
                <Badge color="success" variant="dot">
                  <IconButton sx={{ color: 'success.main' }}>
                    <GamepadIcon />
                  </IconButton>
                </Badge>
              )}

              {/* Indicador de API */}
              <Tooltip title="API usada apenas nos detalhes dos jogos">
                <Chip
                  label="Local"
                  icon={<OfflineIcon />}
                  color="default"
                  size="small"
                  sx={{ bgcolor: 'background.paper', cursor: 'default' }}
                />
              </Tooltip>

              {/* Notificações */}
              <IconButton sx={{ color: 'text.secondary', WebkitAppRegion: 'no-drag' }}>
                <Badge badgeContent={3} color="error">
                  <NotificationsIcon />
                </Badge>
              </IconButton>

              {/* Perfil do usuário */}
              <IconButton sx={{ color: 'text.secondary', WebkitAppRegion: 'no-drag' }}>
                <Avatar sx={{ width: 28, height: 28, bgcolor: 'primary.main' }}>
                  <ProfileIcon sx={{ fontSize: 18 }} />
                </Avatar>
              </IconButton>

              {/* Controles de janela */}
              <Box sx={{ display: 'flex', ml: 2, WebkitAppRegion: 'no-drag' }}>
                <IconButton
                  onClick={handleMinimize}
                  size="small"
                  sx={{
                    color: 'text.secondary',
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }
                  }}
                >
                  <MinimizeIcon fontSize="small" />
                </IconButton>
                <IconButton
                  onClick={handleMaximize}
                  size="small"
                  sx={{
                    color: 'text.secondary',
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }
                  }}
                >
                  <MaximizeIcon fontSize="small" />
                </IconButton>
                <IconButton
                  onClick={handleClose}
                  size="small"
                  sx={{
                    color: 'text.secondary',
                    '&:hover': { bgcolor: 'rgba(244, 67, 54, 0.8)', color: 'white' }
                  }}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Box>
            </Box>
          </Toolbar>
        </AppBar>
      )}

      {/* Sidebar - ESCONDER quando GameDetails estiver ativo */}
      {!selectedGameId && (
        <Sidebar
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          currentView={currentView}
          onViewChange={setCurrentView}
        />
      )}

      {/* Conteúdo principal */}
      <Box
        component={motion.div}
        animate={{
          marginLeft: selectedGameId ? 0 : (sidebarOpen ? 280 : 0), // Sem margem quando GameDetails ativo
          transition: { duration: 0.3, ease: 'easeInOut' }
        }}
        sx={{
          height: '100vh',
          paddingTop: selectedGameId ? '0px' : '56px', // Sem padding quando GameDetails ativo
          overflow: selectedGameId ? 'auto' : 'hidden',
          background: selectedGameId ? 'transparent' : (currentView === 'home' ? 'transparent' : 'background.default')
        }}
      >
        {/* Background com gradiente Xbox - APENAS quando não há GameDetails */}
        {currentView === 'home' && !selectedGameId && (
          <Box
            sx={{
              position: 'fixed',
              top: 0,
              left: sidebarOpen ? 280 : 0,
              right: 0,
              bottom: 0,
              background: 'linear-gradient(135deg, #0C1618 0%, #1A2B32 50%, #0C1618 100%)',
              zIndex: -1,
              transition: 'left 0.3s ease'
            }}
          />
        )}

        <Container
          maxWidth={selectedGameId ? false : 'false'} // Full width quando GameDetails ativo
          sx={{
            height: '100%',
            padding: selectedGameId ? 0 : 3, // Sem padding quando GameDetails ativo
            maxWidth: selectedGameId ? 'none' : undefined // Sem limitação de largura
          }}
        >
          <AnimatePresence mode="wait">
            {selectedGameId ? (
              <GameDetails
                key="game-details"
                gameId={selectedGameId}
                onBack={() => setSelectedGameId(null)}
              />
            ) : currentView === 'settings' ? (
              <SettingsPanel key="settings" />
            ) : (
              <GameGrid
                key="game-grid"
                onGameSelect={setSelectedGameId}
                searchQuery={searchQuery}
              />
            )}
          </AnimatePresence>
        </Container>
      </Box>
    </Box>
  );
};

export default function Home() {
  return <HomePage />;
}