import React from 'react';
import {
  Box,
  Tabs,
  Tab,
  useTheme
} from '@mui/material';
import {
  Info as InfoIcon,
  PhotoLibrary as PhotoIcon,
  PlayArrow as VideoIcon,
  Download as DownloadIcon
} from '@mui/icons-material';

const GameInfoTabs = ({ 
  activeTab, 
  onTabChange, 
  game, 
  selectedElement, 
  setSelectedElement 
}) => {
  const theme = useTheme();
  
  const tabs = [
    { 
      id: 'overview', 
      label: 'Visão Geral', 
      icon: <InfoIcon />,
      elementId: 'tab-overview'
    },
    { 
      id: 'screenshots', 
      label: 'Screenshots', 
      icon: <PhotoIcon />,
      elementId: 'tab-screenshots',
      disabled: !game.screenshots?.length
    },
    { 
      id: 'videos', 
      label: 'Vídeos', 
      icon: <VideoIcon />,
      elementId: 'tab-videos',
      disabled: !game.trailerUrl && !game.videos?.length
    },
    { 
      id: 'download', 
      label: 'Download', 
      icon: <DownloadIcon />,
      elementId: 'tab-download'
    }
  ].filter(tab => !tab.disabled);

  return (
    <Box sx={{ 
      borderBottom: 1, 
      borderColor: 'divider',
      bgcolor: 'rgba(255,255,255,0.05)',
      backdropFilter: 'blur(10px)'
    }}>
      <Tabs
        value={activeTab}
        onChange={(event, newValue) => onTabChange(newValue)}
        variant="fullWidth"
        sx={{
          '& .MuiTab-root': {
            minHeight: 60,
            fontSize: '0.95rem',
            fontWeight: 600,
            textTransform: 'none',
            color: 'text.secondary',
            transition: 'all 0.3s ease',
            '&:hover': {
              color: 'primary.main',
              bgcolor: 'rgba(25,118,210,0.1)'
            },
            '&.Mui-selected': {
              color: 'primary.main',
              bgcolor: 'rgba(25,118,210,0.15)'
            }
          },
          '& .MuiTabs-indicator': {
            height: 3,
            borderRadius: '3px 3px 0 0',
            background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`
          }
        }}
      >
        {tabs.map((tab) => (
          <Tab
            key={tab.id}
            id={tab.elementId}
            label={tab.label}
            icon={tab.icon}
            iconPosition="start"
            value={tab.id}
            sx={{
              border: selectedElement === tab.elementId ? 
                `2px solid ${theme.palette.primary.main}` : 
                '2px solid transparent',
              borderRadius: 1,
              mx: 0.5,
              transition: 'all 0.2s ease',
              '&:focus': {
                outline: 'none',
                border: `2px solid ${theme.palette.primary.main}`,
                bgcolor: 'rgba(25,118,210,0.2)'
              }
            }}
            onFocus={() => setSelectedElement(tab.elementId)}
          />
        ))}
      </Tabs>
    </Box>
  );
};

export default GameInfoTabs;