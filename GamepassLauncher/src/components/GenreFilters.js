import React from 'react';
import { Box, Chip } from '@mui/material';
import { motion } from 'framer-motion';
import {
  Lightbulb as IndependenteIcon,
  FamilyRestroom as FamilyIcon,
  SportsSoccer as EsporteIcon,
  DirectionsRun as AventuraIcon,
  SportsEsports as LutaIcon,
  Psychology as EstrategiaIcon,
  FlightTakeoff as SimulacaoIcon,
  AutoStories as RPGIcon
} from '@mui/icons-material';
import { useTheme as useMuiTheme } from '@mui/material/styles';
import { useTheme } from '../contexts/ThemeContext';

const GenreFilters = ({ selectedGenre, onGenreChange }) => {
  const muiTheme = useMuiTheme();
  const { currentTheme } = useTheme();

  // Cores específicas para cada tema
  const getThemeColors = () => {
    switch (currentTheme) {
      case 'xbox':
        return {
          primary: '#107C10',
          secondary: '#00BCF2',
          accent1: '#16AA16',
          accent2: '#0096C2',
          accent3: '#0D5D0D',
          accent4: '#33C9F5',
          accent5: '#1A8A1A',
          accent6: '#0086B2'
        };
      case 'ps5':
        return {
          primary: '#0070F3',
          secondary: '#00D4FF',
          accent1: '#3391FF',
          accent2: '#0056CC',
          accent3: '#00C851',
          accent4: '#FFFFFF',
          accent5: '#5599FF',
          accent6: '#0044AA'
        };
      case 'switch':
        return {
          primary: '#E60012',
          secondary: '#0066CC',
          accent1: '#FF3345',
          accent2: '#3388FF',
          accent3: '#FF6B00',
          accent4: '#B3000E',
          accent5: '#FF5566',
          accent6: '#0052A3'
        };
      default:
        return {
          primary: '#107C10',
          secondary: '#00BCF2',
          accent1: '#16AA16',
          accent2: '#0096C2',
          accent3: '#0D5D0D',
          accent4: '#33C9F5',
          accent5: '#1A8A1A',
          accent6: '#0086B2'
        };
    }
  };

  const themeColors = getThemeColors();

  const genres = [
    { id: 'all', label: 'Todos', icon: null, color: themeColors.primary },
    { id: 'independente', label: 'Independente', icon: IndependenteIcon, color: themeColors.accent1 },
    { id: 'familia', label: 'Para todas as idades', icon: FamilyIcon, color: themeColors.accent2 },
    { id: 'tiro', label: 'Tiro', icon: EsporteIcon, color: themeColors.secondary },
    { id: 'acao', label: 'Ação e aventura', icon: AventuraIcon, color: themeColors.accent3 },
    { id: 'luta', label: 'Jogos de luta', icon: LutaIcon, color: themeColors.accent4 },
    { id: 'estrategia', label: 'Estratégia', icon: EstrategiaIcon, color: themeColors.accent5 },
    { id: 'simulacao', label: 'Simulação', icon: SimulacaoIcon, color: themeColors.accent6 },
    { id: 'rpg', label: 'RPG', icon: RPGIcon, color: themeColors.primary }
  ];

  return (
    <Box
      sx={{
        display: 'flex',
        gap: 1,
        overflowX: 'auto',
        pb: 2,
        mb: 3,
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
      }}
    >
      {genres.map((genre) => {
        const IconComponent = genre.icon;
        const isSelected = selectedGenre === genre.id;

        return (
          <Chip
            key={genre.id}
            component={motion.div}
            whileTap={{ scale: 0.95 }}
            icon={IconComponent ? <IconComponent sx={{ fontSize: 18 }} /> : undefined}
            label={genre.label}
            onClick={() => onGenreChange(genre.id)}
            sx={{
              backgroundColor: isSelected ? genre.color : 'rgba(255,255,255,0.1)',
              color: isSelected ? (currentTheme === 'ps5' && genre.color === '#FFFFFF' ? '#000000' : 'white') : 'text.secondary',
              border: `1px solid ${isSelected ? genre.color : 'rgba(255,255,255,0.2)'}`,
              fontWeight: isSelected ? 600 : 400,
              fontSize: '0.875rem',
              height: 36,
              px: 1,
              minWidth: 'auto',
              whiteSpace: 'nowrap',
              transition: 'all 0.2s ease',
              '&:hover': {
                backgroundColor: isSelected ? genre.color : 'rgba(255,255,255,0.15)',
                borderColor: isSelected ? genre.color : 'rgba(255,255,255,0.4)',
                transform: 'translateY(-1px)'
              },
              '& .MuiChip-icon': {
                color: 'inherit'
              }
            }}
          />
        );
      })}
    </Box>
  );
};

export default GenreFilters;