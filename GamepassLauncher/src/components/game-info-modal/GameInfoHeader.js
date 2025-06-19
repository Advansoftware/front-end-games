import React from 'react';
import {
  Box,
  Typography,
  Chip,
  Stack
} from '@mui/material';
import {
  Star as StarIcon,
  CalendarToday as CalendarIcon,
  VideogameAsset as GameIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';

const GameInfoHeader = ({ game, currentColors }) => {
  const heroImage = game.screenshots?.[0] || game.image;

  return (
    <Box
      sx={{
        position: 'relative',
        height: { xs: 250, md: 300 },
        backgroundImage: `url(${heroImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        display: 'flex',
        alignItems: 'flex-end',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(180deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.9) 100%)'
        }
      }}
    >
      <Box
        sx={{
          position: 'relative',
          zIndex: 1,
          p: { xs: 3, md: 4 },
          width: '100%'
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Typography
            variant="h3"
            sx={{
              color: 'white',
              fontWeight: 900,
              textShadow: '3px 3px 6px rgba(0,0,0,0.8)',
              mb: 2,
              fontSize: { xs: '2rem', md: '2.5rem', lg: '3rem' },
              lineHeight: 1.2
            }}
          >
            {game.title}
          </Typography>

          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            alignItems={{ xs: 'flex-start', sm: 'center' }}
            flexWrap="wrap"
            gap={1}
          >
            {/* Rating */}
            {game.rating && game.rating > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    bgcolor: 'rgba(255,193,7,0.2)',
                    backdropFilter: 'blur(10px)',
                    px: 2,
                    py: 1,
                    borderRadius: 2,
                    border: '1px solid rgba(255,193,7,0.3)'
                  }}
                >
                  <StarIcon sx={{ color: 'warning.main', fontSize: 20 }} />
                  <Typography
                    variant="body1"
                    sx={{ fontWeight: 'bold', color: 'white', fontSize: '1rem' }}
                  >
                    {game.rating}/10
                  </Typography>
                </Box>
              </motion.div>
            )}

            {/* Gênero */}
            {game.genre && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
              >
                <Chip
                  icon={<GameIcon />}
                  label={game.genre}
                  sx={{
                    bgcolor: `${currentColors.primary}40`,
                    color: 'white',
                    fontWeight: 600,
                    backdropFilter: 'blur(10px)',
                    border: `1px solid ${currentColors.primary}60`,
                    '& .MuiChip-icon': { color: currentColors.accent }
                  }}
                />
              </motion.div>
            )}

            {/* Data de lançamento */}
            {game.releaseDate && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    bgcolor: 'rgba(76,175,80,0.2)',
                    backdropFilter: 'blur(10px)',
                    px: 2,
                    py: 1,
                    borderRadius: 2,
                    border: '1px solid rgba(76,175,80,0.3)'
                  }}
                >
                  <CalendarIcon sx={{ color: 'success.main', fontSize: 18 }} />
                  <Typography variant="body2" sx={{ color: 'white', fontWeight: 500 }}>
                    {new Date(game.releaseDate).getFullYear()}
                  </Typography>
                </Box>
              </motion.div>
            )}

            {/* Tamanho */}
            {game.size && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
              >
                <Chip
                  label={game.size}
                  size="small"
                  sx={{
                    bgcolor: 'rgba(156,39,176,0.3)',
                    color: 'white',
                    fontWeight: 600,
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(156,39,176,0.4)'
                  }}
                />
              </motion.div>
            )}
          </Stack>

          {/* Descrição breve */}
          {game.shortDescription && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Typography
                variant="body1"
                sx={{
                  color: 'rgba(255,255,255,0.9)',
                  mt: 2,
                  fontSize: '1rem',
                  lineHeight: 1.5,
                  textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
                  maxWidth: '80%',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }}
              >
                {game.shortDescription}
              </Typography>
            </motion.div>
          )}
        </motion.div>
      </Box>
    </Box>
  );
};

export default GameInfoHeader;