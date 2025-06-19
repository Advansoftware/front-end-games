import React from 'react';
import {
  Modal,
  Backdrop,
  Fade,
  Box,
  Typography,
  IconButton,
  Chip,
  Stack,
  Grid,
  Card,
  CardMedia
} from '@mui/material';
import {
  Close as CloseIcon,
  Star as StarIcon,
  InfoOutlined as InfoIcon,
  Language as WebIcon
} from '@mui/icons-material';

import CustomButton from '../CustomButton';
import GameDetailsActions from './GameDetailsActions';

const GameDetailsInfo = ({ game, open, onClose, onShowTrailer }) => {
  if (!game) return null;

  const heroImage = game.screenshots?.[0] || game.image;
  const displayImages = game.screenshots?.length > 0 ? game.screenshots : [game.image];

  return (
    <Modal
      open={open}
      onClose={onClose}
      closeAfterTransition
      BackdropComponent={Backdrop}
      BackdropProps={{
        timeout: 500,
        sx: {
          backgroundColor: 'rgba(0,0,0,0.9)',
          zIndex: 15000
        }
      }}
      sx={{ zIndex: 15000 }}
    >
      <Fade in={open}>
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
          {/* Header do modal */}
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
                {game.title}
              </Typography>

              <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
                {game.rating && game.rating > 0 && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <StarIcon sx={{ color: 'warning.main', fontSize: 18 }} />
                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'white' }}>
                      {game.rating}/10
                    </Typography>
                  </Box>
                )}

                {game.genre && (
                  <Chip
                    label={game.genre}
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

            <IconButton
              onClick={onClose}
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

          {/* Conteúdo principal */}
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
                    {game.description}
                  </Typography>
                </Box>

                {/* Screenshots em grid */}
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
                {/* Ações principais */}
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

                  <Box sx={{ '& > div': { flexDirection: 'column', alignItems: 'stretch' } }}>
                    <GameDetailsActions
                      game={game}
                      onShowTrailer={onShowTrailer}
                    />
                  </Box>
                </Box>

                {/* Informações técnicas */}
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
                    {game.developer && (
                      <Box>
                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', mb: 0.5 }}>
                          DESENVOLVEDOR
                        </Typography>
                        <Typography variant="body1" sx={{ color: 'white', fontWeight: 600 }}>
                          {game.developer}
                        </Typography>
                      </Box>
                    )}

                    {game.publisher && game.publisher !== game.developer && (
                      <Box>
                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', mb: 0.5 }}>
                          EDITORA
                        </Typography>
                        <Typography variant="body1" sx={{ color: 'white', fontWeight: 600 }}>
                          {game.publisher}
                        </Typography>
                      </Box>
                    )}

                    {game.releaseDate && (
                      <Box>
                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', mb: 0.5 }}>
                          LANÇAMENTO
                        </Typography>
                        <Typography variant="body1" sx={{ color: 'white', fontWeight: 600 }}>
                          {game.releaseDate}
                        </Typography>
                      </Box>
                    )}

                    <Box>
                      <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', mb: 0.5 }}>
                        TAMANHO
                      </Typography>
                      <Typography variant="body1" sx={{ color: 'white', fontWeight: 600 }}>
                        {game.size || game.downloadSize || 'N/A'}
                      </Typography>
                    </Box>

                    {game.website && (
                      <CustomButton
                        variant="outlined"
                        href={game.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        startIcon={<WebIcon />}
                        size="small"
                        sx={{ mt: 1 }}
                      >
                        Site Oficial
                      </CustomButton>
                    )}
                  </Stack>
                </Card>

                {/* Tags */}
                {game.tags && game.tags.length > 0 && (
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
                      {game.tags.map((tag, index) => (
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
  );
};

export default GameDetailsInfo;