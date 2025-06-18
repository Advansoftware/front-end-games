import React from 'react';
import { Box, Typography } from '@mui/material';
import GameCard from './GameCard';

const GameSection = ({
  title,
  games = [],
  isRecent = false,
  onGameSelect,
  variant = 'horizontal' // 'horizontal' | 'grid'
}) => {
  if (!games.length) return null;

  return (
    <Box sx={{ mb: 4 }}>
      <Typography
        variant="h5"
        sx={{
          fontWeight: 700,
          color: 'text.primary',
          mb: 2,
          ml: 1
        }}
      >
        {title}
      </Typography>

      <Box
        sx={{
          display: variant === 'grid' ? 'grid' : 'flex',
          ...(variant === 'grid' ? {
            gridTemplateColumns: {
              xs: 'repeat(auto-fill, 200px)', // Largura fixa baseada no card
              sm: 'repeat(auto-fill, 200px)',
              md: 'repeat(auto-fill, 200px)',
              lg: 'repeat(auto-fill, 200px)'
            },
            gap: 3,
            px: 1,
            justifyContent: 'center' // Centralizar cards quando sobra espaço
          } : {
            gap: 2, // Aumentado gap para horizontal scroll
            overflowX: 'auto',
            pb: 2,
            '&::-webkit-scrollbar': {
              height: 6
            },
            '&::-webkit-scrollbar-track': {
              background: 'rgba(255,255,255,0.1)',
              borderRadius: 3
            },
            '&::-webkit-scrollbar-thumb': {
              background: 'rgba(255,255,255,0.3)',
              borderRadius: 3,
              '&:hover': {
                background: 'rgba(255,255,255,0.5)'
              }
            }
          })
        }}
      >
        {games.map((game) => (
          <GameCard
            key={game.id}
            game={game}
            isRecent={isRecent}
            onGameSelect={onGameSelect}
            variant={variant === 'grid' ? 'vertical' : 'horizontal'}
          />
        ))}
      </Box>
    </Box>
  );
};

export default GameSection;