import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Button,
  Chip,
  Stack,
  Card,
  CardMedia,
  Grid,
  Modal,
  Backdrop,
  Fade
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowBack as BackIcon,
  PlayArrow as PlayIcon,
  Download as DownloadIcon,
  Update as UpdateIcon,
  Star as StarIcon,
  YouTube as YouTubeIcon,
  CloudDownload as CloudIcon,
  Minimize as MinimizeIcon,
  Maximize as MaximizeIcon,
  Close as CloseIcon,
  InfoOutlined as InfoIcon,
  Language as WebIcon
} from '@mui/icons-material';
import { useGames } from '../contexts/GamesContext';
import CacheService from '../services/CacheService';
import YouTubePlayer from './YouTubePlayer';

const GameDetails = ({ gameId, onBack }) => {
  const {
    getGameById,
    downloadGame,
    updateGame,
    launchGame,
    downloadProgress,
    updateProgress
  } = useGames();

  const [gameDetails, setGameDetails] = useState(null);
  const [selectedScreenshot, setSelectedScreenshot] = useState(0);
  const [showTrailer, setShowTrailer] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);

  const game = getGameById(gameId);
  const downloadPercent = downloadProgress[gameId];
  const updatePercent = updateProgress[gameId];
  const isDownloading = downloadPercent !== undefined;
  const isUpdating = updatePercent !== undefined;

  // Garantir que o progresso seja sempre um número inteiro
  const progressPercent = isDownloading ? Math.round(downloadPercent) : 0;
  const updateProgressPercent = isUpdating ? Math.round(updatePercent) : 0;

  // Simular atualizações disponíveis para alguns jogos
  const hasUpdate = [1, 3].includes(gameId);

  // Carregar dados do jogo - Cache primeiro, depois API se necessário
  useEffect(() => {
    const loadGameData = async () => {
      if (!game) return;

      // Sempre mostrar dados locais primeiro (do games.json)
      setGameDetails(game);

      // Se estiver no Electron, tentar sistema de cache inteligente
      if (CacheService.isElectronMode()) {
        try {
          console.log(`🔍 Verificando cache para: ${game.title}`);

          // 1. PRIMEIRO: Tentar carregar do cache
          const cachedData = await CacheService.loadGameFromCache(gameId);

          if (cachedData) {
            console.log(`📦 Dados encontrados no cache para ${game.title}`);
            setGameDetails(cachedData);
            return; // Cache encontrado, não precisa buscar da API
          }

          // 2. SEGUNDO: Cache não encontrado, buscar da API
          console.log(`🌐 Cache não encontrado, buscando da API para: ${game.title}`);

          const enrichedData = await CacheService.enrichAndCacheGameData(
            gameId,
            game.title,
            game.platform,
            game
          );

          if (enrichedData && enrichedData.enrichedFromAPI) {
            console.log(`✅ Dados da API encontrados e salvos no cache para: ${game.title}`);
            setGameDetails(enrichedData);
          }

        } catch (error) {
          console.warn(`⚠️ Erro no sistema de cache para ${game.title}:`, error);
          // Manter dados locais em caso de erro
        }
      } else {
        console.log('🌐 Modo navegador: usando apenas dados locais');
      }
    };

    loadGameData();
  }, [gameId, game]);

  const handleScreenshotClick = (index) => {
    setSelectedScreenshot(index);
  };

  const handlePlay = () => {
    launchGame(gameId);
  };

  const handleDownload = () => {
    downloadGame(gameId);
  };

  const handleUpdate = () => {
    updateGame(gameId);
  };

  const handleTrailerToggle = () => {
    setShowTrailer(!showTrailer);
  };

  // Se não há dados do jogo, mostrar erro
  if (!gameDetails) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" color="error">
          Jogo não encontrado
        </Typography>
        <Button onClick={onBack} sx={{ mt: 2 }}>
          Voltar
        </Button>
      </Box>
    );
  }

  // Imagens para exibir (screenshots ou imagem principal)
  const displayImages = gameDetails.screenshots?.length > 0
    ? gameDetails.screenshots
    : [gameDetails.image];

  const heroImage = gameDetails.screenshots?.[0] || gameDetails.image;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        style={{
          height: '100vh',
          overflow: 'hidden',
          position: 'relative'
        }}
      >
        {/* Hero Section COMPLETA - Layout anterior melhorado */}
        <Box
          sx={{
            position: 'relative',
            height: '100vh',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {/* Botão voltar flutuante */}
          <IconButton
            onClick={onBack}
            sx={{
              position: 'absolute',
              top: 20,
              left: 20,
              zIndex: 10,
              bgcolor: 'rgba(0,0,0,0.8)',
              color: 'white',
              backdropFilter: 'blur(10px)',
              '&:hover': {
                bgcolor: 'rgba(0,0,0,0.9)',
                transform: 'scale(1.1)'
              },
              transition: 'all 0.3s ease'
            }}
          >
            <BackIcon />
          </IconButton>

          {/* Controles de janela flutuantes */}
          {typeof window !== 'undefined' && window.electronAPI && (
            <Box
              sx={{
                position: 'absolute',
                top: 20,
                right: 20,
                zIndex: 10,
                display: 'flex',
                gap: 1,
                bgcolor: 'rgba(0,0,0,0.8)',
                borderRadius: 2,
                p: 0.5,
                backdropFilter: 'blur(10px)'
              }}
            >
              <IconButton
                onClick={() => window.electronAPI.minimizeWindow()}
                size="small"
                sx={{ color: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' } }}
              >
                <MinimizeIcon fontSize="small" />
              </IconButton>
              <IconButton
                onClick={() => window.electronAPI.maximizeWindow()}
                size="small"
                sx={{ color: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' } }}
              >
                <MaximizeIcon fontSize="small" />
              </IconButton>
              <IconButton
                onClick={() => window.electronAPI.closeWindow()}
                size="small"
                sx={{ color: 'white', '&:hover': { bgcolor: 'rgba(244, 67, 54, 0.8)' } }}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>
          )}

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

          {/* Overlay com gradiente */}
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

          {/* Conteúdo principal - Layout original melhorado */}
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
              {/* Imagem do jogo - Menor e mais à esquerda */}
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
                    {showTrailer && gameDetails.youtubeVideoId ? (
                      <YouTubePlayer
                        videoId={gameDetails.youtubeVideoId}
                        height={280}
                        onClose={() => setShowTrailer(false)}
                      />
                    ) : (
                      <CardMedia
                        component="img"
                        image={heroImage}
                        alt={gameDetails.title}
                        sx={{
                          height: { xs: 220, md: 280 },
                          objectFit: 'cover'
                        }}
                      />
                    )}
                  </Card>
                </motion.div>
              </Grid>

              {/* Informações principais e botões - Mais espaço */}
              <Grid item xs={12} md={8} lg={9}>
                <motion.div
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  <Box sx={{ color: 'white' }}>
                    {/* Título principal */}
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

                    {/* Rating, gênero e informações rápidas */}
                    <Stack direction="row" spacing={4} sx={{ mb: 3, alignItems: 'center', flexWrap: 'wrap' }}>
                      {/* Rating */}
                      {gameDetails.rating && gameDetails.rating > 0 && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <StarIcon sx={{ color: 'warning.main', fontSize: 28 }} />
                          <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                            {gameDetails.rating}/10
                          </Typography>
                        </Box>
                      )}

                      {/* Gênero */}
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

                      {/* Informações separadas por pontos */}
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

                    {/* Descrição resumida + Botão Ver Mais */}
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

                        {/* Botão Ver Mais */}
                        <Button
                          variant="text"
                          startIcon={<InfoIcon />}
                          onClick={() => setShowInfoModal(true)}
                          sx={{
                            color: 'rgba(255,255,255,0.8)',
                            fontSize: '0.9rem',
                            textTransform: 'none',
                            '&:hover': {
                              color: 'white',
                              bgcolor: 'rgba(255,255,255,0.1)'
                            }
                          }}
                        >
                          Ver mais informações
                        </Button>
                      </Box>
                    )}

                    {/* Botões de ação principais - Maiores e mais destacados */}
                    <Stack direction="row" spacing={3} sx={{ mb: 4 }}>
                      {/* Botão principal - Jogar/Baixar */}
                      {gameDetails.installed ? (
                        <Button
                          variant="contained"
                          size="large"
                          startIcon={<PlayIcon sx={{ fontSize: 24 }} />}
                          onClick={handlePlay}
                          disabled={isDownloading || isUpdating}
                          sx={{
                            bgcolor: 'success.main',
                            color: 'white',
                            px: 6,
                            py: 2,
                            fontSize: '1.3rem',
                            fontWeight: 'bold',
                            borderRadius: 6,
                            boxShadow: '0 10px 30px rgba(76, 175, 80, 0.4)',
                            minWidth: 200,
                            '&:hover': {
                              bgcolor: 'success.dark',
                              transform: 'translateY(-3px)',
                              boxShadow: '0 15px 35px rgba(76, 175, 80, 0.6)'
                            },
                            transition: 'all 0.3s ease'
                          }}
                        >
                          Jogar Agora
                        </Button>
                      ) : (
                        <Box sx={{ position: 'relative', display: 'inline-block' }}>
                          <Button
                            variant="contained"
                            size="large"
                            startIcon={isDownloading ? <CloudIcon sx={{ fontSize: 24 }} /> : <DownloadIcon sx={{ fontSize: 24 }} />}
                            onClick={handleDownload}
                            disabled={isDownloading || isUpdating}
                            sx={{
                              bgcolor: isDownloading ? 'info.main' : 'primary.main',
                              color: 'white',
                              px: 6,
                              py: 2,
                              fontSize: '1.3rem',
                              fontWeight: 'bold',
                              borderRadius: 6,
                              boxShadow: isDownloading ? '0 10px 30px rgba(33, 150, 243, 0.4)' : '0 10px 30px rgba(25, 118, 210, 0.4)',
                              minWidth: 220,
                              position: 'relative',
                              overflow: 'hidden',
                              '&:hover': {
                                bgcolor: isDownloading ? 'info.dark' : 'primary.dark',
                                transform: !isDownloading ? 'translateY(-3px)' : 'none',
                                boxShadow: isDownloading ? '0 15px 35px rgba(33, 150, 243, 0.6)' : '0 15px 35px rgba(25, 118, 210, 0.6)'
                              },
                              '&:disabled': {
                                bgcolor: 'info.main',
                                color: 'white'
                              },
                              transition: 'all 0.3s ease'
                            }}
                          >
                            {/* Barra de progresso integrada no botão */}
                            {isDownloading && (
                              <Box
                                sx={{
                                  position: 'absolute',
                                  bottom: 0,
                                  left: 0,
                                  height: '6px',
                                  width: `${progressPercent}%`,
                                  bgcolor: 'rgba(255,255,255,0.6)',
                                  transition: 'width 0.3s ease',
                                  borderRadius: '0 0 6px 6px'
                                }}
                              />
                            )}

                            {isDownloading ? `Baixando ${progressPercent}%` : 'Baixar Jogo'}
                          </Button>
                        </Box>
                      )}

                      {/* Botão de trailer */}
                      {gameDetails.youtubeVideoId && (
                        <Button
                          variant="outlined"
                          size="large"
                          startIcon={<YouTubeIcon sx={{ fontSize: 24 }} />}
                          onClick={handleTrailerToggle}
                          sx={{
                            borderColor: 'white',
                            color: 'white',
                            px: 4,
                            py: 2,
                            fontSize: '1.2rem',
                            fontWeight: 'bold',
                            borderRadius: 6,
                            borderWidth: 2,
                            '&:hover': {
                              bgcolor: 'rgba(255,255,255,0.15)',
                              borderColor: 'rgba(255,255,255,0.8)',
                              transform: 'translateY(-3px)'
                            },
                            transition: 'all 0.3s ease'
                          }}
                        >
                          {showTrailer ? 'Fechar Trailer' : 'Ver Trailer'}
                        </Button>
                      )}

                      {/* Botão de atualização */}
                      {hasUpdate && gameDetails.installed && (
                        <Button
                          variant="outlined"
                          size="large"
                          startIcon={isUpdating ? <CloudIcon sx={{ fontSize: 24 }} /> : <UpdateIcon sx={{ fontSize: 24 }} />}
                          onClick={handleUpdate}
                          disabled={isDownloading || isUpdating}
                          sx={{
                            borderColor: 'warning.main',
                            color: 'warning.main',
                            px: 4,
                            py: 2,
                            fontSize: '1.2rem',
                            fontWeight: 'bold',
                            borderRadius: 6,
                            borderWidth: 2,
                            '&:hover': {
                              borderColor: 'warning.dark',
                              bgcolor: 'rgba(255, 152, 0, 0.15)',
                              transform: 'translateY(-3px)'
                            },
                            transition: 'all 0.3s ease'
                          }}
                        >
                          {isUpdating ? `Atualizando ${updateProgressPercent}%` : 'Atualizar'}
                        </Button>
                      )}
                    </Stack>

                    {/* Screenshots em miniatura horizontal na parte inferior */}
                    {displayImages.length > 1 && (
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, opacity: 0.9 }}>
                          Screenshots
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 2, overflowX: 'auto', pb: 1 }}>
                          {displayImages.slice(0, 6).map((image, index) => (
                            <Box
                              key={index}
                              onClick={() => handleScreenshotClick(index)}
                              sx={{
                                minWidth: 140,
                                height: 80,
                                borderRadius: 2,
                                overflow: 'hidden',
                                cursor: 'pointer',
                                border: selectedScreenshot === index ? 3 : 2,
                                borderColor: selectedScreenshot === index ? 'primary.main' : 'rgba(255,255,255,0.3)',
                                opacity: selectedScreenshot === index ? 1 : 0.7,
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                  opacity: 1,
                                  transform: 'scale(1.05)',
                                  borderColor: 'primary.main'
                                }
                              }}
                            >
                              <img
                                src={image}
                                alt={`Screenshot ${index + 1}`}
                                style={{
                                  width: '100%',
                                  height: '100%',
                                  objectFit: 'cover'
                                }}
                              />
                            </Box>
                          ))}
                        </Box>
                      </Box>
                    )}
                  </Box>
                </motion.div>
              </Grid>
            </Grid>
          </Box>
        </Box>

        {/* Modal de Informações Completas - MELHORADO */}
        <Modal
          open={showInfoModal}
          onClose={() => setShowInfoModal(false)}
          closeAfterTransition
          BackdropComponent={Backdrop}
          BackdropProps={{
            timeout: 500,
            sx: { backgroundColor: 'rgba(0,0,0,0.9)' }
          }}
        >
          <Fade in={showInfoModal}>
            <Box
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: { xs: '95%', md: '80%', lg: '70%' },
                maxHeight: '90vh',
                bgcolor: 'rgba(8, 16, 20, 0.98)',
                backdropFilter: 'blur(30px)',
                border: '2px solid rgba(255,255,255,0.15)',
                borderRadius: 5,
                boxShadow: '0 30px 60px rgba(0,0,0,0.8)',
                overflow: 'hidden'
              }}
            >
              {/* Header do modal com imagem de fundo */}
              <Box
                sx={{
                  position: 'relative',
                  height: 200,
                  backgroundImage: `url(${heroImage})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  display: 'flex',
                  alignItems: 'center',
                  px: 4,
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'linear-gradient(135deg, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.6) 100%)'
                  }
                }}
              >
                <Box sx={{ position: 'relative', zIndex: 2, flex: 1 }}>
                  <Typography
                    variant="h3"
                    sx={{
                      color: 'white',
                      fontWeight: 900,
                      textShadow: '3px 3px 6px rgba(0,0,0,0.8)',
                      mb: 1
                    }}
                  >
                    {gameDetails.title}
                  </Typography>

                  {/* Rating e gênero no modal */}
                  <Stack direction="row" spacing={2} alignItems="center">
                    {gameDetails.rating && gameDetails.rating > 0 && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <StarIcon sx={{ color: 'warning.main', fontSize: 20 }} />
                        <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'white' }}>
                          {gameDetails.rating}/10
                        </Typography>
                      </Box>
                    )}

                    {gameDetails.genre && (
                      <Chip
                        label={gameDetails.genre}
                        sx={{
                          bgcolor: 'rgba(255,255,255,0.25)',
                          color: 'white',
                          fontWeight: 600,
                          backdropFilter: 'blur(10px)'
                        }}
                      />
                    )}
                  </Stack>
                </Box>

                {/* Botão fechar estilizado */}
                <IconButton
                  onClick={() => setShowInfoModal(false)}
                  sx={{
                    position: 'relative',
                    zIndex: 2,
                    color: 'white',
                    bgcolor: 'rgba(0,0,0,0.6)',
                    backdropFilter: 'blur(10px)',
                    '&:hover': {
                      bgcolor: 'rgba(244, 67, 54, 0.8)',
                      transform: 'scale(1.1)'
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  <CloseIcon />
                </IconButton>
              </Box>

              {/* Conteúdo principal do modal */}
              <Box sx={{ p: 4, maxHeight: 'calc(90vh - 200px)', overflow: 'auto' }}>
                <Grid container spacing={4}>
                  {/* Lado esquerdo - Descrição e screenshots */}
                  <Grid item xs={12} lg={8}>
                    {/* Descrição completa */}
                    <Box sx={{ mb: 4 }}>
                      <Typography
                        variant="h5"
                        sx={{
                          color: 'white',
                          mb: 3,
                          fontWeight: 'bold',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1
                        }}
                      >
                        <InfoIcon sx={{ color: 'primary.main' }} />
                        Sobre o Jogo
                      </Typography>
                      <Typography
                        variant="body1"
                        sx={{
                          color: 'rgba(255,255,255,0.9)',
                          lineHeight: 1.8,
                          fontSize: '1.1rem',
                          textAlign: 'justify'
                        }}
                      >
                        {gameDetails.description}
                      </Typography>
                    </Box>

                    {/* Screenshots em grid melhorado */}
                    {displayImages.length > 1 && (
                      <Box>
                        <Typography
                          variant="h5"
                          sx={{
                            color: 'white',
                            mb: 3,
                            fontWeight: 'bold',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1
                          }}
                        >
                          <CardMedia sx={{ color: 'primary.main' }} />
                          Galeria de Imagens
                        </Typography>
                        <Grid container spacing={2}>
                          {displayImages.map((image, index) => (
                            <Grid item xs={6} md={4} key={index}>
                              <Card
                                sx={{
                                  borderRadius: 3,
                                  overflow: 'hidden',
                                  cursor: 'pointer',
                                  transition: 'all 0.3s ease',
                                  '&:hover': {
                                    transform: 'scale(1.05)',
                                    boxShadow: '0 15px 30px rgba(0,0,0,0.5)'
                                  }
                                }}
                                onClick={() => handleScreenshotClick(index)}
                              >
                                <CardMedia
                                  component="img"
                                  image={image}
                                  alt={`Screenshot ${index + 1}`}
                                  sx={{
                                    height: 140,
                                    objectFit: 'cover'
                                  }}
                                />
                              </Card>
                            </Grid>
                          ))}
                        </Grid>
                      </Box>
                    )}
                  </Grid>

                  {/* Lado direito - Informações técnicas e ações */}
                  <Grid item xs={12} lg={4}>
                    {/* Ações principais no modal */}
                    <Box sx={{ mb: 4 }}>
                      <Typography
                        variant="h6"
                        sx={{
                          color: 'white',
                          mb: 2,
                          fontWeight: 'bold'
                        }}
                      >
                        Ações
                      </Typography>

                      <Stack spacing={2}>
                        {/* Botão principal no modal - MELHORADO */}
                        {gameDetails.installed ? (
                          <Button
                            variant="contained"
                            size="large"
                            startIcon={<PlayIcon />}
                            onClick={handlePlay}
                            disabled={isDownloading || isUpdating}
                            sx={{
                              bgcolor: 'success.main',
                              color: 'white',
                              py: 1.5,
                              fontSize: '1.1rem',
                              fontWeight: 'bold',
                              borderRadius: 4,
                              boxShadow: '0 8px 25px rgba(76, 175, 80, 0.4)',
                              '&:hover': {
                                bgcolor: 'success.dark',
                                transform: 'translateY(-2px)',
                                boxShadow: '0 12px 30px rgba(76, 175, 80, 0.6)'
                              },
                              transition: 'all 0.3s ease'
                            }}
                          >
                            Jogar Agora
                          </Button>
                        ) : (
                          <Box sx={{ position: 'relative' }}>
                            <Button
                              variant="contained"
                              size="large"
                              startIcon={isDownloading ? <CloudIcon /> : <DownloadIcon />}
                              onClick={handleDownload}
                              disabled={isDownloading || isUpdating}
                              sx={{
                                width: '100%',
                                py: 1.5,
                                fontSize: '1.1rem',
                                fontWeight: 'bold',
                                borderRadius: 4,
                                position: 'relative',
                                overflow: 'hidden',
                                // Cor dinâmica baseada no progresso
                                bgcolor: isDownloading
                                  ? `hsl(${Math.min(progressPercent * 1.2, 120)}, 70%, 50%)` // Verde gradual conforme progresso
                                  : 'primary.main',
                                color: 'white',
                                boxShadow: isDownloading
                                  ? `0 8px 25px hsla(${Math.min(progressPercent * 1.2, 120)}, 70%, 50%, 0.4)`
                                  : '0 8px 25px rgba(25, 118, 210, 0.4)',
                                '&:hover': {
                                  bgcolor: isDownloading
                                    ? `hsl(${Math.min(progressPercent * 1.2, 120)}, 70%, 40%)`
                                    : 'primary.dark',
                                  transform: !isDownloading ? 'translateY(-2px)' : 'none',
                                  boxShadow: isDownloading
                                    ? `0 12px 30px hsla(${Math.min(progressPercent * 1.2, 120)}, 70%, 50%, 0.6)`
                                    : '0 12px 30px rgba(25, 118, 210, 0.6)'
                                },
                                '&:disabled': {
                                  bgcolor: isDownloading
                                    ? `hsl(${Math.min(progressPercent * 1.2, 120)}, 70%, 50%)`
                                    : 'grey.600',
                                  color: 'white'
                                },
                                transition: 'all 0.3s ease'
                              }}
                            >
                              {/* Barra de progresso integrada com gradiente */}
                              {isDownloading && (
                                <>
                                  {/* Fundo da barra */}
                                  <Box
                                    sx={{
                                      position: 'absolute',
                                      bottom: 0,
                                      left: 0,
                                      right: 0,
                                      height: '4px',
                                      bgcolor: 'rgba(0,0,0,0.3)'
                                    }}
                                  />
                                  {/* Barra de progresso com gradiente */}
                                  <Box
                                    sx={{
                                      position: 'absolute',
                                      bottom: 0,
                                      left: 0,
                                      height: '4px',
                                      width: `${progressPercent}%`,
                                      background: `linear-gradient(90deg, 
                                        hsl(0, 70%, 60%), 
                                        hsl(${progressPercent * 1.2}, 70%, 60%), 
                                        hsl(120, 70%, 60%))`,
                                      borderRadius: '0 0 4px 4px',
                                      transition: 'width 0.3s ease'
                                    }}
                                  />
                                  {/* Efeito de brilho na barra */}
                                  <Box
                                    sx={{
                                      position: 'absolute',
                                      bottom: 0,
                                      left: 0,
                                      height: '4px',
                                      width: `${progressPercent}%`,
                                      background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
                                      animation: 'shimmer 2s infinite',
                                      '@keyframes shimmer': {
                                        '0%': { transform: 'translateX(-100%)' },
                                        '100%': { transform: 'translateX(100%)' }
                                      }
                                    }}
                                  />
                                </>
                              )}

                              {isDownloading ? `Baixando ${progressPercent}%` : 'Baixar Jogo'}
                            </Button>
                          </Box>
                        )}

                        {/* Outros botões */}
                        {gameDetails.youtubeVideoId && (
                          <Button
                            variant="outlined"
                            startIcon={<YouTubeIcon />}
                            onClick={handleTrailerToggle}
                            sx={{
                              borderColor: 'rgba(255,255,255,0.3)',
                              color: 'white',
                              py: 1.5,
                              borderRadius: 4,
                              '&:hover': {
                                borderColor: 'white',
                                bgcolor: 'rgba(255,255,255,0.1)'
                              }
                            }}
                          >
                            Ver Trailer
                          </Button>
                        )}

                        {hasUpdate && gameDetails.installed && (
                          <Button
                            variant="outlined"
                            startIcon={<UpdateIcon />}
                            onClick={handleUpdate}
                            sx={{
                              borderColor: 'warning.main',
                              color: 'warning.main',
                              py: 1.5,
                              borderRadius: 4,
                              '&:hover': {
                                bgcolor: 'rgba(255, 152, 0, 0.1)'
                              }
                            }}
                          >
                            Atualizar
                          </Button>
                        )}
                      </Stack>
                    </Box>

                    {/* Informações técnicas estilizadas */}
                    <Card
                      sx={{
                        bgcolor: 'rgba(255,255,255,0.05)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: 3,
                        p: 3
                      }}
                    >
                      <Typography
                        variant="h6"
                        sx={{
                          color: 'white',
                          mb: 2,
                          fontWeight: 'bold'
                        }}
                      >
                        Especificações
                      </Typography>

                      <Stack spacing={2.5}>
                        {gameDetails.developer && (
                          <Box>
                            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', mb: 0.5 }}>
                              DESENVOLVEDOR
                            </Typography>
                            <Typography variant="body1" sx={{ color: 'white', fontWeight: 600 }}>
                              {gameDetails.developer}
                            </Typography>
                          </Box>
                        )}

                        {gameDetails.publisher && gameDetails.publisher !== gameDetails.developer && (
                          <Box>
                            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', mb: 0.5 }}>
                              EDITORA
                            </Typography>
                            <Typography variant="body1" sx={{ color: 'white', fontWeight: 600 }}>
                              {gameDetails.publisher}
                            </Typography>
                          </Box>
                        )}

                        {gameDetails.releaseDate && (
                          <Box>
                            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', mb: 0.5 }}>
                              LANÇAMENTO
                            </Typography>
                            <Typography variant="body1" sx={{ color: 'white', fontWeight: 600 }}>
                              {gameDetails.releaseDate}
                            </Typography>
                          </Box>
                        )}

                        <Box>
                          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', mb: 0.5 }}>
                            TAMANHO
                          </Typography>
                          <Typography variant="body1" sx={{ color: 'white', fontWeight: 600 }}>
                            {gameDetails.size || gameDetails.downloadSize || 'N/A'}
                          </Typography>
                        </Box>

                        {gameDetails.website && (
                          <Button
                            variant="outlined"
                            href={gameDetails.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            startIcon={<WebIcon />}
                            size="small"
                            sx={{
                              borderColor: 'primary.main',
                              color: 'primary.main',
                              borderRadius: 3,
                              mt: 1,
                              '&:hover': {
                                bgcolor: 'rgba(33, 150, 243, 0.1)'
                              }
                            }}
                          >
                            Site Oficial
                          </Button>
                        )}
                      </Stack>
                    </Card>

                    {/* Tags melhoradas */}
                    {gameDetails.tags && gameDetails.tags.length > 0 && (
                      <Box sx={{ mt: 3 }}>
                        <Typography
                          variant="h6"
                          sx={{
                            color: 'white',
                            mb: 2,
                            fontWeight: 'bold'
                          }}
                        >
                          Tags
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                          {gameDetails.tags.map((tag, index) => (
                            <Chip
                              key={index}
                              label={tag}
                              size="small"
                              sx={{
                                bgcolor: 'rgba(33, 150, 243, 0.2)',
                                color: 'primary.light',
                                border: '1px solid rgba(33, 150, 243, 0.3)',
                                fontSize: '0.8rem',
                                fontWeight: 500,
                                '&:hover': {
                                  bgcolor: 'rgba(33, 150, 243, 0.3)'
                                }
                              }}
                            />
                          ))}
                        </Box>
                      </Box>
                    )}
                  </Grid>
                </Grid>
              </Box>
            </Box>
          </Fade>
        </Modal>
      </motion.div>
    </AnimatePresence>
  );
};

export default GameDetails;