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
  onDownload,
  // Props para controle de foco
  heroButtonProps,
  focusMode,
  currentHeroButton
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
  const hasUpdate = featuredGame.hasUpdate;
  const isDownloaded = featuredGame.installed;

  // Determinar qual botão principal mostrar
  const renderPrimaryButton = () => {
    // Botão principal (índice 0)
    return (
      <CustomButton
        {...(heroButtonProps ? heroButtonProps(0) : {})}
        variant="contained"
        size="large"
        startIcon={getButtonIcon()}
        onClick={(e) => {
          e.stopPropagation();
          handlePrimaryAction();
        }}
        loading={isDownloading || hasUpdate}
        progress={isDownloading ? progressPercent : updateProgressPercent}
        sx={{
          fontSize: '1.1rem',
          py: 1.5,
          px: 4,
          minWidth: 180,
          // Estilo de foco para navegação console
          border: focusMode === 'hero' && currentHeroButton === 0
            ? '3px solid rgba(255, 255, 255, 0.8)'
            : '2px solid transparent',
          transform: focusMode === 'hero' && currentHeroButton === 0
            ? 'scale(1.05)'
            : 'scale(1)',
          boxShadow: focusMode === 'hero' && currentHeroButton === 0
            ? '0 8px 25px rgba(255, 255, 255, 0.3)'
            : `0 4px 20px ${currentColors.glow}40`,
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: focusMode === 'hero' && currentHeroButton === 0
              ? 'scale(1.05)'
              : 'translateY(-2px)',
            boxShadow: focusMode === 'hero' && currentHeroButton === 0
              ? '0 8px 25px rgba(255, 255, 255, 0.3)'
              : `0 6px 25px ${currentColors.glow}60`
          }
        }}
      >
        {getButtonText()}
      </CustomButton>
    );
  };

  const getButtonIcon = () => {
    if (isDownloading) return <CloudIcon />;
    if (hasUpdate) return <UpdateIcon />;
    if (isDownloaded) return <PlayIcon />;
    return <DownloadIcon />;
  };

  const getButtonText = () => {
    if (isDownloading) {
      return isInstalling ? 'Instalando...' : 'Baixando...';
    }
    if (hasUpdate) return 'Atualizando...';
    if (isDownloaded) return 'Jogar';
    return 'Baixar';
  };

  const handlePrimaryAction = () => {
    if (isDownloaded && !hasUpdate) {
      launchGame(featuredGame.id);
    } else if (hasUpdate) {
      updateGame(featuredGame.id);
    } else if (!isDownloading) {
      downloadGame(featuredGame.id);
    }
  };

  return (
    <Box
      sx={{
        position: 'relative',
        height: { xs: 400, md: 500 },
        borderRadius: 3,
        overflow: 'hidden',
        mb: 4
      }}
    >
      {/* Background com gradiente */}
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
          height: '50%',
          background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 100%)'
        }}
      />

      {/* Conteúdo principal - FOCÁVEL */}
      <Box
        sx={{
          position: 'relative',
          zIndex: 2,
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          px: { xs: 3, md: 6 }
        }}
      >
        <Box sx={{ maxWidth: 600 }}>
          {/* Título */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Typography
              variant="h2"
              sx={{
                fontWeight: 900,
                mb: 2,
                background: `linear-gradient(45deg, ${currentColors.primary}, ${currentColors.accent})`,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textShadow: '0 4px 20px rgba(0,0,0,0.5)',
                fontSize: { xs: '2.5rem', md: '3.5rem' }
              }}
            >
              {featuredGame.title}
            </Typography>
          </motion.div>

          {/* Descrição */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <Typography
              variant="h6"
              sx={{
                mb: 3,
                color: 'rgba(255,255,255,0.9)',
                lineHeight: 1.6,
                maxWidth: 500,
                textShadow: '0 2px 10px rgba(0,0,0,0.7)'
              }}
            >
              {featuredGame.description}
            </Typography>
          </motion.div>

          {/* Info do jogo */}
          <Stack direction="row" spacing={2} sx={{ mb: 4 }}>
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

          {/* Botões de ação - ELEMENTOS FOCÁVEIS */}
          <Stack direction="row" spacing={2}>
            {renderPrimaryButton()}

            <CustomButton
              {...(heroButtonProps ? heroButtonProps(1) : {})}
              variant="outlined"
              onClick={(e) => {
                e.stopPropagation();
                onGameSelect(featuredGame.id);
              }}
              sx={{
                color: 'white',
                borderColor: 'rgba(255,255,255,0.6)',
                fontSize: '0.8rem',
                textTransform: 'none',
                px: 2,
                py: 0.8,
                // Estilo de foco para navegação console
                border: focusMode === 'hero' && currentHeroButton === 1
                  ? '3px solid rgba(255, 255, 255, 0.8)'
                  : '1px solid rgba(255,255,255,0.6)',
                transform: focusMode === 'hero' && currentHeroButton === 1
                  ? 'scale(1.05)'
                  : 'scale(1)',
                boxShadow: focusMode === 'hero' && currentHeroButton === 1
                  ? '0 8px 25px rgba(255, 255, 255, 0.3)'
                  : 'none',
                transition: 'all 0.3s ease',
                '&:hover': {
                  borderColor: 'rgba(255,255,255,0.8)',
                  bgcolor: 'rgba(255,255,255,0.1)'
                }
              }}
            >
              Ver mais informações
            </CustomButton>
          </Stack>
        </Box>
      </Box>
    </Box>
  );
};

export default HeroSection;