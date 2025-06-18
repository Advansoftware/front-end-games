import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Skeleton,
  Typography
} from '@mui/material';
import { motion } from 'framer-motion';
import { useGames } from '../contexts/GamesContext';
import { useTheme } from '../contexts/ThemeContext';
import { useGamepad } from '../hooks/useGamepad';

// Importar os componentes
import HeroSection from './HeroSection';
import GameSection from './GameSection';
import GenreFilters from './GenreFilters';

const GameGrid = ({ onGameSelect, searchQuery = '' }) => {
  const { games, downloadGame, launchGame, loading, getFeaturedGame } = useGames();
  const { playSound } = useTheme();
  const gamepad = useGamepad();

  const [filteredGames, setFilteredGames] = useState([]);
  const [recentGames, setRecentGames] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState('all');

  // Mapear gêneros para filtros
  const genreMapping = {
    'independente': ['indie', 'independente'],
    'familia': ['family', 'kids', 'casual'],
    'tiro': ['fps', 'shooter', 'tiro'],
    'acao': ['action', 'adventure', 'acao', 'aventura'],
    'luta': ['fighting', 'luta'],
    'estrategia': ['strategy', 'estrategia'],
    'simulacao': ['simulation', 'simulacao'],
    'rpg': ['rpg', 'role-playing']
  };

  // Filtrar jogos baseado na pesquisa e gênero
  useEffect(() => {
    if (games) {
      let filtered = games;

      // Filtro de pesquisa
      if (searchQuery) {
        filtered = filtered.filter(game =>
          game.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (game.genre && typeof game.genre === 'string' && game.genre.toLowerCase().includes(searchQuery.toLowerCase()))
        );
      }

      // Filtro de gênero
      if (selectedGenre !== 'all') {
        const genreTerms = genreMapping[selectedGenre] || [selectedGenre];
        filtered = filtered.filter(game => {
          const gameGenre = (game.genre && typeof game.genre === 'string') ? game.genre.toLowerCase() : '';
          return genreTerms.some(term => gameGenre.includes(term.toLowerCase()));
        });
      }

      setFilteredGames(filtered);
      setRecentGames(filtered.slice(0, 6));
    }
  }, [games, searchQuery, selectedGenre]);

  // Obter jogo em destaque (último jogado ou aleatório)
  const featuredGame = getFeaturedGame();

  const handleGameSelect = (gameId) => {
    onGameSelect(gameId);
    playSound('confirm');
  };

  const handleDownload = (game) => {
    if (game.installed) {
      launchGame(game.id);
    } else {
      downloadGame(game.id);
    }
    playSound('confirm');
  };

  const handleGenreChange = (genreId) => {
    setSelectedGenre(genreId);
    playSound?.('select');
  };

  if (loading) {
    return (
      <Container maxWidth={false}>
        {/* Hero skeleton */}
        <Skeleton variant="rectangular" height={480} sx={{ borderRadius: 2, mb: 4 }} />

        {/* Genre filters skeleton */}
        <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <Skeleton key={item} variant="rounded" width={120} height={36} />
          ))}
        </Box>

        {/* Horizontal sections skeleton */}
        {[1, 2, 3].map((section) => (
          <Box key={section} sx={{ mb: 6 }}>
            <Skeleton variant="text" width={300} height={40} sx={{ mb: 2 }} />
            <Box sx={{ display: 'flex', gap: 3 }}>
              {[1, 2, 3, 4, 5].map((card) => (
                <Skeleton
                  key={card}
                  variant="rectangular"
                  width={280}
                  height={380}
                  sx={{ borderRadius: 2, flexShrink: 0 }}
                />
              ))}
            </Box>
          </Box>
        ))}
      </Container>
    );
  }

  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      sx={{ height: '100%', overflow: 'auto' }}
    >
      {/* Hero Section - sem sobreposições confusas */}
      {!searchQuery && (
        <HeroSection
          featuredGame={featuredGame}
          onGameSelect={handleGameSelect}
          heroGames={filteredGames}
          onDownload={handleDownload}
        />
      )}

      <Container maxWidth={false} sx={{ px: { xs: 2, md: 3 } }}>
        {/* Filtros de Gênero */}
        <GenreFilters
          selectedGenre={selectedGenre}
          onGenreChange={handleGenreChange}
        />

        {/* Game Sections - organizadas com componentes reutilizáveis */}
        {searchQuery ? (
          <GameSection
            title={`Resultados para "${searchQuery}"`}
            games={filteredGames}
            onGameSelect={handleGameSelect}
            variant="grid"
          />
        ) : selectedGenre !== 'all' ? (
          <GameSection
            title={`Jogos de ${selectedGenre.charAt(0).toUpperCase() + selectedGenre.slice(1)}`}
            games={filteredGames}
            onGameSelect={handleGameSelect}
            variant="grid"
          />
        ) : (
          <>
            <GameSection
              title="Voltar a jogar"
              games={recentGames}
              isRecent={true}
              onGameSelect={handleGameSelect}
              variant="horizontal"
            />

            <GameSection
              title="Biblioteca de jogos"
              games={filteredGames.slice(6)}
              onGameSelect={handleGameSelect}
              variant="horizontal"
            />

            {/* Seção adicional para mostrar todos os jogos em grid quando necessário */}
            {filteredGames.length > 12 && (
              <GameSection
                title="Todos os jogos"
                games={filteredGames}
                onGameSelect={handleGameSelect}
                variant="grid"
              />
            )}
          </>
        )}

        {/* Empty state */}
        {filteredGames.length === 0 && (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '50vh',
              textAlign: 'center'
            }}
          >
            <Typography variant="h6" sx={{ color: 'text.secondary', mb: 1 }}>
              {selectedGenre !== 'all'
                ? `Nenhum jogo encontrado nesta categoria`
                : 'Nenhum jogo encontrado'
              }
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {selectedGenre !== 'all'
                ? 'Tente selecionar outra categoria'
                : 'Tente ajustar sua pesquisa ou explore nossa biblioteca'
              }
            </Typography>
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default GameGrid;