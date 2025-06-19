import React from 'react';
import {
  Box,
  Tabs,
  Tab
} from '@mui/material';
import {
  Info as InfoIcon,
  PhotoLibrary as PhotoIcon,
  Assessment as SpecsIcon,
  GetApp as ActionsIcon
} from '@mui/icons-material';

const GameInfoNavigation = ({ activeTab, onTabChange, currentColors, game, getTabProps = () => ({}) }) => {
  // Tabs disponíveis - SEMPRE incluir galeria, mesmo sem screenshots
  const tabs = [
    { id: 'overview', label: 'Visão Geral', icon: <InfoIcon /> },
    { id: 'gallery', label: 'Galeria', icon: <PhotoIcon /> }, // Removido disabled
    { id: 'specs', label: 'Especificações', icon: <SpecsIcon /> },
    { id: 'actions', label: 'Ações', icon: <ActionsIcon /> }
  ]; // Removido .filter(tab => !tab.disabled);

  return (
    <Box sx={{
      borderBottom: 1,
      borderColor: 'divider',
      bgcolor: 'rgba(255,255,255,0.03)',
      backdropFilter: 'blur(10px)'
    }}>
      <Tabs
        value={activeTab}
        onChange={(event, newValue) => onTabChange(newValue)}
        variant="fullWidth"
        sx={{
          '& .MuiTab-root': {
            minHeight: 64,
            fontSize: '0.95rem',
            fontWeight: 600,
            textTransform: 'none',
            color: 'text.secondary',
            transition: 'all 0.3s ease',
            '&:hover': {
              color: currentColors.primary,
              bgcolor: `${currentColors.primary}10`
            },
            '&.Mui-selected': {
              color: currentColors.primary,
              bgcolor: `${currentColors.primary}15`
            }
          },
          '& .MuiTabs-indicator': {
            height: 3,
            borderRadius: '3px 3px 0 0',
            background: `linear-gradient(90deg, ${currentColors.primary}, ${currentColors.accent})`
          }
        }}
      >
        {tabs.map((tab, index) => (
          <Tab
            key={tab.id}
            label={tab.label}
            icon={tab.icon}
            iconPosition="start"
            value={tab.id}
            {...getTabProps(tab.id, index)}
          />
        ))}
      </Tabs>
    </Box>
  );
};

export default GameInfoNavigation;