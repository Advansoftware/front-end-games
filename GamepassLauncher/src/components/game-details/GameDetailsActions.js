import React from 'react';
import { Stack } from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Download as DownloadIcon,
  Update as UpdateIcon,
  YouTube as YouTubeIcon,
  CloudDownload as CloudIcon
} from '@mui/icons-material';

import { useGames } from '../../contexts/GamesContext';
import { useDownloads } from '../../hooks/useDownloads';
import CustomButton from '../CustomButton';

const GameDetailsActions = ({ game, onShowTrailer }) => {
  const {
    downloadGame,
    updateGame,
    launchGame,
    updateProgress
  } = useGames();

  const { activeDownloads } = useDownloads();

  // Lógica de estado do jogo
  const downloadData = activeDownloads.get(game.id);
  const updatePercent = updateProgress[game.id];
  const isDownloading = downloadData !== undefined;

  const progressPercent = isDownloading ? Math.round(downloadData.progress || 0) : 0;
  const updateProgressPercent = updatePercent ? Math.round(updatePercent) : 0;

  const isInstalling = downloadData?.status === 'installing';
  const isUpdating = game?.installed && isDownloading;

  // Simular atualizações disponíveis
  const hasUpdate = game && [1, 3].includes(game.id) && game.installed && !isDownloading;

  // Função para obter mensagem da operação
  const getOperationMessage = () => {
    if (!isDownloading) return '';
    if (isInstalling) return 'Instalando';
    if (isUpdating) return 'Atualizando';
    return 'Baixando';
  };

  const operationMessage = getOperationMessage();

  // Handlers
  const handlePlay = () => {
    launchGame(game.id);
  };

  const handleDownload = () => {
    downloadGame(game.id);
  };

  const handleUpdate = () => {
    updateGame(game.id);
  };

  return (
    <Stack direction="row" spacing={2} sx={{ mb: 4 }}>
      {/* Lógica correta: apenas um botão principal por vez */}

      {/* Se está baixando/instalando/atualizando - APENAS o botão de progresso */}
      {(isDownloading || isUpdating) ? (
        <CustomButton
          variant={isUpdating ? "warning" : "info"}
          size="medium"
          startIcon={<CloudIcon />}
          disabled={true}
          downloadProgress={isDownloading ? progressPercent : updateProgressPercent}
          sx={{
            px: 4,
            py: 1.5,
            fontSize: '1.1rem',
            fontWeight: 'bold',
            minWidth: 180
          }}
        >
          {operationMessage}
        </CustomButton>
      ) : (
        <>
          {/* Se está instalado E não tem atualização - JOGAR AGORA */}
          {game.installed && !hasUpdate ? (
            <CustomButton
              variant="success"
              size="medium"
              startIcon={<PlayIcon />}
              onClick={handlePlay}
              sx={{
                px: 4,
                py: 1.5,
                fontSize: '1.1rem',
                fontWeight: 'bold',
                minWidth: 160
              }}
            >
              Jogar Agora
            </CustomButton>
          ) : null}

          {/* Se tem atualização disponível - ATUALIZAR */}
          {hasUpdate ? (
            <CustomButton
              variant="warning"
              size="medium"
              startIcon={<UpdateIcon />}
              onClick={handleUpdate}
              sx={{
                px: 3,
                py: 1.5,
                fontSize: '1rem',
                fontWeight: 'bold'
              }}
            >
              Atualizar
            </CustomButton>
          ) : null}

          {/* Se NÃO está instalado - BAIXAR */}
          {!game.installed ? (
            <CustomButton
              variant="primary"
              size="medium"
              startIcon={<DownloadIcon />}
              onClick={handleDownload}
              sx={{
                px: 4,
                py: 1.5,
                fontSize: '1.1rem',
                fontWeight: 'bold',
                minWidth: 180
              }}
            >
              Baixar Jogo
            </CustomButton>
          ) : null}
        </>
      )}

      {/* Botão de trailer - sempre disponível */}
      {game.youtubeVideoId && (
        <CustomButton
          variant="outlined"
          size="medium"
          startIcon={<YouTubeIcon />}
          onClick={onShowTrailer}
          sx={{
            px: 3,
            py: 1.5,
            fontSize: '1rem',
            fontWeight: 'bold'
          }}
        >
          Ver Trailer
        </CustomButton>
      )}
    </Stack>
  );
};

export default GameDetailsActions;