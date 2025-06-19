import React from 'react';
import {
  Card,
  CardMedia,
  Box,
  Typography,
  IconButton,
  Chip,
  Stack,
  LinearProgress,
  CircularProgress
} from '@mui/material';
import { motion } from 'framer-motion';
import {
  PlayArrow as PlayIcon,
  Star as StarIcon,
  Schedule as ClockIcon,
  Download as DownloadIcon,
  CloudDownload as CloudIcon,
  Update as UpdateIcon
} from '@mui/icons-material';
import { useGames } from '../contexts/GamesContext';
import { useDownloads } from '../hooks/useDownloads';
import { useTheme } from '../contexts/ThemeContext';
import CustomButton from './CustomButton';
import OverlayActionButton from './OverlayActionButton';

const GameCard = ({
  game,
  isRecent = false,
  onSelect,
  variant = 'horizontal',
  // Props para navegação console
  'data-focused': isFocused = false,
  tabIndex = -1,
  ...otherProps
}) => {
  const { downloadGame, updateGame } = useGames();
  const { activeDownloads } = useDownloads();
  const { currentTheme } = useTheme();

  // Cores por tema
  const themeColors = {
    xbox: {
      primary: '#107C10',
      secondary: '#0E6A0E',
      accent: '#40E040',
      glow: '#40E040'
    },
    ps5: {
      primary: '#0070F3',
      secondary: '#0051CC',
      accent: '#40B4FF',
      glow: '#40B4FF'
    },
    switch: {
      primary: '#E60012',
      secondary: '#CC0010',
      accent: '#FF4040',
      glow: '#FF4040'
    }
  };

  const currentColors = themeColors[currentTheme];

  // Remover dimensões fixas - usar 100% da largura do grid item
  const cardHeight = variant === 'horizontal' ? 280 : 300;

  // Usar o status de instalação do jogo e dados do hook useDownloads
  const isDownloaded = game.installed === true;
  const downloadData = activeDownloads.get(game.id);
  const isDownloading = downloadData !== undefined;

  // Garantir que o progresso seja sempre um número inteiro
  const progressPercent = isDownloading ? Math.round(downloadData.progress || 0) : 0;

  // Determinar tipo de operação e mensagem
  const isUpdating = isDownloaded && isDownloading; // Se já instalado e baixando = atualizando
  const operationType = isUpdating ? 'updating' : 'downloading';

  // Determinar mensagem baseada no status real e tipo de operação
  let operationMessage = 'Baixando';
  if (isUpdating) {
    if (downloadData?.status === 'installing') {
      operationMessage = 'Instalando';
    } else {
      operationMessage = 'Atualizando';
    }
  } else if (downloadData?.status === 'installing') {
    operationMessage = 'Instalando';
  }

  const operationIcon = isUpdating ? UpdateIcon : DownloadIcon;

  // Determinar se tem atualização disponível (mesma lógica do GameDetails)
  const hasUpdate = [1, 3].includes(game.id) && game.installed && !isDownloading;

  // Função para iniciar download
  const handleDownload = (e) => {
    e.stopPropagation(); // Impede que o clique propague para o card
    if (!isDownloaded && !isDownloading) {
      downloadGame(game.id);
    }
  };

  // Função para iniciar atualização
  const handleUpdate = (e) => {
    e.stopPropagation(); // Impede que o clique propague para o card
    // Usar downloadGame para simular atualização (mesmo processo interno)
    downloadGame(game.id);
  };

  return (
    <Card
      component={motion.div}
      whileTap={{ scale: 0.98 }}
      tabIndex={tabIndex}
      {...otherProps}
      sx={{
        width: '100%',
        height: cardHeight + 120,
        flexShrink: 0,
        bgcolor: 'rgba(255,255,255,0.05)',
        backdropFilter: 'blur(10px)',
        borderRadius: 1,
        overflow: 'hidden',
        cursor: 'pointer',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        outline: 'none', // Remove outline padrão do foco

        // Estilo de foco para navegação console
        border: isFocused
          ? `3px solid ${currentColors.primary}`
          : '1px solid rgba(255,255,255,0.1)',

        transform: isFocused ? 'scale(1.05)' : 'scale(1)',

        boxShadow: isFocused
          ? `0 8px 25px ${currentColors.glow}60, 0 0 0 1px ${currentColors.primary}40`
          : 'none',

        opacity: isDownloaded ? 1 : (isFocused ? 0.9 : 0.7),

        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',

        // Efeito de hover (apenas quando não focado pelo controle)
        '&:hover': !isFocused ? {
          bgcolor: 'rgba(255,255,255,0.1)',
          borderColor: `${currentColors.primary}80`,
          transform: 'scale(1.02)',
          '& .game-overlay': {
            opacity: 1
          },
          '& .game-info': {
            transform: 'translateY(-1px)'
          }
        } : {},

        // Efeito adicional quando focado
        ...(isFocused && {
          bgcolor: 'rgba(255,255,255,0.08)',
          '& .game-overlay': {
            opacity: 1
          },
          '& .game-info': {
            transform: 'translateY(-2px)'
          },
          '&::before': {
            content: '""',
            position: 'absolute',
            top: -2,
            left: -2,
            right: -2,
            bottom: -2,
            background: `linear-gradient(45deg, ${currentColors.primary}, ${currentColors.accent})`,
            borderRadius: 'inherit',
            zIndex: -1,
            opacity: 0.6,
            filter: 'blur(8px)'
          }
        })
      }}
      onClick={() => onSelect && onSelect(game.id)}
    >
      {/* Indicador de foco no canto superior esquerdo */}
      {isFocused && (
        <Box
          sx={{
            position: 'absolute',
            top: 8,
            left: 8,
            width: 12,
            height: 12,
            borderRadius: '50%',
            bgcolor: currentColors.primary,
            zIndex: 20,
            boxShadow: `0 0 12px ${currentColors.glow}80`,
            animation: 'pulse-focus 2s infinite',
            '@keyframes pulse-focus': {
              '0%, 100%': {
                transform: 'scale(1)',
                opacity: 1
              },
              '50%': {
                transform: 'scale(1.2)',
                opacity: 0.8
              }
            }
          }}
        />
      )}

      {/* Progress bar no topo do card durante download */}
      {isDownloading && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 4,
            zIndex: 10,
            bgcolor: 'rgba(0,0,0,0.3)'
          }}
        >
          <Box
            sx={{
              height: '100%',
              width: `${progressPercent}%`,
              borderRadius: '0 2px 2px 0',
              transition: 'width 0.3s ease',
              background: `linear-gradient(90deg, ${currentColors.primary}, ${currentColors.accent})`,
              boxShadow: `0 0 8px ${currentColors.glow}40`
            }}
          />
        </Box>
      )}

      {/* Thumbnail com proporção responsiva */}
      <Box
        sx={{
          position: 'relative',
          height: cardHeight,
          width: '100%',
          flexShrink: 0
        }}
      >
        <CardMedia
          component="img"
          image={game.image}
          alt={game.title}
          sx={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            filter: isDownloaded ? 'none' : 'grayscale(0.3) brightness(0.8)',
            // Melhora visual quando focado
            ...(isFocused && {
              filter: isDownloaded ? 'brightness(1.1) saturate(1.1)' : 'grayscale(0.1) brightness(0.9)'
            })
          }}
        />

        {/* Overlay para jogos baixados - LÓGICA CORRIGIDA */}
        {game.installed && !isDownloading && !hasUpdate && (
          <Box
            className="game-overlay"
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              bgcolor: 'rgba(0,0,0,0.6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: 0,
              transition: 'opacity 0.3s ease'
            }}
          >
            <IconButton
              sx={{
                bgcolor: currentColors.primary,
                color: 'white',
                size: 'large',
                boxShadow: `0 0 20px ${currentColors.glow}60`,
                '&:hover': {
                  bgcolor: currentColors.secondary,
                  transform: 'scale(1.1)',
                  boxShadow: `0 0 30px ${currentColors.glow}80`
                }
              }}
            >
              <PlayIcon sx={{ fontSize: 32 }} />
            </IconButton>
          </Box>
        )}

        {/* Overlay para jogos com atualização disponível */}
        {hasUpdate && !isDownloading && !isUpdating && (
          <OverlayActionButton
            icon={UpdateIcon}
            text="Atualizar"
            onClick={handleUpdate}
            currentColors={currentColors}
          />
        )}

        {/* Overlay para jogos não baixados */}
        {!isDownloaded && !isDownloading && (
          <OverlayActionButton
            icon={DownloadIcon}
            text="Baixar"
            onClick={handleDownload}
            currentColors={currentColors}
          />
        )}

        {/* Overlay durante download */}
        {isDownloading && (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              bgcolor: 'rgba(0,0,0,0.85)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              backdropFilter: 'blur(4px)'
            }}
          >
            {/* Ícone da operação */}
            <Box sx={{ mb: 2 }}>
              {React.createElement(operationIcon, {
                sx: {
                  fontSize: 32,
                  color: currentColors.primary,
                  filter: `drop-shadow(0 0 8px ${currentColors.glow}60)`,
                  animation: 'pulse 2s infinite',
                  '@keyframes pulse': {
                    '0%, 100%': { opacity: 1 },
                    '50%': { opacity: 0.7 }
                  }
                }
              })}
            </Box>

            {/* Loading circular com porcentagem ou infinito */}
            <Box
              sx={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 80,
                height: 80,
                mb: 2
              }}
            >
              {progressPercent > 0 ? (
                // Loading com porcentagem
                <>
                  {/* Círculo de fundo */}
                  <Box
                    sx={{
                      position: 'absolute',
                      width: '100%',
                      height: '100%',
                      borderRadius: '50%',
                      border: '4px solid rgba(255,255,255,0.1)',
                    }}
                  />
                  {/* Círculo de progresso */}
                  <Box
                    sx={{
                      position: 'absolute',
                      width: '100%',
                      height: '100%',
                      borderRadius: '50%',
                      border: '4px solid transparent',
                      borderTopColor: currentColors.primary,
                      borderRightColor: progressPercent > 25 ? currentColors.primary : 'transparent',
                      borderBottomColor: progressPercent > 50 ? currentColors.accent : 'transparent',
                      borderLeftColor: progressPercent > 75 ? currentColors.accent : 'transparent',
                      transform: `rotate(${(progressPercent / 100) * 360}deg)`,
                      transition: 'all 0.3s ease',
                      filter: `drop-shadow(0 0 6px ${currentColors.glow}40)`
                    }}
                  />
                  {/* Texto da porcentagem */}
                  <Typography
                    variant="h6"
                    sx={{
                      color: 'white',
                      fontWeight: 700,
                      fontSize: '1rem',
                      textShadow: `0 0 8px ${currentColors.glow}60`
                    }}
                  >
                    {progressPercent}%
                  </Typography>
                </>
              ) : (
                // Loading infinito
                <CircularProgress
                  size={72}
                  thickness={4}
                  sx={{
                    color: currentColors.primary,
                    filter: `drop-shadow(0 0 8px ${currentColors.glow}40)`,
                    '& .MuiCircularProgress-circle': {
                      strokeLinecap: 'round',
                    }
                  }}
                />
              )}
            </Box>

            {/* Mensagem da operação */}
            <Typography
              variant="body2"
              sx={{
                color: 'white',
                fontWeight: 600,
                fontSize: '0.9rem',
                textAlign: 'center',
                textShadow: `0 0 8px ${currentColors.glow}40`,
                mb: 1
              }}
            >
              {operationMessage}
            </Typography>

            {/* Informações adicionais */}
            {downloadData?.speed && (
              <Typography
                variant="caption"
                sx={{
                  color: currentColors.accent,
                  fontSize: '0.75rem',
                  fontWeight: 500,
                  textShadow: `0 0 4px ${currentColors.glow}30`
                }}
              >
                {downloadData.speed}
              </Typography>
            )}
          </Box>
        )}

        {/* Status badge */}
        {isRecent && (
          <Chip
            icon={<ClockIcon sx={{ fontSize: 14 }} />}
            label="Recente"
            size="small"
            sx={{
              position: 'absolute',
              top: 8,
              left: isFocused ? 28 : 8, // Mover para direita se focado
              bgcolor: 'rgba(0,0,0,0.8)',
              color: 'white',
              fontSize: '0.7rem',
              height: 24,
              transition: 'left 0.3s ease'
            }}
          />
        )}

        {/* Badge de status de download */}
        {!isDownloaded && !isDownloading && (
          <Chip
            icon={<CloudIcon sx={{ fontSize: 12 }} />}
            label="Disponível"
            size="small"
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              bgcolor: 'rgba(33, 150, 243, 0.9)',
              color: 'white',
              fontSize: '0.65rem',
              height: 22
            }}
          />
        )}
      </Box>

      {/* Game info com altura fixa */}
      <Box
        className="game-info"
        sx={{
          p: 2,
          height: 120,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          transition: 'transform 0.3s ease',
          flexGrow: 1,
          width: '100%',
          // Melhor destaque do texto quando focado
          ...(isFocused && {
            '& .MuiTypography-root': {
              textShadow: `0 1px 3px rgba(0,0,0,0.5)`
            }
          })
        }}
      >
        {/* Informações do jogo - parte superior */}
        <Box sx={{ flex: 1 }}>
          <Typography
            variant="subtitle1"
            sx={{
              fontWeight: 600,
              color: isFocused ? 'white' : 'text.primary',
              mb: 0.5,
              fontSize: '0.9rem',
              lineHeight: 1.2,
              height: '2.4em',
              overflow: 'hidden',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              transition: 'color 0.3s ease'
            }}
          >
            {game.title}
          </Typography>

          <Typography
            variant="body2"
            sx={{
              color: isFocused ? 'rgba(255,255,255,0.8)' : 'text.secondary',
              fontSize: '0.75rem',
              mb: 1,
              height: '1.2em',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              transition: 'color 0.3s ease'
            }}
          >
            {game.genre || 'Aventura'}
          </Typography>
        </Box>

        {/* Rating e status - parte inferior */}
        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          justifyContent="space-between"
          sx={{ mt: 'auto', height: 20 }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <StarIcon sx={{
              color: 'warning.main',
              fontSize: 12,
              ...(isFocused && {
                filter: 'brightness(1.2) drop-shadow(0 1px 2px rgba(0,0,0,0.5))'
              })
            }} />
            <Typography
              variant="caption"
              sx={{
                fontWeight: 600,
                fontSize: '0.7rem',
                color: isFocused ? 'white' : 'inherit',
                transition: 'color 0.3s ease'
              }}
            >
              {game.rating || '9.5'}
            </Typography>
          </Box>

          {/* Status de download */}
          {!isDownloading && (
            <Typography
              variant="caption"
              sx={{
                color: isDownloaded ? 'success.main' : 'info.main',
                fontWeight: 500,
                fontSize: '0.65rem',
                ...(isFocused && {
                  color: isDownloaded ? '#4caf50' : '#40B4FF',
                  filter: 'brightness(1.2)'
                }),
                transition: 'color 0.3s ease'
              }}
            >
              {isDownloaded ? 'Instalado' : 'Nuvem'}
            </Typography>
          )}
        </Stack>
      </Box>
    </Card>
  );
};

export default GameCard;