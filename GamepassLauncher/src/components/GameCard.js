import React from 'react';
import {
  Card,
  CardMedia,
  Box,
  Typography,
  IconButton,
  Chip,
  Stack,
  LinearProgress
} from '@mui/material';
import { motion } from 'framer-motion';
import {
  PlayArrow as PlayIcon,
  Star as StarIcon,
  Schedule as ClockIcon,
  Download as DownloadIcon,
  CloudDownload as CloudIcon
} from '@mui/icons-material';
import { useGames } from '../contexts/GamesContext';
import CustomButton from './CustomButton';

const GameCard = ({
  game,
  isRecent = false,
  onGameSelect,
  variant = 'horizontal' // 'horizontal' | 'vertical'
}) => {
  const { downloadProgress, downloadGame } = useGames();

  // Dimensões fixas e consistentes para todos os cards
  const cardDimensions = variant === 'horizontal'
    ? { width: 200, height: 280 } // Dimensões fixas para todos
    : { width: 220, height: 300 }; // Dimensões fixas para vertical

  // Usar o status de instalação do jogo
  const isDownloaded = game.installed === true;
  const downloadPercent = downloadProgress[game.id];
  const isDownloading = downloadPercent !== undefined;

  // Garantir que o progresso seja sempre um número inteiro
  const progressPercent = isDownloading ? Math.round(downloadPercent) : 0;

  // Função para iniciar download
  const handleDownload = (e) => {
    e.stopPropagation(); // Impede que o clique propague para o card
    if (!isDownloaded && !isDownloading) {
      downloadGame(game.id);
    }
  };

  return (
    <Card
      component={motion.div}
      whileTap={{ scale: 0.98 }}
      sx={{
        width: cardDimensions.width,
        height: cardDimensions.height + 120, // +120 para info do jogo (aumentado para caber tudo)
        flexShrink: 0,
        bgcolor: 'rgba(255,255,255,0.05)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 1,
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        opacity: isDownloaded ? 1 : 0.7,
        position: 'relative',
        display: 'flex',
        flexDirection: 'column', // Garantir layout em coluna
        '&:hover': {
          bgcolor: 'rgba(255,255,255,0.1)',
          borderColor: 'primary.main',
          '& .game-overlay': {
            opacity: 1
          },
          '& .game-info': {
            transform: 'translateY(-1px)'
          }
        }
      }}
      onClick={() => onGameSelect(game.id)}
    >
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
              bgcolor: 'info.main',
              borderRadius: '0 2px 2px 0',
              transition: 'width 0.3s ease',
              background: 'linear-gradient(90deg, #0070f3, #00d4ff)'
            }}
          />
        </Box>
      )}

      {/* Thumbnail com proporção fixa */}
      <Box
        sx={{
          position: 'relative',
          height: cardDimensions.height,
          flexShrink: 0 // Não permite que a imagem diminua
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
            filter: isDownloaded ? 'none' : 'grayscale(0.3) brightness(0.8)'
          }}
        />

        {/* Overlay para jogos baixados */}
        {isDownloaded && !isDownloading && (
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
                bgcolor: 'primary.main',
                color: 'white',
                size: 'large',
                '&:hover': {
                  bgcolor: 'primary.dark'
                }
              }}
            >
              <PlayIcon sx={{ fontSize: 32 }} />
            </IconButton>
          </Box>
        )}

        {/* Overlay para jogos não baixados */}
        {!isDownloaded && !isDownloading && (
          <Box
            className="game-overlay"
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              bgcolor: 'rgba(0,0,0,0.7)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: 0,
              transition: 'opacity 0.3s ease'
            }}
          >
            <CloudIcon sx={{ fontSize: 36, color: 'white', mb: 1.5 }} />
            <CustomButton
              variant="contained"
              size="medium"
              startIcon={<DownloadIcon />}
              onClick={handleDownload}
              sx={{
                bgcolor: 'success.main',
                fontSize: '0.8rem',
                py: 1,
                px: 2,
                '&:hover': {
                  bgcolor: 'success.dark'
                }
              }}
            >
              Baixar
            </CustomButton>
          </Box>
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
              bgcolor: 'rgba(0,0,0,0.8)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
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
              {/* Círculo de progresso */}
              <Box
                sx={{
                  position: 'absolute',
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  border: '4px solid rgba(255,255,255,0.2)',
                }}
              />
              <Box
                sx={{
                  position: 'absolute',
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  border: '4px solid transparent',
                  borderTopColor: 'info.main',
                  transform: `rotate(${(progressPercent / 100) * 360}deg)`,
                  transition: 'transform 0.3s ease'
                }}
              />
              <Typography
                variant="h6"
                sx={{
                  color: 'white',
                  fontWeight: 700,
                  fontSize: '1rem'
                }}
              >
                {progressPercent}%
              </Typography>
            </Box>
            {/* Removido o texto "Baixando..." da parte inferior */}
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
              left: 8,
              bgcolor: 'rgba(0,0,0,0.8)',
              color: 'white',
              fontSize: '0.7rem',
              height: 24
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
          height: 120, // Altura fixa para todas as informações
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          transition: 'transform 0.2s ease',
          flexGrow: 1 // Ocupa o espaço restante
        }}
      >
        {/* Informações do jogo - parte superior */}
        <Box sx={{ flex: 1 }}>
          <Typography
            variant="subtitle1"
            sx={{
              fontWeight: 600,
              color: 'text.primary',
              mb: 0.5,
              fontSize: '0.9rem',
              lineHeight: 1.2,
              height: '2.4em', // Altura fixa para 2 linhas
              overflow: 'hidden',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical'
            }}
          >
            {game.title}
          </Typography>

          <Typography
            variant="body2"
            sx={{
              color: 'text.secondary',
              fontSize: '0.75rem',
              mb: 1,
              height: '1.2em', // Altura fixa para 1 linha
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
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
          sx={{ mt: 'auto', height: 20 }} // Altura fixa
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <StarIcon sx={{ color: 'warning.main', fontSize: 12 }} />
            <Typography variant="caption" sx={{ fontWeight: 600, fontSize: '0.7rem' }}>
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
                fontSize: '0.65rem'
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