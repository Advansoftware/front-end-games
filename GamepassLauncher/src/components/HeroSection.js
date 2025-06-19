import React from 'react';
import { Box, Typography, Chip, Stack } from '@mui/material';
import { motion } from 'framer-motion';
import {
  Download as DownloadIcon,
  Star as StarIcon,
  PlayArrow as PlayIcon,
  Update as UpdateIcon,
  CloudDownload as CloudIcon
} from '@mui/icons-material';
import CustomButton from './CustomButton';
import { useTheme, getThemeColors } from '../contexts/ThemeContext';
import { useGames } from '../contexts/GamesContext';
import { useDownloads } from '../hooks/useDownloads';

const HeroSection = ({
  featuredGame,
  onGameSelect,
  heroGames = [],
  onDownload
}) => {
  const { currentTheme } = useTheme();
  const currentColors = getThemeColors(currentTheme);

  const {
    downloadGame,
    updateGame,
    launchGame,
    updateProgress
  } = useGames();

  const { activeDownloads } = useDownloads();

  if (!featuredGame) return null;

  // Lógica de estado do jogo (mesma da tela de detalhes)
  const downloadData = activeDownloads.get(featuredGame.id);
  const updatePercent = updateProgress[featuredGame.id];
  const isDownloading = downloadData !== undefined;

  const progressPercent = isDownloading ? Math.round(downloadData.progress || 0) : 0;
  const updateProgressPercent = updatePercent ? Math.round(updatePercent) : 0;

  const isInstalling = downloadData?.status === 'installing';
  const isUpdating = featuredGame?.installed && isDownloading;

  // Simular atualizações disponíveis para alguns jogos
  const hasUpdate = featuredGame && [1, 3].includes(featuredGame.id) && featuredGame.installed && !isDownloading;

  // Função para obter mensagem correta baseada no contexto
  const getOperationMessage = () => {
    if (!isDownloading) return '';
    if (isInstalling) return 'Instalando';
    if (isUpdating) return 'Atualizando';
    return 'Baixando';
  };

  const operationMessage = getOperationMessage();

  // Handlers
  const handlePlay = (e) => {
    e.stopPropagation();
    launchGame(featuredGame.id);
  };

  const handleDownload = (e) => {
    e.stopPropagation();
    downloadGame(featuredGame.id);
  };

  const handleUpdate = (e) => {
    e.stopPropagation();
    updateGame(featuredGame.id);
  };

  // Função para determinar o botão principal
  const renderPrimaryButton = () => {
    // Se está baixando/instalando/atualizando - mostrar progresso
    if (isDownloading || isUpdating) {
      return (
        <CustomButton
          variant={isUpdating ? "warning" : "info"}
          startIcon={<CloudIcon />}
          disabled={true}
          downloadProgress={isDownloading ? progressPercent : updateProgressPercent}
          sx={{
            fontWeight: 700,
            px: 3,
            py: 1.5,
            borderRadius: 2,
            fontSize: '1rem',
            textTransform: 'none',
            minWidth: 180
          }}
        >
          {operationMessage}
        </CustomButton>
      );
    }

    // Se está instalado E tem atualização - botão ATUALIZAR
    if (featuredGame.installed && hasUpdate) {
      return (
        <CustomButton
          variant="warning"
          startIcon={<UpdateIcon />}
          onClick={handleUpdate}
          sx={{
            fontWeight: 700,
            px: 3,
            py: 1.5,
            borderRadius: 2,
            fontSize: '1rem',
            textTransform: 'none',
            boxShadow: `0 4px 20px ${currentColors.glow}40`,
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: `0 6px 25px ${currentColors.glow}60`
            }
          }}
        >
          Atualizar
        </CustomButton>
      );
    }

    // Se está instalado E NÃO tem atualização - botão JOGAR AGORA
    if (featuredGame.installed && !hasUpdate) {
      return (
        <CustomButton
          variant="success"
          startIcon={<PlayIcon />}
          onClick={handlePlay}
          sx={{
            fontWeight: 700,
            px: 3,
            py: 1.5,
            borderRadius: 2,
            fontSize: '1rem',
            textTransform: 'none',
            boxShadow: `0 4px 20px ${currentColors.glow}40`,
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: `0 6px 25px ${currentColors.glow}60`
            }
          }}
        >
          Jogar Agora
        </CustomButton>
      );
    }

    // Se NÃO está instalado - botão BAIXAR
    return (
      <CustomButton
        variant="primary"
        startIcon={<DownloadIcon />}
        onClick={handleDownload}
        sx={{
          fontWeight: 700,
          px: 3,
          py: 1.5,
          borderRadius: 2,
          fontSize: '1rem',
          textTransform: 'none',
          boxShadow: `0 4px 20px ${currentColors.glow}40`,
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: `0 6px 25px ${currentColors.glow}60`
          }
        }}
      >
        Baixar agora
      </CustomButton>
    );
  };

  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      sx={{
        position: 'relative',
        width: '100%',
        height: '60vh',
        minHeight: '500px',
        overflow: 'hidden',
        mb: 4,
        borderRadius: 3,
        cursor: 'pointer',
        '&:hover .hero-overlay': {
          opacity: 0.95
        }
      }}
      onClick={() => onGameSelect(featuredGame.id)}
    >
      {/* Background image */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `url(${featuredGame.image})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'brightness(0.6)',
        }}
      />

      {/* Gradient overlay principal */}
      <Box
        className="hero-overlay"
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.7) 40%, rgba(0,0,0,0.3) 70%, transparent 100%)',
          opacity: 0.8,
          transition: 'opacity 0.3s ease'
        }}
      />

      {/* Gradient overlay inferior */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '40%',
          background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 100%)',
          zIndex: 1
        }}
      />

      {/* Content principal */}
      <Box
        sx={{
          position: 'absolute',
          left: { xs: 30, md: 50 },
          bottom: { xs: 60, md: 80 },
          right: { xs: 30, md: '40%' },
          zIndex: 3,
          color: 'white'
        }}
      >
        <Chip
          label="Em destaque"
          size="small"
          sx={{
            mb: 2,
            bgcolor: currentColors.primary,
            color: 'white',
            fontWeight: 600,
            fontSize: '0.8rem',
            boxShadow: `0 0 10px ${currentColors.glow}60`
          }}
        />

        <Typography
          variant="h2"
          sx={{
            fontWeight: 800,
            mb: 2,
            textShadow: '3px 3px 6px rgba(0,0,0,0.8)',
            fontSize: { xs: '2rem', md: '3rem', lg: '3.5rem' },
            lineHeight: 0.9
          }}
        >
          {featuredGame.title}
        </Typography>

        <Typography
          variant="h6"
          sx={{
            mb: 3,
            opacity: 0.9,
            lineHeight: 1.5,
            textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
            fontSize: { xs: '1rem', md: '1.1rem' },
            maxWidth: '500px'
          }}
        >
          {featuredGame.description}
        </Typography>

        <Stack direction="row" spacing={3} alignItems="center" sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <StarIcon sx={{ color: 'warning.main', fontSize: 20 }} />
            <Typography variant="body1" sx={{ fontWeight: 700 }}>
              {featuredGame.rating || '9.5'}
            </Typography>
          </Box>

          <Typography variant="body2" sx={{ opacity: 0.9, fontWeight: 500 }}>
            {featuredGame.platform || 'PC'}
          </Typography>

          <Typography variant="body2" sx={{ opacity: 0.9, fontWeight: 500 }}>
            {featuredGame.size || '5.7 GB'}
          </Typography>
        </Stack>

        <Stack direction="row" spacing={2}>
          {renderPrimaryButton()}

          <CustomButton
            variant="outlined"
            onClick={(e) => {
              e.stopPropagation();
              onGameSelect(featuredGame.id);
            }}
            sx={{
              color: 'white',
              borderColor: 'rgba(255,255,255,0.6)',
              fontWeight: 600,
              px: 3,
              py: 1.5,
              borderRadius: 2,
              fontSize: '1rem',
              textTransform: 'none',
              backdropFilter: 'blur(10px)',
              bgcolor: 'rgba(255,255,255,0.1)',
              '&:hover': {
                borderColor: 'white',
                bgcolor: 'rgba(255,255,255,0.2)',
                transform: 'translateY(-2px)'
              }
            }}
          >
            Ver detalhes
          </CustomButton>
        </Stack>
      </Box>

      {/* Jogos em destaque no lado direito (removendo sobreposição confusa) */}
      {heroGames.length > 0 && (
        <Box
          sx={{
            position: 'absolute',
            right: { xs: 20, md: 60 },
            bottom: 20,
            zIndex: 3,
            display: { xs: 'none', lg: 'block' }
          }}
        >
          <Typography
            variant="caption"
            sx={{
              color: 'white',
              opacity: 0.7,
              fontSize: '0.75rem',
              display: 'block',
              mb: 1
            }}
          >
            +{heroGames.length - 1} jogos na biblioteca
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default HeroSection;