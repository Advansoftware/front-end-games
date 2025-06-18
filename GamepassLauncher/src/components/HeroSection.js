import React from 'react';
import { Box, Typography, Button, Chip, Stack } from '@mui/material';
import { motion } from 'framer-motion';
import {
  Download as DownloadIcon,
  Star as StarIcon
} from '@mui/icons-material';

const HeroSection = ({
  featuredGame,
  onGameSelect,
  heroGames = [],
  onDownload
}) => {
  if (!featuredGame) return null;

  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      sx={{
        position: 'relative',
        width: '100%',
        height: '60vh',
        minHeight: '500px',
        overflow: 'hidden',
        mb: 4,
        borderRadius: 3,
        cursor: 'pointer',
        '&:hover .hero-overlay': {
          opacity: 0.95
        }
      }}
      onClick={() => onGameSelect(featuredGame.id)}
    >
      {/* Background image */}
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
          height: '40%',
          background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 100%)',
          zIndex: 1
        }}
      />

      {/* Content principal */}
      <Box
        sx={{
          position: 'absolute',
          left: { xs: 30, md: 50 },
          bottom: { xs: 60, md: 80 },
          right: { xs: 30, md: '40%' },
          zIndex: 3,
          color: 'white'
        }}
      >
        <Chip
          label="Em destaque"
          size="small"
          sx={{
            mb: 2,
            bgcolor: 'success.main',
            color: 'white',
            fontWeight: 600,
            fontSize: '0.8rem'
          }}
        />

        <Typography
          variant="h2"
          sx={{
            fontWeight: 800,
            mb: 2,
            textShadow: '3px 3px 6px rgba(0,0,0,0.8)',
            fontSize: { xs: '2rem', md: '3rem', lg: '3.5rem' },
            lineHeight: 0.9
          }}
        >
          {featuredGame.title}
        </Typography>

        <Typography
          variant="h6"
          sx={{
            mb: 3,
            opacity: 0.9,
            lineHeight: 1.5,
            textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
            fontSize: { xs: '1rem', md: '1.1rem' },
            maxWidth: '500px'
          }}
        >
          {featuredGame.description}
        </Typography>

        <Stack direction="row" spacing={3} alignItems="center" sx={{ mb: 4 }}>
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

        <Stack direction="row" spacing={2}>
          <Button
            variant="contained"
            startIcon={<DownloadIcon />}
            onClick={(e) => {
              e.stopPropagation();
              onDownload?.(featuredGame);
            }}
            sx={{
              bgcolor: 'success.main',
              color: 'white',
              fontWeight: 700,
              px: 3,
              py: 1.5,
              borderRadius: 2,
              fontSize: '1rem',
              textTransform: 'none',
              boxShadow: '0 4px 20px rgba(46, 125, 50, 0.4)',
              '&:hover': {
                bgcolor: 'success.dark',
                transform: 'translateY(-2px)',
                boxShadow: '0 6px 25px rgba(46, 125, 50, 0.6)'
              }
            }}
          >
            Baixar agora
          </Button>

          <Button
            variant="outlined"
            onClick={(e) => {
              e.stopPropagation();
              onGameSelect(featuredGame.id);
            }}
            sx={{
              color: 'white',
              borderColor: 'rgba(255,255,255,0.6)',
              fontWeight: 600,
              px: 3,
              py: 1.5,
              borderRadius: 2,
              fontSize: '1rem',
              textTransform: 'none',
              backdropFilter: 'blur(10px)',
              bgcolor: 'rgba(255,255,255,0.1)',
              '&:hover': {
                borderColor: 'white',
                bgcolor: 'rgba(255,255,255,0.2)',
                transform: 'translateY(-2px)'
              }
            }}
          >
            Ver detalhes
          </Button>
        </Stack>
      </Box>

      {/* Jogos em destaque no lado direito (removendo sobreposição confusa) */}
      {heroGames.length > 0 && (
        <Box
          sx={{
            position: 'absolute',
            right: { xs: 20, md: 60 },
            bottom: 20,
            zIndex: 3,
            display: { xs: 'none', lg: 'block' }
          }}
        >
          <Typography
            variant="caption"
            sx={{
              color: 'white',
              opacity: 0.7,
              fontSize: '0.75rem',
              display: 'block',
              mb: 1
            }}
          >
            +{heroGames.length - 1} jogos na biblioteca
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default HeroSection;