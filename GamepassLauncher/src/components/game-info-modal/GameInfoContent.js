import React, { useMemo } from 'react';
import {
  Box,
  Typography,
  Grid,
  Chip,
  Stack,
  Paper,
  ImageList,
  ImageListItem,
  useTheme
} from '@mui/material';
import {
  Storage as StorageIcon,
  Memory as MemoryIcon,
  DeviceHub as ProcessorIcon,
  SportsEsports as GamepadIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';

import { useDownloads } from '../../hooks/useDownloads';
import GameDetailsActions from '../game-details/GameDetailsActions';

const GameInfoContent = ({ game, activeTab, currentColors, onShowTrailer, isContentFocused = false }) => {
  const theme = useTheme();
  const { activeDownloads } = useDownloads();

  // Memoizar dados do download para evitar re-renders desnecessários
  const downloadData = useMemo(() => {
    return activeDownloads.get(game?.id);
  }, [activeDownloads, game?.id]);

  const isDownloading = useMemo(() => {
    return downloadData !== undefined;
  }, [downloadData]);

  // Manipular ações
  const handleGameAction = (action) => {
    switch (action) {
      case 'play':
        launchGame(game.id);
        break;
      case 'download':
        downloadGame(game.id);
        break;
      case 'trailer':
        if (onShowTrailer) onShowTrailer();
        break;
      case 'website':
        if (game?.website) window.open(game.website, '_blank');
        break;
    }
  };

  // Componente Overview
  const OverviewTab = useMemo(() => (
    <motion.div
      key="overview-tab"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Box sx={{ p: { xs: 2, md: 3 } }}>
        <Grid container spacing={3}>
          {/* Descrição principal */}
          <Grid item xs={12} md={8}>
            <Typography
              variant="h5"
              sx={{
                color: 'white',
                fontWeight: 'bold',
                mb: 2,
                borderLeft: '4px solid',
                borderColor: currentColors.primary,
                pl: 2
              }}
            >
              Sobre o Jogo
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: 'rgba(255,255,255,0.9)',
                lineHeight: 1.7,
                fontSize: '1rem',
                textAlign: 'justify',
                mb: 3
              }}
            >
              {game.description || game.shortDescription || 'Descrição não disponível.'}
            </Typography>

            {/* Tags */}
            {game.tags && game.tags.length > 0 && (
              <Box>
                <Typography
                  variant="h6"
                  sx={{ color: 'white', fontWeight: 'bold', mb: 2 }}
                >
                  Tags
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                  {game.tags.map((tag, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Chip
                        label={tag}
                        size="small"
                        sx={{
                          bgcolor: `${currentColors.primary}20`,
                          color: currentColors.accent,
                          border: `1px solid ${currentColors.primary}30`,
                          '&:hover': {
                            bgcolor: `${currentColors.primary}30`,
                            transform: 'scale(1.05)'
                          },
                          transition: 'all 0.2s ease'
                        }}
                      />
                    </motion.div>
                  ))}
                </Stack>
              </Box>
            )}
          </Grid>

          {/* Informações laterais */}
          <Grid item xs={12} md={4}>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Paper
                sx={{
                  bgcolor: 'rgba(255,255,255,0.05)',
                  backdropFilter: 'blur(10px)',
                  border: `1px solid ${currentColors.primary}20`,
                  borderRadius: 2,
                  p: 3
                }}
              >
                <Typography
                  variant="h6"
                  sx={{ color: currentColors.accent, fontWeight: 'bold', mb: 2 }}
                >
                  Informações
                </Typography>

                <Stack spacing={2.5}>
                  {[
                    { label: 'Desenvolvedor', value: game.developer },
                    { label: 'Editora', value: game.publisher },
                    { label: 'Data de Lançamento', value: game.releaseDate },
                    { label: 'Tamanho', value: game.size || 'N/A' }
                  ].filter(item => item.value).map((item, index) => (
                    <Box key={index}>
                      <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', mb: 0.5 }}>
                        {item.label.toUpperCase()}
                      </Typography>
                      <Typography variant="body1" sx={{ color: 'white', fontWeight: 600 }}>
                        {item.value}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              </Paper>
            </motion.div>
          </Grid>
        </Grid>
      </Box>
    </motion.div>
  ), [game, currentColors]);

  // Componente Galeria
  const GalleryTab = useMemo(() => (
    <motion.div
      key="gallery-tab"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Box sx={{ p: { xs: 2, md: 3 } }}>
        <Typography
          variant="h5"
          sx={{
            color: 'white',
            fontWeight: 'bold',
            mb: 3,
            borderLeft: '4px solid',
            borderColor: currentColors.primary,
            pl: 2
          }}
        >
          Galeria de Imagens
        </Typography>

        {game.screenshots && game.screenshots.length > 0 ? (
          <ImageList cols={3} gap={16} sx={{ maxHeight: 400, overflow: 'auto' }}>
            {game.screenshots.map((screenshot, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                <ImageListItem>
                  <img
                    src={screenshot}
                    alt={`Screenshot ${index + 1}`}
                    loading="lazy"
                    style={{
                      borderRadius: 8,
                      transition: 'transform 0.3s ease',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'scale(1.05)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'scale(1)';
                    }}
                  />
                </ImageListItem>
              </motion.div>
            ))}
          </ImageList>
        ) : (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: 200,
              bgcolor: 'rgba(255,255,255,0.05)',
              borderRadius: 2,
              border: '2px dashed rgba(255,255,255,0.2)'
            }}
          >
            <Typography sx={{ color: 'rgba(255,255,255,0.6)' }}>
              Nenhuma imagem disponível
            </Typography>
          </Box>
        )}
      </Box>
    </motion.div>
  ), [game, currentColors]);

  // Componente Especificações
  const SpecsTab = useMemo(() => (
    <motion.div
      key="specs-tab"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Box sx={{ p: { xs: 2, md: 3 } }}>
        <Typography
          variant="h5"
          sx={{
            color: 'white',
            fontWeight: 'bold',
            mb: 3,
            borderLeft: '4px solid',
            borderColor: currentColors.primary,
            pl: 2
          }}
        >
          Especificações do Sistema
        </Typography>

        <Grid container spacing={3}>
          {/* Requisitos mínimos */}
          <Grid item xs={12} md={6}>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Paper
                sx={{
                  bgcolor: 'rgba(255,255,255,0.05)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(76,175,80,0.3)',
                  borderRadius: 2,
                  p: 3,
                  height: '100%'
                }}
              >
                <Typography
                  variant="h6"
                  sx={{ color: 'success.main', fontWeight: 'bold', mb: 2 }}
                >
                  Requisitos Mínimos
                </Typography>

                <Stack spacing={2}>
                  {[
                    { icon: ProcessorIcon, label: 'Processador', value: 'Intel Core i3 / AMD Ryzen 3' },
                    { icon: MemoryIcon, label: 'Memória RAM', value: '8 GB RAM' },
                    { icon: StorageIcon, label: 'Armazenamento', value: game.size || '50 GB' }
                  ].map((spec, index) => (
                    <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <spec.icon sx={{ color: currentColors.primary }} />
                      <Box>
                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                          {spec.label}
                        </Typography>
                        <Typography variant="body1" sx={{ color: 'white' }}>
                          {spec.value}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Stack>
              </Paper>
            </motion.div>
          </Grid>

          {/* Requisitos recomendados */}
          <Grid item xs={12} md={6}>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Paper
                sx={{
                  bgcolor: 'rgba(255,255,255,0.05)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,152,0,0.3)',
                  borderRadius: 2,
                  p: 3,
                  height: '100%'
                }}
              >
                <Typography
                  variant="h6"
                  sx={{ color: 'warning.main', fontWeight: 'bold', mb: 2 }}
                >
                  Requisitos Recomendados
                </Typography>

                <Stack spacing={2}>
                  {[
                    { icon: ProcessorIcon, label: 'Processador', value: 'Intel Core i5 / AMD Ryzen 5' },
                    { icon: MemoryIcon, label: 'Memória RAM', value: '16 GB RAM' },
                    { icon: GamepadIcon, label: 'Controle', value: 'Xbox Controller (Recomendado)' }
                  ].map((spec, index) => (
                    <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <spec.icon sx={{ color: currentColors.accent }} />
                      <Box>
                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                          {spec.label}
                        </Typography>
                        <Typography variant="body1" sx={{ color: 'white' }}>
                          {spec.value}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Stack>
              </Paper>
            </motion.div>
          </Grid>
        </Grid>
      </Box>
    </motion.div>
  ), [game, currentColors]);

  // Componente Ações - Memoizado para evitar re-renders
  const ActionsTab = useMemo(() => (
    <motion.div
      key="actions-tab" // Key estável para evitar re-mount
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Box sx={{ p: { xs: 2, md: 3 } }}>
        <Typography
          variant="h5"
          sx={{
            color: 'white',
            fontWeight: 'bold',
            mb: 3,
            borderLeft: '4px solid',
            borderColor: currentColors.primary,
            pl: 2
          }}
        >
          Ações do Jogo
        </Typography>

        {/* Usando o componente GameDetailsActions existente */}
        <Box sx={{
          '& > div': {
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: 'stretch',
            gap: 2
          },
          '& button': {
            minHeight: 56,
            fontSize: '1rem'
          }
        }}>
          <GameDetailsActions
            game={game}
            onShowTrailer={onShowTrailer}
            // Passar informação de foco para navegação interna
            getButtonProps={isContentFocused ? (index) => ({
              'data-focused': index === 0, // Primeiro botão recebe foco quando conteúdo está focado
              tabIndex: index === 0 ? 0 : -1,
              sx: {
                border: index === 0 ? '2px solid rgba(255,255,255,0.8)' : '2px solid transparent',
                transform: index === 0 ? 'scale(1.05)' : 'scale(1)',
                transition: 'all 0.3s ease'
              }
            }) : undefined}
          />
        </Box>

        {/* Informações adicionais sobre ações */}
        <Grid container spacing={3} sx={{ mt: 2 }}>
          <Grid item xs={12} md={6}>
            <Paper
              sx={{
                bgcolor: 'rgba(255,255,255,0.05)',
                backdropFilter: 'blur(10px)',
                border: `1px solid ${currentColors.primary}20`,
                borderRadius: 2,
                p: 3
              }}
            >
              <Typography
                variant="h6"
                sx={{ color: currentColors.accent, fontWeight: 'bold', mb: 2 }}
              >
                Status do Jogo
              </Typography>

              <Stack spacing={2}>
                <Box>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', mb: 0.5 }}>
                    INSTALAÇÃO
                  </Typography>
                  <Typography variant="body1" sx={{ color: 'white', fontWeight: 600 }}>
                    {game.installed ? 'Instalado' : 'Não instalado'}
                  </Typography>
                </Box>

                {isDownloading && (
                  <Box>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', mb: 0.5 }}>
                      PROGRESSO
                    </Typography>
                    <Typography variant="body1" sx={{ color: currentColors.primary, fontWeight: 600 }}>
                      {Math.round(downloadData?.progress || 0)}% - {downloadData?.speed || '0 MB/s'}
                    </Typography>
                  </Box>
                )}

                <Box>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', mb: 0.5 }}>
                    PLATAFORMA
                  </Typography>
                  <Typography variant="body1" sx={{ color: 'white', fontWeight: 600 }}>
                    {game.platform || 'PC'}
                  </Typography>
                </Box>
              </Stack>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper
              sx={{
                bgcolor: 'rgba(255,255,255,0.05)',
                backdropFilter: 'blur(10px)',
                border: `1px solid ${currentColors.primary}20`,
                borderRadius: 2,
                p: 3
              }}
            >
              <Typography
                variant="h6"
                sx={{ color: currentColors.accent, fontWeight: 'bold', mb: 2 }}
              >
                Recursos Disponíveis
              </Typography>

              <Stack spacing={2}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      bgcolor: game.youtubeVideoId ? 'success.main' : 'error.main'
                    }}
                  />
                  <Typography variant="body2" sx={{ color: 'white' }}>
                    Trailer {game.youtubeVideoId ? 'Disponível' : 'Indisponível'}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      bgcolor: game.screenshots?.length ? 'success.main' : 'error.main'
                    }}
                  />
                  <Typography variant="body2" sx={{ color: 'white' }}>
                    Screenshots ({game.screenshots?.length || 0})
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      bgcolor: game.website ? 'success.main' : 'error.main'
                    }}
                  />
                  <Typography variant="body2" sx={{ color: 'white' }}>
                    Site Oficial {game.website ? 'Disponível' : 'Indisponível'}
                  </Typography>
                </Box>
              </Stack>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </motion.div>
  ), [game, currentColors, onShowTrailer, isDownloading, downloadData, isContentFocused]); // Dependências específicas

  // Renderizar conteúdo baseado na tab ativa - sem AnimatePresence
  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return OverviewTab;
      case 'gallery':
        return GalleryTab;
      case 'specs':
        return SpecsTab;
      case 'actions':
        return ActionsTab;
      default:
        return OverviewTab;
    }
  };

  return (
    <Box
      sx={{
        maxHeight: 'calc(90vh - 400px)',
        overflow: 'auto',
        '&::-webkit-scrollbar': { width: 8 },
        '&::-webkit-scrollbar-track': { bgcolor: 'rgba(255,255,255,0.1)' },
        '&::-webkit-scrollbar-thumb': {
          bgcolor: `${currentColors.primary}60`,
          borderRadius: 4,
          '&:hover': { bgcolor: `${currentColors.primary}80` }
        }
      }}
    >
      {/* Remover AnimatePresence para evitar piscar */}
      {renderTabContent()}
    </Box>
  );
};

export default GameInfoContent;