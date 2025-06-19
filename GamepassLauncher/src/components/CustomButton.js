import React from 'react';
import { Button, Box } from '@mui/material';
import { useTheme } from '../contexts/ThemeContext';

const CustomButton = ({
  children,
  variant = 'contained',
  color = 'primary',
  size = 'medium',
  startIcon,
  endIcon,
  onClick,
  disabled = false,
  fullWidth = false,
  loading = false,
  loadingText,
  progress,
  downloadProgress, // Novo prop específico para download
  sx = {},
  ...props
}) => {
  const { theme, playSound, currentTheme } = useTheme();

  const handleClick = (event) => {
    if (!disabled && !loading) {
      playSound('button-click');
      onClick && onClick(event);
    }
  };

  // Verificar se está baixando
  const isDownloading = downloadProgress !== undefined && downloadProgress >= 0;
  const progressPercent = isDownloading ? Math.round(downloadProgress) : 0;

  // Definir tamanhos baseados no tema com melhor hierarquia
  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          px: 2.5,
          py: 1,
          fontSize: '0.875rem',
          minHeight: 36,
          borderRadius: 1.5
        };
      case 'large':
        return {
          px: 6,
          py: 2.5,
          fontSize: '1.3rem',
          minHeight: 56,
          borderRadius: 2.5
        };
      case 'xl':
        return {
          px: 8,
          py: 3.5,
          fontSize: '1.5rem',
          minHeight: 64,
          borderRadius: 3
        };
      default: // medium
        return {
          px: 4,
          py: 1.8,
          fontSize: '1rem',
          minHeight: 44,
          borderRadius: 2
        };
    }
  };

  // Cores otimizadas para tema dark
  const getColorStyles = () => {
    const colors = theme.palette;

    // Para botão de download, forçar contained quando baixando
    const effectiveVariant = isDownloading ? 'contained' : variant;

    switch (color) {
      case 'secondary':
        return {
          bgcolor: effectiveVariant === 'contained' ? colors.secondary.main : 'rgba(0, 188, 242, 0.1)',
          color: effectiveVariant === 'contained' ? colors.secondary.contrastText : colors.secondary.main,
          borderColor: colors.secondary.main,
          '&:hover': {
            bgcolor: effectiveVariant === 'contained' ? colors.secondary.dark : 'rgba(0, 188, 242, 0.2)',
            borderColor: colors.secondary.light,
            boxShadow: `0 0 20px ${colors.secondary.main}40`
          }
        };
      case 'success':
        return {
          bgcolor: effectiveVariant === 'contained' ? colors.success.main : 'rgba(46, 125, 50, 0.15)',
          color: effectiveVariant === 'contained' ? '#ffffff' : colors.success.main,
          borderColor: colors.success.main,
          '&:hover': {
            bgcolor: effectiveVariant === 'contained' ? colors.success.dark : 'rgba(46, 125, 50, 0.25)',
            borderColor: colors.success.light,
            boxShadow: `0 0 20px ${colors.success.main}40`
          }
        };
      case 'info':
        return {
          bgcolor: effectiveVariant === 'contained' ? colors.info.main : 'rgba(3, 169, 244, 0.15)',
          color: effectiveVariant === 'contained' ? '#ffffff' : colors.info.main,
          borderColor: colors.info.main,
          '&:hover': {
            bgcolor: effectiveVariant === 'contained' ? colors.info.dark : 'rgba(3, 169, 244, 0.25)',
            borderColor: colors.info.light,
            boxShadow: `0 0 20px ${colors.info.main}40`
          }
        };
      case 'warning':
        return {
          bgcolor: effectiveVariant === 'contained' ? (colors.warning?.main || '#ff9800') : 'rgba(255, 152, 0, 0.15)',
          color: effectiveVariant === 'contained' ? '#ffffff' : (colors.warning?.main || '#ff9800'),
          borderColor: colors.warning?.main || '#ff9800',
          '&:hover': {
            bgcolor: effectiveVariant === 'contained' ? (colors.warning?.dark || '#f57c00') : 'rgba(255, 152, 0, 0.25)',
            borderColor: colors.warning?.light || '#ffb74d',
            boxShadow: `0 0 20px ${colors.warning?.main || '#ff9800'}40`
          }
        };
      case 'error':
        return {
          bgcolor: effectiveVariant === 'contained' ? (colors.error?.main || '#f44336') : 'rgba(244, 67, 54, 0.15)',
          color: effectiveVariant === 'contained' ? '#ffffff' : (colors.error?.main || '#f44336'),
          borderColor: colors.error?.main || '#f44336',
          '&:hover': {
            bgcolor: effectiveVariant === 'contained' ? (colors.error?.dark || '#d32f2f') : 'rgba(244, 67, 54, 0.25)',
            borderColor: colors.error?.light || '#e57373',
            boxShadow: `0 0 20px ${colors.error?.main || '#f44336'}40`
          }
        };
      default: // primary
        return {
          bgcolor: effectiveVariant === 'contained' ? colors.primary.main : 'rgba(16, 124, 16, 0.15)',
          color: effectiveVariant === 'contained' ? colors.primary.contrastText : colors.primary.main,
          borderColor: colors.primary.main,
          '&:hover': {
            bgcolor: effectiveVariant === 'contained' ? colors.primary.dark : 'rgba(16, 124, 16, 0.25)',
            borderColor: colors.primary.light,
            boxShadow: `0 0 20px ${colors.primary.main}40`
          }
        };
    }
  };

  const sizeStyles = getSizeStyles();
  const colorStyles = getColorStyles();

  // Sombra baseada no tema atual
  const getThemeShadow = () => {
    const shadowColors = {
      xbox: theme.palette.primary.main,
      ps5: theme.palette.primary.main,
      switch: theme.palette.primary.main
    };
    return shadowColors[currentTheme] || theme.palette.primary.main;
  };

  const buttonStyles = {
    ...sizeStyles,
    ...colorStyles,
    fontWeight: 700,
    textTransform: 'none',
    position: 'relative',
    overflow: 'hidden',
    border: variant === 'outlined' || !isDownloading ? 1 : 'none', // Borda mais fina
    borderStyle: 'solid',
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    backdropFilter: 'blur(10px)',
    boxShadow: variant === 'contained' || isDownloading
      ? `0 8px 25px ${getThemeShadow()}30`
      : `0 4px 15px ${getThemeShadow()}20`,
    '&:hover': {
      ...colorStyles['&:hover'],
      transform: !disabled && !loading ? 'translateY(-3px) scale(1.02)' : 'none',
      boxShadow: (variant === 'contained' || isDownloading) && !disabled && !loading
        ? `0 12px 35px ${getThemeShadow()}50`
        : `0 8px 25px ${getThemeShadow()}30`,
    },
    '&:active': {
      transform: !disabled && !loading ? 'translateY(-1px) scale(0.98)' : 'none',
    },
    '&:disabled': {
      opacity: 0.5,
      transform: 'none',
      boxShadow: 'none',
    },
    // Efeito especial para botão de download
    ...(isDownloading && {
      background: `linear-gradient(135deg, ${colorStyles.bgcolor} 0%, ${theme.palette.primary.dark} 100%)`,
      border: 'none',
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: `linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.1) 50%, transparent 70%)`,
        animation: 'shimmer 2s infinite',
        '@keyframes shimmer': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' }
        }
      }
    }),
    ...sx
  };

  return (
    <Button
      variant={isDownloading ? 'contained' : variant}
      size={size}
      startIcon={startIcon}
      endIcon={endIcon}
      onClick={handleClick}
      disabled={disabled || loading}
      fullWidth={fullWidth}
      sx={buttonStyles}
      {...props}
    >
      {/* Barra de progresso de download - preenche todo o botão */}
      {isDownloading && (
        <>
          {/* Fundo da barra */}
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              bgcolor: 'rgba(0,0,0,0.3)',
              zIndex: 1
            }}
          />
          {/* Progresso com gradiente da cor do tema */}
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              bottom: 0,
              width: `${progressPercent}%`,
              background: `linear-gradient(135deg, 
                ${theme.palette.primary.main}, 
                ${theme.palette.primary.light}, 
                ${theme.palette.primary.main})`,
              zIndex: 2,
              transition: 'width 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
              borderRadius: 'inherit',
              '&::after': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: `linear-gradient(90deg, 
                  transparent, 
                  rgba(255,255,255,0.2), 
                  transparent)`,
                animation: 'progressShine 2s infinite',
                '@keyframes progressShine': {
                  '0%': { transform: 'translateX(-100%)' },
                  '100%': { transform: 'translateX(100%)' }
                }
              }
            }}
          />
          {/* Overlay do texto */}
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 3,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(0,0,0,0.1)'
            }}
          />
        </>
      )}

      {/* Barra de progresso simples (para outros casos) */}
      {loading && progress !== undefined && !isDownloading && (
        <Box
          sx={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            height: '6px',
            width: `${Math.round(progress)}%`,
            bgcolor: 'rgba(255,255,255,0.8)',
            transition: 'width 0.3s ease',
            borderRadius: '0 0 6px 6px',
            zIndex: 3
          }}
        />
      )}

      {/* Conteúdo do botão */}
      <Box sx={{ position: 'relative', zIndex: 4, display: 'flex', alignItems: 'center', gap: 1 }}>
        {loading && loadingText ? loadingText : children}
        {isDownloading && (
          <Box
            component="span"
            sx={{
              ml: 1,
              px: 1,
              py: 0.25,
              bgcolor: 'rgba(255,255,255,0.2)',
              borderRadius: 1,
              fontSize: '0.8em',
              fontWeight: 800,
              minWidth: '45px',
              textAlign: 'center'
            }}
          >
            {progressPercent}%
          </Box>
        )}
      </Box>
    </Button>
  );
};

export default CustomButton;