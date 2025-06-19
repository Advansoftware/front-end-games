import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  IconButton,
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
import { useDownloads } from '../hooks/useDownloads';
import CacheService from '../services/CacheService';
import YouTubePlayer from './YouTubePlayer';
import CustomButton from './CustomButton';

const GameDetails = ({ gameId, onBack }) => {
  const {
    getGameById,
    downloadGame,
    updateGame,
    launchGame,
    updateProgress
  } = useGames();

  const { activeDownloads } = useDownloads();

  const [gameDetails, setGameDetails] = useState(null);
  const [selectedScreenshot, setSelectedScreenshot] = useState(0);
  const [showTrailer, setShowTrailer] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);

  const game = getGameById(gameId);

  // Usar dados do hook useDownloads
  const downloadData = activeDownloads.get(gameId);
  const updatePercent = updateProgress[gameId];
  const isDownloading = downloadData !== undefined;
  const isUpdating = updatePercent !== undefined;

  // Garantir que o progresso seja sempre um número inteiro
  const progressPercent = isDownloading ? Math.round(downloadData.progress || 0) : 0;
  const updateProgressPercent = isUpdating ? Math.round(updatePercent) : 0;

  // Determinar status real baseado na fase
  const isInstalling = downloadData?.status === 'installing';

  // Simular atualizações disponíveis para alguns jogos - MANTÉM durante o processo de atualização
  const hasUpdate = gameDetails && [1, 3].includes(gameId) && gameDetails.installed && !isDownloading;

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

  // Efeito para garantir fullscreen no Electron
  useEffect(() => {
    if (typeof window !== 'undefined' && window.electronAPI) {
      // Garantir que a janela esteja maximizada/fullscreen
      window.electronAPI.setFullscreen && window.electronAPI.setFullscreen(true);

      // Esconder a barra de título do Electron se disponível
      window.electronAPI.setTitleBarVisible && window.electronAPI.setTitleBarVisible(false);

      // Prevenir scroll na página principal
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';

      // Limpar ao sair do componente
      return () => {
        window.electronAPI.setFullscreen && window.electronAPI.setFullscreen(false);
        window.electronAPI.setTitleBarVisible && window.electronAPI.setTitleBarVisible(true);
        document.body.style.overflow = 'auto';
        document.documentElement.style.overflow = 'auto';
      };
    }
  }, []);

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
        <CustomButton onClick={onBack} sx={{ mt: 2 }}>
          Voltar
        </CustomButton>
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
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: '100vw',
          height: '100vh',
          margin: 0,
          padding: 0,
          overflow: 'hidden',
          zIndex: 10000,
          backgroundColor: '#000',
          // Garantir que seja realmente fullscreen
          maxWidth: '100vw',
          maxHeight: '100vh',
          minWidth: '100vw',
          minHeight: '100vh'
        }}
      >
        {/* Hero Section COMPLETA - Layout anterior melhorado */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: '100vw',
            height: '100vh',
            margin: 0,
            padding: 0,
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            // Garantir que não há scroll nem espaçamento
            boxSizing: 'border-box'
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

                        {/* Botão Ver Mais - MENOR */}
                        <CustomButton
                          variant="outlined"
                          size="small"
                          startIcon={<InfoIcon />}
                          onClick={() => setShowInfoModal(true)}
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
                            }
                          }}
                        >
                          Ver mais informações
                        </CustomButton>
                      </Box>
                    )}

                    {/* Botões de ação principais - LÓGICA CORRIGIDA */}
                    <Stack direction="row" spacing={2} sx={{ mb: 4 }}>
                      {/* LÓGICA CORRETA: Apenas um botão principal por vez */}

                      {/* Se está baixando/instalando/atualizando - APENAS o botão de progresso */}
                      {(isDownloading || isUpdating) ? (
                        <CustomButton
                          variant={isUpdating ? "warning" : "info"}
                          size="medium"
                          startIcon={<CloudIcon />}
                          disabled={true}
                          downloadProgress={isDownloading ? progressPercent : updateProgressPercent}
                          sx={{
                            px: 4,
                            py: 1.5,
                            fontSize: '1.1rem',
                            fontWeight: 'bold',
                            minWidth: 180
                          }}
                        >
                          {isDownloading ? (isInstalling ? 'Instalando' : 'Baixando') : 'Atualizando'}
                        </CustomButton>
                      ) : (
                        /* Se NÃO está baixando/atualizando */
                        <>
                          {/* Se está instalado E não tem atualização - JOGAR AGORA */}
                          {gameDetails.installed && !hasUpdate ? (
                            <CustomButton
                              variant="success"
                              size="medium"
                              startIcon={<PlayIcon />}
                              onClick={handlePlay}
                              sx={{
                                px: 4,
                                py: 1.5,
                                fontSize: '1.1rem',
                                fontWeight: 'bold',
                                minWidth: 160
                              }}
                            >
                              Jogar Agora
                            </CustomButton>
                          ) : null}

                          {/* Se tem atualização disponível - ATUALIZAR */}
                          {hasUpdate ? (
                            <CustomButton
                              variant="warning"
                              size="medium"
                              startIcon={<UpdateIcon />}
                              onClick={handleUpdate}
                              sx={{
                                px: 3,
                                py: 1.5,
                                fontSize: '1rem',
                                fontWeight: 'bold'
                              }}
                            >
                              Atualizar
                            </CustomButton>
                          ) : null}

                          {/* Se NÃO está instalado - BAIXAR */}
                          {!gameDetails.installed ? (
                            <CustomButton
                              variant="primary"
                              size="medium"
                              startIcon={<DownloadIcon />}
                              onClick={handleDownload}
                              sx={{
                                px: 4,
                                py: 1.5,
                                fontSize: '1.1rem',
                                fontWeight: 'bold',
                                minWidth: 180
                              }}
                            >
                              Baixar Jogo
                            </CustomButton>
                          ) : null}
                        </>
                      )}

                      {/* Botão de trailer - sempre disponível */}
                      {gameDetails.youtubeVideoId && (
                        <CustomButton
                          variant="outlined"
                          size="medium"
                          startIcon={<YouTubeIcon />}
                          onClick={handleTrailerToggle}
                          sx={{
                            px: 3,
                            py: 1.5,
                            fontSize: '1rem',
                            fontWeight: 'bold'
                          }}
                        >
                          {showTrailer ? 'Fechar Trailer' : 'Ver Trailer'}
                        </CustomButton>
                      )}
                    </Stack>
                  </Box>
                </motion.div>
              </Grid>
            </Grid>
          </Box>
        </Box>

        {/* Modal de Informações Completas - CORRIGIDO */}
        <Modal
          open={showInfoModal}
          onClose={() => setShowInfoModal(false)}
          closeAfterTransition
          BackdropComponent={Backdrop}
          BackdropProps={{
            timeout: 500,
            sx: {
              backgroundColor: 'rgba(0,0,0,0.9)',
              zIndex: 15000 // Z-index maior que o GameDetails
            }
          }}
          sx={{
            zIndex: 15000 // Garantir que o modal fique por cima
          }}
        >
          <Fade in={showInfoModal}>
            <Box
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: { xs: '95%', md: '85%', lg: '75%' },
                maxHeight: '90vh',
                bgcolor: 'rgba(8, 16, 20, 0.98)',
                backdropFilter: 'blur(30px)',
                border: '2px solid rgba(255,255,255,0.15)',
                borderRadius: 3,
                boxShadow: '0 30px 60px rgba(0,0,0,0.8)',
                overflow: 'hidden',
                zIndex: 15001
              }}
            >
              {/* Header do modal com imagem de fundo */}
              <Box
                sx={{
                  position: 'relative',
                  height: 180,
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
                      mb: 1,
                      fontSize: { xs: '1.8rem', md: '2.5rem' }
                    }}
                  >
                    {gameDetails.title}
                  </Typography>

                  {/* Rating e gênero no modal */}
                  <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
                    {gameDetails.rating && gameDetails.rating > 0 && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <StarIcon sx={{ color: 'warning.main', fontSize: 18 }} />
                        <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'white' }}>
                          {gameDetails.rating}/10
                        </Typography>
                      </Box>
                    )}

                    {gameDetails.genre && (
                      <Chip
                        label={gameDetails.genre}
                        size="small"
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
              <Box sx={{ p: 4, maxHeight: 'calc(90vh - 180px)', overflow: 'auto' }}>
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

                    {/* Screenshots em grid melhorado - APENAS NO MODAL */}
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
                                  borderRadius: 2,
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
                                    height: 120,
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
                        {/* LÓGICA CORRIGIDA NO MODAL: Botão único que se transforma */}

                        {/* Se está baixando/instalando/atualizando - Botão de progresso */}
                        {(isDownloading || isUpdating) ? (
                          <CustomButton
                            variant={isUpdating ? "warning" : "info"}
                            size="medium"
                            startIcon={<CloudIcon />}
                            disabled={true}
                            downloadProgress={isDownloading ? progressPercent : updateProgressPercent}
                            sx={{
                              width: '100%',
                              py: 1.5,
                              fontSize: '1rem',
                              fontWeight: 'bold'
                            }}
                          >
                            {isDownloading ? (isInstalling ? 'Instalando' : 'Baixando') : 'Atualizando'}
                          </CustomButton>
                        ) : (
                          /* Se NÃO está processando */
                          <>
                            {/* Se está instalado - JOGAR AGORA ou ATUALIZAR (mesmo botão) */}
                            {gameDetails.installed ? (
                              <CustomButton
                                variant={hasUpdate ? "warning" : "success"}
                                size="medium"
                                startIcon={hasUpdate ? <UpdateIcon /> : <PlayIcon />}
                                onClick={hasUpdate ? handleUpdate : handlePlay}
                                sx={{
                                  py: 1.5,
                                  fontSize: '1rem',
                                  fontWeight: 'bold'
                                }}
                              >
                                {hasUpdate ? 'Atualizar' : 'Jogar Agora'}
                              </CustomButton>
                            ) : (
                              /* Se NÃO está instalado - BAIXAR */
                              <CustomButton
                                variant="primary"
                                size="medium"
                                startIcon={<DownloadIcon />}
                                onClick={handleDownload}
                                sx={{
                                  width: '100%',
                                  py: 1.5,
                                  fontSize: '1rem',
                                  fontWeight: 'bold'
                                }}
                              >
                                Baixar Jogo
                              </CustomButton>
                            )}
                          </>
                        )}

                        {/* Outros botões - sempre disponíveis quando não está processando */}
                        {gameDetails.youtubeVideoId && (
                          <CustomButton
                            variant="outlined"
                            size="medium"
                            startIcon={<YouTubeIcon />}
                            onClick={handleTrailerToggle}
                            sx={{
                              py: 1.2
                            }}
                          >
                            Ver Trailer
                          </CustomButton>
                        )}
                      </Stack>
                    </Box>

                    {/* Informações técnicas estilizadas */}
                    <Card
                      sx={{
                        bgcolor: 'rgba(255,255,255,0.05)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: 2,
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
                          <CustomButton
                            variant="outlined"
                            href={gameDetails.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            startIcon={<WebIcon />}
                            size="small"
                            sx={{
                              mt: 1
                            }}
                          >
                            Site Oficial
                          </CustomButton>
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