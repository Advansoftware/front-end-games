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

  // Cores específicas por tema para experiência única
  const getThemeExperience = () => {
    const experiences = {
      xbox: {
        primary: '#107C10',
        secondary: '#16AA16',
        accent: '#00BCF2',
        glow: '#107C10',
        particle: '#16AA16',
        wave: 'linear-gradient(45deg, #107C10, #16AA16, #00BCF2)',
        pulse: '#107C10',
        name: 'Xbox'
      },
      ps5: {
        primary: '#0070F3',
        secondary: '#3391FF',
        accent: '#00D4FF',
        glow: '#0070F3',
        particle: '#00D4FF',
        wave: 'linear-gradient(45deg, #0070F3, #3391FF, #00D4FF)',
        pulse: '#0070F3',
        name: 'PlayStation'
      },
      switch: {
        primary: '#E60012',
        secondary: '#FF3345',
        accent: '#FF6B6B',
        glow: '#E60012',
        particle: '#FF3345',
        wave: 'linear-gradient(45deg, #E60012, #FF3345, #FF6B6B)',
        pulse: '#E60012',
        name: 'Nintendo'
      }
    };
    return experiences[currentTheme] || experiences.xbox;
  };

  const themeExp = getThemeExperience();

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
          bgcolor: effectiveVariant === 'contained' ? colors.secondary.main : `${themeExp.secondary}20`,
          color: effectiveVariant === 'contained' ? colors.secondary.contrastText : colors.secondary.main,
          borderColor: colors.secondary.main,
          '&:hover': {
            bgcolor: effectiveVariant === 'contained' ? colors.secondary.dark : `${themeExp.secondary}30`,
            borderColor: colors.secondary.light,
            boxShadow: `0 0 20px ${colors.secondary.main}40`
          }
        };
      case 'success':
        return {
          bgcolor: effectiveVariant === 'contained' ? colors.success.main : `${themeExp.primary}20`,
          color: effectiveVariant === 'contained' ? '#ffffff' : colors.success.main,
          borderColor: colors.success.main,
          '&:hover': {
            bgcolor: effectiveVariant === 'contained' ? colors.success.dark : `${themeExp.primary}30`,
            borderColor: colors.success.light,
            boxShadow: `0 0 20px ${colors.success.main}40`
          }
        };
      case 'info':
        return {
          bgcolor: effectiveVariant === 'contained' ? themeExp.primary : `${themeExp.primary}20`,
          color: effectiveVariant === 'contained' ? '#ffffff' : themeExp.primary,
          borderColor: themeExp.primary,
          '&:hover': {
            bgcolor: effectiveVariant === 'contained' ? themeExp.secondary : `${themeExp.primary}30`,
            borderColor: themeExp.accent,
            boxShadow: `0 0 20px ${themeExp.primary}40`
          }
        };
      case 'warning':
        return {
          bgcolor: effectiveVariant === 'contained' ? (colors.warning?.main || '#ff9800') : `${colors.warning?.main || '#ff9800'}20`,
          color: effectiveVariant === 'contained' ? '#ffffff' : (colors.warning?.main || '#ff9800'),
          borderColor: colors.warning?.main || '#ff9800',
          '&:hover': {
            bgcolor: effectiveVariant === 'contained' ? (colors.warning?.dark || '#f57c00') : `${colors.warning?.main || '#ff9800'}30`,
            borderColor: colors.warning?.light || '#ffb74d',
            boxShadow: `0 0 20px ${colors.warning?.main || '#ff9800'}40`
          }
        };
      case 'error':
        return {
          bgcolor: effectiveVariant === 'contained' ? (colors.error?.main || '#f44336') : `${colors.error?.main || '#f44336'}20`,
          color: effectiveVariant === 'contained' ? '#ffffff' : (colors.error?.main || '#f44336'),
          borderColor: colors.error?.main || '#f44336',
          '&:hover': {
            bgcolor: effectiveVariant === 'contained' ? (colors.error?.dark || '#d32f2f') : `${colors.error?.main || '#f44336'}30`,
            borderColor: colors.error?.light || '#e57373',
            boxShadow: `0 0 20px ${colors.error?.main || '#f44336'}40`
          }
        };
      default: // primary
        return {
          bgcolor: effectiveVariant === 'contained' ? colors.primary.main : `${themeExp.primary}20`,
          color: effectiveVariant === 'contained' ? colors.primary.contrastText : colors.primary.main,
          borderColor: colors.primary.main,
          '&:hover': {
            bgcolor: effectiveVariant === 'contained' ? colors.primary.dark : `${themeExp.primary}30`,
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
    border: variant === 'outlined' || !isDownloading ? 1 : 'none',
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
    // Experiência especial para botão de download/atualizar
    ...(isDownloading && {
      background: `linear-gradient(135deg, rgba(0,0,0,0.4), rgba(0,0,0,0.2))`, // Fundo neutro escuro
      border: 'none',
      boxShadow: `0 0 30px ${themeExp.glow}60, inset 0 0 20px ${themeExp.primary}20`,
      // Efeito de fundo sutil
      '&::after': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: themeExp.wave,
        opacity: 0.15, // Bem sutil no fundo
        zIndex: 1,
        animation: `${currentTheme}BackgroundWave 4s infinite ease-in-out`,
        '@keyframes xboxBackgroundWave': {
          '0%, 100%': { 
            opacity: 0.1,
            transform: 'scale(1)'
          },
          '50%': { 
            opacity: 0.2,
            transform: 'scale(1.02)'
          }
        },
        '@keyframes ps5BackgroundWave': {
          '0%, 100%': { 
            opacity: 0.15,
            filter: 'hue-rotate(0deg)'
          },
          '50%': { 
            opacity: 0.25,
            filter: 'hue-rotate(10deg)'
          }
        },
        '@keyframes switchBackgroundWave': {
          '0%, 100%': { 
            opacity: 0.12,
            transform: 'skewX(0deg)'
          },
          '50%': { 
            opacity: 0.22,
            transform: 'skewX(1deg)'
          }
        }
      },
      // Animação de pulso do tema
      animation: `${currentTheme}Pulse 2s infinite ease-in-out`,
      '@keyframes xboxPulse': {
        '0%, 100%': {
          boxShadow: `0 0 30px ${themeExp.glow}60, inset 0 0 20px ${themeExp.primary}20`,
          filter: 'brightness(1)'
        },
        '50%': {
          boxShadow: `0 0 50px ${themeExp.glow}80, inset 0 0 30px ${themeExp.secondary}30`,
          filter: 'brightness(1.1)'
        }
      },
      '@keyframes ps5Pulse': {
        '0%, 100%': {
          boxShadow: `0 0 30px ${themeExp.glow}60, inset 0 0 20px ${themeExp.primary}20`
        },
        '50%': {
          boxShadow: `0 0 50px ${themeExp.accent}80, inset 0 0 30px ${themeExp.accent}30`
        }
      },
      '@keyframes switchPulse': {
        '0%, 100%': {
          boxShadow: `0 0 30px ${themeExp.glow}60, inset 0 0 20px ${themeExp.primary}20`
        },
        '50%': {
          boxShadow: `0 0 50px ${themeExp.secondary}80, inset 0 0 30px ${themeExp.accent}30`
        }
      },
      // Efeito shimmer temático
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: `linear-gradient(45deg, transparent 30%, ${themeExp.particle}15 50%, transparent 70%)`, // Reduzida opacidade
        opacity: 0.3, // Mais sutil
        zIndex: 1,
        animation: `${currentTheme}Shimmer 3s infinite`, // Mais lento
        '@keyframes xboxShimmer': {
          '0%, 100%': {
            boxShadow: `0 0 30px ${themeExp.glow}60, inset 0 0 20px ${themeExp.primary}20`,
            filter: 'brightness(1)'
          },
          '50%': {
            boxShadow: `0 0 50px ${themeExp.glow}80, inset 0 0 30px ${themeExp.secondary}30`,
            filter: 'brightness(1.1)'
          }
        },
        '@keyframes ps5Shimmer': {
          '0%, 100%': {
            boxShadow: `0 0 30px ${themeExp.glow}60, inset 0 0 20px ${themeExp.primary}20`
          },
          '50%': {
            boxShadow: `0 0 50px ${themeExp.accent}80, inset 0 0 30px ${themeExp.accent}30`
          }
        },
        '@keyframes switchShimmer': {
          '0%, 100%': {
            boxShadow: `0 0 30px ${themeExp.glow}60, inset 0 0 20px ${themeExp.primary}20`
          },
          '50%': {
            boxShadow: `0 0 50px ${themeExp.secondary}80, inset 0 0 30px ${themeExp.accent}30`
          }
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
      {/* Efeitos visuais especiais durante download */}
      {isDownloading && (
        <>
          {/* Partículas flutuantes temáticas */}
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 1,
              '&::before, &::after': {
                content: '""',
                position: 'absolute',
                width: '4px',
                height: '4px',
                background: themeExp.particle,
                borderRadius: '50%',
                opacity: 0.8,
                filter: `drop-shadow(0 0 6px ${themeExp.particle})`
              },
              '&::before': {
                top: '20%',
                left: '15%',
                animation: `${currentTheme}Particle1 3s infinite ease-in-out`
              },
              '&::after': {
                top: '70%',
                right: '20%',
                animation: `${currentTheme}Particle2 2.5s infinite ease-in-out`
              },
              '@keyframes xboxParticle1': {
                '0%, 100%': { transform: 'translateY(0) scale(1)', opacity: 0.8 },
                '50%': { transform: 'translateY(-10px) scale(1.5)', opacity: 1 }
              },
              '@keyframes xboxParticle2': {
                '0%, 100%': { transform: 'translateX(0) scale(1)', opacity: 0.6 },
                '50%': { transform: 'translateX(10px) scale(1.2)', opacity: 1 }
              },
              '@keyframes ps5Particle1': {
                '0%, 100%': { transform: 'rotate(0deg) translateY(0)', opacity: 0.7 },
                '50%': { transform: 'rotate(180deg) translateY(-8px)', opacity: 1 }
              },
              '@keyframes ps5Particle2': {
                '0%, 100%': { transform: 'scale(1) rotate(0deg)', opacity: 0.8 },
                '50%': { transform: 'scale(1.3) rotate(90deg)', opacity: 0.9 }
              },
              '@keyframes switchParticle1': {
                '0%, 100%': { transform: 'translateY(0) rotateZ(0deg)', opacity: 0.9 },
                '25%': { transform: 'translateY(-5px) rotateZ(90deg)', opacity: 1 },
                '75%': { transform: 'translateY(5px) rotateZ(270deg)', opacity: 0.7 }
              },
              '@keyframes switchParticle2': {
                '0%, 100%': { transform: 'translateX(0) scale(1)', opacity: 0.8 },
                '33%': { transform: 'translateX(8px) scale(1.4)', opacity: 1 },
                '66%': { transform: 'translateX(-4px) scale(0.8)', opacity: 0.9 }
              }
            }}
          />

          {/* Barra de progresso com gradiente temático dinâmico */}
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              bottom: 0,
              width: `${progressPercent}%`,
              background: `linear-gradient(90deg, 
                ${themeExp.primary}, 
                ${themeExp.secondary}, 
                ${themeExp.accent},
                ${themeExp.primary})`,
              backgroundSize: '300% 100%',
              zIndex: 10, // Maior z-index para ficar na frente
              transition: 'width 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
              borderRadius: 0,
              opacity: 0.95, // Bem visível
              boxShadow: `inset 0 0 20px ${themeExp.glow}40, 0 0 15px ${themeExp.primary}60`, // Brilho interno e externo
              animation: `${currentTheme}ProgressFlow 3s infinite linear`,
              '@keyframes xboxProgressFlow': {
                '0%': { 
                  backgroundPosition: '0% 50%',
                  filter: 'brightness(1) saturate(1.2)'
                },
                '100%': { 
                  backgroundPosition: '200% 50%',
                  filter: 'brightness(1.1) saturate(1.3)'
                }
              },
              '@keyframes ps5ProgressFlow': {
                '0%': {
                  backgroundPosition: '0% 50%',
                  filter: 'brightness(1) hue-rotate(0deg) saturate(1.2)'
                },
                '50%': {
                  backgroundPosition: '100% 50%',
                  filter: 'brightness(1.1) hue-rotate(5deg) saturate(1.3)'
                },
                '100%': {
                  backgroundPosition: '200% 50%',
                  filter: 'brightness(1) hue-rotate(0deg) saturate(1.2)'
                }
              },
              '@keyframes switchProgressFlow': {
                '0%': {
                  backgroundPosition: '0% 50%',
                  transform: 'scaleY(1)',
                  filter: 'brightness(1) saturate(1.3)'
                },
                '50%': {
                  backgroundPosition: '100% 50%',
                  transform: 'scaleY(1.05)',
                  filter: 'brightness(1.15) saturate(1.4)'
                },
                '100%': {
                  backgroundPosition: '200% 50%',
                  transform: 'scaleY(1)',
                  filter: 'brightness(1) saturate(1.3)'
                }
              },
              // Efeito de ondas no progresso mais intenso
              '&::after': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: `linear-gradient(90deg, 
                  transparent, 
                  ${themeExp.glow}80, 
                  transparent)`,
                opacity: 0.8,
                animation: `${currentTheme}Wave 2s infinite`,
                '@keyframes xboxWave': {
                  '0%': { transform: 'translateX(-100%)' },
                  '100%': { transform: 'translateX(100%)' }
                },
                '@keyframes ps5Wave': {
                  '0%': {
                    transform: 'translateX(-100%) scaleY(1)',
                    opacity: 0.6
                  },
                  '50%': {
                    transform: 'translateX(0%) scaleY(1.2)',
                    opacity: 1
                  },
                  '100%': {
                    transform: 'translateX(100%) scaleY(1)',
                    opacity: 0.6
                  }
                },
                '@keyframes switchWave': {
                  '0%': {
                    transform: 'translateX(-100%) rotateZ(0deg)',
                    filter: 'hue-rotate(0deg)'
                  },
                  '50%': {
                    transform: 'translateX(0%) rotateZ(1deg)',
                    filter: 'hue-rotate(10deg)'
                  },
                  '100%': {
                    transform: 'translateX(100%) rotateZ(0deg)',
                    filter: 'hue-rotate(0deg)'
                  }
                }
              }
            }}
          />

          {/* Overlay com texto de status temático */}
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: `linear-gradient(135deg, 
                transparent 0%, 
                ${themeExp.primary}10 25%, 
                transparent 50%, 
                ${themeExp.secondary}10 75%, 
                transparent 100%)`,
              zIndex: 3,
              animation: `${currentTheme}StatusOverlay 4s infinite ease-in-out`,
              '@keyframes xboxStatusOverlay': {
                '0%, 100%': { opacity: 0.3 },
                '50%': { opacity: 0.6 }
              },
              '@keyframes ps5StatusOverlay': {
                '0%, 100%': {
                  opacity: 0.4,
                  background: `linear-gradient(135deg, 
                    transparent 0%, 
                    ${themeExp.primary}15 25%, 
                    transparent 50%, 
                    ${themeExp.accent}15 75%, 
                    transparent 100%)`
                },
                '50%': {
                  opacity: 0.7,
                  background: `linear-gradient(135deg, 
                    transparent 0%, 
                    ${themeExp.accent}20 25%, 
                    transparent 50%, 
                    ${themeExp.secondary}20 75%, 
                    transparent 100%)`
                }
              },
              '@keyframes switchStatusOverlay': {
                '0%, 100%': {
                  opacity: 0.5,
                  transform: 'skewX(0deg)'
                },
                '33%': {
                  opacity: 0.8,
                  transform: 'skewX(1deg)'
                },
                '66%': {
                  opacity: 0.6,
                  transform: 'skewX(-1deg)'
                }
              }
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
            borderRadius: 0,
            zIndex: 3
          }}
        />
      )}

      {/* Conteúdo do botão - Apenas o texto com porcentagem */}
      <Box
        sx={{
          position: 'relative',
          zIndex: 20,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 1,
          color: isDownloading || loading ? '#ffffff !important' : 'inherit',
          textShadow: isDownloading || loading ? `2px 2px 8px ${themeExp.glow}80` : 'none',
          fontWeight: isDownloading || loading ? 800 : 'inherit',
          whiteSpace: 'nowrap',
          minWidth: 'fit-content',
          // Efeito de texto especial durante download
          ...(isDownloading && {
            filter: `drop-shadow(0 0 8px ${themeExp.glow}60)`,
            animation: `${currentTheme}TextGlow 2s infinite ease-in-out`,
            '@keyframes xboxTextGlow': {
              '0%, 100%': {
                textShadow: `2px 2px 8px ${themeExp.glow}80`,
                transform: 'scale(1)'
              },
              '50%': {
                textShadow: `2px 2px 12px ${themeExp.glow}100, 0 0 20px ${themeExp.secondary}60`,
                transform: 'scale(1.02)'
              }
            },
            '@keyframes ps5TextGlow': {
              '0%, 100%': {
                textShadow: `2px 2px 8px ${themeExp.glow}80`,
                color: '#ffffff !important'
              },
              '50%': {
                textShadow: `2px 2px 12px ${themeExp.accent}100, 0 0 15px ${themeExp.accent}80`,
                color: '#f0f8ff !important'
              }
            },
            '@keyframes switchTextGlow': {
              '0%, 100%': {
                textShadow: `2px 2px 8px ${themeExp.glow}80`,
                transform: 'scale(1) rotateZ(0deg)'
              },
              '33%': {
                textShadow: `2px 2px 10px ${themeExp.secondary}90, 0 0 15px ${themeExp.accent}70`,
                transform: 'scale(1.01) rotateZ(0.5deg)'
              },
              '66%': {
                textShadow: `2px 2px 10px ${themeExp.accent}90, 0 0 15px ${themeExp.secondary}70`,
                transform: 'scale(1.01) rotateZ(-0.5deg)'
              }
            }
          })
        }}
      >
        {isDownloading ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box component="span">
              Baixando {progressPercent}%
            </Box>
            {/* Indicador de progresso temático */}
            <Box
              sx={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: themeExp.accent,
                animation: `${currentTheme}Indicator 1.5s infinite ease-in-out`,
                '@keyframes xboxIndicator': {
                  '0%, 100%': { transform: 'scale(1)', opacity: 1 },
                  '50%': { transform: 'scale(1.5)', opacity: 0.7 }
                },
                '@keyframes ps5Indicator': {
                  '0%, 100%': {
                    transform: 'scale(1) rotate(0deg)',
                    background: themeExp.accent
                  },
                  '50%': {
                    transform: 'scale(1.3) rotate(180deg)',
                    background: themeExp.secondary
                  }
                },
                '@keyframes switchIndicator': {
                  '0%, 100%': {
                    transform: 'scale(1)',
                    boxShadow: `0 0 5px ${themeExp.accent}`
                  },
                  '25%': {
                    transform: 'scale(1.2)',
                    boxShadow: `0 0 10px ${themeExp.secondary}`
                  },
                  '75%': {
                    transform: 'scale(0.8)',
                    boxShadow: `0 0 8px ${themeExp.primary}`
                  }
                }
              }}
            />
          </Box>
        ) : loading && loadingText ? loadingText : children}
      </Box>
    </Button>
  );
};

export default CustomButton;