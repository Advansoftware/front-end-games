import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Typography,
  Chip,
  IconButton,
  TextField,
  InputAdornment,
  Menu,
  MenuItem,
  Skeleton
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Star as StarIcon,
  Download as DownloadIcon,
  PlayArrow as PlayIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useGames } from '../contexts/GamesContext';
import { useTheme } from '../contexts/ThemeContext';
import { useGamepad } from '../hooks/useGamepad';

const GameCard = ({ game, onSelect, isSelected, onPlay, onDownload }) => {
  const { playSound } = useTheme();
  const { downloadProgress } = useGames();

  const isDownloading = downloadProgress[game.id] !== undefined;
  const progress = downloadProgress[game.id] || 0;

  const handleClick = () => {
    playSound('navigate');
    onSelect(game.id);
  };

  const handlePlay = (e) => {
    e.stopPropagation();
    playSound('confirm');
    onPlay(game.id);
  };

  const handleDownload = (e) => {
    e.stopPropagation();
    playSound('confirm');
    onDownload(game.id);
  };

  return (
    <Card
      component={motion.div}
      whileHover={{
        scale: 1.05,
        transition: { duration: 0.2 }
      }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      onClick={handleClick}
      sx={{
        position: 'relative',
        cursor: 'pointer',
        height: '300px',
        overflow: 'hidden',
        border: isSelected ? 2 : 0,
        borderColor: 'primary.main',
        '&:hover .game-overlay': {
          opacity: 1,
        },
        '&:hover .game-media': {
          transform: 'scale(1.1)',
        }
      }}
    >
      <CardMedia
        component="img"
        height="200"
        image={game.image}
        alt={game.title}
        className="game-media"
        sx={{
          transition: 'transform 0.3s ease',
          objectFit: 'cover'
        }}
      />

      <CardContent sx={{ position: 'relative', height: '100px' }}>
        <Typography variant="h6" component="div" noWrap>
          {game.title}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <StarIcon sx={{ color: 'warning.main', fontSize: 16 }} />
          <Typography variant="body2" color="text.secondary">
            {game.rating}
          </Typography>
          <Chip
            label={game.size}
            size="small"
            variant="outlined"
            sx={{ ml: 'auto' }}
          />
        </Box>

        <Box sx={{ display: 'flex', gap: 1 }}>
          {game.genre.map((g, index) => (
            <Chip
              key={index}
              label={g}
              size="small"
              color="primary"
              variant="outlined"
            />
          ))}
        </Box>
      </CardContent>

      {/* Overlay com botões */}
      <Box
        className="game-overlay"
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(to bottom, transparent 60%, rgba(0,0,0,0.9) 100%)',
          opacity: 0,
          transition: 'opacity 0.3s ease',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          p: 2
        }}
      >
        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
          {game.installed ? (
            <IconButton
              onClick={handlePlay}
              sx={{
                bgcolor: 'success.main',
                color: 'white',
                '&:hover': { bgcolor: 'success.dark' }
              }}
            >
              <PlayIcon />
            </IconButton>
          ) : (
            <IconButton
              onClick={handleDownload}
              disabled={isDownloading}
              sx={{
                bgcolor: 'primary.main',
                color: 'white',
                '&:hover': { bgcolor: 'primary.dark' }
              }}
            >
              <DownloadIcon />
            </IconButton>
          )}
        </Box>

        {isDownloading && (
          <Box sx={{ mt: 1 }}>
            <Typography variant="caption" align="center" display="block">
              Baixando... {progress}%
            </Typography>
            <Box
              sx={{
                width: '100%',
                height: 4,
                bgcolor: 'grey.700',
                borderRadius: 2,
                overflow: 'hidden',
                mt: 0.5
              }}
            >
              <Box
                sx={{
                  width: `${progress}%`,
                  height: '100%',
                  bgcolor: 'primary.main',
                  transition: 'width 0.3s ease'
                }}
              />
            </Box>
          </Box>
        )}
      </Box>
    </Card>
  );
};

