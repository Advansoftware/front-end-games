import React, { useState, useEffect } from 'react';
import { Box, Typography, Chip, Stack, Card, CardMedia, Grid } from '@mui/material';
import { motion } from 'framer-motion';
import {
  Star as StarIcon,
  InfoOutlined as InfoIcon
} from '@mui/icons-material';

import { useGames } from '../../contexts/GamesContext';
import { useDownloads } from '../../hooks/useDownloads';
import CacheService from '../../services/CacheService';
import CustomButton from '../CustomButton';
import GameDetailsActions from './GameDetailsActions';

const GameDetailsHero = ({ game, onShowInfo, onShowTrailer, getInfoButtonProps, getButtonProps }) => {
  const [gameDetails, setGameDetails] = useState(null);
  const { getGameById } = useGames();

  // Carregar dados enriquecidos do jogo
  useEffect(() => {
    const loadGameData = async () => {
      if (!game) return;

      // Sempre mostrar dados locais primeiro
      setGameDetails(game);

      // Se estiver no Electron, tentar carregar dados do cache
      if (CacheService.isElectronMode()) {
        try {
          const cachedData = await CacheService.loadGameFromCache(game.id);
          if (cachedData) {
            setGameDetails(cachedData);
            return;
          }

          // Cache não encontrado, buscar da API
          const enrichedData = await CacheService.enrichAndCacheGameData(
            game.id,
            game.title,
            game.platform,
            game
          );

          if (enrichedData && enrichedData.enrichedFromAPI) {
            setGameDetails(enrichedData);
          }
        } catch (error) {
          console.warn(`Erro no sistema de cache para ${game.title}:`, error);
        }
      }
    };

    loadGameData();
  }, [game]);

  if (!gameDetails) return null;

  const heroImage = gameDetails.screenshots?.[0] || gameDetails.image;

  return (
    <Box
      sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
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
          backgroundImage: `url(${heroImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'brightness(0.3) blur(2px)',
          transform: 'scale(1.1)'
        }}
      />

      {/* Overlay */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(135deg, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.6) 50%, rgba(0,0,0,0.9) 100%)'
        }}
      />

      {/* Conteúdo principal */}
      <Box
        sx={{
          position: 'relative',
          zIndex: 2,
          display: 'flex',
          alignItems: 'center',
          width: '100%',
          height: '100%',
          px: 4,
          py: 4
        }}
      >
        <Grid container spacing={6} alignItems="center" sx={{ width: '100%' }}>
          {/* Imagem do jogo */}
          <Grid item xs={12} md={4} lg={3}>
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Card
                sx={{
                  borderRadius: 3,
                  overflow: 'hidden',
                  boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
                  border: '3px solid rgba(255,255,255,0.2)',
                  maxWidth: 350
                }}
              >
                <CardMedia
                  component="img"
                  image={heroImage}
                  alt={gameDetails.title}
                  sx={{
                    height: { xs: 220, md: 280 },
                    objectFit: 'cover'
                  }}
                />
              </Card>
            </motion.div>
          </Grid>

          {/* Informações principais */}
          <Grid item xs={12} md={8} lg={9}>
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Box sx={{ color: 'white' }}>
                {/* Título */}
                <Typography
                  variant="h2"
                  component="h1"
                  sx={{
                    fontWeight: 900,
                    mb: 2,
                    fontSize: { xs: '2.5rem', md: '4rem' },
                    textShadow: '3px 3px 6px rgba(0,0,0,0.9)',
                    lineHeight: 1.1
                  }}
                >
                  {gameDetails.title}
                </Typography>

                {/* Rating e gênero */}
                <Stack direction="row" spacing={4} sx={{ mb: 3, alignItems: 'center', flexWrap: 'wrap' }}>
                  {gameDetails.rating && gameDetails.rating > 0 && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <StarIcon sx={{ color: 'warning.main', fontSize: 28 }} />
                      <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                        {gameDetails.rating}/10
                      </Typography>
                    </Box>
                  )}

                  {gameDetails.genre && (
                    <Chip
                      label={gameDetails.genre}
                      sx={{
                        bgcolor: 'rgba(255,255,255,0.2)',
                        color: 'white',
                        fontSize: '1rem',
                        height: 40,
                        px: 2,
                        fontWeight: 600
                      }}
                    />
                  )}

                  {/* Informações adicionais */}
                  <Stack direction="row" spacing={2} sx={{ opacity: 0.9 }}>
                    {gameDetails.developer && (
                      <Typography variant="h6" sx={{ fontWeight: 500 }}>
                        {gameDetails.developer}
                      </Typography>
                    )}

                    {gameDetails.releaseDate && (
                      <>
                        <Typography variant="h6">•</Typography>
                        <Typography variant="h6" sx={{ fontWeight: 500 }}>
                          {gameDetails.releaseDate}
                        </Typography>
                      </>
                    )}

                    <Typography variant="h6">•</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 500 }}>
                      {gameDetails.size || gameDetails.downloadSize || 'N/A'}
                    </Typography>
                  </Stack>
                </Stack>

                {/* Descrição resumida */}
                {gameDetails.description && (
                  <Box sx={{ mb: 4 }}>
                    <Typography
                      variant="h5"
                      sx={{
                        mb: 2,
                        opacity: 0.95,
                        lineHeight: 1.5,
                        maxWidth: 800,
                        textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
                        fontSize: { xs: '1.1rem', md: '1.3rem' },
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}
                    >
                      {gameDetails.description}
                    </Typography>

                    <CustomButton
                      variant="outlined"
                      size="small"
                      startIcon={<InfoIcon />}
                      onClick={onShowInfo}
                      {...(getInfoButtonProps ? getInfoButtonProps() : {})}
                      sx={{
                        color: 'rgba(255,255,255,0.8)',
                        fontSize: '0.8rem',
                        textTransform: 'none',
                        borderColor: 'rgba(255,255,255,0.3)',
                        px: 2,
                        py: 0.8,
                        '&:hover': {
                          borderColor: 'rgba(255,255,255,0.6)',
                          bgcolor: 'rgba(255,255,255,0.1)'
                        },
                        ...(getInfoButtonProps ? getInfoButtonProps().sx : {})
                      }}
                    >
                      Ver mais informações
                    </CustomButton>
                  </Box>
                )}

                {/* Botões de ação */}
                <GameDetailsActions
                  game={gameDetails}
                  onShowTrailer={onShowTrailer}
                  getButtonProps={getButtonProps}
                />
              </Box>
            </motion.div>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default GameDetailsHero;