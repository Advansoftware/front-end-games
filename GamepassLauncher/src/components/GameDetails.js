import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  IconButton,
  Chip,
  Grid,
  Card,
  CardContent,
  LinearProgress
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  PlayArrow as PlayIcon,
  Download as DownloadIcon,
  Star as StarIcon,
  VolumeOff as VolumeOffIcon,
  VolumeUp as VolumeUpIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import ReactPlayer from 'react-player';
import { useGames } from '../contexts/GamesContext';
import { useTheme } from '../contexts/ThemeContext';
import { useGamepad } from '../hooks/useGamepad';

const GameDetails = ({ gameId, onBack }) => {
  const { games, downloadGame, launchGame, downloadProgress } = useGames();
  const { playSound } = useTheme();
  const gamepad = useGamepad();

  const [videoMuted, setVideoMuted] = useState(true);
  const [selectedAction, setSelectedAction] = useState(0);

  const game = games.find(g => g.id === gameId);
  const isDownloading = downloadProgress[gameId] !== undefined;
  const progress = downloadProgress[gameId] || 0;

  const actions = [
    {
      label: game?.installed ? 'Jogar' : 'Baixar',
      icon: game?.installed ? PlayIcon : DownloadIcon,
      action: game?.installed ? () => launchGame(gameId) : () => downloadGame(gameId),
      disabled: isDownloading
    },
    {
      label: 'Voltar',
      icon: BackIcon,
      action: onBack,
      disabled: false
    }
  ];

  // Navegação com gamepad
  useEffect(() => {
    const handleGamepadNavigation = () => {
      const nav = gamepad.getNavigationInput();

      if (nav.left && selectedAction > 0) {
        setSelectedAction(prev => prev - 1);
        playSound('navigate');
      }

      if (nav.right && selectedAction < actions.length - 1) {
        setSelectedAction(prev => prev + 1);
        playSound('navigate');
      }

      if (nav.confirm) {
        actions[selectedAction].action();
        playSound('confirm');
      }

      if (nav.back || nav.cancel) {
        onBack();
        playSound('cancel');
      }
    };

    if (gamepad.gamepadConnected) {
      const interval = setInterval(handleGamepadNavigation, 150);
      return () => clearInterval(interval);
    }
  }, [gamepad, selectedAction, actions, onBack, playSound]);

  if (!game) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <Typography variant="h5">Jogo não encontrado</Typography>
      </Box>
    );
  }

  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      sx={{ height: '100%', overflow: 'auto' }}
    >
      <Grid container spacing={4} sx={{ height: '100%' }}>
        {/* Vídeo/Imagem do jogo */}
        <Grid item xs={12} md={8}>
          <Card sx={{ position: 'relative', height: '400px', overflow: 'hidden' }}>
            {game.video ? (
              <>
                <ReactPlayer
                  url={game.video}
                  width="100%"
                  height="100%"
                  playing={true}
                  loop={true}
                  muted={videoMuted}
                  controls={false}
                  style={{ position: 'absolute', top: 0, left: 0 }}
                />

                <IconButton
                  onClick={() => setVideoMuted(!videoMuted)}
                  sx={{
                    position: 'absolute',
                    top: 16,
                    right: 16,
                    bgcolor: 'rgba(0,0,0,0.7)',
                    color: 'white',
                    '&:hover': { bgcolor: 'rgba(0,0,0,0.8)' }
                  }}
                >
                  {videoMuted ? <VolumeOffIcon /> : <VolumeUpIcon />}
                </IconButton>
              </>
            ) : (
              <Box
                component="img"
                src={game.image}
                alt={game.title}
                sx={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
              />
            )}
          </Card>

          {/* Screenshots/Galeria */}
          <Box sx={{ mt: 2, display: 'flex', gap: 1, overflowX: 'auto' }}>
            {[1, 2, 3, 4].map((index) => (
              <Card key={index} sx={{ minWidth: 150, height: 100 }}>
                <Box
                  component="img"
                  src={`${game.image}?variant=${index}`}
                  alt={`Screenshot ${index}`}
                  sx={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    cursor: 'pointer'
                  }}
                />
              </Card>
            ))}
          </Box>
        </Grid>

        {/* Informações do jogo */}
        <Grid item xs={12} md={4}>
          <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Cabeçalho */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="h3" component="h1" gutterBottom>
                {game.title}
              </Typography>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <StarIcon sx={{ color: 'warning.main' }} />
                  <Typography variant="h6">{game.rating}</Typography>
                </Box>

                <Chip
                  label={game.platform}
                  color="primary"
                  variant="outlined"
                />

                <Chip
                  label={game.size}
                  variant="outlined"
                />
              </Box>

              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {game.genre.map((genre, index) => (
                  <Chip
                    key={index}
                    label={genre}
                    size="small"
                    color="secondary"
                  />
                ))}
              </Box>
            </Box>

            {/* Descrição */}
            <Box sx={{ mb: 3, flex: 1 }}>
              <Typography variant="h6" gutterBottom>
                Sobre este jogo
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
                {game.description}
              </Typography>
            </Box>

            {/* Progresso de download */}
            {isDownloading && (
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Baixando {game.title}
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={progress}
                    sx={{ mb: 1 }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    {progress}% concluído
                  </Typography>
                </CardContent>
              </Card>
            )}

            {/* Botões de ação */}
            <Box sx={{ display: 'flex', gap: 2 }}>
              {actions.map((action, index) => {
                const Icon = action.icon;
                const isSelected = gamepad.gamepadConnected && selectedAction === index;

                return (
                  <Button
                    key={index}
                    variant={isSelected ? "contained" : (index === 0 ? "contained" : "outlined")}
                    size="large"
                    startIcon={<Icon />}
                    onClick={action.action}
                    disabled={action.disabled}
                    sx={{
                      flex: index === 0 ? 2 : 1,
                      py: 1.5,
                      border: isSelected ? 2 : undefined,
                      borderColor: isSelected ? 'secondary.main' : undefined
                    }}
                  >
                    {action.label}
                  </Button>
                );
              })}
            </Box>

            {/* Informações técnicas */}
            <Card sx={{ mt: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Informações técnicas
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">
                      Plataforma:
                    </Typography>
                    <Typography variant="body2">
                      {game.platform}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">
                      Tamanho:
                    </Typography>
                    <Typography variant="body2">
                      {game.size}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">
                      Status:
                    </Typography>
                    <Typography
                      variant="body2"
                      color={game.installed ? 'success.main' : 'text.secondary'}
                    >
                      {game.installed ? 'Instalado' : 'Não instalado'}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default GameDetails;