const GameGrid = ({ onGameSelect }) => {
  const { games, loading, downloadGame, launchGame } = useGames();
  const { playSound } = useTheme();
  const gamepad = useGamepad();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [filterAnchor, setFilterAnchor] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState('all');

  // Filtrar jogos
  const filteredGames = games.filter(game => {
    const matchesSearch = game.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = selectedFilter === 'all' ||
      (selectedFilter === 'installed' && game.installed) ||
      (selectedFilter === 'available' && !game.installed);
    return matchesSearch && matchesFilter;
  });

  // Navegação com gamepad
  useEffect(() => {
    const handleGamepadNavigation = () => {
      const nav = gamepad.getNavigationInput();
      const gridCols = 4; // Assumindo 4 colunas
      const maxIndex = filteredGames.length - 1;

      if (nav.left && selectedIndex % gridCols !== 0) {
        setSelectedIndex(prev => Math.max(0, prev - 1));
        playSound('navigate');
      }

      if (nav.right && selectedIndex % gridCols !== gridCols - 1 && selectedIndex < maxIndex) {
        setSelectedIndex(prev => Math.min(maxIndex, prev + 1));
        playSound('navigate');
      }

      if (nav.up && selectedIndex >= gridCols) {
        setSelectedIndex(prev => Math.max(0, prev - gridCols));
        playSound('navigate');
      }

      if (nav.down && selectedIndex + gridCols <= maxIndex) {
        setSelectedIndex(prev => Math.min(maxIndex, prev + gridCols));
        playSound('navigate');
      }

      if (nav.confirm && filteredGames[selectedIndex]) {
        onGameSelect(filteredGames[selectedIndex].id);
        playSound('confirm');
      }
    };

    if (gamepad.gamepadConnected && filteredGames.length > 0) {
      const interval = setInterval(handleGamepadNavigation, 150);
      return () => clearInterval(interval);
    }
  }, [gamepad, selectedIndex, filteredGames, onGameSelect, playSound]);

  const handleFilterClick = (event) => {
    setFilterAnchor(event.currentTarget);
  };

  const handleFilterClose = () => {
    setFilterAnchor(null);
  };

  const handleFilterSelect = (filter) => {
    setSelectedFilter(filter);
    setFilterAnchor(null);
    playSound('navigate');
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Grid container spacing={3}>
          {[...Array(8)].map((_, index) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
              <Skeleton variant="rectangular" height={300} />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      sx={{ height: '100%', overflow: 'auto' }}
    >
      {/* Cabeçalho com busca e filtros */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center' }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Pesquisar jogos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ maxWidth: 400 }}
        />

        <IconButton onClick={handleFilterClick}>
          <FilterIcon />
        </IconButton>

        <Menu
          anchorEl={filterAnchor}
          open={Boolean(filterAnchor)}
          onClose={handleFilterClose}
        >
          <MenuItem onClick={() => handleFilterSelect('all')}>
            Todos os Jogos
          </MenuItem>
          <MenuItem onClick={() => handleFilterSelect('installed')}>
            Instalados
          </MenuItem>
          <MenuItem onClick={() => handleFilterSelect('available')}>
            Disponíveis
          </MenuItem>
        </Menu>
      </Box>

      {/* Grade de jogos */}
      <Grid container spacing={3}>
        <AnimatePresence>
          {filteredGames.map((game, index) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={game.id}>
              <GameCard
                game={game}
                onSelect={onGameSelect}
                onPlay={launchGame}
                onDownload={downloadGame}
                isSelected={gamepad.gamepadConnected && index === selectedIndex}
              />
            </Grid>
          ))}
        </AnimatePresence>
      </Grid>

      {filteredGames.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h5" color="text.secondary">
            Nenhum jogo encontrado
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
            Tente ajustar sua pesquisa ou filtros
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default GameGrid;