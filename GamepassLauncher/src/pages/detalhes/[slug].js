import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { Box, IconButton, Typography, CircularProgress } from '@mui/material';
import {
  ArrowBack as BackIcon,
  Minimize as MinimizeIcon,
  CropSquare as MaximizeIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';

import { useGames } from '../../contexts/GamesContext';
import { useGameDetailsNavigation } from '../../hooks/useGameDetailsNavigation';
import GameDetailsHero from '../../components/game-details/GameDetailsHero';
import GameInfoModal from '../../components/GameInfoModal';
import TrailerModal from '../../components/TrailerModal';
import CacheService from '../../services/CacheService';

const GameDetailsPage = () => {
  const router = useRouter();
  const { slug } = router.query;
  const [showTrailer, setShowTrailer] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [enrichedGame, setEnrichedGame] = useState(null);
  const [loading, setLoading] = useState(true);

  const { games, enrichGameWithAPI } = useGames();

  // Encontrar jogo pelo slug
  const baseGame = games.find(g =>
    g.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') === slug
  );

  // Carregar dados enriquecidos quando a página carrega
  useEffect(() => {
    const loadEnrichedData = async () => {
      if (!baseGame) {
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
        // Primeiro, tentar carregar do cache
        const cachedData = await CacheService.loadGameFromCache(baseGame.id);

        if (cachedData) {
          setEnrichedGame(cachedData);
        } else {
          // Se não há cache, enriquecer via API
          const apiEnrichedData = await enrichGameWithAPI(baseGame.id);
          setEnrichedGame(apiEnrichedData || baseGame);
        }
      } catch (error) {
        console.error('❌ Erro ao carregar dados enriquecidos:', error);
        setEnrichedGame(baseGame);
      } finally {
        setLoading(false);
      }
    };

    loadEnrichedData();
  }, [baseGame?.id]); // Removido enrichGameWithAPI das dependências para evitar loop infinito

  // Voltar para home
  const handleBack = () => {
    router.push('/');
  };

  // Determinar botões disponíveis para navegação
  const getAvailableButtons = () => {
    const buttons = [];

    // Sempre tem o botão "Ver mais informações" se há descrição
    if (enrichedGame?.description) {
      buttons.push('info');
    }

    // Botões de ação (Play/Download/Update)
    if (enrichedGame?.installed) {
      // Se tem atualização disponível
      if ([1, 3].includes(enrichedGame.id)) {
        buttons.push('update');
      } else {
        buttons.push('play');
      }
    } else {
      buttons.push('download');
    }

    // Botão de trailer se disponível
    if (enrichedGame?.youtubeVideoId) {
      buttons.push('trailer');
    }

    return buttons;
  };

  // Hook de navegação para detalhes com controle de modais
  const {
    currentButtonIndex,
    navigationInfo,
    getButtonProps
  } = useGameDetailsNavigation({
    onBack: handleBack,
    router,
    availableButtons: getAvailableButtons(),
    // Estados dos modais para navegação gradual
    modalsOpen: {
      trailer: showTrailer,
      info: showInfoModal
    },
    // Funções para fechar cada modal
    onCloseModals: {
      trailer: () => setShowTrailer(false),
      info: () => setShowInfoModal(false)
    }
  });

  // Função para obter props do botão "Ver mais informações"
  const getInfoButtonProps = () => {
    // Se o botão de info for o primeiro na lista de botões disponíveis
    const availableButtons = getAvailableButtons();
    const infoButtonIndex = availableButtons.indexOf('info');

    if (infoButtonIndex !== -1) {
      return getButtonProps(infoButtonIndex);
    }

    return {};
  };

  // Função para obter props dos botões de ação (ajustada para o índice correto)
  const getActionButtonProps = (actionIndex) => {
    const availableButtons = getAvailableButtons();
    const hasInfoButton = availableButtons.includes('info');

    // Se há botão de info, os botões de ação começam do índice 1
    const adjustedIndex = hasInfoButton ? actionIndex + 1 : actionIndex;

    return getButtonProps(adjustedIndex);
  };

  // Controles do Electron
  useEffect(() => {
    if (typeof window !== 'undefined' && window.electronAPI) {
      // Remover controles de fullscreen - agora é uma página normal
      // window.electronAPI.setFullscreen && window.electronAPI.setFullscreen(true);
      // window.electronAPI.setTitleBarVisible && window.electronAPI.setTitleBarVisible(false);

      // Permitir scroll normal
      // document.body.style.overflow = 'hidden';
      // document.documentElement.style.overflow = 'hidden';

      return () => {
        // Cleanup não é mais necessário
        // window.electronAPI.setFullscreen && window.electronAPI.setFullscreen(false);
        // window.electronAPI.setTitleBarVisible && window.electronAPI.setTitleBarVisible(true);
        // document.body.style.overflow = 'auto';
        // document.documentElement.style.overflow = 'auto';
      };
    }
  }, []);

  if (loading) {
    return (
      <Box sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default'
      }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!enrichedGame) {
    return (
      <Box sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default'
      }}>
        <Typography variant="h4" color="text.primary">Jogo não encontrado</Typography>
      </Box>
    );
  }

  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      sx={{
        position: 'fixed', // Mudado para fixed
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh',
        bgcolor: 'background.default',
        overflow: 'hidden', // Evitar scroll
        zIndex: 1000 // Z-index alto para ficar acima de tudo
      }}
    >
      {/* Botão voltar */}
      <IconButton
        onClick={handleBack}
        sx={{
          position: 'fixed', // Mudado para fixed
          top: 20,
          left: 20,
          zIndex: 1001, // Z-index maior que o container
          bgcolor: 'rgba(0,0,0,0.8)',
          color: 'white',
          backdropFilter: 'blur(10px)',
          '&:hover': {
            bgcolor: 'rgba(0,0,0,0.9)',
            transform: 'scale(1.1)'
          }
        }}
      >
        <BackIcon />
      </IconButton>

      {/* Controles de janela */}
      {typeof window !== 'undefined' && window.electronAPI && (
        <Box
          sx={{
            position: 'fixed', // Mudado para fixed
            top: 20,
            right: 20,
            zIndex: 1001, // Z-index maior que o container
            display: 'flex',
            gap: 0,
            bgcolor: 'rgba(0,0,0,0.8)',
            borderRadius: 1,
            p: 0.5,
            backdropFilter: 'blur(10px)'
          }}
        >
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
              '&:hover': { bgcolor: 'rgba(244, 67, 54, 0.8)', color: 'white' }
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
      )}

      {/* Indicador de controle (apenas quando gamepad conectado) */}
      {navigationInfo.gamepadConnected && (
        <Box
          sx={{
            position: 'fixed', // Mudado para fixed
            top: 20,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 1001, // Z-index maior que o container
            bgcolor: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(10px)',
            borderRadius: 2,
            px: 2,
            py: 1,
            border: '1px solid rgba(255,255,255,0.1)'
          }}
        >
          <Typography variant="caption" sx={{ color: 'text.primary' }}>
            🎮 Botão: {currentButtonIndex + 1}/{navigationInfo.totalButtons} | A: Selecionar | B: Voltar
          </Typography>
        </Box>
      )}

      {/* Hero Section */}
      <GameDetailsHero
        game={enrichedGame}
        onShowInfo={() => setShowInfoModal(true)}
        onShowTrailer={() => setShowTrailer(true)}
        getInfoButtonProps={getInfoButtonProps}
        getButtonProps={getActionButtonProps}
      />

      {/* Modal de informações completas */}
      <GameInfoModal
        game={enrichedGame}
        open={showInfoModal}
        onClose={() => setShowInfoModal(false)}
        onShowTrailer={() => setShowTrailer(true)}
      />

      {/* Modal de trailer */}
      <TrailerModal
        open={showTrailer}
        onClose={() => setShowTrailer(false)}
        videoId={enrichedGame.youtubeVideoId}
        gameTitle={enrichedGame.title}
      />
    </Box>
  );
};

export default GameDetailsPage;