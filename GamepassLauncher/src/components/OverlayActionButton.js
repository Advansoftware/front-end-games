import React from 'react';
import { Box } from '@mui/material';
import CustomButton from './CustomButton';

const OverlayActionButton = ({
  icon: Icon,
  text,
  onClick,
  currentColors,
  sx = {}
}) => {
  return (
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
        transition: 'opacity 0.3s ease',
        ...sx
      }}
    >
      <Icon sx={{
        fontSize: 36,
        color: 'white',
        mb: 1.5,
        filter: `drop-shadow(0 0 8px ${currentColors.glow}60)`
      }} />
      <CustomButton
        variant="contained"
        color="primary"
        size="medium"
        startIcon={<Icon />}
        onClick={onClick}
        sx={{
          bgcolor: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(8px)',
          color: 'white',
          fontSize: '0.8rem',
          py: 1,
          px: 2,
          border: `1px solid ${currentColors.primary}60`,
          boxShadow: `0 0 15px ${currentColors.glow}40`,
          '&:hover': {
            bgcolor: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(12px)',
            borderColor: currentColors.primary,
            transform: 'scale(1.05)',
            boxShadow: `0 0 25px ${currentColors.glow}60`
          }
        }}
      >
        {text}
      </CustomButton>
    </Box>
  );
};

export default OverlayActionButton;